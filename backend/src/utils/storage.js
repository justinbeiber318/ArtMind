import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { env } from '../config/env.js';
import { uploadToCloudinary } from '../config/cloudinary.js';

// Local folder used when Cloudinary is not configured (resolved against the
// backend working directory when you run `npm run dev`).
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

export async function saveImage(buffer, mimetype, req) {
  if (env.cloudinary.cloudName) {
    const dataUri = `data:${mimetype};base64,${buffer.toString('base64')}`;
    const { url } = await uploadToCloudinary(dataUri, 'artmind/uploads');
    return { imageUrl: url, thumbnailUrl: url };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = EXT[mimetype] || 'jpg';
  const base = randomUUID();
  const fullName = `${base}.${ext}`;
  const thumbName = `${base}_thumb.${ext}`;

  await writeFile(path.join(UPLOAD_DIR, fullName), buffer);

  let thumbUrlName = fullName;
  try {
    const thumb = await sharp(buffer).resize(600, 750, { fit: 'inside' }).toBuffer();
    await writeFile(path.join(UPLOAD_DIR, thumbName), thumb);
    thumbUrlName = thumbName;
  } catch {
    /* keep full image as thumbnail */
  }

  const origin = `${req.protocol}://${req.get('host')}`;
  return {
    imageUrl: `${origin}/uploads/${fullName}`,
    thumbnailUrl: `${origin}/uploads/${thumbUrlName}`,
  };
}
