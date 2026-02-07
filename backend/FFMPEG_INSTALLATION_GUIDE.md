# FFmpeg Installation Guide for Project Image Upload System

## Overview

FFmpeg is a critical dependency for the Project Image Upload system, enabling video processing capabilities including format conversion, compression, thumbnail generation, and metadata extraction. This guide provides comprehensive installation instructions for all major platforms and deployment environments.

## Why FFmpeg is Required

The upload system uses FFmpeg for:

1. **Video Format Conversion**: Convert uploaded videos (MOV, WebM, etc.) to web-friendly MP4 format
2. **Video Compression**: Optimize videos for web streaming with H.264 codec and faststart flag
3. **Thumbnail Generation**: Automatically create thumbnail images from video files
4. **Metadata Extraction**: Extract video duration, dimensions, codec information
5. **Quality Optimization**: Balance file size and quality for optimal web performance

## System Requirements

### Minimum Requirements
- **FFmpeg Version**: 4.0 or higher (recommended: 5.0+)
- **Required Codecs**: H.264 (libx264), AAC, VP9 (optional)
- **System Memory**: 2GB RAM minimum for video processing
- **Storage**: 1GB free space for temporary processing files

### Recommended Requirements
- **FFmpeg Version**: Latest stable release
- **Hardware Acceleration**: NVIDIA GPU (NVENC) or Intel Quick Sync for faster processing
- **System Memory**: 4GB+ RAM for large video files
- **Storage**: SSD for faster I/O during processing

---

## Installation Instructions

### Windows

#### Option 1: Chocolatey (Recommended)
```powershell
# Install Chocolatey if not already installed
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install FFmpeg
choco install ffmpeg
```

#### Option 2: Scoop
```powershell
# Install Scoop if not already installed
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
irm get.scoop.sh | iex

# Install FFmpeg
scoop install ffmpeg
```

#### Option 3: Manual Installation
1. **Download FFmpeg**:
   - Visit: https://www.gyan.dev/ffmpeg/builds/
   - Download the "essentials" build (smaller) or "full" build (all features)
   - Choose the latest stable release

2. **Extract and Install**:
   ```powershell
   # Extract to C:\ffmpeg
   Expand-Archive -Path "ffmpeg-master-latest-win64-gpl.zip" -DestinationPath "C:\"
   Rename-Item "C:\ffmpeg-master-latest-win64-gpl" "C:\ffmpeg"
   ```

3. **Add to PATH**:
   ```powershell
   # Add to system PATH (requires admin privileges)
   $env:Path += ";C:\ffmpeg\bin"
   [Environment]::SetEnvironmentVariable("Path", $env:Path, [EnvironmentVariableTarget]::Machine)
   ```

   Or manually:
   - Open System Properties → Advanced → Environment Variables
   - Edit the "Path" variable
   - Add `C:\ffmpeg\bin`
   - Restart your terminal/IDE

#### Option 4: Windows Package Manager (winget)
```powershell
winget install Gyan.FFmpeg
```

### macOS

#### Option 1: Homebrew (Recommended)
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install FFmpeg
brew install ffmpeg
```

#### Option 2: MacPorts
```bash
sudo port install ffmpeg +universal
```

#### Option 3: Manual Installation
1. Download from: https://evermeet.cx/ffmpeg/
2. Extract and move to `/usr/local/bin/`
3. Make executable: `chmod +x /usr/local/bin/ffmpeg`

### Linux

#### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install FFmpeg
sudo apt install ffmpeg

# Verify installation
ffmpeg -version
```

#### CentOS/RHEL/Fedora
```bash
# Enable EPEL repository (CentOS/RHEL)
sudo yum install epel-release

# Install FFmpeg
sudo yum install ffmpeg

# For newer versions, use dnf
sudo dnf install ffmpeg
```

#### Arch Linux
```bash
sudo pacman -S ffmpeg
```

#### Alpine Linux (Docker)
```bash
apk add --no-cache ffmpeg
```

#### Build from Source (Advanced)
```bash
# Install dependencies
sudo apt install build-essential yasm cmake libtool libc6 libc6-dev unzip wget libnuma1 libnuma-dev

# Download and compile
wget https://ffmpeg.org/releases/ffmpeg-5.1.tar.xz
tar -xf ffmpeg-5.1.tar.xz
cd ffmpeg-5.1

# Configure with required codecs
./configure --enable-gpl --enable-libx264 --enable-libx265 --enable-libvpx --enable-libfdk-aac --enable-libmp3lame --enable-libopus

# Compile and install
make -j$(nproc)
sudo make install
```

---

## Verification

### Basic Verification
After installation, verify FFmpeg is working:

```bash
# Check FFmpeg version
ffmpeg -version

# Check FFprobe (metadata extraction tool)
ffprobe -version

# List available codecs
ffmpeg -codecs | grep -E "(h264|aac|vp9)"

# List available formats
ffmpeg -formats | grep mp4
```

### Expected Output
You should see output similar to:
```
ffmpeg version 5.1.2 Copyright (c) 2000-2022 the FFmpeg developers
built with gcc 11.2.0 (Ubuntu 11.2.0-19ubuntu1)
configuration: --enable-gpl --enable-libx264 --enable-libx265 --enable-libvpx --enable-libfdk-aac
libavutil      57. 28.100 / 57. 28.100
libavcodec     59. 37.100 / 59. 37.100
libavformat    59. 27.100 / 59. 27.100
...
```

### Required Codecs Check
Verify essential codecs are available:

```bash
# Check for H.264 encoder (required)
ffmpeg -encoders | grep h264

# Check for AAC encoder (required)
ffmpeg -encoders | grep aac

# Check for VP9 encoder (optional)
ffmpeg -encoders | grep vp9
```

### Test Video Processing
Create a test to ensure video processing works:

```bash
# Create a test video (requires a sample video file)
ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -movflags +faststart test_output.mp4

# Generate thumbnail
ffmpeg -i input.mp4 -ss 00:00:01 -vframes 1 -vf scale=400:300 test_thumbnail.jpg

# Extract metadata
ffprobe -v quiet -print_format json -show_format -show_streams input.mp4
```

---

## Production Deployment

### Docker

#### Dockerfile Example
```dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# Verify installation
RUN ffmpeg -version

# Copy application
COPY . /app
WORKDIR /app

# Install dependencies
RUN npm install

# Start application
CMD ["npm", "start"]
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    environment:
      - NODE_ENV=production
    volumes:
      - ./uploads:/app/uploads
    ports:
      - "5000:5000"
    # Ensure FFmpeg is available
    command: sh -c "ffmpeg -version && npm start"
```

### Cloud Platforms

#### Railway
Add to `nixpacks.toml`:
```toml
[phases.setup]
aptPkgs = ["ffmpeg"]

[phases.build]
cmds = ["npm install"]

[phases.start]
cmd = "npm start"
```

#### Heroku
Add FFmpeg buildpack:
```bash
# Add buildpack
heroku buildpacks:add --index 1 https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git

# Deploy
git push heroku main
```

Or in `app.json`:
```json
{
  "buildpacks": [
    {
      "url": "https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git"
    },
    {
      "url": "heroku/nodejs"
    }
  ]
}
```

#### AWS EC2/Elastic Beanstalk
```bash
# Amazon Linux 2
sudo amazon-linux-extras install epel
sudo yum install ffmpeg

# Ubuntu on AWS
sudo apt update
sudo apt install ffmpeg
```

#### Google Cloud Platform
```bash
# Debian/Ubuntu
sudo apt update
sudo apt install ffmpeg

# Container-Optimized OS
docker run --rm -v /usr/local/bin:/target alpine:latest sh -c "apk add --no-cache ffmpeg && cp /usr/bin/ffmpeg /target/"
```

#### Azure
```bash
# Ubuntu
sudo apt update
sudo apt install ffmpeg

# Windows Server
choco install ffmpeg
```

#### DigitalOcean
```bash
# Ubuntu droplet
sudo apt update
sudo apt install ffmpeg
```

### Serverless Environments

#### AWS Lambda
Use Lambda Layers:
```bash
# Create layer
mkdir ffmpeg-layer
cd ffmpeg-layer
wget https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz
tar -xf ffmpeg-release-amd64-static.tar.xz
mkdir bin
cp ffmpeg-*-amd64-static/ffmpeg bin/
cp ffmpeg-*-amd64-static/ffprobe bin/
zip -r ffmpeg-layer.zip bin/

# Upload as Lambda Layer
aws lambda publish-layer-version --layer-name ffmpeg --zip-file fileb://ffmpeg-layer.zip
```

#### Vercel
FFmpeg is not supported on Vercel due to serverless limitations. Consider:
- Using Vercel's image optimization API
- Offloading video processing to external services
- Using cloud-based video processing APIs

---

## Integration with Node.js

### Package Installation
The backend uses `fluent-ffmpeg` for Node.js integration:

```bash
npm install fluent-ffmpeg
npm install --save-dev @types/fluent-ffmpeg
```

### Configuration
```typescript
// backend/src/services/videoProcessorService.ts
import ffmpeg from 'fluent-ffmpeg';

// Set FFmpeg path if not in system PATH
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
}

// Set FFprobe path if needed
if (process.env.FFPROBE_PATH) {
  ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
}
```

### Environment Variables
```bash
# .env file
FFMPEG_PATH=/usr/local/bin/ffmpeg
FFPROBE_PATH=/usr/local/bin/ffprobe
```

---

## Troubleshooting

### Common Issues

#### "ffmpeg: command not found" or "ffmpeg is not recognized"
**Cause**: FFmpeg is not in system PATH  
**Solution**:
1. Verify installation: `which ffmpeg` (Linux/macOS) or `where ffmpeg` (Windows)
2. Add FFmpeg to PATH (see installation instructions above)
3. Restart terminal/IDE after PATH changes
4. For Node.js apps, restart the application

#### "spawn ffmpeg ENOENT" in Node.js
**Cause**: Node.js cannot find FFmpeg executable  
**Solution**:
```typescript
// Explicitly set FFmpeg path
import ffmpeg from 'fluent-ffmpeg';
ffmpeg.setFfmpegPath('/usr/local/bin/ffmpeg');

// Or use environment variable
ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH || 'ffmpeg');
```

#### Permission denied errors (Linux/macOS)
**Cause**: FFmpeg binary lacks execute permissions  
**Solution**:
```bash
# Make FFmpeg executable
sudo chmod +x /usr/local/bin/ffmpeg
sudo chmod +x /usr/local/bin/ffprobe

# Or for user installation
chmod +x ~/bin/ffmpeg
```

#### Video processing fails with codec errors
**Cause**: Required codecs not available in FFmpeg build  
**Solution**:
1. Check available codecs: `ffmpeg -codecs | grep h264`
2. Install full FFmpeg build with all codecs
3. For Ubuntu: `sudo apt install ffmpeg libx264-dev`

#### Slow video processing
**Cause**: Large files or CPU-intensive processing  
**Solutions**:
1. Use hardware acceleration:
   ```bash
   ffmpeg -hwaccel nvenc -i input.mp4 -c:v h264_nvenc output.mp4
   ```
2. Adjust preset for speed vs quality:
   ```bash
   ffmpeg -i input.mp4 -preset ultrafast output.mp4
   ```
3. Process videos asynchronously in background
4. Implement file size limits

#### Out of memory errors
**Cause**: Insufficient RAM for large video files  
**Solutions**:
1. Increase server memory
2. Process videos in chunks
3. Use streaming processing
4. Implement file size limits

#### Temporary file cleanup issues
**Cause**: Temp files not deleted after processing  
**Solution**:
```typescript
// Ensure cleanup in finally block
try {
  await processVideo(inputPath, outputPath);
} finally {
  await fs.unlink(inputPath).catch(() => {});
  await fs.unlink(tempPath).catch(() => {});
}
```

### Debug Commands

```bash
# Test basic functionality
ffmpeg -f lavfi -i testsrc=duration=10:size=320x240:rate=1 test.mp4

# Check system resources during processing
top -p $(pgrep ffmpeg)

# Monitor temp directory
watch -n 1 'ls -la /tmp | grep ffmpeg'

# Verbose logging
ffmpeg -v debug -i input.mp4 output.mp4
```

### Performance Optimization

#### Hardware Acceleration
```bash
# NVIDIA GPU (if available)
ffmpeg -hwaccel cuda -i input.mp4 -c:v h264_nvenc -preset fast output.mp4

# Intel Quick Sync (if available)
ffmpeg -hwaccel qsv -i input.mp4 -c:v h264_qsv output.mp4

# AMD GPU (if available)
ffmpeg -hwaccel vaapi -i input.mp4 -c:v h264_vaapi output.mp4
```

#### CPU Optimization
```bash
# Use multiple threads
ffmpeg -threads 4 -i input.mp4 output.mp4

# Optimize for speed
ffmpeg -preset ultrafast -i input.mp4 output.mp4

# Balance speed and quality
ffmpeg -preset medium -crf 23 -i input.mp4 output.mp4
```

---

## Alternative Solutions

### Cloud Video Processing Services

If FFmpeg installation or maintenance becomes challenging, consider cloud alternatives:

#### AWS Elemental MediaConvert
```typescript
import { MediaConvert } from 'aws-sdk';

const mediaConvert = new MediaConvert({
  endpoint: 'https://your-endpoint.mediaconvert.region.amazonaws.com'
});

const params = {
  Role: 'arn:aws:iam::account:role/MediaConvertRole',
  Settings: {
    Inputs: [{
      FileInput: 's3://bucket/input.mp4'
    }],
    OutputGroups: [{
      OutputGroupSettings: {
        Type: 'FILE_GROUP_SETTINGS',
        FileGroupSettings: {
          Destination: 's3://bucket/output/'
        }
      },
      Outputs: [{
        VideoDescription: {
          CodecSettings: {
            Codec: 'H_264'
          }
        }
      }]
    }]
  }
};

await mediaConvert.createJob(params).promise();
```

#### Cloudinary
```typescript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'your-cloud-name',
  api_key: 'your-api-key',
  api_secret: 'your-api-secret'
});

const result = await cloudinary.uploader.upload('video.mp4', {
  resource_type: 'video',
  eager: [
    { format: 'mp4', transformation: [{ quality: 'auto' }] },
    { format: 'jpg', transformation: [{ width: 400, height: 300 }] }
  ]
});
```

#### Mux
```typescript
import Mux from '@mux/mux-node';

const { Video } = new Mux(process.env.MUX_TOKEN_ID, process.env.MUX_TOKEN_SECRET);

const asset = await Video.Assets.create({
  input: 'https://example.com/video.mp4',
  playback_policy: 'public'
});
```

### Benefits of Cloud Services
- **No server maintenance**: No need to install or update FFmpeg
- **Scalability**: Handle multiple videos simultaneously
- **Advanced features**: AI-powered optimization, adaptive streaming
- **Global CDN**: Fast video delivery worldwide
- **Cost efficiency**: Pay per use, no server resources needed

### Drawbacks of Cloud Services
- **Cost**: Can be expensive for high volume
- **Latency**: Upload/download time for processing
- **Dependency**: Reliance on external services
- **Privacy**: Videos processed on third-party servers

---

## Monitoring and Maintenance

### Health Checks
```typescript
// backend/src/utils/ffmpegHealthCheck.ts
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function checkFFmpegHealth(): Promise<boolean> {
  try {
    const { stdout } = await execAsync('ffmpeg -version');
    return stdout.includes('ffmpeg version');
  } catch (error) {
    console.error('FFmpeg health check failed:', error);
    return false;
  }
}

// Usage in health endpoint
app.get('/health', async (req, res) => {
  const ffmpegOk = await checkFFmpegHealth();
  res.json({
    status: ffmpegOk ? 'healthy' : 'unhealthy',
    ffmpeg: ffmpegOk
  });
});
```

### Logging
```typescript
// Enhanced logging for video processing
import ffmpeg from 'fluent-ffmpeg';

ffmpeg(inputPath)
  .on('start', (commandLine) => {
    console.log('FFmpeg started:', commandLine);
  })
  .on('progress', (progress) => {
    console.log('Processing: ' + progress.percent + '% done');
  })
  .on('end', () => {
    console.log('FFmpeg processing completed');
  })
  .on('error', (err) => {
    console.error('FFmpeg error:', err);
  })
  .save(outputPath);
```

### Updates
```bash
# Check for updates
ffmpeg -version

# Update via package manager
# Windows (Chocolatey)
choco upgrade ffmpeg

# macOS (Homebrew)
brew upgrade ffmpeg

# Linux (Ubuntu)
sudo apt update && sudo apt upgrade ffmpeg
```

---

## Security Considerations

### Input Validation
```typescript
// Validate video files before processing
const allowedFormats = ['mp4', 'mov', 'webm', 'avi'];
const maxFileSize = 50 * 1024 * 1024; // 50MB

function validateVideoFile(file: Express.Multer.File): boolean {
  const extension = file.originalname.split('.').pop()?.toLowerCase();
  return allowedFormats.includes(extension || '') && file.size <= maxFileSize;
}
```

### Sandboxing
```typescript
// Limit FFmpeg execution time and resources
import { spawn } from 'child_process';

function processVideoSafely(inputPath: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn('ffmpeg', [
      '-i', inputPath,
      '-t', '300', // Max 5 minutes processing
      '-fs', '100M', // Max 100MB output
      outputPath
    ], {
      timeout: 300000, // 5 minute timeout
      killSignal: 'SIGKILL'
    });

    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });

    ffmpeg.on('error', reject);
  });
}
```

### File System Protection
```typescript
// Prevent path traversal attacks
import path from 'path';

function sanitizePath(userPath: string): string {
  // Remove any path traversal attempts
  const sanitized = path.normalize(userPath).replace(/^(\.\.[\/\\])+/, '');
  
  // Ensure path is within uploads directory
  const uploadsDir = path.resolve('./uploads');
  const fullPath = path.resolve(uploadsDir, sanitized);
  
  if (!fullPath.startsWith(uploadsDir)) {
    throw new Error('Invalid file path');
  }
  
  return fullPath;
}
```

---

## Conclusion

FFmpeg is essential for the Project Image Upload system's video processing capabilities. This guide provides comprehensive installation and configuration instructions for all major platforms and deployment scenarios.

### Key Takeaways
1. **Installation**: Use package managers when possible for easier updates
2. **Verification**: Always verify installation with version and codec checks
3. **Production**: Consider cloud alternatives for scalability
4. **Security**: Implement proper input validation and sandboxing
5. **Monitoring**: Set up health checks and logging for production systems

### Next Steps
After successful FFmpeg installation:
1. ✅ Verify installation using the commands in this guide
2. ⏭️ Test video processing with sample files
3. ⏭️ Configure the VideoProcessor service in the backend
4. ⏭️ Implement video upload endpoints
5. ⏭️ Set up monitoring and logging

For additional support, refer to:
- **FFmpeg Documentation**: https://ffmpeg.org/documentation.html
- **Fluent-FFmpeg**: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg
- **Project Documentation**: `backend/API_DOCUMENTATION.md`