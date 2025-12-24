import request from 'supertest';
import app from '../../index';
import { prisma } from '../../utils/prisma';
import { generateToken } from '../../utils/jwt';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: 'cs_test_session_id',
          url: 'https://checkout.stripe.com/pay/cs_test_session_id'
        })
      }
    },
    webhooks: {
      constructEvent: jest.fn()
    }
  }));
});

describe('Payment Routes', () => {
  let testUser: any;
  let testCourse: any;
  let testInstructor: any;
  let authToken: string;

  beforeEach(async () => {
    // Create test instructor
    testInstructor = await prisma.user.create({
      data: {
        email: 'instructor@test.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'Instructor',
        role: 'instructor',
        emailVerified: true
      }
    });

    // Create test student
    testUser = await prisma.user.create({
      data: {
        email: 'student@test.com',
        password: 'hashedpassword',
        firstName: 'Test',
        lastName: 'Student',
        role: 'student',
        emailVerified: true
      }
    });

    // Create test course
    testCourse = await prisma.course.create({
      data: {
        title: 'Test Course',
        description: 'A test course',
        instructorId: testInstructor.id,
        duration: '4 weeks',
        pricing: 99.99,
        currency: 'USD',
        curriculum: 'Test curriculum',
        isPublished: true
      }
    });

    // Generate auth token
    authToken = generateToken({
      userId: testUser.id,
      email: testUser.email,
      role: testUser.role
    });
  });

  afterEach(async () => {
    // Clean up test data
    await prisma.payment.deleteMany();
    await prisma.enrollment.deleteMany();
    await prisma.lessonCompletion.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.submission.deleteMany();
    await prisma.assignment.deleteMany();
    await prisma.lesson.deleteMany();
    await prisma.course.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('POST /api/payments/create-checkout', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/payments/create-checkout')
        .send({
          courseId: testCourse.id,
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/payments/create-checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          courseId: testCourse.id
          // Missing successUrl and cancelUrl
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Course ID, success URL, and cancel URL are required');
    });

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .post('/api/payments/create-checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          courseId: 'non-existent',
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Course not found');
    });

    it('should return 400 for free course', async () => {
      // Update course to be free
      await prisma.course.update({
        where: { id: testCourse.id },
        data: { pricing: 0 }
      });

      const response = await request(app)
        .post('/api/payments/create-checkout')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          courseId: testCourse.id,
          successUrl: 'http://localhost:3000/success',
          cancelUrl: 'http://localhost:3000/cancel'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Cannot create payment session for free course');
    });
  });

  describe('GET /api/payments/status/:paymentId', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/payments/status/test-payment-id');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication required');
    });

    it('should return 404 for non-existent payment', async () => {
      const response = await request(app)
        .get('/api/payments/status/non-existent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Payment not found');
    });

    it('should return payment details for existing payment', async () => {
      // Create a payment
      const payment = await prisma.payment.create({
        data: {
          studentId: testUser.id,
          courseId: testCourse.id,
          amount: 99.99,
          currency: 'USD',
          status: 'pending',
          paymentProvider: 'stripe',
          transactionId: 'test_session_id'
        }
      });

      const response = await request(app)
        .get(`/api/payments/status/${payment.id}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(payment.id);
      expect(response.body.amount).toBe(99.99);
      expect(response.body.status).toBe('pending');
    });
  });
});