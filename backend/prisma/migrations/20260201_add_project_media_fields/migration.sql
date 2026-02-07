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
