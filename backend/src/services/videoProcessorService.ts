import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs/promises';
import os from 'os';

/**
 * Video processing options
 */
export interface VideoProcessorOptions {
  outputFormat?: 'mp4' | 'webm';
  quality?: 'low' | 'medium' | 'high';
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Video metadata
 */
export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  size: number;
  format: string;
  codec?: string;
}

/**
 * Video Processor Service
 * Handles video processing and thumbnail generation using FFmpeg
 */
export class VideoProcessor {
  /**
   * Process a video file (convert, optimize, compress)
   * @param inputPath - Path to input video file
   * @param outputPath - Path to save processed video
   * @param options - Processing options
   * @returns Video metadata
   */
  async processVideo(
    inputPath: string,
    outputPath: string,
    options: VideoProcessorOptions = {}
  ): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      const quality = options.quality || 'medium';
      const maxWidth = options.maxWidth || 1920;

      // CRF values: lower = better quality, higher file size
      const crfMap = { low: 28, medium: 23, high: 18 };
      const crf = crfMap[quality];

      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',           // H.264 video codec
          `-crf ${crf}`,            // Quality setting
          '-preset medium',          // Encoding speed/compression tradeoff
          '-c:a aac',                // AAC audio codec
          '-b:a 128k',               // Audio bitrate
          '-movflags +faststart',    // Enable streaming (move moov atom to start)
          '-pix_fmt yuv420p',        // Pixel format for compatibility
        ])
        .size(`${maxWidth}x?`)       // Resize maintaining aspect ratio
        .on('end', async () => {
          try {
            const metadata = await this.getVideoMetadata(outputPath);
            resolve(metadata);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', (err) => {
          reject(new Error(`Video processing failed: ${err.message}`));
        })
        .save(outputPath);
    });
  }

  /**
   * Generate a thumbnail from a video
   * @param videoPath - Path to video file
   * @param outputPath - Path to save thumbnail
   * @param timestamp - Timestamp to capture (default: 1 second)
   * @returns Promise that resolves when thumbnail is generated
   */
  async generateVideoThumbnail(
    videoPath: string,
    outputPath: string,
    timestamp: string = '00:00:01'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .screenshots({
          timestamps: [timestamp],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '400x300',
        })
        .on('end', () => resolve())
        .on('error', (err) => {
          reject(new Error(`Thumbnail generation failed: ${err.message}`));
        });
    });
  }

  /**
   * Get metadata from a video file
   * @param videoPath - Path to video file
   * @returns Video metadata
   */
  async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) {
          return reject(new Error(`Failed to get video metadata: ${err.message}`));
        }

        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const stats = require('fs').statSync(videoPath);

        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          size: stats.size,
          format: metadata.format.format_name || '',
          codec: videoStream?.codec_name,
        });
      });
    });
  }

  /**
   * Create a temporary file path
   * @param prefix - Filename prefix
   * @param extension - File extension
   * @returns Temporary file path
   */
  createTempPath(prefix: string, extension: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);
    return path.join(os.tmpdir(), `${prefix}-${timestamp}-${random}.${extension}`);
  }

  /**
   * Clean up temporary files
   * @param filePaths - Array of file paths to delete
   */
  async cleanupTempFiles(filePaths: string[]): Promise<void> {
    await Promise.all(
      filePaths.map(async (filePath) => {
        try {
          await fs.unlink(filePath);
        } catch (error: any) {
          console.warn(`Failed to delete temp file: ${filePath}`, error.message);
        }
      })
    );
  }
}

// Export singleton instance
export const videoProcessor = new VideoProcessor();
