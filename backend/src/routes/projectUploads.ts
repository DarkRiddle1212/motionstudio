import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateAdminToken, AuthenticatedRequest } from '../middleware/auth';
import {
  thumbnailUpload,
  heroUpload,
  galleryUpload,
  handleMulterError,
} from '../middleware/uploadMiddleware';
import { imageProcessor } from '../services/imageProcessorService';
import { videoProcessor } from '../services/videoProcessorService';
import { fileStorageManager } from '../services/fileStorageService';
import fs from 'fs/promises';

const router = express.Router();

/**
 * Rate limiter for upload endpoints
 * Limit: 20 requests per minute per IP
 */
const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: {
    error: 'Too many upload requests',
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'You have exceeded the upload rate limit. Please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Upload response interface
 */
interface UploadResponse {
  success: boolean;
  url: string;
  path: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  size: number;
}

/**
 * POST /api/admin/projects/upload/thumbnail
 * Upload project thumbnail image
 */
router.post(
  '/upload/thumbnail',
  uploadRateLimiter,
  authenticateAdminToken,
  thumbnailUpload.single('file'),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          error: 'No file provided',
          code: 'NO_FILE',
        });
      }

      // Process image (resize and optimize)
      const processed = await imageProcessor.processImage(file.buffer, {
        width: 400,
        height: 300,
        quality: 80,
        format: 'webp',
      });

      // Get project ID from request body (or use 'temp' for new projects)
      const projectId = req.body.projectId || 'temp';

      // Save to storage
      const filePath = await fileStorageManager.saveFile(
        projectId,
        'thumbnail',
        processed,
        'webp'
      );

      // Get metadata
      const metadata = await imageProcessor.getMetadata(processed);

      const response: UploadResponse = {
        success: true,
        url: fileStorageManager.getPublicUrl(filePath),
        path: filePath,
        dimensions: { width: metadata.width, height: metadata.height },
        size: processed.length,
      };

      res.json(response);
    } catch (error: any) {
      console.error('Thumbnail upload error:', error);
      res.status(500).json({
        error: 'Upload failed',
        code: 'PROCESSING_FAILED',
        message: 'Image processing failed. Please try again with a different image.',
      });
    }
  }
);

/**
 * POST /api/admin/projects/upload/hero
 * Upload hero image or video
 */
router.post(
  '/upload/hero',
  uploadRateLimiter,
  authenticateAdminToken,
  heroUpload.single('file'),
  async (req: AuthenticatedRequest, res: Response) => {
    const tempFiles: string[] = [];

    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({
          error: 'No file provided',
          code: 'NO_FILE',
        });
      }

      const projectId = req.body.projectId || 'temp';
      const isVideo = file.mimetype.startsWith('video/');

      if (isVideo) {
        // Validate video file size (50MB max)
        if (file.size > 50 * 1024 * 1024) {
          return res.status(400).json({
            error: 'Video file too large',
            code: 'FILE_TOO_LARGE',
            message: 'Maximum video size is 50MB',
          });
        }

        // Save temp file for FFmpeg processing
        const tempInputPath = videoProcessor.createTempPath('upload', 'video');
        await fs.writeFile(tempInputPath, file.buffer);
        tempFiles.push(tempInputPath);

        // Process video
        const tempOutputPath = videoProcessor.createTempPath('processed', 'mp4');
        tempFiles.push(tempOutputPath);

        const metadata = await videoProcessor.processVideo(tempInputPath, tempOutputPath, {
          outputFormat: 'mp4',
          quality: 'high',
          maxWidth: 1920,
        });

        // Generate thumbnail
        const tempThumbnailPath = videoProcessor.createTempPath('thumb', 'jpg');
        tempFiles.push(tempThumbnailPath);
        await videoProcessor.generateVideoThumbnail(tempOutputPath, tempThumbnailPath);

        // Save both files
        const videoBuffer = await fs.readFile(tempOutputPath);
        const thumbnailBuffer = await fs.readFile(tempThumbnailPath);

        const videoFilePath = await fileStorageManager.saveFile(projectId, 'video', videoBuffer, 'mp4');
        const thumbFilePath = await fileStorageManager.saveFile(projectId, 'video-thumbnail', thumbnailBuffer, 'jpg');

        // Cleanup temp files
        await videoProcessor.cleanupTempFiles(tempFiles);

        res.json({
          success: true,
          mediaType: 'video',
          url: fileStorageManager.getPublicUrl(videoFilePath),
          path: videoFilePath,
          thumbnailUrl: fileStorageManager.getPublicUrl(thumbFilePath),
          thumbnailPath: thumbFilePath,
          duration: metadata.duration,
          size: videoBuffer.length,
        });
      } else {
        // Validate image file size (10MB max)
        if (file.size > 10 * 1024 * 1024) {
          return res.status(400).json({
            error: 'Image file too large',
            code: 'FILE_TOO_LARGE',
            message: 'Maximum image size is 10MB',
          });
        }

        // Process image
        const processed = await imageProcessor.processImage(file.buffer, {
          width: 1920,
          height: 1080,
          quality: 85,
          format: 'webp',
        });

        const filePath = await fileStorageManager.saveFile(projectId, 'hero', processed, 'webp');
        const metadata = await imageProcessor.getMetadata(processed);

        res.json({
          success: true,
          mediaType: 'image',
          url: fileStorageManager.getPublicUrl(filePath),
          path: filePath,
          dimensions: { width: metadata.width, height: metadata.height },
          size: processed.length,
        });
      }
    } catch (error: any) {
      // Cleanup temp files on error
      await videoProcessor.cleanupTempFiles(tempFiles);

      console.error('Hero upload error:', error);
      res.status(500).json({
        error: 'Upload failed',
        code: 'PROCESSING_FAILED',
        message: 'Media processing failed. Please try again with a different file.',
      });
    }
  }
);

/**
 * POST /api/admin/projects/upload/gallery
 * Upload multiple gallery images
 */
router.post(
  '/upload/gallery',
  uploadRateLimiter,
  authenticateAdminToken,
  galleryUpload.array('files', 10),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({
          error: 'No files provided',
          code: 'NO_FILE',
        });
      }

      const projectId = req.body.projectId || 'temp';

      // Process all images in parallel
      const results = await Promise.all(
        files.map(async (file, index) => {
          try {
            // Process image
            const processed = await imageProcessor.processImage(file.buffer, {
              width: 1920,
              height: 1080,
              quality: 85,
              format: 'webp',
            });

            // Save to storage
            const filePath = await fileStorageManager.saveFile(
              projectId,
              'gallery',
              processed,
              'webp'
            );

            // Get metadata
            const metadata = await imageProcessor.getMetadata(processed);

            return {
              success: true,
              url: fileStorageManager.getPublicUrl(filePath),
              path: filePath,
              dimensions: { width: metadata.width, height: metadata.height },
              size: processed.length,
              order: index,
            };
          } catch (error: any) {
            return {
              success: false,
              error: 'Image processing failed',
              order: index,
            };
          }
        })
      );

      // Check if any uploads failed
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        return res.status(207).json({
          success: false,
          message: `${failures.length} of ${files.length} uploads failed`,
          results,
        });
      }

      res.json({
        success: true,
        images: results,
      });
    } catch (error: any) {
      console.error('Gallery upload error:', error);
      res.status(500).json({
        error: 'Upload failed',
        code: 'PROCESSING_FAILED',
        message: 'Gallery processing failed. Please try again with different images.',
      });
    }
  }
);

/**
 * DELETE /api/admin/projects/:id/media/:type
 * Delete uploaded media file
 */
router.delete(
  '/:id/media/:type',
  authenticateAdminToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id, type } = req.params;
      const { filePath } = req.body;

      if (!filePath) {
        return res.status(400).json({
          error: 'File path required',
          code: 'NO_FILE_PATH',
        });
      }

      // Delete file from storage
      await fileStorageManager.deleteFile(filePath);

      res.json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error: any) {
      console.error('Delete media error:', error);
      res.status(500).json({
        error: 'Delete failed',
        code: 'DELETE_FAILED',
        message: 'File deletion failed. Please try again.',
      });
    }
  }
);

// Apply error handler middleware
router.use(handleMulterError);

export default router;
