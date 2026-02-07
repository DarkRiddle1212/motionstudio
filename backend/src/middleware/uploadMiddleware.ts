import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

/**
 * Allowed image MIME types
 */
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Allowed video MIME types
 */
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime', // .mov files
];

/**
 * File filter for images only
 */
export function imageFileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WebP, and GIF images are allowed.'));
  }
}

/**
 * File filter for videos only
 */
export function videoFileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, WebM, and MOV videos are allowed.'));
  }
}

/**
 * File filter for images or videos
 */
export function imageOrVideoFileFilter(
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  const allAllowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
  if (allAllowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPG, PNG, WebP, GIF) and videos (MP4, WebM, MOV) are allowed.'));
  }
}

/**
 * Multer configuration for thumbnail uploads
 * Max size: 5MB
 */
export const thumbnailUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFileFilter,
});

/**
 * Multer configuration for hero image/video uploads
 * Max size: 10MB for images, 50MB for videos
 * Note: We use 50MB limit here and validate based on file type in the route handler
 */
export const heroUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB (max for videos)
  },
  fileFilter: imageOrVideoFileFilter,
});

/**
 * Multer configuration for gallery uploads
 * Max size: 5MB per file, max 10 files
 */
export const galleryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10, // Max 10 files
  },
  fileFilter: imageFileFilter,
});

/**
 * Error handler middleware for Multer errors
 */
export function handleMulterError(err: any, req: Request, res: any, next: any): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        code: 'FILE_TOO_LARGE',
        message: 'The uploaded file exceeds the maximum allowed size.',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        code: 'TOO_MANY_FILES',
        message: 'Maximum 10 files allowed',
      });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file field',
        code: 'UNEXPECTED_FILE',
        message: 'Unexpected file field in upload request.',
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      code: 'UPLOAD_ERROR',
      message: 'File upload failed. Please check your file and try again.',
    });
  }

  if (err) {
    return res.status(400).json({
      error: 'Upload failed',
      code: 'UPLOAD_FAILED',
      message: 'File upload failed. Please try again with a valid file.',
    });
  }

  next();
}
