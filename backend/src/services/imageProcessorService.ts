import sharp from 'sharp';

/**
 * Image processing options
 */
export interface ImageProcessorOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
}

/**
 * Multiple image sizes result
 */
export interface MultipleImageSizes {
  thumbnail: Buffer;
  medium: Buffer;
  large: Buffer;
}

/**
 * Image metadata
 */
export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  size: number;
}

/**
 * Image Processor Service
 * Handles image optimization, resizing, and format conversion using Sharp
 */
export class ImageProcessor {
  /**
   * Process an image with specified options
   * @param buffer - The input image buffer
   * @param options - Processing options
   * @returns Processed image buffer
   */
  async processImage(
    buffer: Buffer,
    options: ImageProcessorOptions
  ): Promise<Buffer> {
    let pipeline = sharp(buffer);

    // Resize if dimensions specified
    if (options.width || options.height) {
      pipeline = pipeline.resize(options.width, options.height, {
        fit: options.fit || 'cover',
        withoutEnlargement: true, // Don't upscale images
      });
    }

    // Convert format and set quality
    const format = options.format || 'webp';
    const quality = options.quality || 80;

    pipeline = pipeline.toFormat(format, { quality });

    // Strip EXIF data for privacy
    pipeline = pipeline.rotate(); // Auto-rotate based on EXIF, then strip

    return pipeline.toBuffer();
  }

  /**
   * Generate a thumbnail from an image
   * @param buffer - The input image buffer
   * @returns Thumbnail buffer (400x300, WebP)
   */
  async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    return this.processImage(buffer, {
      width: 400,
      height: 300,
      quality: 75,
      format: 'webp',
    });
  }

  /**
   * Generate multiple sizes of an image
   * @param buffer - The input image buffer
   * @returns Object with thumbnail, medium, and large buffers
   */
  async generateMultipleSizes(buffer: Buffer): Promise<MultipleImageSizes> {
    const [thumbnail, medium, large] = await Promise.all([
      this.processImage(buffer, { width: 400, height: 300, format: 'webp' }),
      this.processImage(buffer, { width: 800, height: 600, format: 'webp' }),
      this.processImage(buffer, { width: 1920, height: 1080, format: 'webp' }),
    ]);

    return { thumbnail, medium, large };
  }

  /**
   * Get metadata from an image
   * @param buffer - The input image buffer
   * @returns Image metadata
   */
  async getMetadata(buffer: Buffer): Promise<ImageMetadata> {
    const metadata = await sharp(buffer).metadata();
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
      format: metadata.format || 'unknown',
      size: buffer.length,
    };
  }

  /**
   * Optimize an image (reduce size while maintaining quality)
   * @param buffer - The input image buffer
   * @returns Optimized image buffer
   */
  async optimizeImage(buffer: Buffer): Promise<Buffer> {
    return sharp(buffer)
      .rotate() // Auto-rotate and strip EXIF
      .webp({ quality: 80 })
      .toBuffer();
  }
}

// Export singleton instance
export const imageProcessor = new ImageProcessor();
