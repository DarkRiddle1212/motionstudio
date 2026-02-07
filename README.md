# Motion Design Studio Platform

A premium, integrated website combining a professional motion design agency portfolio with a comprehensive learning platform. Features advanced media upload capabilities with automatic image optimization and video processing.

## Project Structure

```
motion-studio-platform/
├── backend/                 # Node.js/Express backend
│   ├── src/
│   │   └── index.ts        # Main server entry point
│   ├── prisma/
│   │   └── schema.prisma   # Database schema
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend/               # React frontend
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── .env.example
└── .env.example            # Root environment variables
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL or MySQL database
- **FFmpeg** (required for video processing)
- Git

### FFmpeg Installation

FFmpeg is required for video processing capabilities. Install it before setting up the backend:

**Windows (Chocolatey):**
```bash
choco install ffmpeg
```

**macOS (Homebrew):**
```bash
brew install ffmpeg
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
```

For detailed installation instructions, see [`backend/FFMPEG_INSTALLATION_GUIDE.md`](backend/FFMPEG_INSTALLATION_GUIDE.md).

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your database connection string and other configuration

5. Generate Prisma client:
   ```bash
   npm run prisma:generate
   ```

6. Run database migrations:
   ```bash
   npm run prisma:migrate
   ```

7. Start the development server:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:3000`

## Technology Stack

### Backend
- Express.js - Web framework
- TypeScript - Type safety
- Prisma - ORM
- PostgreSQL/MySQL - Database
- JWT - Authentication
- bcrypt - Password hashing
- Nodemailer - Email service
- **Multer** - File upload handling
- **Sharp** - Image processing and optimization
- **FFmpeg** - Video processing and thumbnail generation

### Frontend
- React 18 - UI library
- TypeScript - Type safety
- Vite - Build tool
- Tailwind CSS - Styling
- Framer Motion - Animations
- React Router - Navigation
- Zustand - State management
- Axios - HTTP client

## ✨ Key Features

### 🎨 Portfolio Management
- **Advanced Media Upload System**: Drag-and-drop interface with real-time progress tracking
- **Image Optimization**: Automatic WebP conversion, resizing, and EXIF data removal
- **Video Processing**: MP4 conversion with H.264 codec and web optimization
- **Gallery Management**: Multi-image upload with drag-to-reorder functionality
- **Media Type Selection**: Support for both image and video hero content

### 🎓 Learning Platform
- Course creation and management
- Interactive lessons with video content
- Assignment submission system
- Progress tracking and analytics
- Payment processing integration

### 🔒 Security & Performance
- Admin authentication with JWT tokens
- Rate limiting (20 requests/minute)
- File type and size validation
- Secure file storage with organized directory structure
- Hardware-accelerated video processing (when available)

### 🎭 Premium UI/UX
- Glassmorphism design with backdrop blur effects
- Smooth 60fps animations with Framer Motion
- Success celebrations with confetti and sparkle effects
- Responsive design for all devices
- Accessibility support with reduced motion preferences

## 🎨 Brand Colors

- Primary Background: `#F6C1CC` (soft blush pink)
- Secondary Background: `#F9D6DC` (light dusty pink)
- Primary Text & CTAs: `#2B2B2E` (charcoal black)
- Secondary Text & Dividers: `#8A8A8E` (mid gray)
- Accent (hover, progress, active states only): `#C89AA6` (muted rose pink)

## 📁 File Upload System

### Supported Formats

**Images:**
- Input: JPG, PNG, WebP, GIF
- Output: WebP (optimized for web)
- Max sizes: 5MB (thumbnails), 10MB (hero images)

**Videos:**
- Input: MP4, WebM, MOV
- Output: MP4 with H.264 codec and faststart
- Max size: 50MB
- Automatic thumbnail generation

### Upload Features

- **Drag & Drop**: Intuitive file selection
- **Progress Tracking**: Real-time upload progress with XMLHttpRequest
- **Image Optimization**: Automatic resizing, format conversion, and compression
- **Video Processing**: Web optimization with FFmpeg
- **Gallery Management**: Up to 10 images with drag-to-reorder
- **File Validation**: Client and server-side validation
- **Error Handling**: User-friendly error messages with retry options

### File Storage Structure

```
backend/uploads/
└── projects/
    └── {projectId}/
        ├── thumbnail-{timestamp}.webp
        ├── hero-{timestamp}.webp
        ├── video-{timestamp}.mp4
        ├── video-thumbnail-{timestamp}.jpg
        └── gallery-{timestamp}.webp
```

## 🔧 Development

### Running Both Services

In separate terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 🗄️ Database

The project uses Prisma ORM with PostgreSQL/MySQL. Key models include:

- User (students, instructors, admins)
- Course (learning content)
- Enrollment (student-course relationships)
- Lesson (course content)
- Assignment (tasks for students)
- Submission (student work)
- Feedback (instructor comments)
- Payment (course purchases)
- **Project (portfolio items with media upload support)**

### Media Upload Schema

The Project model includes fields for uploaded media:

```prisma
model Project {
  // ... existing fields
  
  // Legacy URL fields (backward compatible)
  thumbnailUrl    String
  caseStudyUrl    String
  
  // New upload fields
  thumbnailPath       String?  // Uploaded thumbnail path
  caseStudyPath       String?  // Uploaded hero image path
  mediaType           String   @default("image") // "image" or "video"
  videoPath           String?  // Uploaded video path
  videoThumbnailPath  String?  // Auto-generated video thumbnail
  videoDuration       Float?   // Video duration in seconds
  galleryImages       String   @default("[]") // JSON array of image paths
}
```

## 📚 API Documentation

The backend provides REST API endpoints for:
- Authentication (sign-up, login, email verification)
- Course management
- Lesson management
- Assignment and submission handling
- Payment processing
- User management
- **Media Upload System**:
  - `POST /api/admin/projects/upload/thumbnail` - Upload project thumbnails
  - `POST /api/admin/projects/upload/hero` - Upload hero images/videos
  - `POST /api/admin/projects/upload/gallery` - Upload gallery images
  - `DELETE /api/admin/projects/:id/media/:type` - Delete media files

### Upload API Features

- **Authentication**: Admin JWT token required
- **Rate Limiting**: 20 requests per minute per IP
- **Progress Tracking**: XMLHttpRequest with progress events
- **File Validation**: MIME type and size validation
- **Error Handling**: Consistent error response format
- **Retry Logic**: Exponential backoff for failed uploads

For detailed API documentation, see [`backend/API_DOCUMENTATION.md`](backend/API_DOCUMENTATION.md).

## 🧪 Testing

The project includes comprehensive testing:

### Test Types
- **Unit Tests**: Component and function testing
- **Property-Based Tests**: Correctness properties validation
- **Integration Tests**: End-to-end workflow testing

### Upload System Testing
- File type validation tests
- File size limit enforcement
- Image optimization verification
- Video processing validation
- Authentication and rate limiting tests

### Running Tests

**Backend:**
```bash
cd backend
npm test
```

**Frontend:**
```bash
cd frontend
npm test
```

### Property-Based Testing

The upload system uses property-based testing to verify:
- File organization in correct directories
- Unique filename generation
- Image optimization reduces file size
- Video thumbnail generation
- EXIF data removal
- WebP format conversion

## 📖 Documentation

### Complete Documentation Set

- [`backend/API_DOCUMENTATION.md`](backend/API_DOCUMENTATION.md) - Complete API reference
- [`backend/FILE_STORAGE_DOCUMENTATION.md`](backend/FILE_STORAGE_DOCUMENTATION.md) - File storage architecture
- [`backend/DATABASE_SCHEMA_CHANGES.md`](backend/DATABASE_SCHEMA_CHANGES.md) - Database schema documentation
- [`frontend/COMPONENT_DOCUMENTATION.md`](frontend/COMPONENT_DOCUMENTATION.md) - Frontend component reference
- [`backend/FFMPEG_INSTALLATION_GUIDE.md`](backend/FFMPEG_INSTALLATION_GUIDE.md) - FFmpeg setup guide
- [`TROUBLESHOOTING_GUIDE.md`](TROUBLESHOOTING_GUIDE.md) - Common issues and solutions

### Quick Start Guides

1. **Setup**: Follow the setup instructions above
2. **FFmpeg**: Install FFmpeg using the installation guide
3. **Upload Testing**: Use the admin panel to test file uploads
4. **Troubleshooting**: Check the troubleshooting guide for common issues

## 🚀 Deployment

### Production Requirements

- Node.js 18+ runtime
- PostgreSQL/MySQL database
- FFmpeg installed on server
- Sufficient disk space for file uploads
- SSL certificate for HTTPS

### Environment Variables

```bash
# Backend (.env)
DATABASE_URL="postgresql://user:password@localhost:5432/motiondb"
JWT_SECRET="your-jwt-secret"
SMTP_HOST="smtp.gmail.com"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
UPLOAD_MAX_SIZE="52428800"  # 50MB in bytes
FFMPEG_PATH="/usr/local/bin/ffmpeg"  # Optional: explicit FFmpeg path

# Frontend (.env)
VITE_API_URL="https://your-api-domain.com/api"
```

### Cloud Deployment

The system supports deployment on:
- **Railway**: Includes nixpacks.toml for FFmpeg
- **Heroku**: Use FFmpeg buildpack
- **AWS/GCP/Azure**: Install FFmpeg on VM instances
- **Docker**: Alpine Linux with FFmpeg package

### File Storage Scaling

For production scaling, consider:
- **Cloud Storage**: AWS S3, Google Cloud Storage
- **CDN**: CloudFront, Cloudflare for file delivery
- **Video Processing**: AWS MediaConvert, Cloudinary
- **Load Balancing**: Multiple server instances

## 🔧 Troubleshooting

### Common Issues

1. **FFmpeg not found**: Install FFmpeg and add to PATH
2. **Upload fails**: Check file size limits and disk space
3. **Video processing slow**: Consider hardware acceleration
4. **Permission errors**: Check upload directory permissions

For detailed troubleshooting, see [`TROUBLESHOOTING_GUIDE.md`](TROUBLESHOOTING_GUIDE.md).

### Debug Mode

Enable debug logging:

```bash
# Backend
DEBUG=upload:* npm run dev

# Frontend
VITE_DEBUG=true npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Add property-based tests for new features
- Update documentation for API changes
- Test upload functionality thoroughly
- Maintain backward compatibility

## 📄 License

ISC
