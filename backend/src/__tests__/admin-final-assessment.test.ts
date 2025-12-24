import request from 'supertest';
import app from '../index';
import { prisma } from '../utils/prisma';
import { hashPassword } from '../utils/password';

describe('Admin Panel Final Integration Assessment', () => {
  let adminUser: any;
  let adminToken: string;
  let studentUser: any;
  let studentToken: string;

  beforeAll(async () => {
    await cleanupTestData();
    await createTestUsers();
  }, 30000); // Increase timeout

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  async function cleanupTestData() {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@final-assessment.com',
        },
      },
    });
  }

  async function createTestUsers() {
    const timestamp = Date.now();
    const hashedPassword = await hashPassword('TestPass123');

    // Create admin user
    adminUser = await prisma.user.create({
      data: {
        email: `admin-${timestamp}@final-assessment.com`,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        emailVerified: true,
      },
    });

    // Create student user
    studentUser = await prisma.user.create({
      data: {
        email: `student-${timestamp}@final-assessment.com`,
        password: hashedPassword,
        firstName: 'Student',
        lastName: 'User',
        role: 'student',
        emailVerified: true,
      },
    });

    // Get admin token
    const adminLoginResponse = await request(app)
      .post('/api/admin/login')
      .send({
        email: adminUser.email,
        password: 'TestPass123',
      });
    adminToken = adminLoginResponse.body.token;

    // Get student token
    const studentLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: studentUser.email,
        password: 'TestPass123',
      });
    studentToken = studentLoginResponse.body.token;
  }

  describe('Core Admin Functionality Assessment', () => {
    it('should authenticate admin users successfully', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: adminUser.email,
          password: 'TestPass123',
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.sessionId).toBeDefined();
      expect(response.body.user.role).toBe('admin');
    });

    it('should reject non-admin users from admin login', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: studentUser.email,
          password: 'TestPass123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Admin privileges required');
    });

    it('should protect admin endpoints from unauthorized access', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Admin authentication required');
    });

    it('should allow admin access to user management', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.users).toBeDefined();
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('should allow admin access to course management', async () => {
      const response = await request(app)
        .get('/api/admin/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.courses).toBeDefined();
      expect(Array.isArray(response.body.courses)).toBe(true);
    });

    it('should allow admin access to financial data', async () => {
      const response = await request(app)
        .get('/api/admin/financial/payments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payments).toBeDefined();
      expect(Array.isArray(response.body.payments)).toBe(true);
    });

    it('should allow admin access to scholarship management', async () => {
      const response = await request(app)
        .get('/api/admin/scholarships')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.scholarships).toBeDefined();
      expect(Array.isArray(response.body.scholarships)).toBe(true);
    });

    it('should provide session management capabilities', async () => {
      const statusResponse = await request(app)
        .get('/api/admin/session/status')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(statusResponse.status).toBe(200);
      expect(statusResponse.body.sessionId).toBeDefined();

      const refreshResponse = await request(app)
        .post('/api/admin/session/refresh')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.body.sessionId).toBeDefined();
    });
  });

  describe('Security Assessment', () => {
    it('should validate input parameters', async () => {
      // Test missing login credentials
      const response = await request(app)
        .post('/api/admin/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Email and password are required');
    });

    it('should handle invalid user IDs gracefully', async () => {
      const response = await request(app)
        .get('/api/admin/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('User not found');
    });

    it('should create audit logs for admin actions', async () => {
      // Perform an admin action
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      // Check if audit log exists
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminId: adminUser.id,
        },
        orderBy: { timestamp: 'desc' },
      });

      expect(auditLog).toBeTruthy();
      expect(auditLog!.adminId).toBe(adminUser.id);
      expect(auditLog!.ipAddress).toBeDefined();
      expect(auditLog!.userAgent).toBeDefined();
    });

    it('should handle SQL injection attempts safely', async () => {
      const maliciousInput = "'; DROP TABLE users; --";
      
      const response = await request(app)
        .get('/api/admin/users')
        .query({ search: maliciousInput })
        .set('Authorization', `Bearer ${adminToken}`);

      // Should not crash and should return valid response
      expect(response.status).toBe(200);
      expect(response.body.users).toBeDefined();
    });
  });

  describe('Error Handling Assessment', () => {
    it('should handle invalid authentication tokens', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid admin token');
    });

    it('should not expose sensitive information in errors', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).not.toContain('database');
      expect(response.body.error).not.toContain('SQL');
      expect(response.body.error).not.toContain('prisma');
    });
  });

  describe('Performance and Reliability Assessment', () => {
    it('should handle concurrent requests without issues', async () => {
      const promises = Array.from({ length: 5 }, () =>
        request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
      );

      const responses = await Promise.all(promises);
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.users).toBeDefined();
      });
    });

    it('should maintain data consistency during updates', async () => {
      const updateResponse = await request(app)
        .put(`/api/admin/users/${studentUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'UpdatedName',
        });

      expect(updateResponse.status).toBe(200);

      // Verify the update was applied
      const userResponse = await request(app)
        .get(`/api/admin/users/${studentUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(userResponse.status).toBe(200);
      expect(userResponse.body.user.firstName).toBe('UpdatedName');
    });
  });
});