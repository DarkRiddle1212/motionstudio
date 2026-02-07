import { FileStorageManager } from '../fileStorageService';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('FileStorageManager', () => {
  let storageManager: FileStorageManager;
  let testDir: string;

  beforeEach(async () => {
    // Create a temporary directory for testing
    testDir = path.join(os.tmpdir(), `test-uploads-${Date.now()}`);
    await fs.mkdir(testDir, { recursive: true });
    storageManager = new FileStorageManager(testDir);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to clean up test directory:', error);
    }
  });

  describe('saveFile', () => {
    it('should save a file to the correct directory structure', async () => {
      const projectId = 'test-project-123';
      const buffer = Buffer.from('test file content');
      const filePath = await storageManager.saveFile(projectId, 'thumbnail', buffer, 'webp');

      expect(filePath).toContain('projects/test-project-123');
      expect(filePath).toContain('thumbnail-');
      expect(filePath).toContain('.webp');

      // Verify file exists
      const fullPath = path.join(testDir, filePath);
      const exists = await fs.access(fullPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      // Verify file content
      const content = await fs.readFile(fullPath);
      expect(content.toString()).toBe('test file content');
    });

    it('should create project directory if it does not exist', async () => {
      const projectId = 'new-project-456';
      const buffer = Buffer.from('test content');
      await storageManager.saveFile(projectId, 'hero', buffer, 'jpg');

      const projectDir = path.join(testDir, 'projects', projectId);
      const exists = await fs.access(projectDir).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('should generate unique filenames for multiple uploads', async () => {
      const projectId = 'test-project';
      const buffer = Buffer.from('test');

      const filePath1 = await storageManager.saveFile(projectId, 'gallery', buffer, 'webp');
      // Small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      const filePath2 = await storageManager.saveFile(projectId, 'gallery', buffer, 'webp');

      expect(filePath1).not.toBe(filePath2);
    });
  });

  describe('deleteFile', () => {
    it('should delete an existing file', async () => {
      const projectId = 'test-project';
      const buffer = Buffer.from('test content');
      const filePath = await storageManager.saveFile(projectId, 'thumbnail', buffer, 'webp');

      // Verify file exists
      const fullPath = path.join(testDir, filePath);
      let exists = await fs.access(fullPath).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      // Delete file
      await storageManager.deleteFile(filePath);

      // Verify file is deleted
      exists = await fs.access(fullPath).then(() => true).catch(() => false);
      expect(exists).toBe(false);
    });

    it('should not throw error when deleting non-existent file', async () => {
      await expect(storageManager.deleteFile('non-existent/file.jpg')).resolves.not.toThrow();
    });
  });

  describe('getPublicUrl', () => {
    it('should return correct public URL path', () => {
      const filePath = 'projects/test-123/thumbnail-123456.webp';
      const url = storageManager.getPublicUrl(filePath);
      expect(url).toBe('/uploads/projects/test-123/thumbnail-123456.webp');
    });
  });

  describe('deleteProjectFiles', () => {
    it('should delete entire project directory', async () => {
      const projectId = 'test-project';
      const buffer = Buffer.from('test');

      // Create multiple files
      await storageManager.saveFile(projectId, 'thumbnail', buffer, 'webp');
      await storageManager.saveFile(projectId, 'hero', buffer, 'webp');
      await storageManager.saveFile(projectId, 'gallery', buffer, 'webp');

      const projectDir = path.join(testDir, 'projects', projectId);
      let exists = await fs.access(projectDir).then(() => true).catch(() => false);
      expect(exists).toBe(true);

      // Delete project files
      await storageManager.deleteProjectFiles(projectId);

      // Verify directory is deleted
      exists = await fs.access(projectDir).then(() => true).catch(() => false);
      expect(exists).toBe(false);
    });
  });
});
