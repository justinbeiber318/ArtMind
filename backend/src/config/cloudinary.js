import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

// Uploads a local file path or a base64 data URI to Cloudinary.
export async function uploadToCloudinary(filePathOrDataUri, folder = 'artmind') {
  const result = await cloudinary.uploader.upload(filePathOrDataUri, {
    folder,
    resource_type: 'image',
  });
  return { url: result.secure_url, publicId: result.public_id };
}

export { cloudinary };
