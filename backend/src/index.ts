import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import studentRoutes from './routes/students';
import lessonRoutes from './routes/lessons';
import paymentRoutes from './routes/payments';
import assignmentRoutes from './routes/assignments';
import feedbackRoutes from './routes/feedback';
import projectRoutes from './routes/projects';
import contactRoutes from './routes/contact';
import adminRoutes from './routes/admin';
import projectUploadRoutes from './routes/projectUploads';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3001',
    'http://localhost:3000',
    'http://localhost:3001',
    // Add your Vercel domains here
    'https://motionstudio-darkriddle1212.vercel.app',
    /\.vercel\.app$/  // Allow any vercel.app subdomain
  ],
  credentials: true,
}));

// Increase body size limits for file uploads
// 60MB limit supports: thumbnails (5MB), hero images (10MB), videos (50MB)
// Note: Multer middleware enforces specific limits per endpoint
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Static file serving for uploads with caching
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '1y', // Cache for 1 year
  etag: true,
  lastModified: true,
  setHeaders: (res, filePath) => {
    // Set appropriate MIME types
    if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    } else if (filePath.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (filePath.endsWith('.webm')) {
      res.setHeader('Content-Type', 'video/webm');
    }
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/projects', projectUploadRoutes);

// Simple API index route for quick verification
app.get('/api', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    name: 'Motion Studio Backend',
    version: process.env.npm_package_version || 'unknown',
    uptime: process.uptime(),
    routes: [
      '/api/health',
      '/api/auth',
      '/api/admin',
      '/api/courses',
      '/api/lessons',
      '/api/assignments',
      '/api/projects',
      '/api/students',
      '/api/payments',
      '/api/feedback',
      '/api/contact',
    ],
  });
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Motion Studio Backend is running' });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
