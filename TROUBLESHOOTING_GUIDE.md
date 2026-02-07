# Project Image Upload System - Troubleshooting Guide

## Overview

This comprehensive troubleshooting guide covers common issues, error messages, and solutions for the Project Image Upload system. Use this guide to quickly diagnose and resolve problems with file uploads, video processing, and system configuration.

## Quick Diagnosis

### System Health Check

Run these commands to quickly assess system health:

```bash
# Backend health check
curl http://localhost:5000/api/health

# Check FFmpeg installation
ffmpeg -version

# Check upload directory permissions
ls -la backend/uploads/

# Check disk space
df -h

# Check running processes
ps aux | grep node
```

### Common Error Patterns

| Error Pattern | Likely Cause | Quick Fix |
|---------------|--------------|-----------|
| `ENOENT: no such file or directory` | Missing uploads directory | Create `backend/uploads/projects/` |
| `spawn ffmpeg ENOENT` | FFmpeg not installed | Install FFmpeg (see installation guide) |
| `413 Payload Too Large` | File size exceeds limit | Check file size limits |
| `401 Unauthorized` | Missing/invalid admin token | Check authentication |
| `429 Too Many Requests` | Rate limit exceeded | Wait or increase rate limits |
| `ENOSPC: no space left on device` | Disk full | Free up disk space |

---

## Upload Issues

### File Upload Fails

#### Symptom: "No file uploaded" error
**Cause**: File not properly selected or form data corrupted  
**Solutions**:
1. Check file input element:
   ```javascript
   console.log('Selected file:', fileInput.files[0]);
   ```
2. Verify form data:
   ```javascript
   const formData = new FormData();
   formData.append('file', file);
   formData.append('projectId', projectId);
   console.log('FormData entries:', [...formData.entries()]);
   ```
3. Check network tab in browser dev tools for request details

#### Symptom: "File too large" error
**Cause**: File exceeds size limits  
**Solutions**:
1. Check current limits:
   - Thumbnails: 5MB
   - Hero images: 10MB  
   - Hero videos: 50MB
   - Gallery images: 5MB each
2. Compress files before upload
3. Adjust limits in `uploadMiddleware.ts` if needed:
   ```typescript
   export const thumbnailUpload = multer({
     limits: {
       fileSize: 10 * 1024 * 1024, // Increase to 10MB
     }
   });
   ```

#### Symptom: "Invalid file type" error
**Cause**: File format not supported  
**Solutions**:
1. Check supported formats:
   - Images: JPG, PNG, WebP, GIF
   - Videos: MP4, WebM, MOV
2. Convert file to supported format
3. Check MIME type validation in `uploadMiddleware.ts`

#### Symptom: Upload progress stalls at 100%
**Cause**: Server processing taking too long  
**Solutions**:
1. Check server logs for processing errors
2. Verify FFmpeg is working for video files
3. Check available disk space and memory
4. Increase request timeout:
   ```typescript
   // In Express app
   app.use(timeout('300s')); // 5 minute timeout
   ```

### Authentication Issues

#### Symptom: "Admin authentication required" error
**Cause**: Missing or invalid authentication token  
**Solutions**:
1. Check token in localStorage:
   ```javascript
   console.log('Admin token:', localStorage.getItem('adminToken'));
   ```
2. Verify token format (should be JWT)
3. Check token expiration
4. Re-login to get fresh token
5. Verify token is sent in request headers:
   ```javascript
   headers: {
     'Authorization': `Bearer ${token}`
   }
   ```

#### Symptom: "403 Forbidden" error
**Cause**: Valid token but insufficient permissions  
**Solutions**:
1. Check user role in token payload
2. Verify admin role is assigned
3. Check middleware authentication logic

### Rate Limiting Issues

#### Symptom: "Too many upload requests" error
**Cause**: Exceeded rate limit (20 requests per minute)  
**Solutions**:
1. Wait for rate limit window to reset
2. Implement request queuing on frontend
3. Increase rate limits if needed:
   ```typescript
   const uploadRateLimiter = rateLimit({
     windowMs: 60 * 1000,
     max: 50, // Increase from 20 to 50
   });
   ```

---

## Image Processing Issues

### Image Processing Fails

#### Symptom: "Image processing failed" error
**Cause**: Sharp library issues or corrupted image  
**Solutions**:
1. Check Sharp installation:
   ```bash
   npm list sharp
   ```
2. Reinstall Sharp:
   ```bash
   npm uninstall sharp
   npm install sharp
   ```
3. Test with different image file
4. Check image file integrity
5. Verify image format is supported

#### Symptom: Images appear corrupted after processing
**Cause**: Processing parameters or Sharp configuration  
**Solutions**:
1. Check processing settings in `imageProcessorService.ts`
2. Adjust quality settings:
   ```typescript
   const processedBuffer = await sharp(inputBuffer)
     .resize(width, height, { fit: 'inside', withoutEnlargement: true })
     .webp({ quality: 85 }) // Increase quality
     .toBuffer();
   ```
3. Test with unprocessed image upload

#### Symptom: EXIF data not removed
**Cause**: Sharp not stripping metadata  
**Solutions**:
1. Verify metadata removal:
   ```typescript
   const processedBuffer = await sharp(inputBuffer)
     .rotate() // Auto-rotate based on EXIF
     .resize(width, height)
     .webp({ quality: 85 })
     .toBuffer();
   ```
2. Check processed image metadata:
   ```bash
   exiftool processed_image.webp
   ```

### WebP Conversion Issues

#### Symptom: WebP images not displaying in browser
**Cause**: Browser doesn't support WebP or serving issues  
**Solutions**:
1. Check browser WebP support:
   ```javascript
   const supportsWebP = document.createElement('canvas')
     .toDataURL('image/webp').indexOf('data:image/webp') === 0;
   ```
2. Implement fallback format:
   ```typescript
   // Serve JPEG fallback for unsupported browsers
   if (!supportsWebP) {
     return await sharp(inputBuffer).jpeg({ quality: 85 }).toBuffer();
   }
   ```
3. Check MIME type serving:
   ```javascript
   // In Express static config
   express.static('uploads', {
     setHeaders: (res, path) => {
       if (path.endsWith('.webp')) {
         res.setHeader('Content-Type', 'image/webp');
       }
     }
   });
   ```

---

## Video Processing Issues

### FFmpeg Issues

#### Symptom: "spawn ffmpeg ENOENT" error
**Cause**: FFmpeg not installed or not in PATH  
**Solutions**:
1. Verify FFmpeg installation:
   ```bash
   ffmpeg -version
   which ffmpeg  # Linux/macOS
   where ffmpeg  # Windows
   ```
2. Install FFmpeg (see installation guide)
3. Add FFmpeg to PATH
4. Set explicit path in code:
   ```typescript
   import ffmpeg from 'fluent-ffmpeg';
   ffmpeg.setFfmpegPath('/usr/local/bin/ffmpeg');
   ```

#### Symptom: Video processing extremely slow
**Cause**: Large files or CPU-intensive processing  
**Solutions**:
1. Use hardware acceleration if available:
   ```typescript
   ffmpeg(inputPath)
     .videoCodec('h264_nvenc') // NVIDIA GPU
     .audioCodec('aac')
     .save(outputPath);
   ```
2. Adjust processing preset:
   ```typescript
   ffmpeg(inputPath)
     .videoCodec('libx264')
     .addOption('-preset', 'fast') // Faster processing
     .save(outputPath);
   ```
3. Implement file size limits
4. Process videos asynchronously

#### Symptom: "No such codec" error
**Cause**: Required codec not available in FFmpeg build  
**Solutions**:
1. Check available codecs:
   ```bash
   ffmpeg -codecs | grep h264
   ffmpeg -encoders | grep aac
   ```
2. Install full FFmpeg build with all codecs
3. Use alternative codec:
   ```typescript
   // Fallback to different codec
   .videoCodec('libx265') // Instead of libx264
   ```

### Video Thumbnail Generation

#### Symptom: Thumbnail generation fails
**Cause**: Video format issues or FFmpeg problems  
**Solutions**:
1. Test thumbnail generation manually:
   ```bash
   ffmpeg -i video.mp4 -ss 00:00:01 -vframes 1 -vf scale=400:300 thumb.jpg
   ```
2. Check video file integrity
3. Try different timestamp:
   ```typescript
   ffmpeg(videoPath)
     .seekInput(2) // Try 2 seconds instead of 1
     .frames(1)
     .size('400x300')
     .save(thumbnailPath);
   ```

#### Symptom: Thumbnails are black/corrupted
**Cause**: Seeking to invalid timestamp or video encoding issues  
**Solutions**:
1. Get video duration first:
   ```typescript
   ffmpeg.ffprobe(videoPath, (err, metadata) => {
     const duration = metadata.format.duration;
     const seekTime = Math.min(1, duration / 2); // Seek to middle or 1s
   });
   ```
2. Use different frame extraction method:
   ```bash
   ffmpeg -i video.mp4 -vf "select=eq(n\,10)" -vframes 1 thumb.jpg
   ```

---

## Database Issues

### Database Connection

#### Symptom: "Database connection failed" error
**Cause**: Database not running or connection string incorrect  
**Solutions**:
1. Check database status:
   ```bash
   # SQLite (check file exists)
   ls -la backend/prisma/dev.db
   
   # PostgreSQL
   pg_isready -h localhost -p 5432
   
   # MySQL
   mysqladmin ping -h localhost
   ```
2. Verify connection string in `.env`
3. Check database permissions
4. Restart database service

### Migration Issues

#### Symptom: "Migration failed" error
**Cause**: Database schema conflicts or permission issues  
**Solutions**:
1. Reset database (development only):
   ```bash
   cd backend
   npx prisma migrate reset
   npx prisma migrate dev
   ```
2. Check migration status:
   ```bash
   npx prisma migrate status
   ```
3. Apply pending migrations:
   ```bash
   npx prisma migrate deploy
   ```

#### Symptom: "Column does not exist" error
**Cause**: Database schema out of sync  
**Solutions**:
1. Generate Prisma client:
   ```bash
   npx prisma generate
   ```
2. Check schema differences:
   ```bash
   npx prisma db diff
   ```
3. Create new migration:
   ```bash
   npx prisma migrate dev --name add_missing_columns
   ```

---

## File System Issues

### Directory Permissions

#### Symptom: "EACCES: permission denied" error
**Cause**: Insufficient permissions on uploads directory  
**Solutions**:
1. Check directory permissions:
   ```bash
   ls -la backend/uploads/
   ```
2. Fix permissions:
   ```bash
   chmod 755 backend/uploads/
   chmod 755 backend/uploads/projects/
   ```
3. Change ownership if needed:
   ```bash
   chown -R $USER:$USER backend/uploads/
   ```

### Disk Space Issues

#### Symptom: "ENOSPC: no space left on device" error
**Cause**: Disk full  
**Solutions**:
1. Check disk usage:
   ```bash
   df -h
   du -sh backend/uploads/
   ```
2. Clean up old files:
   ```bash
   # Remove files older than 30 days
   find backend/uploads/ -type f -mtime +30 -delete
   ```
3. Implement automatic cleanup:
   ```typescript
   // Cleanup job
   setInterval(async () => {
     await fileStorageManager.cleanupOrphanedFiles();
   }, 24 * 60 * 60 * 1000); // Daily
   ```

### File Path Issues

#### Symptom: "File not found" after upload
**Cause**: Path mismatch between database and file system  
**Solutions**:
1. Check file paths in database:
   ```sql
   SELECT id, thumbnailPath, caseStudyPath FROM projects WHERE id = 'project123';
   ```
2. Verify files exist:
   ```bash
   ls -la backend/uploads/projects/project123/
   ```
3. Check path generation logic in `fileStorageService.ts`
4. Ensure consistent path separators (use `path.join()`)

---

## Frontend Issues

### Component Rendering

#### Symptom: Upload components not displaying
**Cause**: Import errors or missing dependencies  
**Solutions**:
1. Check console for errors
2. Verify imports:
   ```typescript
   import { FileUpload } from '@/components/Common/FileUpload';
   ```
3. Check component props:
   ```typescript
   <FileUpload
     accept="image/*"
     maxSize={5 * 1024 * 1024}
     onUpload={handleUpload}
     mediaType="image"
     label="Thumbnail"
   />
   ```

#### Symptom: Drag and drop not working
**Cause**: Event handlers not properly configured  
**Solutions**:
1. Check drag event handlers:
   ```typescript
   const handleDragOver = (e: DragEvent) => {
     e.preventDefault(); // Essential!
     e.stopPropagation();
   };
   ```
2. Verify file access:
   ```typescript
   const handleDrop = (e: DragEvent) => {
     e.preventDefault();
     const files = e.dataTransfer?.files;
     console.log('Dropped files:', files);
   };
   ```

### Animation Issues

#### Symptom: Animations not smooth or jerky
**Cause**: Performance issues or conflicting CSS  
**Solutions**:
1. Check for CSS conflicts
2. Optimize animations:
   ```typescript
   // Use transform instead of changing layout properties
   animate={{ scale: 1.05, y: -2 }}
   transition={{ type: "spring", stiffness: 200 }}
   ```
3. Enable hardware acceleration:
   ```css
   .animated-element {
     will-change: transform;
     transform: translateZ(0);
   }
   ```

#### Symptom: Reduced motion not respected
**Cause**: Missing accessibility check  
**Solutions**:
1. Check for reduced motion preference:
   ```typescript
   const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
   
   const animationProps = prefersReducedMotion 
     ? { transition: { duration: 0 } }
     : { transition: { type: "spring" } };
   ```

---

## Network Issues

### API Communication

#### Symptom: "Network error" during upload
**Cause**: Server not running or network connectivity issues  
**Solutions**:
1. Check server status:
   ```bash
   curl http://localhost:5000/api/health
   ```
2. Verify API base URL:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
   ```
3. Check CORS configuration:
   ```typescript
   app.use(cors({
     origin: ['http://localhost:3000', 'http://localhost:5173'],
     credentials: true
   }));
   ```

#### Symptom: Requests timing out
**Cause**: Large files or slow processing  
**Solutions**:
1. Increase timeout:
   ```typescript
   const xhr = new XMLHttpRequest();
   xhr.timeout = 300000; // 5 minutes
   ```
2. Implement retry logic:
   ```typescript
   const uploadWithRetry = async (file: File, maxRetries = 3) => {
     for (let i = 0; i < maxRetries; i++) {
       try {
         return await uploadFile(file);
       } catch (error) {
         if (i === maxRetries - 1) throw error;
         await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
       }
     }
   };
   ```

### CORS Issues

#### Symptom: "CORS policy" error in browser
**Cause**: Cross-origin request blocked  
**Solutions**:
1. Configure CORS on backend:
   ```typescript
   import cors from 'cors';
   
   app.use(cors({
     origin: process.env.FRONTEND_URL || 'http://localhost:3000',
     methods: ['GET', 'POST', 'PUT', 'DELETE'],
     allowedHeaders: ['Content-Type', 'Authorization']
   }));
   ```
2. Check preflight requests for file uploads
3. Ensure credentials are handled properly

---

## Performance Issues

### Slow Upload Performance

#### Symptom: Uploads taking too long
**Cause**: Large files, slow processing, or network issues  
**Solutions**:
1. Implement client-side compression:
   ```typescript
   import imageCompression from 'browser-image-compression';
   
   const compressedFile = await imageCompression(file, {
     maxSizeMB: 1,
     maxWidthOrHeight: 1920,
     useWebWorker: true
   });
   ```
2. Use chunked uploads for large files
3. Optimize server processing
4. Implement progress indicators

### Memory Issues

#### Symptom: "Out of memory" errors
**Cause**: Large files or memory leaks  
**Solutions**:
1. Increase Node.js memory limit:
   ```bash
   node --max-old-space-size=4096 server.js
   ```
2. Use streaming for large files:
   ```typescript
   import { pipeline } from 'stream/promises';
   
   await pipeline(
     fs.createReadStream(inputPath),
     sharp().resize(800, 600),
     fs.createWriteStream(outputPath)
   );
   ```
3. Clean up resources:
   ```typescript
   // Explicitly clean up buffers
   buffer = null;
   if (global.gc) global.gc();
   ```

---

## Production Issues

### Deployment Problems

#### Symptom: Uploads work locally but fail in production
**Cause**: Environment differences  
**Solutions**:
1. Check environment variables:
   ```bash
   echo $NODE_ENV
   echo $DATABASE_URL
   echo $UPLOAD_DIR
   ```
2. Verify file permissions in production
3. Check disk space and memory limits
4. Ensure FFmpeg is installed in production environment

#### Symptom: Static files not serving
**Cause**: Web server configuration  
**Solutions**:
1. Configure nginx for file serving:
   ```nginx
   location /uploads/ {
     alias /path/to/uploads/;
     expires 1y;
     add_header Cache-Control "public, immutable";
   }
   ```
2. Check Express static middleware:
   ```typescript
   app.use('/uploads', express.static('uploads', {
     maxAge: '1y',
     etag: true
   }));
   ```

### Scaling Issues

#### Symptom: System slows down with multiple uploads
**Cause**: Resource contention  
**Solutions**:
1. Implement upload queuing:
   ```typescript
   import Queue from 'bull';
   
   const uploadQueue = new Queue('upload processing');
   
   uploadQueue.process(async (job) => {
     const { file, projectId } = job.data;
     return await processFile(file, projectId);
   });
   ```
2. Use worker processes for CPU-intensive tasks
3. Implement load balancing
4. Consider cloud storage solutions

---

## Monitoring and Debugging

### Logging

#### Enable Debug Logging
```typescript
// Backend logging
import winston from 'winston';

const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'upload-debug.log' }),
    new winston.transports.Console()
  ]
});

// Use in upload handlers
logger.debug('Processing upload', { projectId, fileSize: file.size });
```

#### Frontend Debugging
```typescript
// Enable verbose logging
const DEBUG = process.env.NODE_ENV === 'development';

function debugLog(message: string, data?: any) {
  if (DEBUG) {
    console.log(`[Upload Debug] ${message}`, data);
  }
}

// Use throughout upload process
debugLog('Starting upload', { fileName: file.name, size: file.size });
```

### Health Monitoring

#### System Health Endpoint
```typescript
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    disk: await checkDiskSpace(),
    ffmpeg: await checkFFmpegHealth(),
    database: await checkDatabaseHealth()
  };
  
  const isHealthy = health.ffmpeg && health.database;
  res.status(isHealthy ? 200 : 503).json(health);
});
```

#### Metrics Collection
```typescript
// Track upload metrics
const uploadMetrics = {
  totalUploads: 0,
  successfulUploads: 0,
  failedUploads: 0,
  averageProcessingTime: 0
};

// Update metrics on each upload
function updateMetrics(success: boolean, processingTime: number) {
  uploadMetrics.totalUploads++;
  if (success) {
    uploadMetrics.successfulUploads++;
  } else {
    uploadMetrics.failedUploads++;
  }
  
  // Calculate rolling average
  uploadMetrics.averageProcessingTime = 
    (uploadMetrics.averageProcessingTime + processingTime) / 2;
}
```

---

## Emergency Procedures

### System Recovery

#### Complete System Reset (Development)
```bash
# Stop all services
pkill -f node

# Clean uploads directory
rm -rf backend/uploads/projects/*

# Reset database
cd backend
npx prisma migrate reset --force

# Reinstall dependencies
npm install

# Restart services
npm run dev
```

#### Partial Recovery (Production)
```bash
# Clean temporary files only
find backend/uploads/ -name "*.tmp" -delete

# Restart application
pm2 restart all

# Check system health
curl http://localhost:5000/api/health
```

### Data Recovery

#### Recover Orphaned Files
```typescript
// Script to match orphaned files with database records
async function recoverOrphanedFiles() {
  const files = await fs.readdir('uploads/projects', { recursive: true });
  const projects = await prisma.project.findMany();
  
  for (const file of files) {
    const projectId = file.split('/')[0];
    const project = projects.find(p => p.id === projectId);
    
    if (!project) {
      console.log(`Orphaned file: ${file}`);
      // Move to recovery directory
      await fs.rename(
        `uploads/projects/${file}`,
        `uploads/recovery/${file}`
      );
    }
  }
}
```

#### Database Consistency Check
```sql
-- Find projects with missing files
SELECT p.id, p.title, p.thumbnailPath
FROM projects p
WHERE p.thumbnailPath IS NOT NULL
  AND p.thumbnailPath NOT IN (
    SELECT DISTINCT file_path FROM uploaded_files
  );

-- Find files without project references
SELECT file_path
FROM uploaded_files
WHERE project_id NOT IN (SELECT id FROM projects);
```

---

## Getting Help

### Information to Collect

When reporting issues, include:

1. **System Information**:
   ```bash
   node --version
   npm --version
   ffmpeg -version
   uname -a  # Linux/macOS
   systeminfo  # Windows
   ```

2. **Error Logs**:
   - Browser console errors
   - Server logs
   - Network tab in dev tools

3. **Configuration**:
   - Environment variables (sanitized)
   - Package.json dependencies
   - Upload middleware configuration

4. **Steps to Reproduce**:
   - Exact steps taken
   - File types and sizes used
   - Expected vs actual behavior

### Support Channels

1. **Documentation**: Check all documentation files in the project
2. **Logs**: Review server and browser logs for detailed error messages
3. **Community**: Search for similar issues in project discussions
4. **Issue Tracker**: Create detailed bug reports with reproduction steps

### Self-Help Checklist

Before seeking help:

- [ ] Checked this troubleshooting guide
- [ ] Verified system requirements
- [ ] Tested with different files
- [ ] Checked browser console for errors
- [ ] Reviewed server logs
- [ ] Tested in different browsers
- [ ] Verified network connectivity
- [ ] Checked file permissions
- [ ] Confirmed FFmpeg installation
- [ ] Tested with minimal configuration

---

This troubleshooting guide covers the most common issues encountered with the Project Image Upload system. Keep this guide updated as new issues are discovered and resolved.