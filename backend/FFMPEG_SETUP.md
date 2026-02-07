# FFmpeg Installation Guide

FFmpeg is required for video processing in the portfolio media upload system. This guide covers installation on different operating systems.

## Why FFmpeg?

FFmpeg is used to:
- Convert videos to web-friendly formats (MP4 with H.264 codec)
- Compress videos to reduce file size
- Generate video thumbnails automatically
- Extract video metadata (duration, dimensions, etc.)

## Installation

### Windows

**Option 1: Using Chocolatey (Recommended)**
```bash
choco install ffmpeg
```

**Option 2: Manual Installation**
1. Download FFmpeg from: https://www.gyan.dev/ffmpeg/builds/
2. Extract the zip file to `C:\ffmpeg`
3. Add `C:\ffmpeg\bin` to your system PATH:
   - Open System Properties → Environment Variables
   - Edit the "Path" variable
   - Add `C:\ffmpeg\bin`
   - Restart your terminal

**Option 3: Using Scoop**
```bash
scoop install ffmpeg
```

### macOS

**Using Homebrew (Recommended)**
```bash
brew install ffmpeg
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install ffmpeg
```

### Linux (CentOS/RHEL)

```bash
sudo yum install ffmpeg
```

## Verify Installation

After installation, verify FFmpeg is available:

```bash
ffmpeg -version
```

You should see output showing the FFmpeg version and configuration.

## Testing

To test FFmpeg with the backend:

1. Start the backend server:
   ```bash
   npm run dev
   ```

2. Try uploading a video through the admin panel

3. Check the console for FFmpeg processing logs

## Troubleshooting

### "ffmpeg: command not found" or "ffmpeg is not recognized"

**Solution**: FFmpeg is not in your system PATH. Follow the installation steps above and ensure the FFmpeg binary directory is added to your PATH.

### Video processing fails with "spawn ffmpeg ENOENT"

**Solution**: The Node.js process cannot find FFmpeg. Restart your terminal/IDE after installation to refresh the PATH.

### Permission errors on Linux/macOS

**Solution**: Ensure FFmpeg has execute permissions:
```bash
chmod +x /usr/local/bin/ffmpeg
```

### Video processing is slow

**Solution**: This is normal for large video files. The backend processes videos asynchronously to avoid blocking. Consider:
- Using smaller video files (under 50MB)
- Pre-compressing videos before upload
- Upgrading server resources in production

## Production Deployment

### Railway/Heroku

Add FFmpeg buildpack:
```bash
# Railway: Add to nixpacks.toml
[phases.setup]
aptPkgs = ["ffmpeg"]

# Heroku: Add buildpack
heroku buildpacks:add --index 1 https://github.com/jonathanong/heroku-buildpack-ffmpeg-latest.git
```

### Docker

Include FFmpeg in your Dockerfile:
```dockerfile
FROM node:18-alpine

# Install FFmpeg
RUN apk add --no-cache ffmpeg

# ... rest of your Dockerfile
```

### AWS/Azure/GCP

FFmpeg is typically pre-installed on most cloud VM images. If not, use the Linux installation commands above.

## Alternative: Cloud Video Processing

For production at scale, consider using cloud video processing services:
- **AWS Elastic Transcoder** - Managed video transcoding
- **Cloudinary** - Media management with video processing
- **Mux** - Video streaming and processing API

These services handle video processing in the cloud, eliminating the need for FFmpeg on your server.

## Support

If you encounter issues with FFmpeg installation or video processing, please:
1. Check the FFmpeg documentation: https://ffmpeg.org/documentation.html
2. Verify your FFmpeg version is recent (4.0+)
3. Check server logs for detailed error messages
4. Open an issue with your system details and error logs
