import request from 'supertest';
import app from '../../index';
import { prisma } from '../../utils/prisma';
import { hashPassword } from '../../utils/password';

describe('Admin Routes', () => {
  // Use unique email to avoid conflicts with beforeEach cleanup
  const adminEmail = 'admin-route-test@example.org';
  const userEmail = 'user-route-test@example.org';

  beforeAll(async () => {
    // Clean up any existing test users first
    await prisma.user.deleteMany({
      where: { 
        OR: [
          { email: adminEmail },
          { email: userEmail }
        ]
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.user.deleteMany({
      where: { 
        OR: [
          { email: adminEmail },
          { email: userEmail }
        ]
      },
    });
  });

  describe('POST /api/admin/login', () => {
    it('should login admin user successfully', async () => {
      // Create admin user within the test
      const hashedPassword = await hashPassword('adminpassword123');
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          emailVerified: true,
        },
      });

      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: adminEmail,
          password: 'adminpassword123',
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('sessionId');
      expect(response.body).toHaveProperty('sessionTimeout');
      expect(response.body.user.role).toBe('admin');

      // Clean up
      await prisma.user.delete({ where: { email: adminEmail } });
    });

    it('should reject non-admin user', async () => {
      // Create a regular user
      const hashedPassword = await hashPassword('userpassword123');
      await prisma.user.create({
        data: {
          email: userEmail,
          password: hashedPassword,
          firstName: 'Regular',
          lastName: 'User',
          role: 'student',
          emailVerified: true,
        },
      });

      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: userEmail,
          password: 'userpassword123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Admin privileges required');

      // Clean up
      await prisma.user.delete({ where: { email: userEmail } });
    });

    it('should reject invalid credentials', async () => {
      // Create admin user
      const hashedPassword = await hashPassword('adminpassword123');
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          firstName: 'Admin',
          lastName: 'User',
          role: 'admin',
          emailVerified: true,
        },
      });

      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: adminEmail,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid email or password');

      // Clean up
      await prisma.user.delete({ where: { email: adminEmail } });
    });

    it('should require email and password', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Email and password are required');
    });
  });
});