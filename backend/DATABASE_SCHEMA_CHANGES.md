# Database Schema Changes Documentation

## Overview

This document details the database schema changes made to support the Project Image Upload system. The changes were designed to maintain backward compatibility while adding comprehensive media upload capabilities.

## Migration Information

**Migration File:** `20260201_add_project_media_fields/migration.sql`  
**Date:** February 1, 2026  
**Purpose:** Add media upload support to Project model

## Project Model Changes

### Before (Original Schema)

```prisma
model Project {
  id              String   @id @default(cuid())
  title           String
  description     String
  goal            String
  solution        String
  motionBreakdown String
  toolsUsed       String
  
  // Original URL-based fields
  thumbnailUrl    String   // External URL for thumbnail
  caseStudyUrl    String   // External URL for hero image
  
  order           Int
  isPublished     Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("projects")
}
```

### After (Enhanced Schema)

```prisma
model Project {
  id              String   @id @default(cuid())
  title           String
  description     String
  goal            String
  solution        String
  motionBreakdown String
  toolsUsed       String
  
  // Legacy URL fields (backward compatible)
  thumbnailUrl    String   // Kept for backward compatibility
  caseStudyUrl    String   // Kept for backward compatibility
  
  // New file path fields for uploaded media
  thumbnailPath       String?  // Server path for uploaded thumbnail
  caseStudyPath       String?  // Server path for uploaded hero image
  
  // Media type selection
  mediaType           String   @default("image") // "image" or "video"
  
  // Video-specific fields
  videoPath           String?  // Server path for uploaded video
  videoThumbnailPath  String?  // Auto-generated video thumbnail
  videoDuration       Float?   // Video duration in seconds
  
  // Gallery images
  galleryImages       String   @default("[]") // JSON array of image paths
  
  order           Int
  isPublished     Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@map("projects")
}
```

## New Fields Detailed

### 1. thumbnailPath
- **Type:** `String?` (optional)
- **Purpose:** Store server file path for uploaded thumbnail images
- **Example:** `"uploads/projects/cml68gb7n000210k10e1mdwje/thumbnail-1770101034291.webp"`
- **Relationship:** Replaces `thumbnailUrl` for uploaded files

### 2. caseStudyPath  
- **Type:** `String?` (optional)
- **Purpose:** Store server file path for uploaded hero images
- **Example:** `"uploads/projects/cml68gb7n000210k10e1mdwje/hero-1770101710521.webp"`
- **Relationship:** Replaces `caseStudyUrl` for uploaded files

### 3. mediaType
- **Type:** `String` (required)
- **Default:** `"image"`
- **Purpose:** Specify whether the hero media is an image or video
- **Values:** 
  - `"image"` - Hero is an image (uses `caseStudyPath`)
  - `"video"` - Hero is a video (uses `videoPath` and `videoThumbnailPath`)

### 4. videoPath
- **Type:** `String?` (optional)
- **Purpose:** Store server file path for uploaded hero videos
- **Example:** `"uploads/projects/cml68gb7n000210k10e1mdwje/video-1770102111520.mp4"`
- **Used when:** `mediaType = "video"`

### 5. videoThumbnailPath
- **Type:** `String?` (optional)
- **Purpose:** Store server file path for auto-generated video thumbnails
- **Example:** `"uploads/projects/cml68gb7n000210k10e1mdwje/video-thumbnail-1770102111520.jpg"`
- **Generated:** Automatically created when video is uploaded

### 6. videoDuration
- **Type:** `Float?` (optional)
- **Purpose:** Store video duration in seconds
- **Example:** `30.5` (30.5 seconds)
- **Used for:** Video player controls and metadata display

### 7. galleryImages
- **Type:** `String` (required)
- **Default:** `"[]"`
- **Purpose:** Store JSON array of gallery image file paths
- **Format:** JSON string array
- **Example:** `'["uploads/projects/project123/gallery-1770101710649.webp", "uploads/projects/project123/gallery-1770101710652.webp"]'`

## Migration SQL

```sql
-- AlterTable: Add new fields to Project model for media uploads
-- This migration adds support for uploaded images/videos while maintaining backward compatibility

-- Add new optional fields for uploaded media
ALTER TABLE "projects" ADD COLUMN "thumbnailPath" TEXT;
ALTER TABLE "projects" ADD COLUMN "caseStudyPath" TEXT;
ALTER TABLE "projects" ADD COLUMN "mediaType" TEXT NOT NULL DEFAULT 'image';
ALTER TABLE "projects" ADD COLUMN "videoPath" TEXT;
ALTER TABLE "projects" ADD COLUMN "videoThumbnailPath" TEXT;
ALTER TABLE "projects" ADD COLUMN "videoDuration" REAL;
ALTER TABLE "projects" ADD COLUMN "galleryImages" TEXT NOT NULL DEFAULT '[]';
```

## Backward Compatibility Strategy

### Dual Field System

The schema maintains both old URL fields and new path fields:

**Legacy Projects (URL-based):**
```typescript
{
  id: "project123",
  thumbnailUrl: "https://example.com/image.jpg",  // External URL
  caseStudyUrl: "https://example.com/hero.jpg",   // External URL
  thumbnailPath: null,                            // No uploaded file
  caseStudyPath: null,                            // No uploaded file
  mediaType: "image"
}
```

**New Projects (Upload-based):**
```typescript
{
  id: "project456", 
  thumbnailUrl: "https://example.com/placeholder.jpg", // Fallback URL
  caseStudyUrl: "https://example.com/placeholder.jpg", // Fallback URL
  thumbnailPath: "uploads/projects/project456/thumbnail-123.webp", // Uploaded file
  caseStudyPath: "uploads/projects/project456/hero-456.webp",      // Uploaded file
  mediaType: "image"
}
```

### Display Logic

Frontend components check for uploaded files first, then fall back to URLs:

```typescript
// Thumbnail display logic
const thumbnailSrc = project.thumbnailPath 
  ? `${API_BASE_URL}/${project.thumbnailPath}`
  : project.thumbnailUrl;

// Hero media display logic  
const heroSrc = project.mediaType === 'video'
  ? (project.videoPath ? `${API_BASE_URL}/${project.videoPath}` : null)
  : (project.caseStudyPath ? `${API_BASE_URL}/${project.caseStudyPath}` : project.caseStudyUrl);
```

## Data Types and Constraints

### Field Specifications

| Field | Type | Nullable | Default | Max Length | Constraints |
|-------|------|----------|---------|------------|-------------|
| `thumbnailPath` | TEXT | Yes | NULL | - | Valid file path |
| `caseStudyPath` | TEXT | Yes | NULL | - | Valid file path |
| `mediaType` | TEXT | No | 'image' | - | 'image' or 'video' |
| `videoPath` | TEXT | Yes | NULL | - | Valid file path |
| `videoThumbnailPath` | TEXT | Yes | NULL | - | Valid file path |
| `videoDuration` | REAL | Yes | NULL | - | Positive number |
| `galleryImages` | TEXT | No | '[]' | - | Valid JSON array |

### JSON Format for galleryImages

```json
[
  "uploads/projects/project123/gallery-1770101710649.webp",
  "uploads/projects/project123/gallery-1770101710652.webp", 
  "uploads/projects/project123/gallery-1770101710670.webp"
]
```

## Database Operations

### Creating Projects with Media

```typescript
// Create project with uploaded thumbnail and hero image
const project = await prisma.project.create({
  data: {
    title: "My Project",
    description: "Project description",
    goal: "Project goal",
    solution: "Project solution", 
    motionBreakdown: "Motion breakdown",
    toolsUsed: "Tools used",
    thumbnailUrl: "https://placeholder.com/thumb.jpg", // Fallback
    caseStudyUrl: "https://placeholder.com/hero.jpg",  // Fallback
    thumbnailPath: "uploads/projects/project123/thumbnail-123.webp",
    caseStudyPath: "uploads/projects/project123/hero-456.webp",
    mediaType: "image",
    galleryImages: JSON.stringify([
      "uploads/projects/project123/gallery-789.webp",
      "uploads/projects/project123/gallery-012.webp"
    ]),
    order: 1,
    isPublished: true
  }
});
```

### Updating Media Fields

```typescript
// Update thumbnail
await prisma.project.update({
  where: { id: projectId },
  data: { 
    thumbnailPath: "uploads/projects/project123/thumbnail-new.webp"
  }
});

// Add gallery image
const project = await prisma.project.findUnique({ where: { id: projectId } });
const currentGallery = JSON.parse(project.galleryImages);
currentGallery.push("uploads/projects/project123/gallery-new.webp");

await prisma.project.update({
  where: { id: projectId },
  data: { 
    galleryImages: JSON.stringify(currentGallery)
  }
});

// Switch to video media
await prisma.project.update({
  where: { id: projectId },
  data: {
    mediaType: "video",
    videoPath: "uploads/projects/project123/video-123.mp4",
    videoThumbnailPath: "uploads/projects/project123/video-thumbnail-123.jpg",
    videoDuration: 45.2
  }
});
```

### Querying Projects

```typescript
// Get all projects with media information
const projects = await prisma.project.findMany({
  select: {
    id: true,
    title: true,
    thumbnailUrl: true,
    thumbnailPath: true,
    caseStudyUrl: true, 
    caseStudyPath: true,
    mediaType: true,
    videoPath: true,
    videoThumbnailPath: true,
    videoDuration: true,
    galleryImages: true,
    isPublished: true
  },
  where: { isPublished: true },
  orderBy: { order: 'asc' }
});

// Process gallery images
const processedProjects = projects.map(project => ({
  ...project,
  galleryImages: JSON.parse(project.galleryImages)
}));
```

## Performance Considerations

### Indexing

Consider adding indexes for frequently queried fields:

```sql
-- Index for media type filtering
CREATE INDEX idx_projects_media_type ON projects(mediaType);

-- Index for published projects with media
CREATE INDEX idx_projects_published_media ON projects(isPublished, mediaType);
```

### Query Optimization

```typescript
// Efficient query for portfolio display
const projects = await prisma.project.findMany({
  select: {
    id: true,
    title: true,
    description: true,
    // Only select needed media fields based on type
    thumbnailUrl: true,
    thumbnailPath: true,
    mediaType: true,
    // Conditionally select video fields
    ...(includeVideoFields && {
      videoPath: true,
      videoThumbnailPath: true,
      videoDuration: true
    })
  },
  where: { isPublished: true }
});
```

## Data Migration Scripts

### Migrate Existing Projects

```typescript
// Script to migrate existing URL-based projects
async function migrateExistingProjects() {
  const projects = await prisma.project.findMany({
    where: {
      thumbnailPath: null,
      caseStudyPath: null
    }
  });

  for (const project of projects) {
    await prisma.project.update({
      where: { id: project.id },
      data: {
        mediaType: 'image', // Default to image
        galleryImages: '[]' // Empty gallery
      }
    });
  }
  
  console.log(`Migrated ${projects.length} projects`);
}
```

### Cleanup Orphaned Files

```typescript
// Script to find and clean up orphaned media files
async function cleanupOrphanedFiles() {
  const projects = await prisma.project.findMany({
    select: {
      thumbnailPath: true,
      caseStudyPath: true,
      videoPath: true,
      videoThumbnailPath: true,
      galleryImages: true
    }
  });

  // Collect all referenced file paths
  const referencedPaths = new Set<string>();
  
  projects.forEach(project => {
    if (project.thumbnailPath) referencedPaths.add(project.thumbnailPath);
    if (project.caseStudyPath) referencedPaths.add(project.caseStudyPath);
    if (project.videoPath) referencedPaths.add(project.videoPath);
    if (project.videoThumbnailPath) referencedPaths.add(project.videoThumbnailPath);
    
    const galleryImages = JSON.parse(project.galleryImages);
    galleryImages.forEach((path: string) => referencedPaths.add(path));
  });

  // Find files not in database
  // Implementation would scan file system and compare
}
```

## Rollback Strategy

### Rollback Migration

```sql
-- Rollback script (if needed)
ALTER TABLE "projects" DROP COLUMN "thumbnailPath";
ALTER TABLE "projects" DROP COLUMN "caseStudyPath";
ALTER TABLE "projects" DROP COLUMN "mediaType";
ALTER TABLE "projects" DROP COLUMN "videoPath";
ALTER TABLE "projects" DROP COLUMN "videoThumbnailPath";
ALTER TABLE "projects" DROP COLUMN "videoDuration";
ALTER TABLE "projects" DROP COLUMN "galleryImages";
```

### Data Preservation

Before rollback, ensure all uploaded files are backed up and URL fields are populated with accessible URLs.

## Testing

### Schema Validation Tests

```typescript
describe('Project Schema', () => {
  test('should create project with media fields', async () => {
    const project = await prisma.project.create({
      data: {
        title: 'Test Project',
        // ... other required fields
        mediaType: 'video',
        videoPath: 'uploads/test/video.mp4',
        videoDuration: 30.5,
        galleryImages: JSON.stringify(['path1.webp', 'path2.webp'])
      }
    });

    expect(project.mediaType).toBe('video');
    expect(project.videoDuration).toBe(30.5);
    expect(JSON.parse(project.galleryImages)).toHaveLength(2);
  });

  test('should handle null media fields', async () => {
    const project = await prisma.project.create({
      data: {
        title: 'Test Project',
        // ... other required fields
        // All media fields will be null/default
      }
    });

    expect(project.thumbnailPath).toBeNull();
    expect(project.mediaType).toBe('image');
    expect(project.galleryImages).toBe('[]');
  });
});
```

## Monitoring and Maintenance

### Database Health Checks

```sql
-- Check for projects with inconsistent media data
SELECT id, title, mediaType, videoPath, caseStudyPath 
FROM projects 
WHERE (mediaType = 'video' AND videoPath IS NULL) 
   OR (mediaType = 'image' AND caseStudyPath IS NULL AND thumbnailPath IS NULL);

-- Check gallery images JSON validity
SELECT id, title, galleryImages 
FROM projects 
WHERE galleryImages NOT LIKE '[%]';

-- Count projects by media type
SELECT mediaType, COUNT(*) as count 
FROM projects 
GROUP BY mediaType;
```

### Storage Usage Analysis

```sql
-- Analyze storage usage by project
SELECT 
  id,
  title,
  CASE 
    WHEN thumbnailPath IS NOT NULL THEN 1 ELSE 0 
  END as has_thumbnail,
  CASE 
    WHEN videoPath IS NOT NULL THEN 1 ELSE 0 
  END as has_video,
  CASE 
    WHEN caseStudyPath IS NOT NULL THEN 1 ELSE 0 
  END as has_hero_image,
  LENGTH(galleryImages) - LENGTH(REPLACE(galleryImages, ',', '')) + 1 as gallery_count
FROM projects
WHERE isPublished = true;
```

This comprehensive database schema documentation provides all the information needed to understand, maintain, and extend the media upload system's database layer.