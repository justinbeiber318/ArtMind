import sharp from "sharp";
import { db } from "../../config/database.js";
import { extractDominantColors } from "./colorExtractor.js";
import { ApiError } from "../../utils/ApiError.js";

/**
 * Image recognition.
 *
 * Colour extraction is exact and runs locally (sharp).
 *
 * Style/category classification uses TensorFlow.js with a MobileNet feature
 * extractor. We use the PURE-JAVASCRIPT build (@tensorflow/tfjs) so it installs
 * and runs on any platform / Node version with NO native compilation (no
 * Visual Studio / build tools needed). The image is decoded to raw RGB pixels
 * with sharp and fed to MobileNet as a tensor.
 *
 * MobileNet's ImageNet labels don't map cleanly to art styles, so we project
 * its top predictions through a heuristic mapping. This gives a real, working
 * signal out of the box; for production accuracy you would fine-tune a small
 * head on a labelled art-style dataset (see docs/AI_NOTES.md). The interface
 * below does not change. If the model can't load (e.g. no internet on first
 * use), the service degrades gracefully to a colour-only result.
 */
let modelPromise = null;
async function loadModel() {
  if (!modelPromise) {
    modelPromise = (async () => {
      const tf = await import("@tensorflow/tfjs");
      await tf.setBackend("cpu");
      await tf.ready();
      const mobilenet = await import("@tensorflow-models/mobilenet");
      const model = await mobilenet.load({ version: 2, alpha: 1.0 });
      return { tf, model };
    })();
  }
  return modelPromise;
}

// Decode an image buffer into a [height, width, 3] int32 tensor using sharp.
async function bufferToTensor(tf, buffer) {
  const { data, info } = await sharp(buffer)
    .resize(224, 224, { fit: "fill" })
    .toColorspace("srgb")
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  let rgb = data;
  // Grayscale source -> expand the single channel to RGB so MobileNet gets 3 channels.
  if (info.channels === 1) {
    rgb = Buffer.alloc(info.width * info.height * 3);
    for (let i = 0; i < info.width * info.height; i += 1) {
      rgb[i * 3] = data[i];
      rgb[i * 3 + 1] = data[i];
      rgb[i * 3 + 2] = data[i];
    }
  }
  if (info.channels > 3) {
    rgb = Buffer.alloc(info.width * info.height * 3);
    for (let i = 0; i < info.width * info.height; i += 1) {
      rgb[i * 3] = data[i * info.channels];
      rgb[i * 3 + 1] = data[i * info.channels + 1];
      rgb[i * 3 + 2] = data[i * info.channels + 2];
    }
  }

  return tf.tensor3d(
    new Uint8Array(rgb),
    [info.height, info.width, 3],
    "int32",
  );
}

// Maps MobileNet ImageNet keywords toward gallery style/category buckets.
const STYLE_HINTS = [
  {
    match: /abstract|mosaic|pattern|tile/i,
    style: "Abstract",
    category: "Abstract",
  },
  {
    match: /landscape|mountain|valley|seashore|lakeside|cliff/i,
    style: "Impressionism",
    category: "Landscape",
  },
  {
    match: /portrait|face|wig|mask|hat/i,
    style: "Realism",
    category: "Portrait",
  },
  {
    match: /flower|vase|fruit|bowl|plate|cup/i,
    style: "Still Life",
    category: "Still Life",
  },
  {
    match: /castle|church|palace|monastery|dome/i,
    style: "Baroque",
    category: "Architecture",
  },
];

function classifyFromPredictions(predictions) {
  for (const p of predictions) {
    for (const hint of STYLE_HINTS) {
      if (hint.match.test(p.className)) {
        return {
          style: hint.style,
          category: hint.category,
          confidence: p.probability,
        };
      }
    }
  }
  // Fallback to the strongest prediction with a generic mapping.
  const top = predictions[0];
  return {
    style: "Contemporary",
    category: "Mixed Media",
    confidence: top?.probability ?? 0.3,
  };
}

function withTimeout(promise, ms, message) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

async function assertValidImage(buffer) {
  try {
    const meta = await sharp(buffer).metadata();
    if (!["jpeg", "png", "webp"].includes(meta.format)) {
      throw ApiError.badRequest("Unsupported file. Use JPG, JPEG, PNG or WEBP");
    }
    if (!meta.width || !meta.height) throw ApiError.badRequest("Invalid image");
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw ApiError.badRequest("Invalid image");
  }
}

function inferMediumAndSurface({ style, category, colors }) {
  const darkPalette = colors.some((hex) => /^#(0|1|2|3)/i.test(hex));
  const medium = style === "Contemporary" || darkPalette ? "Digital or mixed media" : "Paint on canvas";
  const surface = category === "Landscape" || category === "Architecture" ? "Canvas or panel" : "Canvas";
  return { medium, surface };
}

function buildSummary({ style, category, colors, confidence }) {
  const palette = colors.slice(0, 3).join(", ") || "muted tones";
  return `The uploaded artwork appears to be a ${style.toLowerCase()} ${category.toLowerCase()} work with a dominant palette of ${palette}. The confidence score is ${Math.round(confidence * 100)}%, so this should be treated as an AI-assisted reading rather than a definitive attribution.`;
}

function normalizeHistoryRecord(item) {
  const meta = item.dominantColors && !Array.isArray(item.dominantColors)
    ? item.dominantColors
    : { colors: item.dominantColors || [] };
  return {
    id: item.id,
    imageUrl: item.imageUrl,
    thumbnailUrl: meta.thumbnailUrl || item.imageUrl,
    style: item.detectedStyle,
    category: item.detectedCategory,
    colors: meta.colors || [],
    medium: meta.medium || "",
    surface: meta.surface || "",
    confidence: item.confidence,
    summary: meta.summary || "",
    recommendationIds: meta.recommendationIds || [],
    createdAt: item.createdAt,
  };
}

async function markFavorited(paintings, userId) {
  if (!userId || paintings.length === 0) return paintings.map((p) => ({ ...p, isFavorited: false }));

  const favorites = await db.favorite.findMany({
    where: { userId, paintingId: { in: paintings.map((p) => p.id) } },
    select: { paintingId: true },
  });
  const favoriteIds = new Set(favorites.map((f) => f.paintingId));
  return paintings.map((p) => ({ ...p, isFavorited: favoriteIds.has(p.id) }));
}

export const recognitionService = {
  async analyze(buffer, userId, imageUrl, thumbnailUrl = imageUrl) {
    await assertValidImage(buffer);

    let colors = [];
    try {
      colors = await extractDominantColors(buffer, 5);
    } catch (err) {
      console.warn("Colour extraction failed:", err.message);
    }

    let classification = {
      style: "Contemporary",
      category: "Mixed Media",
      confidence: 0.3,
    };
    try {
      const { tf, model } = await withTimeout(loadModel(), 25000, "AI recognition timed out");
      const input = await bufferToTensor(tf, buffer);
      const predictions = await withTimeout(model.classify(input, 5), 25000, "AI recognition timed out");
      input.dispose();
      classification = classifyFromPredictions(predictions);
    } catch (err) {
      if (/timed out/i.test(err.message)) {
        throw ApiError.badRequest("AI recognition timed out. Please try again");
      }
      // Model unavailable (e.g. offline on first load) -> still return colours + heuristic guess.
      console.warn(
        "TF classification unavailable, using colour-only result:",
        err.message,
      );
    }

    // Surface a few real gallery paintings that share the detected style/colours.
    const rawRecommendations = await db.painting.findMany({
      where: {
        AND: [
          {
            OR: [
              { style: { name: classification.style } },
              { category: { name: classification.category } },
            ],
          },
          {
            OR: [
              { uploadedById: null },
              { featured: true },
            ],
          },
        ],
      },
      take: 6,
      include: { artist: true, category: true, style: true },
    });
    const recommendations = await markFavorited(rawRecommendations, userId);

    const confidence = Number(classification.confidence.toFixed(3));
    const { medium, surface } = inferMediumAndSurface({ ...classification, colors });
    const summary = buildSummary({
      style: classification.style,
      category: classification.category,
      colors,
      confidence,
    });

    const result = {
      style: classification.style,
      category: classification.category,
      colors,
      medium,
      surface,
      confidence,
      summary,
      recommendations,
    };

    const history = await db.uploadedImage.create({
      data: {
        userId: userId ?? null,
        imageUrl: imageUrl ?? "",
        detectedStyle: result.style,
        detectedCategory: result.category,
        dominantColors: {
          colors,
          thumbnailUrl,
          medium,
          surface,
          summary,
          recommendationIds: recommendations.map((p) => p.id),
        },
        confidence: result.confidence,
      },
    });
    await db.analytics.create({ data: { metric: "recognition" } });

    return { ...result, id: history.id, imageUrl, thumbnailUrl, createdAt: history.createdAt };
  },

  async history(userId) {
    const items = await db.uploadedImage.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return items.map(normalizeHistoryRecord);
  },

  async getHistoryItem(userId, id) {
    const item = await db.uploadedImage.findFirst({ where: { id, userId } });
    if (!item) throw ApiError.notFound("Recognition result not found");
    const record = normalizeHistoryRecord(item);
    const rawRecommendations = record.recommendationIds.length
      ? await db.painting.findMany({
        where: {
          AND: [
            { id: { in: record.recommendationIds } },
            { OR: [{ uploadedById: null }, { featured: true }] },
          ],
        },
        include: { artist: true, category: true, style: true },
      })
      : [];
    const recommendations = await markFavorited(rawRecommendations, userId);
    return { ...record, recommendations };
  },

  async deleteHistoryItem(userId, id) {
    const item = await db.uploadedImage.findFirst({ where: { id, userId } });
    if (!item) throw ApiError.notFound("Recognition result not found");
    await db.uploadedImage.delete({ where: { id } });
    return { deleted: true };
  },
};
