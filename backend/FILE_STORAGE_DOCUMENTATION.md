# File Storage Structure Documentation

## Overview

This document describes the file storage architecture for the Project Image Upload system, including directory organization, naming conventions, and file management strategies.

## Storage Architecture

### Base Directory Structure

```
backend/
└── uploads/
    ├── .gitkeep                    # Ensures directory exists in git
    ├── test.txt                    # Test file for static serving verification
    └── projects/
        ├── .gitkeep                # Ensures directory exists in git
        └── {projectId}/            # Individual project directories
            ├── thumbnail-{timestamp}.webp
            ├── hero-{timestamp}.webp
            ├── video-{timestamp}.mp4
            ├── video-thumbnail-{timestamp}.jpg
            ├── gallery-{timestamp}.webp
            ├── gallery-{timestamp}.webp
            └── ...
```

### Project Directory Organization

Each project gets its own isolated directory under `uploads/projects/{projectId}/`:

```
uploads/projects/cml68gb7n000210k10e1mdwje/
├── thumbnail-1770101034291.webp           # Project thumbnail
├── hero-1770101710521.webp                # Hero image
├── video-1770102111520.mp4                # Hero video
├── video-thumbnail-1770102111520.jpg      # Video thumbnail
├── gallery-1770101710649.webp             # Gallery image 1
├── gallery-1770101710652.webp             # Gallery image 2
└── gallery-1770101710670.webp             # Gallery image 3
```

## File Naming Convention

### Naming Pattern
All files follow the pattern: `{type}-{timestamp}.{extension}`

- **type**: Media type identifier
- **timestamp**: Unix timestamp in milliseconds (Date.now())
- **extension**: File format extension

### Media Type Identifiers

| Type | Description | Example |
|------|-------------|---------|
| `thumbnail` | Project thumbnail image | `thumbnail-1770101034291.webp` |
| `hero` | Hero image | `hero-1770101710521.webp` |
| `video` | Hero video | `video-1770102111520.mp4` |
| `video-thumbnail` | Video thumbnail | `video-thumbnail-1770102111520.jpg` |
| `gallery` | Gallery image | `gallery-1770101710649.webp` |

### Timestamp Generation
```typescript
const timestamp = Date.now(); // e.g., 1770101034291
const filename = `thumbnail-${timestamp}.webp`;
```

## File Formats and Processing

### Image Files

**Thumbnail Images:**
- Input: JPG, PNG, WebP, GIF
- Output: WebP format
- Dimensions: 400x300px
- Quality: 80%
- EXIF data: Stripped

**Hero Images:**
- Input: JPG, PNG, WebP, GIF  
- Output: WebP format
- Dimensions: 1920x1080px (max)
- Quality: 85%
- EXIF data: Stripped

**Gallery Images:**
- Input: JPG, PNG, WebP, GIF
- Output: WebP format
- Dimensions: 1920x1080px (max)
- Quality: 85%
- EXIF data: Stripped

### Video Files

**Hero Videos:**
- Input: MP4, WebM, MOV
- Output: MP4 format
- Codec: H.264
- Optimization: Faststart enabled
- Max width: 1920px (height scaled proportionally)

**Video Thumbnails:**
- Generated from video at 1-second mark
- Format: JPG
- Dimensions: Match video dimensions
- Quality: 85%

## Storage Management

### FileStorageManager Service

Located at: `backend/src/services/fileStorageService.ts`

**Key Methods:**

```typescript
class FileStorageManager {
  // Save file to project directory
  async saveFile(projectId: string, type: string, buffer: Buffer, extension: string): Promise<string>
  
  // Delete file from storage
  async deleteFile(filePath: string): Promise<void>
  
  // Generate public URL for file
  getPublicUrl(filePath: string): string
  
  // Clean up orphaned files
  async cleanupOrphanedFiles(): Promise<void>
}
```

### Directory Creation

Directories are created automatically when saving files:

```typescript
const projectDir = path.join(this.uploadsDir, 'projects', projectId);
await fs.mkdir(projectDir, { recursive: true });
```

### File Path Generation

```typescript
private generateFilePath(projectId: string, type: string, extension: string): string {
  const timestamp = Date.now();
  const filename = `${type}-${timestamp}.${extension}`;
  return path.join('uploads', 'projects', projectId, filename);
}
```

## Static File Serving

### Express Configuration

Static files are served from the `/uploads` path:

```typescript
// Serve uploaded files with caching headers
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1y', // Cache for 1 year
  etag: true,   // Enable ETag headers
  lastModified: true,
  setHeaders: (res, path) => {
    // Set appropriate MIME types
    if (path.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (path.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    }
  }
}));
```

### Public URL Format

Files are accessible via HTTP at:
```
http://localhost:3001/uploads/projects/{projectId}/{filename}
```

Example:
```
http://localhost:3001/uploads/projects/cml68gb7n000210k10e1mdwje/thumbnail-1770101034291.webp
```

## Security Considerations

### Path Traversal Protection

1. **Organized Structure**: Files are stored in predictable project directories
2. **No User Input in Paths**: Filenames are generated server-side
3. **Validation**: Project IDs are validated before directory creation

### File Access Control

1. **Admin Upload**: Only authenticated admins can upload files
2. **Public Read**: Uploaded files are publicly readable (for portfolio display)
3. **No Execution**: Files are served as static content, not executed

### Filename Security

1. **Timestamp-based**: Prevents filename collisions and exploits
2. **No User Input**: Original filenames are not preserved
3. **Extension Validation**: Only allowed extensions are used

## Database Integration

### Project Model Fields

The Prisma Project model includes fields for file paths:

```prisma
model Project {
  id                  String   @id @default(cuid())
  // ... other fields
  
  // Media file paths
  thumbnailPath       String?  // Path to thumbnail image
  heroImagePath       String?  // Path to hero image  
  videoPath           String?  // Path to hero video
  videoThumbnailPath  String?  // Path to video thumbnail
  galleryImages       String[] // Array of gallery image paths
  mediaType           String?  // 'image' or 'video'
  
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

### Path Storage Examples

```typescript
// Thumbnail upload
await prisma.project.update({
  where: { id: projectId },
  data: { 
    thumbnailPath: 'uploads/projects/project123/thumbnail-1770101034291.webp'
  }
});

// Gallery upload
await prisma.project.update({
  where: { id: projectId },
  data: { 
    galleryImages: {
      push: 'uploads/projects/project123/gallery-1770101710649.webp'
    }
  }
});
```

## File Cleanup and Maintenance

### Automatic Cleanup

1. **Temporary Files**: Video processing temp files are automatically cleaned up
2. **Failed Uploads**: Partial uploads are cleaned up on error
3. **File Replacement**: Old files are deleted when replaced

### Manual Cleanup

The `cleanupOrphanedFiles()` method can be used to remove files that exist on disk but are not referenced in the database:

```typescript
// Find files not referenced in database
const orphanedFiles = await fileStorageManager.cleanupOrphanedFiles();
console.log(`Cleaned up ${orphanedFiles.length} orphaned files`);
```

### Project Deletion

When a project is deleted, all associated media files should be cleaned up:

```typescript
// Delete all project media files
const project = await prisma.project.findUnique({ where: { id: projectId } });
if (project) {
  // Delete thumbnail
  if (project.thumbnailPath) {
    await fileStorageManager.deleteFile(project.thumbnailPath);
  }
  
  // Delete hero media
  if (project.heroImagePath) {
    await fileStorageManager.deleteFile(project.heroImagePath);
  }
  if (project.videoPath) {
    await fileStorageManager.deleteFile(project.videoPath);
  }
  if (project.videoThumbnailPath) {
    await fileStorageManager.deleteFile(project.videoThumbnailPath);
  }
  
  // Delete gallery images
  for (const imagePath of project.galleryImages) {
    await fileStorageManager.deleteFile(imagePath);
  }
}
```

## Performance Considerations

### Caching Strategy

1. **Static File Caching**: Files cached for 1 year with ETag support
2. **CDN Ready**: File structure supports CDN integration
3. **Optimized Formats**: WebP for images, optimized MP4 for videos

### Storage Optimization

1. **Image Compression**: Aggressive compression while maintaining quality
2. **Format Conversion**: Convert all images to WebP for smaller file sizes
3. **Video Optimization**: H.264 with faststart for web streaming

### Scalability

1. **Horizontal Scaling**: File structure supports multiple server instances
2. **Cloud Storage**: Can be adapted for AWS S3, Google Cloud Storage, etc.
3. **Load Balancing**: Static files can be served by separate servers/CDN

## Backup and Recovery

### Backup Strategy

1. **Database Backup**: Include file path references
2. **File System Backup**: Backup entire `uploads/` directory
3. **Incremental Backups**: Only backup changed files

### Recovery Process

1. **Restore Database**: Restore project records with file paths
2. **Restore Files**: Restore files to exact same paths
3. **Verify Integrity**: Check that all referenced files exist

## Monitoring and Logging

### File Operations Logging

All file operations are logged for debugging and audit purposes:

```typescript
console.log(`Saved file: ${filePath}`);
console.log(`Deleted file: ${filePath}`);
console.error(`Failed to process file: ${error.message}`);
```

### Storage Metrics

Monitor these metrics for storage health:

1. **Disk Usage**: Total space used by uploads
2. **File Count**: Number of files per project
3. **Upload Success Rate**: Percentage of successful uploads
4. **Processing Time**: Time taken for image/video processing

## Troubleshooting

### Common Issues

**Permission Errors:**
```bash
# Fix directory permissions
chmod 755 backend/uploads
chmod 755 backend/uploads/projects
```

**Missing Directories:**
```bash
# Create required directories
mkdir -p backend/uploads/projects
touch backend/uploads/.gitkeep
touch backend/uploads/projects/.gitkeep
```

**File Not Found:**
- Check file path in database matches actual file location
- Verify static file serving is configured correctly
- Check file permissions

**Upload Failures:**
- Verify disk space availability
- Check file size limits
- Validate file format support

### Debug Commands

```bash
# Check upload directory structure
find backend/uploads -type f -name "*.webp" | head -10

# Check file sizes
du -sh backend/uploads/projects/*

# Verify static file serving
curl -I http://localhost:3001/uploads/test.txt
```

## Migration and Deployment

### Production Deployment

1. **Create Upload Directory**: Ensure `uploads/` exists with proper permissions
2. **Configure Static Serving**: Set up nginx/Apache for static file serving
3. **Set Environment Variables**: Configure upload paths if different from default
4. **Test File Upload**: Verify upload and serving functionality

### Cloud Storage Migration

To migrate to cloud storage (S3, etc.):

1. **Update FileStorageManager**: Implement cloud storage methods
2. **Migrate Existing Files**: Copy files to cloud storage
3. **Update Database**: Update file paths to cloud URLs
4. **Update Static Serving**: Remove local static serving

This file storage system provides a robust, secure, and scalable foundation for managing project media files.