# Frontend Components Documentation

## Overview

This document provides comprehensive documentation for the frontend components used in the Project Image Upload system. These components provide a premium user experience with smooth animations, drag-and-drop functionality, and real-time progress tracking.

## Component Architecture

The upload system consists of several reusable components that work together:

1. **FileUpload** - Base upload component with drag-and-drop
2. **ImagePreview** - Display uploaded images with metadata
3. **VideoPreview** - Display uploaded videos with custom controls
4. **MediaTypeSelector** - Toggle between image and video modes
5. **GalleryUpload** - Multi-image upload with reordering
6. **Upload API** - Client-side API functions

---

## FileUpload Component

### Overview
The main upload component that handles single file uploads with drag-and-drop, progress tracking, and premium animations.

### Props Interface
```typescript
interface FileUploadProps {
  accept: string;                                    // File types to accept (e.g., "image/*")
  maxSize: number;                                   // Maximum file size in bytes
  onUpload: (file: File) => Promise<UploadResult>;   // Upload handler function
  onRemove?: () => void;                             // Optional remove handler
  existingUrl?: string;                              // URL of existing file
  mediaType: 'image' | 'video';                      // Media type for display
  label: string;                                     // Label text
  helpText?: string;                                 // Optional help text
}

interface UploadResult {
  url: string;                                       // Public URL of uploaded file
  path: string;                                      // Server path
  dimensions?: { width: number; height: number };   // Image/video dimensions
  duration?: number;                                 // Video duration (seconds)
  size: number;                                      // File size in bytes
}
```

### Usage Example
```tsx
import { FileUpload } from '@/components/Common/FileUpload';
import { uploadThumbnail } from '@/utils/uploadApi';

function ProjectForm() {
  const handleThumbnailUpload = async (file: File) => {
    return await uploadThumbnail('project123', file);
  };

  return (
    <FileUpload
      accept="image/*"
      maxSize={5 * 1024 * 1024} // 5MB
      onUpload={handleThumbnailUpload}
      mediaType="image"
      label="Project Thumbnail"
      helpText="Upload a thumbnail image for your project"
    />
  );
}
```

### Features
- **Drag & Drop**: Visual feedback with hover states
- **Progress Tracking**: Real-time upload progress with shimmer effects
- **File Validation**: Client-side validation for type and size
- **Success Animation**: Confetti burst and checkmark on completion
- **Error Handling**: User-friendly error messages with retry option
- **Replace/Remove**: Hover overlay with action buttons
- **Responsive**: Works on mobile and desktop

### States
- `idle` - Ready for upload
- `dragging` - File being dragged over
- `uploading` - Upload in progress with percentage
- `success` - Upload completed successfully
- `error` - Upload failed with error message

---

## ImagePreview Component

### Overview
Displays uploaded images with metadata and action buttons.

### Props Interface
```typescript
interface ImagePreviewProps {
  url: string;                                       // Image URL
  alt?: string;                                      // Alt text (default: "Preview")
  metadata?: {                                       // Optional metadata
    width: number;
    height: number;
    size: number;
    format?: string;
  };
  onReplace?: () => void;                            // Replace button handler
  onRemove?: () => void;                             // Remove button handler
  className?: string;                                // Additional CSS classes
}
```

### Usage Example
```tsx
import { ImagePreview } from '@/components/Common/ImagePreview';

function ProjectThumbnail({ project }) {
  return (
    <ImagePreview
      url={project.thumbnailUrl}
      alt={`${project.title} thumbnail`}
      metadata={{
        width: 400,
        height: 300,
        size: 15420,
        format: 'webp'
      }}
      onReplace={() => openFileDialog()}
      onRemove={() => removeThumbnail()}
    />
  );
}
```

### Features
- **Hover Effects**: Scale animation and overlay on hover
- **Metadata Display**: Shows dimensions, file size, and format
- **Action Buttons**: Replace and remove with smooth animations
- **Responsive**: Adapts to different screen sizes
- **Glassmorphism**: Premium backdrop blur effects

---

## VideoPreview Component

### Overview
Advanced video player with custom controls and glassmorphism styling.

### Props Interface
```typescript
interface VideoPreviewProps {
  videoUrl: string;                                  // Video file URL
  thumbnailUrl?: string;                             // Optional poster image
  metadata?: {                                       // Optional metadata
    duration: number;                                // Duration in seconds
    width: number;
    height: number;
    size: number;
    format?: string;
  };
  onReplace?: () => void;                            // Replace button handler
  onRemove?: () => void;                             // Remove button handler
  className?: string;                                // Additional CSS classes
}
```

### Usage Example
```tsx
import { VideoPreview } from '@/components/Common/VideoPreview';

function ProjectHeroVideo({ project }) {
  return (
    <VideoPreview
      videoUrl={project.videoUrl}
      thumbnailUrl={project.videoThumbnailUrl}
      metadata={{
        duration: 30.5,
        width: 1920,
        height: 1080,
        size: 5242880,
        format: 'mp4'
      }}
      onReplace={() => openFileDialog()}
      onRemove={() => removeVideo()}
    />
  );
}
```

### Features
- **Custom Controls**: Play/pause, volume, progress, fullscreen
- **Glassmorphism**: Backdrop blur effects on controls
- **Auto-hide Controls**: Fade in/out on hover
- **Progress Bar**: Draggable seek bar with visual feedback
- **Volume Control**: Slider with mute toggle
- **Fullscreen**: Native fullscreen API support
- **Metadata Display**: Duration, dimensions, file size
- **Responsive**: Mobile-friendly controls

### Control Features
- Click video to play/pause
- Hover to show/hide controls
- Drag progress bar to seek
- Volume slider with mute button
- Fullscreen toggle
- Time display (current/total)

---

## MediaTypeSelector Component

### Overview
Segmented control for switching between image and video modes.

### Props Interface
```typescript
interface MediaTypeSelectorProps {
  value: 'image' | 'video';                          // Current selection
  onChange: (value: 'image' | 'video') => void;     // Change handler
  className?: string;                                // Additional CSS classes
}
```

### Usage Example
```tsx
import { MediaTypeSelector } from '@/components/Common/MediaTypeSelector';

function HeroMediaUpload() {
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  return (
    <div>
      <MediaTypeSelector
        value={mediaType}
        onChange={setMediaType}
      />
      
      {mediaType === 'image' ? (
        <FileUpload accept="image/*" mediaType="image" />
      ) : (
        <FileUpload accept="video/*" mediaType="video" />
      )}
    </div>
  );
}
```

### Features
- **Smooth Animation**: Sliding indicator with spring physics
- **Icons**: Visual icons for image and video options
- **Glassmorphism**: Premium backdrop blur styling
- **Responsive**: Adapts to different screen sizes
- **Keyboard Accessible**: Proper focus and keyboard navigation

---

## GalleryUpload Component

### Overview
Advanced multi-image upload with drag-to-reorder functionality.

### Props Interface
```typescript
interface GalleryImage {
  id: string;                                        // Unique identifier
  url: string;                                       // Public URL
  path: string;                                      // Server path
  metadata?: {                                       // Optional metadata
    width: number;
    height: number;
    size: number;
    format?: string;
  };
}

interface GalleryUploadProps {
  images: GalleryImage[];                            // Current images
  onImagesChange: (images: GalleryImage[]) => void;  // Images change handler
  onUpload: (files: File[]) => Promise<GalleryImage[]>; // Upload handler
  onRemove: (imageId: string) => void;               // Remove handler
  maxImages?: number;                                // Max images (default: 10)
  className?: string;                                // Additional CSS classes
}
```

### Usage Example
```tsx
import { GalleryUpload } from '@/components/Common/GalleryUpload';
import { uploadGallery } from '@/utils/uploadApi';

function ProjectGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);

  const handleUpload = async (files: File[]) => {
    const result = await uploadGallery('project123', files);
    return result.results.filter(r => r.success).map(r => ({
      id: crypto.randomUUID(),
      url: r.url!,
      path: r.path!,
      metadata: r.metadata
    }));
  };

  const handleRemove = (imageId: string) => {
    // Handle removal logic
  };

  return (
    <GalleryUpload
      images={images}
      onImagesChange={setImages}
      onUpload={handleUpload}
      onRemove={handleRemove}
      maxImages={10}
    />
  );
}
```

### Features
- **Drag to Reorder**: Smooth reordering with Framer Motion
- **Multi-file Upload**: Upload multiple images at once
- **Progress Tracking**: Real-time upload progress
- **Number Badges**: Visual indicators for image order
- **Remove on Hover**: Delete button appears on hover
- **Sparkle Animation**: Success animation with sparkle effects
- **Grid Layout**: Responsive grid that adapts to screen size
- **File Validation**: Prevents exceeding maximum image count

### Reordering
- Uses Framer Motion's `Reorder` component
- Smooth spring animations during reorder
- Visual feedback with drag handles
- Maintains image metadata during reorder

---

## Upload API Utilities

### Overview
Client-side API functions for handling file uploads with progress tracking.

### Functions

#### uploadThumbnail
```typescript
async function uploadThumbnail(
  projectId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<ThumbnailUploadResult>
```

**Parameters:**
- `projectId` - The project ID
- `file` - Image file to upload
- `onProgress` - Optional progress callback

**Returns:**
```typescript
{
  success: true,
  url: "http://localhost:3001/uploads/projects/project123/thumbnail-123.webp",
  path: "uploads/projects/project123/thumbnail-123.webp",
  metadata: {
    width: 400,
    height: 300,
    size: 15420,
    format: "webp"
  }
}
```

#### uploadHero
```typescript
async function uploadHero(
  projectId: string,
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<HeroUploadResult>
```

**Parameters:**
- `projectId` - The project ID
- `file` - Image or video file to upload
- `onProgress` - Optional progress callback

**Returns (Image):**
```typescript
{
  success: true,
  mediaType: "image",
  url: "http://localhost:3001/uploads/projects/project123/hero-456.webp",
  path: "uploads/projects/project123/hero-456.webp",
  metadata: {
    width: 1920,
    height: 1080,
    size: 245680,
    format: "webp"
  }
}
```

**Returns (Video):**
```typescript
{
  success: true,
  mediaType: "video",
  videoUrl: "http://localhost:3001/uploads/projects/project123/video-789.mp4",
  videoPath: "uploads/projects/project123/video-789.mp4",
  thumbnailUrl: "http://localhost:3001/uploads/projects/project123/video-thumbnail-789.jpg",
  thumbnailPath: "uploads/projects/project123/video-thumbnail-789.jpg",
  metadata: {
    duration: 30.5,
    width: 1920,
    height: 1080,
    size: 5242880,
    format: "mp4",
    codec: "h264"
  }
}
```

#### uploadGallery
```typescript
async function uploadGallery(
  projectId: string,
  files: File[],
  onProgress?: (progress: UploadProgress) => void
): Promise<GalleryUploadResult>
```

**Parameters:**
- `projectId` - The project ID
- `files` - Array of image files (max 10)
- `onProgress` - Optional progress callback

**Returns:**
```typescript
{
  success: true,
  uploaded: 3,
  failed: 0,
  results: [
    {
      success: true,
      url: "http://localhost:3001/uploads/projects/project123/gallery-001.webp",
      path: "uploads/projects/project123/gallery-001.webp",
      metadata: { width: 1920, height: 1080, size: 187420, format: "webp" }
    },
    // ... more results
  ]
}
```

#### deleteMedia
```typescript
async function deleteMedia(
  projectId: string,
  type: 'thumbnail' | 'hero' | 'gallery'
): Promise<DeleteMediaResult>
```

**Parameters:**
- `projectId` - The project ID
- `type` - Media type to delete

**Returns:**
```typescript
{
  success: true,
  message: "Media deleted successfully"
}
```

#### retryUpload
```typescript
async function retryUpload<T>(
  uploadFn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T>
```

Utility function for retrying failed uploads with exponential backoff.

### Progress Tracking
```typescript
interface UploadProgress {
  loaded: number;      // Bytes uploaded
  total: number;       // Total bytes
  percentage: number;  // Percentage complete (0-100)
}
```

### Error Handling
All upload functions throw descriptive errors:
- Network errors
- Authentication errors
- File validation errors
- Server errors

---

## Animation System

### Framer Motion Integration
All components use Framer Motion for smooth animations:

#### Common Animation Variants
```typescript
// Fade in/out
const fadeVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

// Slide up
const slideUpVariants = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: -20, opacity: 0 }
};

// Spring physics
const springTransition = {
  type: "spring",
  stiffness: 200,
  damping: 20
};
```

#### Success Animations
- **Confetti Burst**: 6-particle explosion on upload success
- **Checkmark Draw**: SVG path animation for completion
- **Sparkle Effects**: 4-directional sparkle animation for gallery
- **Scale Bounce**: Spring-based scale animation

#### Progress Animations
- **Shimmer Effect**: Moving gradient on progress bars
- **Pulse**: Gentle pulsing for loading states
- **Magnetic Buttons**: Hover effects with scale and lift

### Performance Optimization
- **60fps Target**: All animations optimized for smooth performance
- **Reduced Motion**: Respects `prefers-reduced-motion` setting
- **GPU Acceleration**: Uses transform properties for hardware acceleration
- **Lazy Loading**: Components only animate when visible

---

## Styling System

### Design Tokens
```css
/* Colors */
--primary: #F6C1CC;      /* Pink accent */
--primary-hover: #F8D1D8; /* Lighter pink */
--background: #1f2937;    /* Dark gray */
--surface: #374151;       /* Medium gray */
--text: #f9fafb;         /* Light text */
--text-muted: #9ca3af;   /* Muted text */

/* Glassmorphism */
--glass-bg: rgba(255, 255, 255, 0.1);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-backdrop: blur(12px);
```

### Component Styling
- **Glassmorphism**: Backdrop blur effects throughout
- **Rounded Corners**: Consistent border radius (8px, 12px)
- **Shadows**: Layered shadow system for depth
- **Gradients**: Subtle gradients for visual interest
- **Responsive**: Mobile-first responsive design

### Accessibility
- **Focus States**: Clear focus indicators
- **Color Contrast**: WCAG AA compliant contrast ratios
- **Screen Readers**: Proper ARIA labels and descriptions
- **Keyboard Navigation**: Full keyboard accessibility
- **Reduced Motion**: Respects user preferences

---

## Integration Examples

### Complete Project Form
```tsx
import { useState } from 'react';
import { FileUpload } from '@/components/Common/FileUpload';
import { MediaTypeSelector } from '@/components/Common/MediaTypeSelector';
import { GalleryUpload } from '@/components/Common/GalleryUpload';
import { uploadThumbnail, uploadHero, uploadGallery } from '@/utils/uploadApi';

function ProjectForm({ projectId }: { projectId: string }) {
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  return (
    <form className="space-y-8">
      {/* Thumbnail Upload */}
      <FileUpload
        accept="image/*"
        maxSize={5 * 1024 * 1024}
        onUpload={(file) => uploadThumbnail(projectId, file)}
        mediaType="image"
        label="Project Thumbnail"
        helpText="Upload a thumbnail image (max 5MB)"
      />

      {/* Hero Media Type Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-4">
          Hero Media Type
        </label>
        <MediaTypeSelector
          value={mediaType}
          onChange={setMediaType}
        />
      </div>

      {/* Hero Media Upload */}
      <FileUpload
        accept={mediaType === 'image' ? 'image/*' : 'video/*'}
        maxSize={mediaType === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024}
        onUpload={(file) => uploadHero(projectId, file)}
        mediaType={mediaType}
        label={`Hero ${mediaType === 'image' ? 'Image' : 'Video'}`}
        helpText={`Upload a hero ${mediaType} (max ${mediaType === 'image' ? '10MB' : '50MB'})`}
      />

      {/* Gallery Upload */}
      <GalleryUpload
        images={galleryImages}
        onImagesChange={setGalleryImages}
        onUpload={(files) => uploadGallery(projectId, files)}
        onRemove={(imageId) => {
          // Handle removal
        }}
        maxImages={10}
      />
    </form>
  );
}
```

### Error Handling
```tsx
function UploadWithErrorHandling() {
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    try {
      setError(null);
      return await uploadThumbnail('project123', file);
    } catch (err: any) {
      setError(err.message);
      throw err; // Re-throw to let component handle UI state
    }
  };

  return (
    <div>
      <FileUpload
        accept="image/*"
        maxSize={5 * 1024 * 1024}
        onUpload={handleUpload}
        mediaType="image"
        label="Thumbnail"
      />
      
      {error && (
        <div className="mt-2 p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
```

### Progress Tracking
```tsx
function UploadWithProgress() {
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file: File) => {
    return await uploadThumbnail('project123', file, (progress) => {
      setProgress(progress.percentage);
    });
  };

  return (
    <div>
      <FileUpload
        accept="image/*"
        maxSize={5 * 1024 * 1024}
        onUpload={handleUpload}
        mediaType="image"
        label="Thumbnail"
      />
      
      {progress > 0 && progress < 100 && (
        <div className="mt-2">
          <div className="text-sm text-gray-400 mb-1">
            Uploading... {progress}%
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-[#F6C1CC] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
```

This comprehensive component documentation provides everything needed to understand, use, and extend the upload system's frontend components.