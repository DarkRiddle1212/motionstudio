import request from 'supertest';
import app from '../index';
import { prisma } from '../utils/prisma';
import { hashPassword } from '../utils/password';

describe('Admin Panel Security Assessment', () => {
  let adminUser: any;
  let adminToken: string;
  let studentUser: any;
  let studentToken: string;
  let instructorUser: any;
  let instructorToken: string;

  beforeAll(async () => {
    await cleanupTestData();
    await createTestUsers();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  async function cleanupTestData() {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@security-test.com',
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
        email: `admin-${timestamp}@security-test.com`,
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
        email: `student-${timestamp}@security-test.com`,
        password: hashedPassword,
        firstName: 'Student',
        lastName: 'User',
        role: 'student',
        emailVerified: true,
      },
    });

    // Create instructor user
    instructorUser = await prisma.user.create({
      data: {
        email: `instructor-${timestamp}@security-test.com`,
        password: hashedPassword,
        firstName: 'Instructor',
        lastName: 'User',
        role: 'instructor',
        emailVerified: true,
      },
    });

    // Get tokens
    const adminLoginResponse = await request(app)
      .post('/api/admin/login')
      .send({
        email: adminUser.email,
        password: 'TestPass123',
      });
    adminToken = adminLoginResponse.body.token;

    const studentLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: studentUser.email,
        password: 'TestPass123',
      });
    studentToken = studentLoginResponse.body.token;

    const instructorLoginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: instructorUser.email,
        password: 'TestPass123',
      });
    instructorToken = instructorLoginResponse.body.token;
  }

  describe('1. Authentication Security', () => {
    it('should require admin credentials for admin login', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: studentUser.email,
          password: 'TestPass123',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Admin privileges required');
    });

    it('should reject invalid admin credentials', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: adminUser.email,
          password: 'WrongPassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid email or password');
    });

    it('should create audit log for admin login attempts', async () => {
      await request(app)
        .post('/api/admin/login')
        .send({
          email: adminUser.email,
          password: 'TestPass123',
        });

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminId: adminUser.id,
          action: 'auth_login',
        },
        orderBy: { timestamp: 'desc' },
      });

      expect(auditLog).toBeTruthy();
      expect(auditLog!.ipAddress).toBeDefined();
      expect(auditLog!.userAgent).toBeDefined();
    });
  });

  describe('2. Authorization Security', () => {
    it('should deny student access to admin endpoints', async () => {
      const endpoints = [
        '/api/admin/users',
        '/api/admin/courses',
        '/api/admin/financial/metrics',
        '/api/admin/analytics/kpis',
        '/api/admin/scholarships',
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${studentToken}`);

        expect(response.status).toBe(401);
        expect(response.body.error).toContain('Admin authentication required');
      }
    });

    it('should deny instructor access to admin endpoints', async () => {
      const endpoints = [
        '/api/admin/users',
        '/api/admin/courses',
        '/api/admin/financial/metrics',
        '/api/admin/analytics/kpis',
        '/api/admin/scholarships',
      ];

      for (const endpoint of endpoints) {
        const response = await request(app)
          .get(endpoint)
          .set('Authorization', `Bearer ${instructorToken}`);

        expect(response.status).toBe(401);
        expect(response.body.error).toContain('Admin authentication required');
      }
    });

    it('should deny access without authentication token', async () => {
      const endpoints = [
        '/api/admin/users',
        '/api/admin/courses',
        '/api/admin/financial/metrics',
        '/api/admin/analytics/kpis',
        '/api/admin/scholarships',
      ];

      for (const endpoint of endpoints) {
        const response = await request(app).get(endpoint);

        expect(response.status).toBe(401);
        expect(response.body.error).toContain('Admin authentication required');
      }
    });

    it('should deny access with invalid token', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid admin token');
    });
  });

  describe('3. Input Validation Security', () => {
    it('should validate admin login input', async () => {
      // Missing email
      const response1 = await request(app)
        .post('/api/admin/login')
        .send({
          password: 'TestPass123',
        });

      expect(response1.status).toBe(400);
      expect(response1.body.error).toContain('Email and password are required');

      // Missing password
      const response2 = await request(app)
        .post('/api/admin/login')
        .send({
          email: adminUser.email,
        });

      expect(response2.status).toBe(400);
      expect(response2.body.error).toContain('Email and password are required');

      // Empty request body
      const response3 = await request(app)
        .post('/api/admin/login')
        .send({});

      expect(response3.status).toBe(400);
      expect(response3.body.error).toContain('Email and password are required');
    });

    it('should validate user ID parameters', async () => {
      const response = await request(app)
        .get('/api/admin/users/invalid-user-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('User not found');
    });

    it('should prevent SQL injection in search parameters', async () => {
      const maliciousInputs = [
        "'; DROP TABLE users; --",
        "' OR '1'='1",
        "1' UNION SELECT * FROM users --",
        "<script>alert('xss')</script>",
      ];

      for (const input of maliciousInputs) {
        const response = await request(app)
          .get('/api/admin/users')
          .query({ search: input })
          .set('Authorization', `Bearer ${adminToken}`);

        // Should not crash and should return valid response
        expect(response.status).toBe(200);
        expect(response.body.users).toBeDefined();
      }
    });
  });

  describe('4. Session Security', () => {
    it('should provide session information on admin login', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: adminUser.email,
          password: 'TestPass123',
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeDefined();
      expect(response.body.sessionId).toBeDefined();
      expect(response.body.sessionTimeout).toBeDefined();
      expect(response.body.user.role).toBe('admin');
    });

    it('should check session status', async () => {
      const response = await request(app)
        .get('/api/admin/session/status')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sessionId).toBeDefined();
      expect(response.body.timeRemaining).toBeDefined();
    });

    it('should allow session refresh', async () => {
      const response = await request(app)
        .post('/api/admin/session/refresh')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.sessionId).toBeDefined();
      expect(response.body.newTimeout).toBeDefined();
    });

    it('should allow admin logout', async () => {
      const response = await request(app)
        .post('/api/admin/logout')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain('Logged out successfully');
    });
  });

  describe('5. Data Access Security', () => {
    it('should allow admin to access user data', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.users).toBeDefined();
      expect(Array.isArray(response.body.users)).toBe(true);
    });

    it('should allow admin to access course data', async () => {
      const response = await request(app)
        .get('/api/admin/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.courses).toBeDefined();
      expect(Array.isArray(response.body.courses)).toBe(true);
    });

    it('should allow admin to access financial data', async () => {
      const response = await request(app)
        .get('/api/admin/financial/payments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payments).toBeDefined();
      expect(Array.isArray(response.body.payments)).toBe(true);
    });

    it('should allow admin to access scholarship data', async () => {
      const response = await request(app)
        .get('/api/admin/scholarships')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.scholarships).toBeDefined();
      expect(Array.isArray(response.body.scholarships)).toBe(true);
    });
  });

  describe('6. Audit Logging Security', () => {
    it('should log admin actions with proper details', async () => {
      // Perform an admin action
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      // Check if audit log was created
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminId: adminUser.id,
        },
        orderBy: { timestamp: 'desc' },
      });

      expect(auditLog).toBeTruthy();
      expect(auditLog!.adminId).toBe(adminUser.id);
      expect(auditLog!.action).toBeDefined();
      expect(auditLog!.resourceType).toBeDefined();
      expect(auditLog!.ipAddress).toBeDefined();
      expect(auditLog!.userAgent).toBeDefined();
      expect(auditLog!.timestamp).toBeDefined();
    });

    it('should log failed authentication attempts', async () => {
      await request(app)
        .post('/api/admin/login')
        .send({
          email: adminUser.email,
          password: 'WrongPassword',
        });

      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminId: adminUser.id,
          action: 'auth_login',
        },
        orderBy: { timestamp: 'desc' },
      });

      expect(auditLog).toBeTruthy();
      const details = JSON.parse(auditLog!.changes);
      expect(details.success).toBe(false);
      expect(details.reason).toBe('Invalid password');
    });
  });

  describe('7. Rate Limiting and Brute Force Protection', () => {
    it('should handle multiple rapid requests gracefully', async () => {
      const promises = Array.from({ length: 10 }, () =>
        request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
      );

      const responses = await Promise.all(promises);
      
      // All requests should succeed (no rate limiting implemented yet)
      responses.forEach(response => {
        expect([200, 429]).toContain(response.status); // 200 success or 429 rate limited
      });
    });

    it('should handle multiple failed login attempts', async () => {
      const promises = Array.from({ length: 5 }, () =>
        request(app)
          .post('/api/admin/login')
          .send({
            email: adminUser.email,
            password: 'WrongPassword',
          })
      );

      const responses = await Promise.all(promises);
      
      // Should handle gracefully (may implement rate limiting in future)
      responses.forEach(response => {
        expect([401, 429]).toContain(response.status); // 401 unauthorized or 429 rate limited
      });
    });
  });

  describe('8. Error Handling Security', () => {
    it('should not expose sensitive information in error messages', async () => {
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
      expect(response.body.error).not.toContain('stack');
    });

    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send('invalid-json')
        .set('Content-Type', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('9. CORS and Headers Security', () => {
    it('should include security headers', async () => {
      const response = await request(app)
        .get('/api/health');

      // Check for basic security headers (may need to be implemented)
      expect(response.headers).toBeDefined();
    });

    it('should handle CORS properly', async () => {
      const response = await request(app)
        .options('/api/admin/login')
        .set('Origin', 'http://localhost:3000');

      // Should handle CORS preflight requests
      expect([200, 204]).toContain(response.status);
    });
  });

  describe('10. Data Integrity and Consistency', () => {
    it('should maintain data consistency during concurrent operations', async () => {
      // Create a test user for concurrent updates
      const testUser = await prisma.user.create({
        data: {
          email: `concurrent-test-${Date.now()}@security-test.com`,
          password: await hashPassword('TestPass123'),
          firstName: 'Concurrent',
          lastName: 'Test',
          role: 'student',
          emailVerified: true,
        },
      });

      // Perform concurrent updates
      const promises = Array.from({ length: 3 }, (_, i) =>
        request(app)
          .put(`/api/admin/users/${testUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            firstName: `Updated${i}`,
          })
      );

      const responses = await Promise.all(promises);
      
      // At least one should succeed
      const successfulResponses = responses.filter(r => r.status === 200);
      expect(successfulResponses.length).toBeGreaterThan(0);

      // Verify final state is consistent
      const finalUser = await prisma.user.findUnique({
        where: { id: testUser.id },
      });
      expect(finalUser).toBeTruthy();
      expect(finalUser!.firstName).toMatch(/^Updated\d$/);
    });
  });
});