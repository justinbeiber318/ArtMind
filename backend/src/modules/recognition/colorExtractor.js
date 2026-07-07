import sharp from "sharp";

// Extracts dominant colours by downscaling the image and bucketing pixels
// into a coarse colour grid (median-cut-lite). Fully deterministic, no model.
export async function extractDominantColors(buffer, count = 5) {
  const width = 64;
  // NOTE: the sharp option is `resolveWithObject` (returns { data, info }).
  const { data, info } = await sharp(buffer)
    .resize(width, width, { fit: "inside" })
    .toColorspace("srgb")
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const channels = info.channels || 3;
  const buckets = new Map();
  for (let i = 0; i + 2 < data.length; i += channels) {
    // Quantise each channel to 8 levels to group similar shades.
    const r = data[i] & 0xe0;
    const g = data[i + 1] & 0xe0;
    const b = data[i + 2] & 0xe0;
    const key = (r << 16) | (g << 8) | b;
    const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };
    bucket.r += data[i];
    bucket.g += data[i + 1];
    bucket.b += data[i + 2];
    bucket.n += 1;
    buckets.set(key, bucket);
  }

  const toHex = (v) => Math.round(v).toString(16).padStart(2, "0");
  return [...buckets.values()]
    .sort((a, b) => b.n - a.n)
    .slice(0, count)
    .map((c) =>
      `#${toHex(c.r / c.n)}${toHex(c.g / c.n)}${toHex(c.b / c.n)}`.toUpperCase(),
    );
}
