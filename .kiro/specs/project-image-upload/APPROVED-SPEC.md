# Portfolio Media Upload System - APPROVED SPECIFICATION

## ✅ Confirmed Requirements

### 1. Image Upload System
- ✅ Upload thumbnail images (drag-and-drop or browse)
- ✅ Upload hero images (drag-and-drop or browse)
- ✅ Upload multiple gallery images (up to 10 per project)
- ✅ File size limits: 5MB (thumbnail), 10MB (hero), 5MB each (gallery)
- ✅ Automatic optimization (resize, compress, WebP format)
- ✅ Image preview before upload
- ✅ Progress indicators
- ✅ Replace/delete functionality

### 2. Video Upload System
- ✅ Upload video FILES directly (NO external links)
- ✅ Supported formats: MP4, WebM, MOV
- ✅ File size limit: 50MB per video
- ✅ Automatic video compression and optimization
- ✅ Auto-generate video thumbnail for portfolio grid
- ✅ Video preview in admin panel

### 3. Media Type Selection
- ✅ Choose "Image" OR "Video" for each project's hero/case study
- ✅ Thumbnail is always an image
- ✅ Hero can be either image or video
- ✅ If video: Autoplay + Loop (muted on portfolio grid)
- ✅ If video: Autoplay + Loop (with sound on case study page)

### 4. Multiple Gallery Images
- ✅ Upload up to 10 gallery images per project
- ✅ Drag-and-drop to reorder
- ✅ Delete individual images
- ✅ Display in lightbox on case study page
- ✅ Automatic optimization for all gallery images

### 5. Backward Compatibility
- ✅ Existing projects with URL-based images continue to work
- ✅ No migration required
- ✅ System checks for uploaded files first, falls back to URLs

---

## 🗄️ Database Schema

```prisma
model Project {
  id                  String   @id @default(cuid())
  title               String
  description         String
  goal                String
  solution            String
  motionBreakdown     String
  toolsUsed           String
  order               Int
  isPublished         Boolean  @default(false)
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  // Image fields (existing - backward compatible)
  thumbnailUrl        String
  caseStudyUrl        String
  
  // NEW FIELDS
  thumbnailPath       String?  // Server path for uploaded thumbnail
  caseStudyPath       String?  // Server path for uploaded hero image
  mediaType           String   @default("image") // "image" or "video"
  videoPath           String?  // Server path for uploaded video
  videoThumbnailPath  String?  // Auto-generated video thumbnail
  galleryImages       String   @default("[]") // JSON array of image paths
  
  @@map("projects")
}
```

---

## 📁 File Storage Structure

```
uploads/
  projects/
    {projectId}/
      thumbnail/
        thumbnail-{timestamp}.webp
        thumbnail-{timestamp}.jpg
      hero/
        hero-{timestamp}.webp
        hero-{timestamp}.jpg
      video/
        video-{timestamp}.mp4
        video-{timestamp}.webm
        video-thumbnail-{timestamp}.jpg
      gallery/
        gallery-1-{timestamp}.webp
        gallery-1-{timestamp}.jpg
        gallery-2-{timestamp}.webp
        gallery-2-{timestamp}.jpg
        ...
```

---

## 🔧 Technical Stack

### Backend
- **Framework:** Express.js
- **File Upload:** Multer
- **Image Processing:** Sharp
- **Video Processing:** FFmpeg (via fluent-ffmpeg)
- **Database:** PostgreSQL via Prisma
- **Storage:** Local filesystem

### Frontend
- **Framework:** React 18 + TypeScript
- **Upload Component:** Custom FileUpload with drag-and-drop
- **Video Player:** HTML5 video element
- **Progress:** XMLHttpRequest with progress events

---

## 🎯 API Endpoints

```
POST   /api/admin/projects/upload/thumbnail
POST   /api/admin/projects/upload/hero
POST   /api/admin/projects/upload/video
POST   /api/admin/projects/upload/gallery
DELETE /api/admin/projects/:id/media/:type/:filename
GET    /uploads/projects/:projectId/:type/:filename
```

---

## 🎨 User Experience

### Admin Panel - Creating Project

1. Fill in project details (title, description, etc.)
2. **Upload Thumbnail:**
   - Drag image or click to browse
   - See preview
   - Upload automatically
3. **Choose Media Type:**
   - Select "Image" or "Video"
4. **If Image:**
   - Drag hero image or click to browse
   - See preview
   - Upload automatically
5. **If Video:**
   - Drag video file or click to browse
   - See video preview
   - Upload automatically (with progress bar)
   - System generates thumbnail automatically
6. **Upload Gallery Images:**
   - Drag multiple images or click to browse
   - See all previews
   - Reorder with drag-and-drop
   - Delete individual images
7. Click "Create Project"

### Portfolio Display

**Portfolio Grid:**
- Image projects: Show thumbnail image with hover effects
- Video projects: Show video thumbnail with subtle animation/preview
- Both types: Click to view case study

**Case Study Page:**
- Image projects: Full-width hero image with parallax
- Video projects: Full-width video player (autoplay + loop)
- Gallery section: Lightbox with all gallery images
- Smooth animations throughout

---

## ⚡ Performance Optimizations

### Images:
- Resize to multiple sizes (400px, 800px, 1920px)
- Compress with quality 85%
- Generate WebP format (with JPG fallback)
- Strip EXIF data
- Lazy loading on frontend

### Videos:
- Compress to reduce file size
- Convert to web-friendly formats (MP4 H.264, WebM VP9)
- Generate poster/thumbnail image
- Optimize for streaming
- Lazy loading on frontend

---

## 🔒 Security

- ✅ File type whitelist (images: jpg, png, webp, gif | videos: mp4, webm, mov)
- ✅ File size limits enforced
- ✅ Filename sanitization
- ✅ Admin authentication required
- ✅ Rate limiting on upload endpoints
- ✅ Secure file permissions
- ✅ HTTPS only

---

## 📊 File Size Limits

| File Type | Max Size | Formats |
|-----------|----------|---------|
| Thumbnail | 5MB | JPG, PNG, WebP, GIF |
| Hero Image | 10MB | JPG, PNG, WebP, GIF |
| Gallery Image | 5MB each | JPG, PNG, WebP, GIF |
| Video | 50MB | MP4, WebM, MOV |

---

## 🚀 Implementation Plan

### Phase 1: Backend Setup (Days 1-2)
- [ ] Install dependencies (multer, sharp, fluent-ffmpeg)
- [ ] Create upload directory structure
- [ ] Implement image upload endpoints
- [ ] Implement video upload endpoints
- [ ] Implement image optimization
- [ ] Implement video processing
- [ ] Add database fields (migration)
- [ ] Test all API endpoints

### Phase 2: Frontend Components (Days 3-4)
- [ ] Create FileUpload component (images)
- [ ] Create VideoUpload component
- [ ] Create MediaTypeSelector component
- [ ] Create GalleryUpload component (multiple images)
- [ ] Update ProjectManagement form
- [ ] Add image/video previews
- [ ] Add progress indicators
- [ ] Add reorder functionality for gallery

### Phase 3: Portfolio Display (Days 5-6)
- [ ] Update PortfolioPage for video support
- [ ] Update CaseStudyPage for video player
- [ ] Implement autoplay + loop for videos
- [ ] Add gallery lightbox with multiple images
- [ ] Implement responsive video player
- [ ] Add fallback handling
- [ ] Test on mobile devices
- [ ] Performance optimization

### Phase 4: Testing & Polish (Day 7)
- [ ] Test file upload flow (images + videos)
- [ ] Test image optimization
- [ ] Test video processing
- [ ] Test gallery functionality
- [ ] Test error handling
- [ ] Test backward compatibility
- [ ] Performance testing
- [ ] Security testing
- [ ] Documentation

---

## ✅ Success Criteria

- [ ] Admins can upload images via drag-and-drop
- [ ] Admins can upload videos via drag-and-drop
- [ ] Admins can upload multiple gallery images
- [ ] Images are automatically optimized
- [ ] Videos are automatically compressed
- [ ] Video thumbnails are auto-generated
- [ ] Portfolio grid displays both image and video projects
- [ ] Videos autoplay + loop on portfolio and case study pages
- [ ] Gallery lightbox works with multiple images
- [ ] Upload success rate > 95%
- [ ] Average upload time < 10 seconds
- [ ] Portfolio page load time < 2 seconds
- [ ] Existing projects with URLs still work
- [ ] Zero broken images/videos in portfolio

---

## 📝 Notes

- Video files are stored on server (not external links)
- Videos autoplay + loop (muted on grid, with sound on case study)
- Gallery images can be reordered with drag-and-drop
- Existing projects with URL-based images are not migrated
- FFmpeg must be installed on server for video processing
- Consider cloud storage (S3) for production at scale

---

## 🎉 Ready to Start!

**Estimated Timeline:** 7 days  
**Priority:** High  
**Status:** Approved ✅  

Let's build this! 🚀
