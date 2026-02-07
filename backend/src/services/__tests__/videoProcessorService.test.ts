import { VideoProcessor } from '../videoProcessorService';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('VideoProcessor', () => {
  let videoProcessor: VideoProcessor;

  beforeAll(() => {
    videoProcessor = new VideoProcessor();
  });

  describe('createTempPath', () => {
    it('should create unique temporary file paths', () => {
      const path1 = videoProcessor.createTempPath('test', 'mp4');
      const path2 = videoProcessor.createTempPath('test', 'mp4');

      expect(path1).not.toBe(path2);
      expect(path1).toContain('test-');
      expect(path1).toContain('.mp4');
    });
  });

  describe('cleanupTempFiles', () => {
    it('should delete temporary files', async () => {
      const tempPath = path.join(os.tmpdir(), `test-cleanup-${Date.now()}.txt`);
      await fs.writeFile(tempPath, 'test content');

      // Verify file exists
      let exists = await fs.access(tempPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      // Cleanup
      await videoProcessor.cleanupTempFiles([tempPath]);

      // Verify file is deleted
      exists = await fs.access(tempPath).then(() => true).catch(() => false);
      expect(exists).toBe(false);
    });

    it('should not throw error for non-existent files', async () => {
      await expect(
        videoProcessor.cleanupTempFiles(['non-existent-file.mp4'])
      ).resolves.not.toThrow();
    });
  });

  // Note: Full video processing tests require actual video files and FFmpeg
  // These would be integration tests rather than unit tests
  // For now, we test the utility methods and structure
});
