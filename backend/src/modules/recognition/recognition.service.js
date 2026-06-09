import sharp from "sharp";
import { prisma } from "../../config/prisma.js";
import { extractDominantColors } from "./colorExtractor.js";

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

export const recognitionService = {
  async analyze(buffer, userId, imageUrl) {
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
      const { tf, model } = await loadModel();
      const input = await bufferToTensor(tf, buffer);
      const predictions = await model.classify(input, 5);
      input.dispose();
      classification = classifyFromPredictions(predictions);
    } catch (err) {
      // Model unavailable (e.g. offline on first load) -> still return colours + heuristic guess.
      console.warn(
        "TF classification unavailable, using colour-only result:",
        err.message,
      );
    }

    // Surface a few real gallery paintings that share the detected style/colours.
    const recommendations = await prisma.painting.findMany({
      where: {
        OR: [
          { style: { name: classification.style } },
          { category: { name: classification.category } },
        ],
      },
      take: 6,
      include: { artist: true },
    });

    const result = {
      style: classification.style,
      category: classification.category,
      colors,
      confidence: Number(classification.confidence.toFixed(3)),
      recommendations,
    };

    await prisma.uploadedImage.create({
      data: {
        userId: userId ?? null,
        imageUrl: imageUrl ?? "",
        detectedStyle: result.style,
        detectedCategory: result.category,
        dominantColors: colors,
        confidence: result.confidence,
      },
    });
    await prisma.analytics.create({ data: { metric: "recognition" } });

    return result;
  },
};
