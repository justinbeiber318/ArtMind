import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';

// Keep uploads in memory; services decide whether to push to Cloudinary
// or hand the buffer to TensorFlow. Caps size and restricts to images.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpe?g|png|webp)$/.test(file.mimetype)) return cb(null, true);
    return cb(ApiError.badRequest('Only JPEG, PNG or WEBP images are allowed'));
  },
});
