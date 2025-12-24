import request from 'supertest';
import app from '../index';
import { prisma } from '../utils/prisma';
import { hashPassword } from '../utils/password';

describe('Admin Panel Integration Tests', () => {
  // Test data containers
  let adminUser: any;
  let adminToken: string;
  let studentUser: any;
  let instructorUser: any;
  let testCourse: any;
  let testPayment: any;

  beforeAll(async () => {
    // Clean up any existing test data
    await cleanupTestData();
    
    // Create test users
    await createTestUsers();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  async function cleanupTestData() {
    // Clean up in reverse dependency order
    await prisma.auditLog.deleteMany({
      where: {
        adminId: {
          in: await prisma.user.findMany({
            where: {
              email: {
                contains: '@admin-integration-test.com',
              },
            },
            select: { id: true },
          }).then(users => users.map(u => u.id)),
        },
      },
    });
    await prisma.scholarship.deleteMany({
      where: {
        student: {
          email: {
            contains: '@admin-integration-test.com',
          },
        },
      },
    });
    await prisma.payment.deleteMany({
      where: {
        student: {
          email: {
            contains: '@admin-integration-test.com',
          },
        },
      },
    });
    await prisma.enrollment.deleteMany({
      where: {
        student: {
          email: {
            contains: '@admin-integration-test.com',
          },
        },
      },
    });
    await prisma.course.deleteMany({
      where: {
        instructor: {
          email: {
            contains: '@admin-integration-test.com',
          },
        },
      },
    });
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@admin-integration-test.com',
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
        email: `admin-${timestamp}@admin-integration-test.com`,
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
        email: `student-${timestamp}@admin-integration-test.com`,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Student',
        role: 'student',
        emailVerified: true,
      },
    });

    // Create instructor user
    instructorUser = await prisma.user.create({
      data: {
        email: `instructor-${timestamp}@admin-integration-test.com`,
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'Instructor',
        role: 'instructor',
        emailVerified: true,
      },
    });

    // Login admin to get token
    const loginResponse = await request(app)
      .post('/api/admin/login')
      .send({
        email: adminUser.email,
        password: 'TestPass123',
      });
    
    adminToken = loginResponse.body.token;
  }

  describe('1. Admin Authentication and Access Control', () => {
    it('should authenticate admin and create audit log', async () => {
      const response = await request(app)
        .post('/api/admin/login')
        .send({
          email: adminUser.email,
          password: 'TestPass123',
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBeTruthy();
      expect(response.body.sessionId).toBeTruthy();
      expect(response.body.user.role).toBe('admin');

      // Verify audit log was created
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminId: adminUser.id,
          action: 'auth_login',
        },
        orderBy: { timestamp: 'desc' },
      });

      expect(auditLog).toBeTruthy();
      const details = JSON.parse(auditLog!.changes);
      expect(details).toHaveProperty('success', true);
    });

    it('should reject non-admin access to admin endpoints', async () => {
      // Get student token
      const studentLoginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: studentUser.email,
          password: 'TestPass123',
        });

      const studentToken = studentLoginResponse.body.token;

      // Try to access admin endpoint with student token
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Admin authentication required');
    });
  });

  describe('2. User Management Workflow', () => {
    it('should list all users with search and filtering', async () => {
      const response = await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.users).toBeDefined();
      expect(response.body.users.length).toBeGreaterThanOrEqual(3); // admin, student, instructor

      // Test search functionality
      const searchResponse = await request(app)
        .get('/api/admin/users?search=student')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.body.users.some((user: any) => 
        user.email.includes('student')
      )).toBe(true);
    });

    it('should get user details with enrollment and payment history', async () => {
      const response = await request(app)
        .get(`/api/admin/users/${studentUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(studentUser.id);
      expect(response.body.user.enrollments).toBeDefined();
      expect(response.body.user.payments).toBeDefined();
    });

    it('should update user role and create audit log', async () => {
      const response = await request(app)
        .put(`/api/admin/users/${studentUser.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          role: 'instructor',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.role).toBe('instructor');

      // Verify audit log was created
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminId: adminUser.id,
          action: 'user_update',
          resourceId: studentUser.id,
        },
        orderBy: { timestamp: 'desc' },
      });

      expect(auditLog).toBeTruthy();
      const changes = JSON.parse(auditLog!.changes);
      expect(changes).toHaveProperty('role');
    });
  });

  describe('3. Course Management Workflow', () => {
    beforeAll(async () => {
      // Create a test course
      testCourse = await prisma.course.create({
        data: {
          title: 'Admin Test Course',
          description: 'Course for admin testing',
          instructorId: instructorUser.id,
          duration: '4 weeks',
          pricing: 99.99,
          curriculum: 'Test curriculum',
          isPublished: false,
        },
      });
    });

    it('should list all courses with instructor and enrollment data', async () => {
      const response = await request(app)
        .get('/api/admin/courses')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.courses).toBeDefined();
      expect(response.body.courses.some((course: any) => 
        course.id === testCourse.id
      )).toBe(true);
    });

    it('should get course details with lessons and assignments', async () => {
      const response = await request(app)
        .get(`/api/admin/courses/${testCourse.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.course.id).toBe(testCourse.id);
      expect(response.body.course.instructor).toBeDefined();
      expect(response.body.course.lessons).toBeDefined();
      expect(response.body.course.assignments).toBeDefined();
    });

    it('should update course publication status', async () => {
      const response = await request(app)
        .patch(`/api/admin/courses/${testCourse.id}/publish`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          isPublished: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.course.isPublished).toBe(true);

      // Verify audit log
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminId: adminUser.id,
          action: 'PUBLISH_COURSE',
          resourceId: testCourse.id,
        },
        orderBy: { timestamp: 'desc' },
      });

      expect(auditLog).toBeTruthy();
    });
  });

  describe('4. Financial Management Workflow', () => {
    beforeAll(async () => {
      // Create a test payment
      testPayment = await prisma.payment.create({
        data: {
          studentId: studentUser.id,
          courseId: testCourse.id,
          amount: 99.99,
          currency: 'USD',
          status: 'completed',
          paymentProvider: 'stripe',
          transactionId: `test_admin_${Date.now()}`,
        },
      });
    });

    it('should get financial dashboard metrics', async () => {
      const response = await request(app)
        .get('/api/admin/financial/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.metrics).toBeDefined();
      expect(response.body.metrics.totalRevenue).toBeDefined();
      expect(response.body.metrics.totalTransactions).toBeDefined();
    });

    it('should list payment transactions with filtering', async () => {
      const response = await request(app)
        .get('/api/admin/financial/payments')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.payments).toBeDefined();
      expect(response.body.payments.some((payment: any) => 
        payment.id === testPayment.id
      )).toBe(true);

      // Test filtering by status
      const filteredResponse = await request(app)
        .get('/api/admin/financial/payments?status=completed')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(filteredResponse.status).toBe(200);
      expect(filteredResponse.body.payments.every((payment: any) => 
        payment.status === 'completed'
      )).toBe(true);
    });

    it('should process refund and update access', async () => {
      const response = await request(app)
        .post(`/api/admin/financial/payments/${testPayment.id}/refund`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Customer request',
        });

      expect(response.status).toBe(200);
      expect(response.body.payment.status).toBe('refunded');

      // Verify audit log
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminId: adminUser.id,
          action: 'REFUND_PAYMENT',
          resourceId: testPayment.id,
        },
        orderBy: { timestamp: 'desc' },
      });

      expect(auditLog).toBeTruthy();
    });
  });

  describe('5. Scholarship Management Workflow', () => {
    it('should create scholarship with full details', async () => {
      const response = await request(app)
        .post('/api/admin/scholarships')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: studentUser.id,
          courseId: testCourse.id,
          discountPercentage: 100,
          reason: 'Merit-based scholarship',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        });

      expect(response.status).toBe(201);
      expect(response.body.scholarship.discountPercentage).toBe(100);
      expect(response.body.scholarship.reason).toBe('Merit-based scholarship');
      expect(response.body.scholarship.grantedBy).toBe(adminUser.id);

      // Verify audit log
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminId: adminUser.id,
          action: 'scholarship_create',
        },
        orderBy: { timestamp: 'desc' },
      });

      expect(auditLog).toBeTruthy();
    });

    it('should list scholarships with student and course details', async () => {
      const response = await request(app)
        .get('/api/admin/scholarships')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.scholarships).toBeDefined();
      expect(response.body.scholarships.length).toBeGreaterThan(0);
      expect(response.body.scholarships[0].student).toBeDefined();
      expect(response.body.scholarships[0].course).toBeDefined();
    });

    it('should manually enroll student bypassing payment', async () => {
      // Create another course for testing
      const anotherCourse = await prisma.course.create({
        data: {
          title: 'Manual Enrollment Test Course',
          description: 'Course for manual enrollment testing',
          instructorId: instructorUser.id,
          duration: '2 weeks',
          pricing: 49.99,
          curriculum: 'Manual enrollment curriculum',
          isPublished: true,
        },
      });

      const response = await request(app)
        .post('/api/admin/enrollments/manual')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: studentUser.id,
          courseId: anotherCourse.id,
          reason: 'Administrative enrollment',
        });

      expect(response.status).toBe(201);
      expect(response.body.enrollment.status).toBe('active');

      // Verify enrollment was created
      const enrollment = await prisma.enrollment.findFirst({
        where: {
          studentId: studentUser.id,
          courseId: anotherCourse.id,
        },
      });

      expect(enrollment).toBeTruthy();
    });
  });

  describe('6. Analytics and Reporting Workflow', () => {
    it('should get platform analytics dashboard', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/kpis')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.kpis).toBeDefined();
      expect(response.body.kpis.totalUsers).toBeDefined();
      expect(response.body.kpis.totalCourses).toBeDefined();
      expect(response.body.kpis.totalRevenue).toBeDefined();
    });

    it('should export analytics data', async () => {
      const response = await request(app)
        .get('/api/admin/analytics/export')
        .set('Authorization', `Bearer ${adminToken}`)
        .query({
          format: 'csv',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        });

      expect(response.status).toBe(200);
      expect(response.body.exportUrl).toBeDefined();
    });
  });

  describe('7. Security and Audit Management', () => {
    it('should list audit logs with filtering', async () => {
      const response = await request(app)
        .get('/api/admin/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.auditLogs).toBeDefined();
      expect(response.body.auditLogs.length).toBeGreaterThan(0);

      // Test filtering by action
      const filteredResponse = await request(app)
        .get('/api/admin/audit-logs?action=user_update')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(filteredResponse.status).toBe(200);
      expect(filteredResponse.body.auditLogs.every((log: any) => 
        log.action === 'user_update'
      )).toBe(true);
    });

    it('should export audit logs securely', async () => {
      const response = await request(app)
        .post('/api/admin/audit-logs/export')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          dateRange: {
            start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
          format: 'pdf',
        });

      expect(response.status).toBe(200);
      expect(response.body.exportUrl).toBeDefined();
      expect(response.body.checksum).toBeDefined(); // Tamper-evidence
    });

    it('should manage user sessions and force logout', async () => {
      // Get active sessions
      const sessionsResponse = await request(app)
        .get('/api/admin/sessions')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(sessionsResponse.status).toBe(200);
      expect(sessionsResponse.body.sessions).toBeDefined();

      // Force logout a session (if any exist)
      if (sessionsResponse.body.sessions.length > 0) {
        const sessionId = sessionsResponse.body.sessions[0].id;
        
        const logoutResponse = await request(app)
          .post(`/api/admin/sessions/${sessionId}/logout`)
          .set('Authorization', `Bearer ${adminToken}`);

        expect(logoutResponse.status).toBe(200);
        expect(logoutResponse.body.message).toContain('Session terminated');
      }
    });
  });

  describe('8. System Configuration Management', () => {
    it('should get system configuration settings', async () => {
      const response = await request(app)
        .get('/api/admin/system/config')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.config).toBeDefined();
    });

    it('should update system configuration with validation', async () => {
      const response = await request(app)
        .put('/api/admin/system/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          category: 'general',
          key: 'platform_name',
          value: 'Motion Studio Platform - Test',
          description: 'Platform display name',
        });

      expect(response.status).toBe(200);
      expect(response.body.config.value).toBe('Motion Studio Platform - Test');

      // Verify audit log
      const auditLog = await prisma.auditLog.findFirst({
        where: {
          adminId: adminUser.id,
          action: 'config_update',
        },
        orderBy: { timestamp: 'desc' },
      });

      expect(auditLog).toBeTruthy();
    });
  });

  describe('9. Bulk Operations Workflow', () => {
    it('should perform bulk user operations with confirmation', async () => {
      // Create additional test users for bulk operations
      const bulkUsers = await Promise.all([
        prisma.user.create({
          data: {
            email: `bulk1-${Date.now()}@admin-integration-test.com`,
            password: await hashPassword('TestPass123'),
            firstName: 'Bulk',
            lastName: 'User1',
            role: 'student',
            emailVerified: true,
          },
        }),
        prisma.user.create({
          data: {
            email: `bulk2-${Date.now()}@admin-integration-test.com`,
            password: await hashPassword('TestPass123'),
            firstName: 'Bulk',
            lastName: 'User2',
            role: 'student',
            emailVerified: true,
          },
        }),
      ]);

      const response = await request(app)
        .post('/api/admin/users/bulk-update')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          userIds: bulkUsers.map(user => user.id),
          action: 'update_role',
          data: { role: 'instructor' },
          confirmed: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.updatedCount).toBe(2);

      // Verify users were updated
      const updatedUsers = await prisma.user.findMany({
        where: {
          id: { in: bulkUsers.map(user => user.id) },
        },
      });

      expect(updatedUsers.every(user => user.role === 'instructor')).toBe(true);
    });

    it('should export comprehensive platform data', async () => {
      const response = await request(app)
        .post('/api/admin/data/export')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          format: 'csv',
          tables: ['users', 'courses', 'payments', 'enrollments'],
          dateRange: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.exportId).toBeDefined();
      expect(response.body.status).toBe('processing');
    });
  });

  describe('10. Error Handling and Edge Cases', () => {
    it('should handle invalid user ID gracefully', async () => {
      const response = await request(app)
        .get('/api/admin/users/invalid-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('Invalid user ID');
    });

    it('should handle non-existent course ID', async () => {
      const response = await request(app)
        .get('/api/admin/courses/non-existent-id')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toContain('Course not found');
    });

    it('should validate scholarship data', async () => {
      const response = await request(app)
        .post('/api/admin/scholarships')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          studentId: 'invalid-id',
          courseId: testCourse.id,
          discountPercentage: 150, // Invalid percentage
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should handle concurrent admin operations', async () => {
      // Simulate concurrent user updates
      const promises = Array.from({ length: 5 }, (_, i) => 
        request(app)
          .put(`/api/admin/users/${studentUser.id}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            firstName: `Updated${i}`,
          })
      );

      const responses = await Promise.all(promises);
      
      // All should succeed or fail gracefully
      responses.forEach(response => {
        expect([200, 409]).toContain(response.status); // 200 success or 409 conflict
      });
    });
  });
});