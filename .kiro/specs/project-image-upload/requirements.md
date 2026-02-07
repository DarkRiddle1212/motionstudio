# Project Image Upload - Requirements

## Feature Overview
Replace the current URL-based image system in the Project Management admin panel with a proper file upload system. Admins should be able to upload images directly, and those images will be stored on the server and displayed in the portfolio.

## Current State
- Projects currently use `thumbnailUrl` and `caseStudyUrl` fields
- Admins must paste external image URLs
- Images are hosted elsewhere (not on our server)
- No image validation or optimization

## Desired State
- Admins can upload images via drag-and-drop or file picker
- Images are stored on our server
- Images are automatically optimized (resized, compressed)
- Images are served efficiently to the portfolio
- Existing projects continue to work during migration

## User Stories

### 1. Upload Project Thumbnail
**As an** admin  
**I want** to upload a thumbnail image for a project  
**So that** it appears on the portfolio grid without needing external hosting

**Acceptance Criteria:**
- 1.1 Replace "Thumbnail URL" text input with file upload component
- 1.2 Support drag-and-drop file upload
- 1.3 Support click-to-browse file selection
- 1.4 Show image preview after selection
- 1.5 Validate file type (jpg, jpeg, png, webp, gif)
- 1.6 Validate file size (max 5MB)
- 1.7 Show upload progress indicator
- 1.8 Display success/error messages
- 1.9 Allow replacing existing thumbnail
- 1.10 Uploaded image appears in portfolio grid immediately after save

### 2. Upload Case Study Hero Image
**As an** admin  
**I want** to upload a hero image for the case study page  
**So that** it displays prominently when visitors view the project details

**Acceptance Criteria:**
- 2.1 Replace "Case Study URL" text input with file upload component
- 2.2 Support drag-and-drop file upload
- 2.3 Support click-to-browse file selection
- 2.4 Show image preview after selection
- 2.5 Validate file type (jpg, jpeg, png, webp, gif)
- 2.6 Validate file size (max 10MB for hero images)
- 2.7 Show upload progress indicator
- 2.8 Display success/error messages
- 2.9 Allow replacing existing hero image
- 2.10 Uploaded image appears on case study page immediately after save

### 2B. Media Type Selection (Image OR Video)
**As an** admin  
**I want** to choose between displaying an image or video for each project  
**So that** I can showcase motion work with actual video files

**Acceptance Criteria:**
- 2B.1 Add media type selector: "Image" or "Video"
- 2B.2 If "Image" selected, show image upload component
- 2B.3 If "Video" selected, show video file upload component
- 2B.4 Support video file formats: MP4, WebM, MOV
- 2B.5 Validate video file size (max 50MB)
- 2B.6 Show video preview/thumbnail in admin after upload
- 2B.7 Store media type in database (image/video)
- 2B.8 Portfolio grid displays video with autoplay + loop (muted)
- 2B.9 Case study page displays video with autoplay + loop
- 2B.10 Generate video thumbnail automatically for portfolio grid
- 2B.11 Optimize video files (compress, convert to web-friendly formats)
- 2B.12 Fallback to image if video fails to load

### 3. Multiple Gallery Images
**As an** admin  
**I want** to upload multiple images for the project gallery  
**So that** I can showcase different aspects of the project in the case study

**Acceptance Criteria:**
- 3.1 Add "Gallery Images" section in project form
- 3.2 Support uploading multiple images (up to 10)
- 3.3 Drag-and-drop multiple files at once
- 3.4 Show preview of all uploaded gallery images
- 3.5 Reorder gallery images with drag-and-drop
- 3.6 Delete individual gallery images
- 3.7 Validate each image (type, size)
- 3.8 Store gallery images in database as JSON array
- 3.9 Display gallery images in case study lightbox
- 3.10 Gallery images are optimized automatically
**As a** system  
**I want** to store and serve uploaded images efficiently  
**So that** the portfolio loads quickly and images are always available

**Acceptance Criteria:**
- 3.1 Images are stored in a dedicated uploads directory
- 3.2 Images are organized by project ID
- 3.3 Unique filenames prevent collisions
- 3.4 Images are automatically optimized on upload
- 3.5 Multiple image sizes generated (thumbnail, medium, large)
- 3.6 Images are served with proper caching headers
- 3.7 Old images are deleted when replaced
- 3.8 Orphaned images are cleaned up when projects are deleted
- 3.9 Images are accessible via public URL path
- 3.10 Image URLs are stored in database (thumbnailUrl, caseStudyUrl)

### 4. Backend API Endpoints
**As a** developer  
**I want** proper API endpoints for media upload  
**So that** the frontend can upload and manage images and videos

**Acceptance Criteria:**
- 4.1 POST `/api/admin/projects/upload/thumbnail` - Upload thumbnail image
- 4.2 POST `/api/admin/projects/upload/hero` - Upload hero image or video
- 4.3 POST `/api/admin/projects/upload/gallery` - Upload gallery images
- 4.4 DELETE `/api/admin/projects/:id/media/:type` - Delete media file
- 4.5 Endpoints require admin authentication
- 4.6 Endpoints accept multipart/form-data
- 4.7 Endpoints return file URL on success
- 4.8 Endpoints validate file type and size
- 4.9 Endpoints handle errors gracefully
- 4.10 Endpoints log upload activity
- 4.11 Rate limiting to prevent abuse
- 4.12 Support for video file upload (MP4, WebM, MOV)

### 5. Database Schema Updates
**As a** developer  
**I want** the database to support uploaded images, videos, and gallery images  
**So that** we can store all media types and migrate gradually

**Acceptance Criteria:**
- 5.1 `thumbnailUrl` field remains as string (stores URL)
- 5.2 `caseStudyUrl` field remains as string (stores URL)
- 5.3 Add `thumbnailPath` field (optional, stores server file path)
- 5.4 Add `caseStudyPath` field (optional, stores server file path)
- 5.5 Add `mediaType` field (enum: 'image' | 'video')
- 5.6 Add `videoPath` field (optional, stores server video file path)
- 5.7 Add `videoThumbnailPath` field (optional, auto-generated thumbnail)
- 5.8 Add `galleryImages` field (JSON array of image paths)
- 5.9 System checks for uploaded file first, falls back to URL
- 5.10 Migration script not required (backward compatible)
- 5.11 Existing projects with URLs continue to work

### 6. Frontend Upload Component
**As an** admin  
**I want** a premium, intuitive upload interface  
**So that** I can easily add images and videos with a professional experience

**Acceptance Criteria:**
- 6.1 Reusable FileUpload component with premium design
- 6.2 Drag-and-drop zone with smooth animations and visual feedback
- 6.3 Click to browse file picker with elegant modal
- 6.4 Image/video preview with dimensions and file size
- 6.5 Circular progress bar with percentage
- 6.6 Success animations (checkmark, confetti effect)
- 6.7 Error notifications with helpful messages
- 6.8 "Remove" button with confirmation animation
- 6.9 "Replace" button with smooth transition
- 6.10 Accessible with keyboard navigation
- 6.11 Mobile-friendly interface with touch gestures
- 6.12 Video preview player in admin with custom controls
- 6.13 Glassmorphism effects and subtle shadows
- 6.14 Smooth micro-interactions throughout
- 6.15 Loading skeleton states
- 6.16 Hover effects with scale and glow
- 6.4 Image preview with dimensions
- 6.5 Upload progress bar
- 6.6 Success/error notifications
- 6.7 "Remove" button to clear selection
- 6.8 "Replace" button for existing images
- 6.9 Accessible with keyboard navigation
- 6.10 Mobile-friendly interface

### 7. Image Optimization
**As a** system  
**I want** to optimize uploaded images automatically  
**So that** the portfolio loads quickly

**Acceptance Criteria:**
- 7.1 Resize images to appropriate dimensions
- 7.2 Compress images to reduce file size
- 7.3 Convert to WebP format (with fallback)
- 7.4 Generate multiple sizes (thumbnail: 400x300, medium: 800x600, large: 1920x1080)
- 7.5 Maintain aspect ratio
- 7.6 Strip EXIF data for privacy
- 7.7 Optimization happens asynchronously
- 7.8 Original file is preserved (optional)

### 8. Error Handling & Validation
**As an** admin  
**I want** clear error messages when uploads fail  
**So that** I know how to fix the issue

**Acceptance Criteria:**
- 8.1 Invalid file type shows specific error
- 8.2 File too large shows size limit
- 8.3 Network errors show retry option
- 8.4 Server errors show helpful message
- 8.5 Validation happens before upload starts
- 8.6 Failed uploads don't break the form
- 8.7 Partial uploads are cleaned up
- 8.8 User can retry failed uploads

## Technical Requirements

### Backend
- **Framework:** Express.js
- **File Upload:** Multer middleware
- **Image Processing:** Sharp library
- **Storage:** Local filesystem (with option for cloud storage later)
- **Database:** PostgreSQL via Prisma
- **Authentication:** Existing admin auth system

### Frontend
- **Framework:** React 18+ with TypeScript
- **Upload Component:** Custom FileUpload component
- **File Handling:** HTML5 File API
- **Progress:** XMLHttpRequest or Fetch with progress events
- **Validation:** Client-side validation before upload

### File Storage Structure
```
uploads/
  projects/
    {projectId}/
      thumbnail-{timestamp}.webp
      thumbnail-{timestamp}.jpg (fallback)
      hero-{timestamp}.webp
      hero-{timestamp}.jpg (fallback)
```

### API Endpoints
```
POST   /api/admin/projects/upload/thumbnail
POST   /api/admin/projects/upload/hero
DELETE /api/admin/projects/:id/images/:type
GET    /uploads/projects/:projectId/:filename (static serving)
```

### Database Schema Changes
```prisma
model Project {
  id            String   @id @default(uuid())
  title         String
  description   String
  thumbnailUrl  String   // Can be external URL or /uploads/... path
  caseStudyUrl  String   // Can be external URL or /uploads/... path
  thumbnailPath String?  // Optional: server file path
  caseStudyPath String?  // Optional: server file path
  mediaType     String   @default("image") // "image" or "video"
  videoUrl      String?  // Optional: Vimeo/YouTube URL
  videoProvider String?  // Optional: "vimeo" or "youtube"
  // ... other fields
}
```

## Security Considerations
- File type validation (whitelist: jpg, jpeg, png, webp, gif)
- File size limits (thumbnail: 5MB, hero: 10MB)
- Filename sanitization to prevent path traversal
- Admin authentication required for all upload endpoints
- Rate limiting on upload endpoints
- Virus scanning (optional, for production)
- Secure file permissions (not executable)

## Performance Considerations
- Async image processing (don't block response)
- Generate multiple sizes for responsive images
- Serve images with proper caching headers
- Use CDN for image delivery (future enhancement)
- Lazy loading on frontend
- Progressive image loading

## Migration Strategy
1. Deploy new upload functionality
2. Keep existing URL fields working
3. Admins can gradually replace URLs with uploads
4. No forced migration required
5. Both systems work simultaneously

## Out of Scope
- Multiple gallery images per project (future feature)
- Image editing/cropping in admin panel
- Cloud storage (S3, Cloudinary) - future enhancement
- Bulk image upload
- Image CDN integration
- Video file upload (use external services like Vimeo/YouTube only)
- Live video streaming

## Success Metrics
- 100% of new projects use uploaded images
- Image upload success rate > 95%
- Average upload time < 5 seconds
- Portfolio page load time remains < 2 seconds
- Zero broken images in portfolio

## Dependencies
- Existing Project model and API
- Existing admin authentication
- Existing ProjectManagement component
- Multer npm package
- Sharp npm package

## Priority
**Critical (Must Have):**
- Upload thumbnail image (1.1-1.10)
- Upload hero image OR video embed (2.1-2.10, 2B.1-2B.10)
- Backend API endpoints (4.1-4.10)
- Frontend upload component (6.1-6.10)
- Media type selection (image/video)

**High Priority:**
- Image storage & management (3.1-3.10)
- Error handling (8.1-8.8)
- Security validation

**Medium Priority:**
- Image optimization (7.1-7.8)
- Database schema updates (5.1-5.7)

**Low Priority:**
- Advanced optimization features
- Analytics on upload success rates
