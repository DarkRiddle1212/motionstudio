import fs from 'fs/promises';
import path from 'path';

/**
 * Media types for file organization
 */
export type MediaType = 'thumbnail' | 'hero' | 'gallery' | 'video' | 'video-thumbnail';

/**
 * File Storage Manager
 * Manages file storage operations for uploaded media files
 */
export class FileStorageManager {
  private uploadsDir: string;

  constructor(uploadsDir?: string) {
    // Default to backend/uploads directory
    this.uploadsDir = uploadsDir || path.join(__dirname, '../../uploads');
  }

  /**
   * Save a file to the storage system
   * @param projectId - The project ID for organization
   * @param type - The type of media (thumbnail, hero, video, etc.)
   * @param buffer - The file buffer to save
   * @param ext - The file extension (without dot)
   * @returns The relative path to the saved file
   */
  async saveFile(
    projectId: string,
    type: MediaType,
    buffer: Buffer,
    ext: string
  ): Promise<string> {
    // Create project directory if it doesn't exist
    const projectDir = path.join(this.uploadsDir, 'projects', projectId);
    await fs.mkdir(projectDir, { recursive: true });

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const filename = `${type}-${timestamp}.${ext}`;
    const filePath = path.join(projectDir, filename);

    // Write file to disk
    await fs.writeFile(filePath, buffer);

    // Return relative path from uploads directory
    return path.relative(this.uploadsDir, filePath).replace(/\\/g, '/');
  }

  /**
   * Delete a file from the storage system
   * @param filePath - The relative path to the file (from uploads directory)
   */
  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadsDir, filePath);
    try {
      await fs.unlink(fullPath);
    } catch (error: any) {
      // File might not exist, log but don't throw
      console.warn(`Failed to delete file: ${filePath}`, error.message);
    }
  }

  /**
   * Get the public URL for a file
   * @param filePath - The relative path to the file (from uploads directory)
   * @returns The public URL path
   */
  getPublicUrl(filePath: string): string {
    return `/uploads/${filePath}`;
  }

  /**
   * Clean up orphaned files for a project
   * Files that are not referenced in the database
   * @param projectId - The project ID
   */
  async cleanupOrphanedFiles(projectId: string): Promise<void> {
    const projectDir = path.join(this.uploadsDir, 'projects', projectId);
    try {
      const files = await fs.readdir(projectDir);
      // Logic to identify and remove orphaned files
      // This would require database queries to check which files are referenced
      // For now, we'll just log the files found
      console.log(`Found ${files.length} files in project ${projectId} directory`);
    } catch (error: any) {
      console.warn(`Failed to cleanup files for project ${projectId}`, error.message);
    }
  }

  /**
   * Delete all files for a project
   * Used when a project is deleted
   * @param projectId - The project ID
   */
  async deleteProjectFiles(projectId: string): Promise<void> {
    const projectDir = path.join(this.uploadsDir, 'projects', projectId);
    try {
      await fs.rm(projectDir, { recursive: true, force: true });
    } catch (error: any) {
      console.warn(`Failed to delete project directory: ${projectId}`, error.message);
    }
  }
}

// Export singleton instance
export const fileStorageManager = new FileStorageManager();
