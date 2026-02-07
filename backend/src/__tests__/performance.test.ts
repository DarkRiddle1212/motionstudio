import request from 'supertest';
import app from '../index';
import { prisma } from '../utils/prisma';
import { hashPassword } from '../utils/password';
import sharp from 'sharp';

describe('Performance Tests - Upload System', () => {
  let adminToken: string;
  let testProjectId: string;

  beforeAll(async () => {
    // Clean up test data
    await prisma.user.deleteMany({
      where: {
        email: 'admin-perf-test@integration-test.com',
      },
    });

    // Create admin user
    const adminUser = await prisma.user.create({
      data: {
        email: 'admin-perf-test@integration-test.com',
        password: await hashPassword('password123'),
        firstName: 'Performance',
        lastName: 'Admin',
        role: 'admin',
        emailVerified: true,
      },
    });

    // Login to get admin token
    const loginResponse = await request(app)
      .post('/api/admin/login')
      .send({
        email: 'admin-perf-test@integration-test.com',
        password: 'password123',
      })
      .expect(200);

    adminToken = loginResponse.body.token;

    // Create a test project
    const projectResponse = await request(app)
      .post('/api/admin/projects')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Performance Test Project',
        description: 'Test project for performance testing',
        thumbnailUrl: 'https://example.com/thumb.jpg',
        caseStudyUrl: 'https://example.com/case.jpg',
        toolsUsed: ['Test Tool'],
        goal: 'Test goal',
        solution: 'Test solution',
        motionBreakdown: 'Test breakdown',
        mediaType: 'image',
      })
      .expect(201);

    testProjectId = projectResponse.body.id;
  });

  afterAll(async () => {
    // Clean up test data
    if (testProjectId) {
      await prisma.project.delete({
        where: { id: testProjectId },
      }).catch(() => {}); // Ignore if already deleted
    }
    
    await prisma.user.deleteMany({
      where: {
        email: 'admin-perf-test@integration-test.com',
      },
    });
    
    await prisma.$disconnect();
  });

  describe('24.1 Upload Speed Tests', () => {
    it('should upload small image (100KB) within 2 seconds', async () => {
      const startTime = Date.now();
      
      // Create a 100x100 image (approximately 100KB)
      const testImageBuffer = await sharp({
        create: {
          width: 500,
          height: 500,
          channels: 3,
          background: { r: 255, g: 0, b: 0 }
        }
      })
      .png()
      .toBuffer();

      console.log(`Small image size: ${testImageBuffer.length} bytes`);

      const response = await request(app)
        .post('/api/admin/projects/upload/thumbnail')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('projectId', testProjectId)
        .attach('file', testImageBuffer, 'small-test.png')
        .expect(200);

      const uploadTime = Date.now() - startTime;
      console.log(`Small image upload time: ${uploadTime}ms`);

      expect(uploadTime).toBeLessThan(2000); // Should be under 2 seconds
      expect(response.body).toHaveProperty('url');
    });

    it('should upload medium image (1MB) within 5 seconds', async () => {
      const startTime = Date.now();
      
      // Create a larger image (approximately 1MB)
      const testImageBuffer = await sharp({
        create: {
          width: 1500,
          height: 1500,
          channels: 3,
          background: { r: 0, g: 255, b: 0 }
        }
      })
      .png()
      .toBuffer();

      console.log(`Medium image size: ${testImageBuffer.length} bytes`);

      const response = await request(app)
        .post('/api/admin/projects/upload/hero')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('projectId', testProjectId)
        .attach('file', testImageBuffer, 'medium-test.png')
        .expect(200);

      const uploadTime = Date.now() - startTime;
      console.log(`Medium image upload time: ${uploadTime}ms`);

      expect(uploadTime).toBeLessThan(5000); // Should be under 5 seconds
      expect(response.body).toHaveProperty('url');
    });

    it('should upload large image (5MB) within 10 seconds', async () => {
      const startTime = Date.now();
      
      // Create a large image (approximately 5MB)
      const testImageBuffer = await sharp({
        create: {
          width: 3000,
          height: 3000,
          channels: 3,
          background: { r: 0, g: 0, b: 255 }
        }
      })
      .png()
      .toBuffer();

      console.log(`Large image size: ${testImageBuffer.length} bytes`);

      const response = await request(app)
        .post('/api/admin/projects/upload/hero')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('projectId', testProjectId)
        .attach('file', testImageBuffer, 'large-test.png')
        .expect(200);

      const uploadTime = Date.now() - startTime;
      console.log(`Large image upload time: ${uploadTime}ms`);

      expect(uploadTime).toBeLessThan(10000); // Should be under 10 seconds
      expect(response.body).toHaveProperty('url');
    });
  });

  describe('24.2 Image Optimization Performance', () => {
    it('should optimize image within 3 seconds', async () => {
      const startTime = Date.now();
      
      // Create a test image
      const testImageBuffer = await sharp({
        create: {
          width: 1000,
          height: 1000,
          channels: 3,
          background: { r: 128, g: 128, b: 128 }
        }
      })
      .png()
      .toBuffer();

      const response = await request(app)
        .post('/api/admin/projects/upload/thumbnail')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('projectId', testProjectId)
        .attach('file', testImageBuffer, 'optimization-test.png')
        .expect(200);

      const optimizationTime = Date.now() - startTime;
      console.log(`Image optimization time: ${optimizationTime}ms`);

      expect(optimizationTime).toBeLessThan(3000); // Should be under 3 seconds
      expect(response.body.metadata.format).toBe('webp'); // Should be optimized to WebP
    });

    it('should reduce image file size during optimization', async () => {
      // Create a moderately sized unoptimized image (within upload limits)
      const originalImageBuffer = await sharp({
        create: {
          width: 800,
          height: 800,
          channels: 3,
          background: { r: 255, g: 255, b: 255 }
        }
      })
      .png({ compressionLevel: 0 }) // No compression
      .toBuffer();

      console.log(`Original image size: ${originalImageBuffer.length} bytes`);

      const response = await request(app)
        .post('/api/admin/projects/upload/thumbnail')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('projectId', testProjectId)
        .attach('file', originalImageBuffer, 'size-test.png')
        .expect(200);

      const optimizedSize = response.body.metadata.size;
      const originalSize = originalImageBuffer.length;

      console.log(`Original size: ${originalSize} bytes`);
      console.log(`Optimized size: ${optimizedSize} bytes`);
      console.log(`Size reduction: ${((originalSize - optimizedSize) / originalSize * 100).toFixed(1)}%`);

      // Optimized image should be smaller than original
      expect(optimizedSize).toBeLessThan(originalSize);
    });
  });

  describe('24.4 Gallery Upload Performance', () => {
    it('should upload multiple images efficiently', async () => {
      const startTime = Date.now();
      
      // Create multiple test images
      const testImageBuffer = await sharp({
        create: {
          width: 400,
          height: 400,
          channels: 3,
          background: { r: 200, g: 100, b: 50 }
        }
      })
      .png()
      .toBuffer();

      const response = await request(app)
        .post('/api/admin/projects/upload/gallery')
        .set('Authorization', `Bearer ${adminToken}`)
        .field('projectId', testProjectId)
        .attach('files', testImageBuffer, 'gallery1.png')
        .attach('files', testImageBuffer, 'gallery2.png')
        .attach('files', testImageBuffer, 'gallery3.png')
        .attach('files', testImageBuffer, 'gallery4.png')
        .attach('files', testImageBuffer, 'gallery5.png')
        .expect(200);

      const uploadTime = Date.now() - startTime;
      console.log(`Gallery upload time (5 images): ${uploadTime}ms`);

      expect(uploadTime).toBeLessThan(8000); // Should be under 8 seconds for 5 images
      expect(response.body.results).toHaveLength(5);
    });
  });

  describe('24.5 Concurrent Upload Performance', () => {
    it('should handle concurrent uploads without significant performance degradation', async () => {
      const testImageBuffer = await sharp({
        create: {
          width: 300,
          height: 300,
          channels: 3,
          background: { r: 100, g: 200, b: 150 }
        }
      })
      .png()
      .toBuffer();

      const startTime = Date.now();

      // Perform 3 concurrent uploads
      const uploadPromises = [
        request(app)
          .post('/api/admin/projects/upload/thumbnail')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('projectId', testProjectId)
          .attach('file', testImageBuffer, 'concurrent1.png'),
        
        request(app)
          .post('/api/admin/projects/upload/thumbnail')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('projectId', testProjectId)
          .attach('file', testImageBuffer, 'concurrent2.png'),
        
        request(app)
          .post('/api/admin/projects/upload/thumbnail')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('projectId', testProjectId)
          .attach('file', testImageBuffer, 'concurrent3.png')
      ];

      const responses = await Promise.all(uploadPromises);
      const totalTime = Date.now() - startTime;

      console.log(`Concurrent upload time (3 uploads): ${totalTime}ms`);

      // All uploads should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('url');
      });

      // Should complete within reasonable time (concurrent should be faster than sequential)
      expect(totalTime).toBeLessThan(6000); // Should be under 6 seconds for 3 concurrent uploads
    });
  });

  describe('24.6 Memory Usage', () => {
    it('should not cause memory leaks during multiple uploads', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      const testImageBuffer = await sharp({
        create: {
          width: 200,
          height: 200,
          channels: 3,
          background: { r: 50, g: 100, b: 200 }
        }
      })
      .png()
      .toBuffer();

      // Perform multiple uploads
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/admin/projects/upload/thumbnail')
          .set('Authorization', `Bearer ${adminToken}`)
          .field('projectId', testProjectId)
          .attach('file', testImageBuffer, `memory-test-${i}.png`)
          .expect(200);
      }

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      console.log(`Initial memory: ${(initialMemory / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Final memory: ${(finalMemory / 1024 / 1024).toFixed(2)} MB`);
      console.log(`Memory increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)} MB`);

      // Memory increase should be reasonable (less than 50MB for 10 uploads)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});