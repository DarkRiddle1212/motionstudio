"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paymentService_1 = require("../paymentService");
const prisma_1 = require("../../utils/prisma");
// Mock Stripe
jest.mock('stripe', () => {
    return jest.fn().mockImplementation(() => ({
        checkout: {
            sessions: {
                create: jest.fn()
            }
        },
        webhooks: {
            constructEvent: jest.fn()
        }
    }));
});
describe('PaymentService', () => {
    let testUser;
    let testCourse;
    let testInstructor;
    beforeEach(async () => {
        // Create test instructor
        testInstructor = await prisma_1.prisma.user.create({
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
        testUser = await prisma_1.prisma.user.create({
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
        testCourse = await prisma_1.prisma.course.create({
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
    });
    afterEach(async () => {
        // Clean up test data in correct order to avoid foreign key constraints
        await prisma_1.prisma.payment.deleteMany();
        await prisma_1.prisma.enrollment.deleteMany();
        await prisma_1.prisma.lessonCompletion.deleteMany();
        await prisma_1.prisma.feedback.deleteMany();
        await prisma_1.prisma.submission.deleteMany();
        await prisma_1.prisma.assignment.deleteMany();
        await prisma_1.prisma.lesson.deleteMany();
        await prisma_1.prisma.course.deleteMany();
        await prisma_1.prisma.user.deleteMany();
    });
    describe('createCheckoutSession', () => {
        it('should throw error for non-existent course', async () => {
            await expect(paymentService_1.PaymentService.createCheckoutSession({
                courseId: 'non-existent',
                studentId: testUser.id,
                successUrl: 'http://localhost:3000/success',
                cancelUrl: 'http://localhost:3000/cancel'
            })).rejects.toThrow('Course not found');
        });
        it('should throw error for free course', async () => {
            // Update the existing course to be free
            await prisma_1.prisma.course.update({
                where: { id: testCourse.id },
                data: { pricing: 0 }
            });
            await expect(paymentService_1.PaymentService.createCheckoutSession({
                courseId: testCourse.id,
                studentId: testUser.id,
                successUrl: 'http://localhost:3000/success',
                cancelUrl: 'http://localhost:3000/cancel'
            })).rejects.toThrow('Cannot create payment session for free course');
        });
        it('should throw error if student is already enrolled', async () => {
            // Create enrollment first
            await prisma_1.prisma.enrollment.create({
                data: {
                    studentId: testUser.id,
                    courseId: testCourse.id,
                    status: 'active'
                }
            });
            await expect(paymentService_1.PaymentService.createCheckoutSession({
                courseId: testCourse.id,
                studentId: testUser.id,
                successUrl: 'http://localhost:3000/success',
                cancelUrl: 'http://localhost:3000/cancel'
            })).rejects.toThrow('Student is already enrolled in this course');
        });
    });
    describe('getPaymentStatus', () => {
        it('should throw error for non-existent payment', async () => {
            await expect(paymentService_1.PaymentService.getPaymentStatus('non-existent')).rejects.toThrow('Payment not found');
        });
        it('should return payment details for existing payment', async () => {
            // Create a payment
            const payment = await prisma_1.prisma.payment.create({
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
            const result = await paymentService_1.PaymentService.getPaymentStatus(payment.id);
            expect(result).toBeDefined();
            expect(result.id).toBe(payment.id);
            expect(result.amount).toBe(99.99);
            expect(result.status).toBe('pending');
            expect(result.course).toBeDefined();
            expect(result.student).toBeDefined();
        });
    });
    describe('getPaymentStatusBySessionId', () => {
        it('should throw error for non-existent session', async () => {
            await expect(paymentService_1.PaymentService.getPaymentStatusBySessionId('non-existent')).rejects.toThrow('Payment not found');
        });
        it('should return payment details for existing session', async () => {
            // Create a payment
            const payment = await prisma_1.prisma.payment.create({
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
            const result = await paymentService_1.PaymentService.getPaymentStatusBySessionId('test_session_id');
            expect(result).toBeDefined();
            expect(result.id).toBe(payment.id);
            expect(result.transactionId).toBe('test_session_id');
            expect(result.course).toBeDefined();
            expect(result.student).toBeDefined();
        });
    });
});
//# sourceMappingURL=paymentService.test.js.map