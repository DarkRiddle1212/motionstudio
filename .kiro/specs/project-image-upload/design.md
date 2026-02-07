# Project Image Upload - Design Document

## Overview

This feature replaces the URL-based image system with a comprehensive file upload solution that supports images and videos. The system enables admins to upload media files directly through a premium UI, with automatic optimization, storage management, and efficient serving to the portfolio.

The design follows a dual-path approach: images and videos are treated as distinct media types with specialized handling. Videos support direct file uploads (MP4, WebM, MOV) with automatic thumbnail generation and optimization. The frontend features a luxurious glassmorphism-based UI with smooth animations, while the backend handles multipart uploads, processing, and storage.

Key technical components:
- **Backend**: Express + Multer (file upload) + Sharp (image processing) + FFmpeg (video processing)
- **Frontend**: React + TypeScript + Framer Motion (animations)
- **Storage**: Local filesystem with organized directory structure
- **Database**: PostgreSQL via Prisma with backward-compatible schema

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                        Admin Panel (React)                   │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  FileUpload      │  │  MediaTypeSelector│                │
│  │  Component       │  │  Component        │                │
│  └────────┬─────────┘  └────────┬──────────┘                │
│           │                     │                            │
│           └─────────┬───────────┘                            │
│                     │                                        │
│              ┌──────▼──────┐                                │
│              │  Upload API  │                                │
│              │  Client      │                                │
│              └──────┬───────┘                                │
└─────────────────────┼────────────────────────────────────────┘
                      │ HTTP Multipart
                      │
┌─────────────────────▼────────────────────────────────────────┐
│                    Express Backend                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Upload Endpoints                         │   │
│  │  /api/admin/projects/upload/thumbnail                │   │
│  │  /api/admin/projects/upload/hero                     │   │
│  │  /api/admin/projects/upload/gallery                  │   │
│  └────────┬─────────────────────────────────────────────┘   │
│           │                                                  │
│  ┌────────▼─────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │  Multer          │  │  Sharp       │  │  FFmpeg      │  │
│  │  Middleware      │  │  Processor   │  │  Processor   │  │
│  └────────┬─────────┘  └──────┬───────┘  └──────┬───────┘  │
│           │                   │                  │           │
│           └───────────────────┼──────────────────┘           │
│                               │                              │
│                      ┌────────▼────────┐                     │
│                      │  File Storage   │                     │
│                      │  Manager        │                     │
│                      └────────┬────────┘                     │
└───────────────────────────────┼──────────────────────────────┘
                                │
                       ┌────────▼────────┐
                       │  Filesystem     │
                       │  uploads/       │
                       │    projects/    │
                       │      {id}/      │
                       └─────────────────┘
```

### Data Flow

**Upload Flow:**
1. User selects file in FileUpload component
2. Client validates file (type, size)
3. Client sends multipart POST to upload endpoint
4. Multer middleware receives and temporarily stores file
5. Sharp/FFmpeg processes file (resize, compress, optimize)
6. File Storage Manager saves to organized directory
7. Database updated with file paths
8. Response returns public URL
9. Frontend displays preview

**Display Flow:**
1. Portfolio page requests project data
2. Backend returns project with media URLs
3. Frontend checks mediaType (image/video)
4. Renders appropriate component (img/video)
5. Browser requests media from static endpoint
6. Express serves file with caching headers

## Components and Interfaces

### Frontend Components

#### FileUpload Component

**Purpose**: Reusable upload component with premium UI and drag-and-drop support.

**Props**:
```typescript
interface FileUploadProps {
  accept: string;              // MIME types: "image/*" or "video/*"
  maxSize: number;             // Max file size in bytes
  onUpload: (file: File) => Promise<UploadResult>;
  onRemove?: () => void;
  existingUrl?: string;        // For displaying existing media
  mediaType: 'image' | 'video';
  label: string;
  helpText?: string;
}

interface UploadResult {
  url: string;
  path: string;
  dimensions?: { width: number; height: number };
  duration?: number;           // For videos
  size: number;
}
```

**State Management**:
```typescript
type UploadState = 
  | { status: 'idle' }
  | { status: 'dragging' }
  | { status: 'uploading'; progress: number }
  | { status: 'success'; result: UploadResult }
  | { status: 'error'; message: string };
```

**Key Features**:
- Drag-and-drop zone with visual feedback
- Click-to-browse file picker
- Real-time validation (client-side)
- Progress indicator with percentage
- Preview after upload
- Replace/Remove actions
- Glassmorphism styling
- Smooth animations (Framer Motion)

#### MediaTypeSelector Component

**Purpose**: Toggle between image and video upload modes.

**Props**:
```typescript
interface MediaTypeSelectorProps {
  value: 'image' | 'video';
  onChange: (type: 'image' | 'video') => void;
  disabled?: boolean;
}
```

**Behavior**:
- Segmented control design
- Smooth sliding indicator animation
- Icons for each option
- Disabled state when editing existing project

#### ImagePreview Component

**Purpose**: Display uploaded image with metadata and actions.

**Props**:
```typescript
interface ImagePreviewProps {
  url: string;
  dimensions: { width: number; height: number };
  size: number;
  onReplace: () => void;
  onRemove: () => void;
}
```

**Features**:
- Rounded corners with shadow
- Hover overlay with actions
- Metadata display (dimensions, size)
- Scale animation on hover

#### VideoPreview Component

**Purpose**: Display uploaded video with custom player controls.

**Props**:
```typescript
interface VideoPreviewProps {
  url: string;
  duration: number;
  size: number;
  thumbnailUrl?: string;
  onReplace: () => void;
  onRemove: () => void;
}
```

**Features**:
- Custom video player with glassmorphism controls
- Play/pause with smooth transitions
- Progress bar with gradient
- Volume control
- Fullscreen support
- Hover to show controls

#### GalleryUpload Component

**Purpose**: Multi-image upload with drag-to-reorder functionality.

**Props**:
```typescript
interface GalleryUploadProps {
  images: GalleryImage[];
  maxImages: number;
  onAdd: (files: File[]) => Promise<void>;
  onRemove: (index: number) => void;
  onReorder: (fromIndex: number, toIndex: number) => void;
}

interface GalleryImage {
  id: string;
  url: string;
  path: string;
  order: number;
}
```

**Features**:
- Grid layout with consistent spacing
- Drag handles for reordering
- Smooth reorder animations
- Delete button on hover
- Add more button
- Number badges

### Backend Components

#### Upload Middleware (Multer Configuration)

**Purpose**: Handle multipart file uploads with validation.

```typescript
interface MulterConfig {
  storage: StorageEngine;
  limits: {
    fileSize: number;
    files: number;
  };
  fileFilter: (req: Request, file: MulterFile, cb: FileFilterCallback) => void;
}

const thumbnailUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFileFilter
});

const heroUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for images
  fileFilter: imageOrVideoFileFilter
});

const videoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for videos
  fileFilter: videoFileFilter
});
```

**File Filters**:
```typescript
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

function imageFileFilter(req: Request, file: MulterFile, cb: FileFilterCallback) {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, WebP, and GIF allowed.'));
  }
}

function videoFileFilter(req: Request, file: MulterFile, cb: FileFilterCallback) {
  if (ALLOWED_VIDEO_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, WebM, and MOV allowed.'));
  }
}
```

#### Image Processor (Sharp)

**Purpose**: Optimize and resize images.

```typescript
interface ImageProcessorOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  fit?: 'cover' | 'contain' | 'fill';
}

class ImageProcessor {
  async processImage(
    buffer: Buffer,
    options: ImageProcessorOptions
  ): Promise<Buffer> {
    return sharp(buffer)
      .resize(options.width, options.height, { fit: options.fit || 'cover' })
      .toFormat(options.format || 'webp', { quality: options.quality || 80 })
      .toBuffer();
  }

  async generateThumbnail(buffer: Buffer): Promise<Buffer> {
    return this.processImage(buffer, {
      width: 400,
      height: 300,
      quality: 75
    });
  }

  async generateMultipleSizes(buffer: Buffer): Promise<{
    thumbnail: Buffer;
    medium: Buffer;
    large: Buffer;
  }> {
    return {
      thumbnail: await this.processImage(buffer, { width: 400, height: 300 }),
      medium: await this.processImage(buffer, { width: 800, height: 600 }),
      large: await this.processImage(buffer, { width: 1920, height: 1080 })
    };
  }
}
```

#### Video Processor (FFmpeg)

**Purpose**: Optimize videos and generate thumbnails.

```typescript
interface VideoProcessorOptions {
  outputFormat?: 'mp4' | 'webm';
  quality?: 'low' | 'medium' | 'high';
  maxWidth?: number;
  maxHeight?: number;
}

class VideoProcessor {
  async processVideo(
    inputPath: string,
    outputPath: string,
    options: VideoProcessorOptions
  ): Promise<VideoMetadata> {
    // Use fluent-ffmpeg to process video
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .outputOptions([
          '-c:v libx264',           // H.264 codec
          '-preset medium',          // Encoding speed
          '-crf 23',                 // Quality (lower = better)
          '-c:a aac',                // Audio codec
          '-b:a 128k',               // Audio bitrate
          '-movflags +faststart'     // Web optimization
        ])
        .size(options.maxWidth ? `${options.maxWidth}x?` : '1920x?')
        .on('end', () => resolve(metadata))
        .on('error', reject)
        .save(outputPath);
    });
  }

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
          size: '400x300'
        })
        .on('end', resolve)
        .on('error', reject);
    });
  }

  async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(videoPath, (err, metadata) => {
        if (err) return reject(err);
        
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        resolve({
          duration: metadata.format.duration || 0,
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          size: metadata.format.size || 0,
          format: metadata.format.format_name || ''
        });
      });
    });
  }
}

interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  size: number;
  format: string;
}
```

#### File Storage Manager

**Purpose**: Manage file storage, naming, and cleanup.

```typescript
interface StorageManager {
  saveFile(projectId: string, type: MediaType, buffer: Buffer, ext: string): Promise<string>;
  deleteFile(filePath: string): Promise<void>;
  getPublicUrl(filePath: string): string;
  cleanupOrphanedFiles(projectId: string): Promise<void>;
}

type MediaType = 'thumbnail' | 'hero' | 'gallery' | 'video' | 'video-thumbnail';

class FileStorageManager implements StorageManager {
  private uploadsDir = path.join(__dirname, '../../uploads');

  async saveFile(
    projectId: string,
    type: MediaType,
    buffer: Buffer,
    ext: string
  ): Promise<string> {
    const projectDir = path.join(this.uploadsDir, 'projects', projectId);
    await fs.mkdir(projectDir, { recursive: true });

    const timestamp = Date.now();
    const filename = `${type}-${timestamp}.${ext}`;
    const filePath = path.join(projectDir, filename);

    await fs.writeFile(filePath, buffer);

    return path.relative(this.uploadsDir, filePath);
  }

  async deleteFile(filePath: string): Promise<void> {
    const fullPath = path.join(this.uploadsDir, filePath);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      // File might not exist, log but don't throw
      console.warn(`Failed to delete file: ${filePath}`, error);
    }
  }

  getPublicUrl(filePath: string): string {
    return `/uploads/${filePath}`;
  }

  async cleanupOrphanedFiles(projectId: string): Promise<void> {
    const projectDir = path.join(this.uploadsDir, 'projects', projectId);
    try {
      const files = await fs.readdir(projectDir);
      // Logic to identify and remove orphaned files
      // (files not referenced in database)
    } catch (error) {
      console.warn(`Failed to cleanup files for project ${projectId}`, error);
    }
  }
}
```

### API Endpoints

#### POST /api/admin/projects/upload/thumbnail

**Purpose**: Upload project thumbnail image.

**Request**:
- Method: POST
- Content-Type: multipart/form-data
- Body: `file` (image file)
- Headers: Authorization (admin token)

**Response**:
```typescript
interface UploadResponse {
  success: boolean;
  url: string;
  path: string;
  dimensions: { width: number; height: number };
  size: number;
}
```

**Implementation**:
```typescript
router.post('/upload/thumbnail',
  authenticateAdmin,
  thumbnailUpload.single('file'),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      // Process image
      const processed = await imageProcessor.processImage(file.buffer, {
        width: 400,
        height: 300,
        quality: 80
      });

      // Save to storage
      const projectId = req.body.projectId || 'temp';
      const filePath = await storageManager.saveFile(
        projectId,
        'thumbnail',
        processed,
        'webp'
      );

      // Get dimensions
      const metadata = await sharp(processed).metadata();

      res.json({
        success: true,
        url: storageManager.getPublicUrl(filePath),
        path: filePath,
        dimensions: { width: metadata.width!, height: metadata.height! },
        size: processed.length
      });
    } catch (error) {
      res.status(500).json({ error: 'Upload failed', message: error.message });
    }
  }
);
```

#### POST /api/admin/projects/upload/hero

**Purpose**: Upload hero image or video.

**Request**:
- Method: POST
- Content-Type: multipart/form-data
- Body: `file` (image or video file), `mediaType` ('image' | 'video')
- Headers: Authorization (admin token)

**Response**:
```typescript
interface HeroUploadResponse {
  success: boolean;
  mediaType: 'image' | 'video';
  url: string;
  path: string;
  thumbnailUrl?: string;      // For videos
  thumbnailPath?: string;     // For videos
  dimensions?: { width: number; height: number };
  duration?: number;          // For videos
  size: number;
}
```

**Implementation**:
```typescript
router.post('/upload/hero',
  authenticateAdmin,
  heroUpload.single('file'),
  async (req, res) => {
    try {
      const file = req.file;
      const mediaType = req.body.mediaType;

      if (!file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const projectId = req.body.projectId || 'temp';

      if (mediaType === 'video') {
        // Save temp file for FFmpeg processing
        const tempPath = path.join(os.tmpdir(), `upload-${Date.now()}.${file.originalname.split('.').pop()}`);
        await fs.writeFile(tempPath, file.buffer);

        // Process video
        const outputPath = path.join(os.tmpdir(), `processed-${Date.now()}.mp4`);
        const metadata = await videoProcessor.processVideo(tempPath, outputPath, {
          outputFormat: 'mp4',
          quality: 'high',
          maxWidth: 1920
        });

        // Generate thumbnail
        const thumbnailPath = path.join(os.tmpdir(), `thumb-${Date.now()}.jpg`);
        await videoProcessor.generateVideoThumbnail(outputPath, thumbnailPath);

        // Save both files
        const videoBuffer = await fs.readFile(outputPath);
        const thumbnailBuffer = await fs.readFile(thumbnailPath);

        const videoFilePath = await storageManager.saveFile(projectId, 'video', videoBuffer, 'mp4');
        const thumbFilePath = await storageManager.saveFile(projectId, 'video-thumbnail', thumbnailBuffer, 'jpg');

        // Cleanup temp files
        await Promise.all([
          fs.unlink(tempPath),
          fs.unlink(outputPath),
          fs.unlink(thumbnailPath)
        ]);

        res.json({
          success: true,
          mediaType: 'video',
          url: storageManager.getPublicUrl(videoFilePath),
          path: videoFilePath,
          thumbnailUrl: storageManager.getPublicUrl(thumbFilePath),
          thumbnailPath: thumbFilePath,
          duration: metadata.duration,
          size: videoBuffer.length
        });
      } else {
        // Process image (similar to thumbnail endpoint)
        const processed = await imageProcessor.processImage(file.buffer, {
          width: 1920,
          height: 1080,
          quality: 85
        });

        const filePath = await storageManager.saveFile(projectId, 'hero', processed, 'webp');
        const metadata = await sharp(processed).metadata();

        res.json({
          success: true,
          mediaType: 'image',
          url: storageManager.getPublicUrl(filePath),
          path: filePath,
          dimensions: { width: metadata.width!, height: metadata.height! },
          size: processed.length
        });
      }
    } catch (error) {
      res.status(500).json({ error: 'Upload failed', message: error.message });
    }
  }
);
```

#### POST /api/admin/projects/upload/gallery

**Purpose**: Upload multiple gallery images.

**Request**:
- Method: POST
- Content-Type: multipart/form-data
- Body: `files[]` (array of image files)
- Headers: Authorization (admin token)

**Response**:
```typescript
interface GalleryUploadResponse {
  success: boolean;
  images: Array<{
    url: string;
    path: string;
    dimensions: { width: number; height: number };
    size: number;
  }>;
}
```

#### DELETE /api/admin/projects/:id/media/:type

**Purpose**: Delete uploaded media file.

**Request**:
- Method: DELETE
- Params: `id` (project ID), `type` (thumbnail | hero | video | gallery)
- Headers: Authorization (admin token)

**Response**:
```typescript
interface DeleteResponse {
  success: boolean;
  message: string;
}
```

## Data Models

### Database Schema (Prisma)

```prisma
model Project {
  id                  String   @id @default(uuid())
  title               String
  description         String
  category            String
  tools               String[]
  
  // Legacy URL fields (backward compatible)
  thumbnailUrl        String?
  caseStudyUrl        String?
  
  // New file path fields
  thumbnailPath       String?
  caseStudyPath       String?
  
  // Media type selection
  mediaType           String   @default("image") // "image" or "video"
  
  // Video-specific fields
  videoPath           String?
  videoThumbnailPath  String?
  videoDuration       Float?
  
  // Gallery images
  galleryImages       Json?    // Array of { path, url, order }
  
  // Metadata
  featured            Boolean  @default(false)
  order               Int      @default(0)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  @@index([category])
  @@index([featured])
  @@index([order])
}
```

### TypeScript Interfaces

```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  tools: string[];
  
  // Media fields
  thumbnailUrl?: string;
  caseStudyUrl?: string;
  thumbnailPath?: string;
  caseStudyPath?: string;
  mediaType: 'image' | 'video';
  videoPath?: string;
  videoThumbnailPath?: string;
  videoDuration?: number;
  
  // Gallery
  galleryImages?: GalleryImage[];
  
  // Metadata
  featured: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

interface GalleryImage {
  id: string;
  path: string;
  url: string;
  order: number;
}

// Helper to get display URL (checks uploaded file first, falls back to URL)
function getDisplayUrl(project: Project, type: 'thumbnail' | 'hero'): string {
  if (type === 'thumbnail') {
    return project.thumbnailPath 
      ? `/uploads/${project.thumbnailPath}`
      : project.thumbnailUrl || '';
  } else {
    if (project.mediaType === 'video' && project.videoPath) {
      return `/uploads/${project.videoPath}`;
    }
    return project.caseStudyPath
      ? `/uploads/${project.caseStudyPath}`
      : project.caseStudyUrl || '';
  }
}

function getThumbnailUrl(project: Project): string {
  if (project.mediaType === 'video' && project.videoThumbnailPath) {
    return `/uploads/${project.videoThumbnailPath}`;
  }
  return getDisplayUrl(project, 'thumbnail');
}
```

### File Storage Structure

```
uploads/
  projects/
    {project-id-1}/
      thumbnail-1234567890.webp
      hero-1234567890.webp
      video-1234567890.mp4
      video-thumbnail-1234567890.jpg
      gallery-1234567890-0.webp
      gallery-1234567890-1.webp
      gallery-1234567890-2.webp
    {project-id-2}/
      thumbnail-1234567891.webp
      hero-1234567891.webp
```

**Naming Convention**:
- Format: `{type}-{timestamp}.{ext}`
- Type: thumbnail, hero, video, video-thumbnail, gallery
- Timestamp: Unix timestamp (milliseconds)
- Extension: webp (images), mp4 (videos), jpg (thumbnails)

## Error Handling

### Client-Side Validation

**File Type Validation**:
```typescript
function validateFileType(file: File, allowedTypes: string[]): ValidationResult {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
    };
  }
  return { valid: true };
}
```

**File Size Validation**:
```typescript
function validateFileSize(file: File, maxSize: number): ValidationResult {
  if (file.size > maxSize) {
    const maxMB = (maxSize / (1024 * 1024)).toFixed(1);
    const fileMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File too large (${fileMB}MB). Maximum: ${maxMB}MB`
    };
  }
  return { valid: true };
}
```

### Server-Side Error Handling

**Error Types**:
```typescript
class UploadError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'UploadError';
  }
}

const ErrorCodes = {
  NO_FILE: 'NO_FILE',
  INVALID_TYPE: 'INVALID_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  PROCESSING_FAILED: 'PROCESSING_FAILED',
  STORAGE_FAILED: 'STORAGE_FAILED',
  UNAUTHORIZED: 'UNAUTHORIZED'
};
```

**Error Handler Middleware**:
```typescript
function uploadErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        code: ErrorCodes.FILE_TOO_LARGE,
        message: error.message
      });
    }
  }

  if (error instanceof UploadError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code
    });
  }

  console.error('Upload error:', error);
  res.status(500).json({
    error: 'Upload failed',
    code: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred'
  });
}
```

### Cleanup on Failure

**Automatic Cleanup**:
```typescript
async function uploadWithCleanup<T>(
  operation: () => Promise<T>,
  tempFiles: string[]
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    // Clean up temp files on failure
    await Promise.all(
      tempFiles.map(file => 
        fs.unlink(file).catch(err => 
          console.warn(`Failed to cleanup ${file}:`, err)
        )
      )
    );
    throw error;
  }
}
```

### User-Facing Error Messages

**Error Message Mapping**:
```typescript
const USER_FRIENDLY_ERRORS: Record<string, string> = {
  [ErrorCodes.NO_FILE]: 'Please select a file to upload',
  [ErrorCodes.INVALID_TYPE]: 'This file type is not supported. Please use JPG, PNG, WebP, or GIF',
  [ErrorCodes.FILE_TOO_LARGE]: 'File is too large. Please choose a smaller file',
  [ErrorCodes.PROCESSING_FAILED]: 'Failed to process the file. Please try again',
  [ErrorCodes.STORAGE_FAILED]: 'Failed to save the file. Please try again',
  [ErrorCodes.UNAUTHORIZED]: 'You do not have permission to upload files'
};

function getUserFriendlyError(code: string): string {
  return USER_FRIENDLY_ERRORS[code] || 'An unexpected error occurred. Please try again';
}
```

## Testing Strategy

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage. Unit tests validate specific examples, edge cases, and integration points, while property-based tests verify universal properties across randomized inputs.

### Unit Testing

**Frontend Component Tests**:
- FileUpload component renders correctly
- Drag-and-drop triggers file selection
- File validation shows appropriate errors
- Upload progress updates correctly
- Success/error states display properly
- Replace/Remove actions work correctly

**Backend Endpoint Tests**:
- Upload endpoints accept valid files
- Upload endpoints reject invalid files
- Authentication is enforced
- File size limits are enforced
- Error responses are formatted correctly

**Integration Tests**:
- End-to-end upload flow (client → server → storage)
- Database updates after successful upload
- File cleanup on project deletion
- Backward compatibility with URL-based projects

### Property-Based Testing

Property-based tests will be implemented using a PBT library appropriate for the language (e.g., fast-check for TypeScript/JavaScript). Each test will run a minimum of 100 iterations and reference its corresponding design property.

**Configuration**:
- Library: fast-check (TypeScript/JavaScript)
- Iterations: 100 minimum per property
- Tag format: `Feature: project-image-upload, Property {N}: {description}`


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property Reflection

After analyzing all acceptance criteria, I identified the following redundancies:
- File type validation properties (1.5, 2B.4, 3.7) can be consolidated into a single property about MIME type validation
- File size validation properties (1.6, 2B.5, 3.7) can be consolidated into a single property about size limits
- Image optimization properties (3.10, 7.1-7.6) overlap significantly and can be consolidated
- Multiple size generation (3.5 Storage, 7.4) is the same property
- Authentication requirements (4.5) applies to all endpoints and can be a single property
- Error handling properties (8.1, 8.2, 8.4) can be consolidated into error message quality

The following properties represent the unique, non-redundant correctness guarantees:

### Property 1: File Type Validation

*For any* file upload attempt (image or video), if the file's MIME type is not in the allowed list for that upload type, the system should reject the upload with a specific error message indicating the allowed types.

**Validates: Requirements 1.5, 2B.4, 3.7, 4.8**

### Property 2: File Size Validation

*For any* file upload attempt, if the file size exceeds the maximum limit for that upload type (5MB for thumbnails, 10MB for hero images, 50MB for videos), the system should reject the upload with an error message indicating the size limit.

**Validates: Requirements 1.6, 2B.5, 3.7, 4.8, 8.2**

### Property 3: Gallery Image Limit

*For any* gallery upload attempt, if the total number of images (existing + new) would exceed 10, the system should reject the additional images.

**Validates: Requirements 3.2**

### Property 4: Gallery Reordering Preserves Images

*For any* gallery with N images, reordering images from any valid ordering to another valid ordering should preserve all N images without duplication or loss.

**Validates: Requirements 3.5**

### Property 5: Project Directory Organization

*For any* uploaded file, the file should be stored in a directory path that includes the project ID: `uploads/projects/{projectId}/`.

**Validates: Requirements 3.2 (Storage)**

### Property 6: Unique Filename Generation

*For any* two file uploads, even if they have the same original filename, the stored filenames should be different (using timestamps or unique identifiers).

**Validates: Requirements 3.3 (Storage)**

### Property 7: Image Optimization Reduces Size

*For any* uploaded image, the optimized version should have a smaller file size than the original while maintaining reasonable quality (quality >= 75).

**Validates: Requirements 3.4 (Storage), 7.2**

### Property 8: Multiple Image Sizes Generated

*For any* uploaded image, the system should generate at least three sizes: thumbnail (≤400x300), medium (≤800x600), and large (≤1920x1080).

**Validates: Requirements 3.5 (Storage), 7.4**

### Property 9: Caching Headers Present

*For any* request to serve an uploaded image or video, the response should include appropriate caching headers (Cache-Control, ETag, or Last-Modified).

**Validates: Requirements 3.6 (Storage)**

### Property 10: File Replacement Cleanup

*For any* operation that replaces an existing image or video, the old file should be deleted from the filesystem after the new file is successfully saved.

**Validates: Requirements 3.7 (Storage)**

### Property 11: Project Deletion Cleanup

*For any* project deletion, all associated media files (thumbnail, hero, video, gallery images) should be deleted from the filesystem.

**Validates: Requirements 3.8 (Storage)**

### Property 12: Public URL Accessibility

*For any* successfully uploaded file, the returned URL should be accessible via HTTP GET request and return the file content.

**Validates: Requirements 3.9 (Storage)**

### Property 13: Video Thumbnail Generation

*For any* uploaded video file, the system should automatically generate a thumbnail image (JPEG format, approximately 400x300 resolution).

**Validates: Requirements 2B.10**

### Property 14: Video Optimization

*For any* uploaded video file, the system should convert it to a web-friendly format (MP4 with H.264 codec) and optimize it for streaming (faststart flag).

**Validates: Requirements 2B.11**

### Property 15: Authentication Required

*For any* upload endpoint request without valid admin authentication, the system should return a 401 or 403 status code and reject the upload.

**Validates: Requirements 4.5**

### Property 16: Multipart Form Data Acceptance

*For any* upload endpoint, the endpoint should accept requests with Content-Type: multipart/form-data and correctly parse the file from the request body.

**Validates: Requirements 4.6**

### Property 17: Successful Upload Returns URL

*For any* successful file upload, the response should include a valid URL string that points to the uploaded file.

**Validates: Requirements 4.7**

### Property 18: Error Response Format

*For any* upload error (validation failure, processing failure, storage failure), the response should include an error message, error code, and appropriate HTTP status code (4xx or 5xx).

**Validates: Requirements 4.9, 8.1, 8.2, 8.4**

### Property 19: Rate Limiting Enforcement

*For any* user or IP address making more than N upload requests within a time window (e.g., 20 requests per minute), subsequent requests should be rejected with a 429 status code.

**Validates: Requirements 4.11**

### Property 20: Image Resizing Maintains Aspect Ratio

*For any* uploaded image, all generated sizes should maintain the original aspect ratio (within a tolerance of 1%).

**Validates: Requirements 7.5**

### Property 21: EXIF Data Removal

*For any* uploaded image containing EXIF metadata, the processed image should not contain EXIF data (for privacy).

**Validates: Requirements 7.6**

### Property 22: WebP Format Generation

*For any* uploaded image, the system should generate a WebP version of the image in addition to or instead of the original format.

**Validates: Requirements 7.3**

### Property 23: Validation Before Upload

*For any* file selected for upload, client-side validation (type and size) should occur before the HTTP request is sent to the server.

**Validates: Requirements 8.5**

### Property 24: Form Resilience After Error

*For any* upload error, the upload form should remain functional and allow the user to attempt another upload without page refresh.

**Validates: Requirements 8.6**

### Property 25: Temporary File Cleanup

*For any* failed upload that created temporary files during processing, those temporary files should be deleted from the filesystem.

**Validates: Requirements 8.7**

