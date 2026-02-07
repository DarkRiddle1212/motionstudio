import { ImageProcessor } from '../imageProcessorService';
import sharp from 'sharp';

describe('ImageProcessor', () => {
  let imageProcessor: ImageProcessor;
  let testImageBuffer: Buffer;

  beforeAll(async () => {
    imageProcessor = new ImageProcessor();
    // Create a test image (100x100 red square)
    testImageBuffer = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 },
      },
    })
      .png()
      .toBuffer();
  });

  describe('processImage', () => {
    it('should resize image to specified dimensions', async () => {
      const processed = await imageProcessor.processImage(testImageBuffer, {
        width: 50,
        height: 50,
        format: 'webp',
      });

      const metadata = await sharp(processed).metadata();
      expect(metadata.width).toBe(50);
      expect(metadata.height).toBe(50);
    });

    it('should convert image to WebP format', async () => {
      const processed = await imageProcessor.processImage(testImageBuffer, {
        format: 'webp',
      });

      const metadata = await sharp(processed).metadata();
      expect(metadata.format).toBe('webp');
    });

    it('should reduce file size with quality setting', async () => {
      const highQuality = await imageProcessor.processImage(testImageBuffer, {
        quality: 95,
        format: 'webp',
      });

      const lowQuality = await imageProcessor.processImage(testImageBuffer, {
        quality: 50,
        format: 'webp',
      });

      expect(lowQuality.length).toBeLessThan(highQuality.length);
    });

    it('should not upscale images', async () => {
      const processed = await imageProcessor.processImage(testImageBuffer, {
        width: 200,
        height: 200,
        format: 'webp',
      });

      const metadata = await sharp(processed).metadata();
      // Should not exceed original dimensions
      expect(metadata.width).toBeLessThanOrEqual(100);
      expect(metadata.height).toBeLessThanOrEqual(100);
    });
  });

  describe('generateThumbnail', () => {
    it('should generate thumbnail with correct dimensions', async () => {
      const thumbnail = await imageProcessor.generateThumbnail(testImageBuffer);
      const metadata = await sharp(thumbnail).metadata();

      expect(metadata.width).toBeLessThanOrEqual(400);
      expect(metadata.height).toBeLessThanOrEqual(300);
      expect(metadata.format).toBe('webp');
    });
  });

  describe('generateMultipleSizes', () => {
    it('should generate three different sizes', async () => {
      const sizes = await imageProcessor.generateMultipleSizes(testImageBuffer);

      expect(sizes.thumbnail).toBeDefined();
      expect(sizes.medium).toBeDefined();
      expect(sizes.large).toBeDefined();

      const thumbMeta = await sharp(sizes.thumbnail).metadata();
      const mediumMeta = await sharp(sizes.medium).metadata();
      const largeMeta = await sharp(sizes.large).metadata();

      expect(thumbMeta.width).toBeLessThanOrEqual(400);
      expect(mediumMeta.width).toBeLessThanOrEqual(800);
      expect(largeMeta.width).toBeLessThanOrEqual(1920);
    });
  });

  describe('getMetadata', () => {
    it('should return correct image metadata', async () => {
      const metadata = await imageProcessor.getMetadata(testImageBuffer);

      expect(metadata.width).toBe(100);
      expect(metadata.height).toBe(100);
      expect(metadata.format).toBe('png');
      expect(metadata.size).toBeGreaterThan(0);
    });
  });

  describe('optimizeImage', () => {
    it('should optimize image and reduce size', async () => {
      const optimized = await imageProcessor.optimizeImage(testImageBuffer);
      const metadata = await sharp(optimized).metadata();

      expect(metadata.format).toBe('webp');
      // Optimized WebP should typically be smaller than PNG
      expect(optimized.length).toBeLessThan(testImageBuffer.length);
    });
  });
});
