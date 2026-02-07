# Project Image Upload API Documentation

## Overview

This document provides comprehensive documentation for the Project Image Upload API endpoints. These endpoints allow administrators to upload, manage, and delete media files (images and videos) for portfolio projects.

## Base URL

All endpoints are prefixed with `/api/admin/projects/`

## Authentication

All upload endpoints require admin authentication via JWT token in the Authorization header:

```
Authorization: Bearer <admin_jwt_token>
```

## Rate Limiting

All upload endpoints are rate-limited to **20 requests per minute per IP address**.

Rate limit exceeded response:
```json
{
  "error": "Too many upload requests",
  "code": "RATE_LIMIT_EXCEEDED", 
  "message": "You have exceeded the upload rate limit. Please try again later."
}
```

---

## API Endpoints

### 1. Upload Project Thumbnail

Upload and process a thumbnail image for a project.

**Endpoint:** `POST /api/admin/projects/upload/thumbnail`

**Content-Type:** `multipart/form-data`

**Request Parameters:**
- `file` (file, required): Image file (JPG, PNG, WebP, GIF)
- `projectId` (string, required): ID of the project

**File Constraints:**
- Maximum file size: 5MB
- Allowed formats: JPG, PNG, WebP, GIF
- Processed to: 400x300px WebP format

**Success Response (200):**
```json
{
  "success": true,
  "url": "http://localhost:3001/uploads/projects/project123/thumbnail-1234567890.webp",
  "path": "uploads/projects/project123/thumbnail-1234567890.webp",
  "metadata": {
    "width": 400,
    "height": 300,
    "size": 15420,
    "format": "webp"
  }
}
```

**Error Responses:**

*401 Unauthorized:*
```json
{
  "error": "Admin authentication required"
}
```

*400 Bad Request:*
```json
{
  "error": "No file uploaded"
}
```

*400 Bad Request (Invalid file type):*
```json
{
  "error": "Invalid file type. Only JPG, PNG, WebP, and GIF images are allowed."
}
```

*400 Bad Request (File too large):*
```json
{
  "error": "File too large",
  "code": "FILE_TOO_LARGE",
  "message": "The uploaded file exceeds the maximum allowed size."
}
```

*500 Internal Server Error:*
```json
{
  "error": "Upload failed",
  "code": "PROCESSING_FAILED",
  "message": "Image processing failed. Please try again with a different image."
}
```

---

### 2. Upload Project Hero Media

Upload and process a hero image or video for a project.

**Endpoint:** `POST /api/admin/projects/upload/hero`

**Content-Type:** `multipart/form-data`

**Request Parameters:**
- `file` (file, required): Image or video file
- `projectId` (string, required): ID of the project

**File Constraints:**
- Images: Maximum 10MB (JPG, PNG, WebP, GIF)
- Videos: Maximum 50MB (MP4, WebM, MOV)
- Images processed to: 1920x1080px WebP format
- Videos processed to: MP4 with H.264 codec and faststart

**Success Response - Image (200):**
```json
{
  "success": true,
  "mediaType": "image",
  "url": "http://localhost:3001/uploads/projects/project123/hero-1234567890.webp",
  "path": "uploads/projects/project123/hero-1234567890.webp",
  "metadata": {
    "width": 1920,
    "height": 1080,
    "size": 245680,
    "format": "webp"
  }
}
```

**Success Response - Video (200):**
```json
{
  "success": true,
  "mediaType": "video",
  "videoUrl": "http://localhost:3001/uploads/projects/project123/video-1234567890.mp4",
  "videoPath": "uploads/projects/project123/video-1234567890.mp4",
  "thumbnailUrl": "http://localhost:3001/uploads/projects/project123/video-thumbnail-1234567890.jpg",
  "thumbnailPath": "uploads/projects/project123/video-thumbnail-1234567890.jpg",
  "metadata": {
    "duration": 30.5,
    "width": 1920,
    "height": 1080,
    "size": 5242880,
    "format": "mp4",
    "codec": "h264"
  }
}
```

**Error Responses:**
Same as thumbnail endpoint, plus:

*400 Bad Request (Invalid file type):*
```json
{
  "error": "Invalid file type. Only images (JPG, PNG, WebP, GIF) and videos (MP4, WebM, MOV) are allowed."
}
```

---

### 3. Upload Gallery Images

Upload and process multiple gallery images for a project.

**Endpoint:** `POST /api/admin/projects/upload/gallery`

**Content-Type:** `multipart/form-data`

**Request Parameters:**
- `files` (file[], required): Array of image files (max 10)
- `projectId` (string, required): ID of the project

**File Constraints:**
- Maximum 10 files per request
- Maximum file size per image: 5MB
- Allowed formats: JPG, PNG, WebP, GIF
- Processed to: 1920x1080px WebP format

**Success Response (200):**
```json
{
  "success": true,
  "uploaded": 3,
  "failed": 0,
  "results": [
    {
      "success": true,
      "url": "http://localhost:3001/uploads/projects/project123/gallery-1234567890.webp",
      "path": "uploads/projects/project123/gallery-1234567890.webp",
      "metadata": {
        "width": 1920,
        "height": 1080,
        "size": 187420,
        "format": "webp"
      }
    },
    {
      "success": true,
      "url": "http://localhost:3001/uploads/projects/project123/gallery-1234567891.webp",
      "path": "uploads/projects/project123/gallery-1234567891.webp",
      "metadata": {
        "width": 1920,
        "height": 1080,
        "size": 203150,
        "format": "webp"
      }
    }
  ]
}
```

**Partial Success Response (200):**
```json
{
  "success": true,
  "uploaded": 2,
  "failed": 1,
  "results": [
    {
      "success": true,
      "url": "http://localhost:3001/uploads/projects/project123/gallery-1234567890.webp",
      "path": "uploads/projects/project123/gallery-1234567890.webp",
      "metadata": {
        "width": 1920,
        "height": 1080,
        "size": 187420,
        "format": "webp"
      }
    },
    {
      "success": false,
      "error": "Image processing failed",
      "filename": "corrupted-image.jpg"
    }
  ]
}
```

**Error Responses:**
Same as thumbnail endpoint, plus:

*400 Bad Request (Too many files):*
```json
{
  "error": "Too many files",
  "code": "TOO_MANY_FILES", 
  "message": "Maximum 10 files allowed"
}
```

---

### 4. Delete Project Media

Delete uploaded media files for a project.

**Endpoint:** `DELETE /api/admin/projects/:projectId/media/:type`

**URL Parameters:**
- `projectId` (string, required): ID of the project
- `type` (string, required): Type of media to delete
  - `thumbnail` - Delete thumbnail image
  - `hero` - Delete hero image
  - `video` - Delete hero video and its thumbnail
  - `gallery` - Delete all gallery images

**Success Response (200):**
```json
{
  "success": true,
  "message": "Media deleted successfully",
  "deletedFiles": [
    "uploads/projects/project123/thumbnail-1234567890.webp"
  ]
}
```

**Error Responses:**

*404 Not Found:*
```json
{
  "error": "Project not found"
}
```

*500 Internal Server Error:*
```json
{
  "error": "Delete failed",
  "code": "DELETE_FAILED",
  "message": "Failed to delete media files. Please try again."
}
```

---

## File Processing Details

### Image Processing
- **Thumbnail**: Resized to 400x300px, 80% quality, WebP format
- **Hero Image**: Resized to 1920x1080px, 85% quality, WebP format  
- **Gallery Images**: Resized to 1920x1080px, 85% quality, WebP format
- **EXIF Data**: Automatically stripped from all processed images
- **Aspect Ratio**: Maintained during resize operations

### Video Processing
- **Format**: Converted to MP4 with H.264 codec
- **Optimization**: Faststart flag enabled for web streaming
- **Max Resolution**: 1920px width (height scaled proportionally)
- **Thumbnail**: Generated at 1-second mark as JPG
- **Temporary Files**: Automatically cleaned up after processing

### File Storage Structure
```
uploads/
└── projects/
    └── {projectId}/
        ├── thumbnail-{timestamp}.webp
        ├── hero-{timestamp}.webp
        ├── video-{timestamp}.mp4
        ├── video-thumbnail-{timestamp}.jpg
        ├── gallery-{timestamp}.webp
        └── gallery-{timestamp}.webp
```

---

## Security Features

1. **Authentication**: Admin JWT token required for all endpoints
2. **File Type Validation**: Server-side MIME type validation
3. **File Size Limits**: Enforced at middleware level
4. **Rate Limiting**: 20 requests per minute per IP
5. **Path Traversal Protection**: Organized directory structure
6. **Filename Sanitization**: Timestamp-based naming prevents exploits
7. **Error Message Security**: Generic error messages prevent information leakage

---

## Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": "Brief error description",
  "code": "ERROR_CODE", 
  "message": "User-friendly error message"
}
```

Common error codes:
- `FILE_TOO_LARGE` - File exceeds size limit
- `TOO_MANY_FILES` - Too many files in request
- `UNEXPECTED_FILE` - Unexpected file field
- `UPLOAD_ERROR` - General upload error
- `UPLOAD_FAILED` - Upload validation failed
- `PROCESSING_FAILED` - File processing failed
- `DELETE_FAILED` - File deletion failed
- `RATE_LIMIT_EXCEEDED` - Rate limit exceeded

---

## Usage Examples

### Upload Thumbnail with cURL
```bash
curl -X POST \
  http://localhost:3001/api/admin/projects/upload/thumbnail \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "file=@thumbnail.jpg" \
  -F "projectId=project123"
```

### Upload Hero Video with JavaScript
```javascript
const formData = new FormData();
formData.append('file', videoFile);
formData.append('projectId', 'project123');

const response = await fetch('/api/admin/projects/upload/hero', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});

const result = await response.json();
```

### Upload Multiple Gallery Images
```javascript
const formData = new FormData();
imageFiles.forEach(file => {
  formData.append('files', file);
});
formData.append('projectId', 'project123');

const response = await fetch('/api/admin/projects/upload/gallery', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`
  },
  body: formData
});
```

---

## Testing

All endpoints can be tested using the provided integration tests in:
- `backend/src/__tests__/admin-integration.test.ts`
- `backend/src/services/__tests__/upload.property.test.ts`

Run tests with:
```bash
cd backend
npm test
```