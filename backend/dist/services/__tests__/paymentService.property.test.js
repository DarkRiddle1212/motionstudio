"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const paymentService_1 = require("../paymentService");
const courseService_1 = require("../courseService");
const prisma_1 = require("../../utils/prisma");
const password_1 = require("../../utils/password");
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
/**
 * Feature: motion-studio-platform, Property 3: Payment Completion Grants Access
 * Validates: Requirements 7.2, 7.5
 *
 * For any paid course and any student, if the student completes a successful payment
 * transaction, the student should immediately gain full access to all course lessons
 * and assignments.
 */
describe('Property-Based Tests: Payment Service', () => {
    const courseService = new courseService_1.CourseService();
    beforeAll(async () => {
        // Clean up test database before running tests
        await prisma_1.prisma.enrollment.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@payment-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.payment.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@payment-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.course.deleteMany({
            where: {
                instructor: {
                    email: {
                        contains: '@payment-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.user.deleteMany({
            where: {
                email: {
                    contains: '@payment-property-test.com',
                },
            },
        });
    });
    afterAll(async () => {
        // Clean up test database after running tests
        await prisma_1.prisma.enrollment.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@payment-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.payment.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@payment-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.course.deleteMany({
            where: {
                instructor: {
                    email: {
                        contains: '@payment-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.user.deleteMany({
            where: {
                email: {
                    contains: '@payment-property-test.com',
                },
            },
        });
        await prisma_1.prisma.$disconnect();
    });
    describe('Property 3: Payment Completion Grants Access', () => {
        it('should grant immediate access to paid course after successful payment completion', async () => {
            // Test with a few different pricing scenarios
            const testCases = [
                { pricing: 29.99, currency: 'USD' },
                { pricing: 99.99, currency: 'USD' },
                { pricing: 149.50, currency: 'EUR' }
            ];
            for (const testCase of testCases) {
                let instructor, student, course, payment;
                try {
                    // Create instructor with unique timestamp to avoid conflicts
                    const timestamp = Date.now() + Math.random();
                    const instructorEmail = `instructor-payment-${timestamp}@payment-property-test.com`;
                    const hashedInstructorPassword = await (0, password_1.hashPassword)('TestPass123');
                    instructor = await prisma_1.prisma.user.create({
                        data: {
                            email: instructorEmail,
                            password: hashedInstructorPassword,
                            firstName: 'Test',
                            lastName: 'Instructor',
                            role: 'instructor',
                            emailVerified: true,
                        },
                    });
                    // Ensure instructor is created before proceeding
                    const createdInstructor = await prisma_1.prisma.user.findUnique({
                        where: { id: instructor.id }
                    });
                    expect(createdInstructor).toBeTruthy();
                    // Create student
                    const studentEmail = `student-payment-${timestamp}@payment-property-test.com`;
                    const hashedStudentPassword = await (0, password_1.hashPassword)('TestPass123');
                    student = await prisma_1.prisma.user.create({
                        data: {
                            email: studentEmail,
                            password: hashedStudentPassword,
                            firstName: 'Test',
                            lastName: 'Student',
                            role: 'student',
                            emailVerified: true,
                        },
                    });
                    // Create paid course
                    course = await courseService.createCourse({
                        title: `Test Paid Course ${testCase.pricing}`,
                        description: 'A test paid course for property testing',
                        instructorId: instructor.id,
                        duration: '4 weeks',
                        pricing: testCase.pricing,
                        currency: testCase.currency,
                        curriculum: 'Test curriculum content',
                    });
                    // Publish the course so it's available for enrollment
                    await courseService.updateCourse(course.id, instructor.id, { isPublished: true });
                    // Verify student cannot enroll without payment
                    try {
                        await courseService.enrollStudent(course.id, student.id);
                        throw new Error('Should not be able to enroll in paid course without payment');
                    }
                    catch (error) {
                        expect(error.message).toBe('This is a paid course. Please complete payment first.');
                    }
                    // Create a completed payment for the course
                    payment = await prisma_1.prisma.payment.create({
                        data: {
                            studentId: student.id,
                            courseId: course.id,
                            amount: testCase.pricing,
                            currency: testCase.currency,
                            status: 'completed', // Payment is completed
                            paymentProvider: 'stripe',
                            transactionId: `test_session_${Date.now()}_${Math.random()}`,
                        },
                    });
                    // Now student should be able to enroll using payment verification
                    const enrollment = await paymentService_1.PaymentService.enrollStudentAfterPayment(payment.id);
                    // Verify immediate access is granted
                    expect(enrollment).toBeDefined();
                    expect(enrollment.studentId).toBe(student.id);
                    expect(enrollment.courseId).toBe(course.id);
                    expect(enrollment.status).toBe('active');
                    expect(enrollment.progressPercentage).toBe(0);
                    // Verify the course information is included in the enrollment
                    expect(enrollment.course).toBeDefined();
                    expect(enrollment.course.id).toBe(course.id);
                    expect(enrollment.course.title).toBe(`Test Paid Course ${testCase.pricing}`);
                    expect(enrollment.course.pricing).toBe(testCase.pricing);
                    // Verify the student can retrieve their enrollment
                    const studentEnrollments = await courseService.getStudentEnrollments(student.id);
                    expect(studentEnrollments).toHaveLength(1);
                    expect(studentEnrollments[0].courseId).toBe(course.id);
                    expect(studentEnrollments[0].status).toBe('active');
                    // Verify the course is accessible (student can get course details)
                    const accessibleCourse = await courseService.getCourseById(course.id);
                    expect(accessibleCourse).toBeDefined();
                    expect(accessibleCourse.id).toBe(course.id);
                    expect(accessibleCourse.isPublished).toBe(true);
                    // Verify payment verification with course service detects existing enrollment
                    try {
                        await courseService.enrollStudentWithPaymentVerification(course.id, student.id, payment.id);
                        throw new Error('Should detect existing enrollment');
                    }
                    catch (error) {
                        expect(error.message).toBe('You are already enrolled in this course');
                    }
                    // Verify still only one enrollment exists
                    const finalEnrollments = await courseService.getStudentEnrollments(student.id);
                    expect(finalEnrollments).toHaveLength(1);
                }
                finally {
                    // Clean up in correct order (foreign key constraints)
                    if (course && student) {
                        try {
                            await prisma_1.prisma.enrollment.deleteMany({
                                where: {
                                    studentId: student.id,
                                    courseId: course.id,
                                },
                            });
                        }
                        catch (error) {
                            // Ignore cleanup errors
                        }
                    }
                    if (payment) {
                        try {
                            await prisma_1.prisma.payment.delete({
                                where: { id: payment.id },
                            });
                        }
                        catch (error) {
                            // Ignore cleanup errors
                        }
                    }
                    if (course) {
                        try {
                            await prisma_1.prisma.course.delete({
                                where: { id: course.id },
                            });
                        }
                        catch (error) {
                            // Ignore cleanup errors
                        }
                    }
                    if (instructor) {
                        try {
                            await prisma_1.prisma.user.delete({
                                where: { id: instructor.id },
                            });
                        }
                        catch (error) {
                            // Ignore cleanup errors
                        }
                    }
                    if (student) {
                        try {
                            await prisma_1.prisma.user.delete({
                                where: { id: student.id },
                            });
                        }
                        catch (error) {
                            // Ignore cleanup errors
                        }
                    }
                }
            }
        }, 30000); // 30 second timeout
        it('should reject enrollment with incomplete payment', async () => {
            let instructor, student, course, payment;
            try {
                // Create instructor with unique timestamp to avoid conflicts
                const timestamp = Date.now() + Math.random();
                const instructorEmail = `instructor-incomplete-${timestamp}@payment-property-test.com`;
                const hashedInstructorPassword = await (0, password_1.hashPassword)('TestPass123');
                instructor = await prisma_1.prisma.user.create({
                    data: {
                        email: instructorEmail,
                        password: hashedInstructorPassword,
                        firstName: 'Test',
                        lastName: 'Instructor',
                        role: 'instructor',
                        emailVerified: true,
                    },
                });
                // Ensure instructor is created before proceeding
                const createdInstructor = await prisma_1.prisma.user.findUnique({
                    where: { id: instructor.id }
                });
                expect(createdInstructor).toBeTruthy();
                // Create student
                const studentEmail = `student-incomplete-${timestamp}@payment-property-test.com`;
                const hashedStudentPassword = await (0, password_1.hashPassword)('TestPass123');
                student = await prisma_1.prisma.user.create({
                    data: {
                        email: studentEmail,
                        password: hashedStudentPassword,
                        firstName: 'Test',
                        lastName: 'Student',
                        role: 'student',
                        emailVerified: true,
                    },
                });
                // Create paid course
                course = await courseService.createCourse({
                    title: 'Test Paid Course',
                    description: 'A test paid course',
                    instructorId: instructor.id,
                    duration: '4 weeks',
                    pricing: 99.99,
                    currency: 'USD',
                    curriculum: 'Test curriculum content',
                });
                // Publish the course
                await courseService.updateCourse(course.id, instructor.id, { isPublished: true });
                // Create a pending payment (not completed)
                payment = await prisma_1.prisma.payment.create({
                    data: {
                        studentId: student.id,
                        courseId: course.id,
                        amount: 99.99,
                        currency: 'USD',
                        status: 'pending', // Payment is not completed
                        paymentProvider: 'stripe',
                        transactionId: `test_session_pending_${Date.now()}`,
                    },
                });
                // Attempt to enroll with incomplete payment should fail
                try {
                    await paymentService_1.PaymentService.enrollStudentAfterPayment(payment.id);
                    throw new Error('Should not be able to enroll with incomplete payment');
                }
                catch (error) {
                    expect(error.message).toBe('Payment is not completed');
                }
                // Verify no enrollment was created
                const studentEnrollments = await courseService.getStudentEnrollments(student.id);
                expect(studentEnrollments).toHaveLength(0);
                // Test with failed payment status
                await prisma_1.prisma.payment.update({
                    where: { id: payment.id },
                    data: { status: 'failed' },
                });
                try {
                    await paymentService_1.PaymentService.enrollStudentAfterPayment(payment.id);
                    throw new Error('Should not be able to enroll with failed payment');
                }
                catch (error) {
                    expect(error.message).toBe('Payment is not completed');
                }
                // Verify still no enrollment
                const finalEnrollments = await courseService.getStudentEnrollments(student.id);
                expect(finalEnrollments).toHaveLength(0);
            }
            finally {
                // Clean up
                if (payment) {
                    try {
                        await prisma_1.prisma.payment.delete({
                            where: { id: payment.id },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
                if (course) {
                    try {
                        await prisma_1.prisma.course.delete({
                            where: { id: course.id },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
                if (instructor) {
                    try {
                        await prisma_1.prisma.user.delete({
                            where: { id: instructor.id },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
                if (student) {
                    try {
                        await prisma_1.prisma.user.delete({
                            where: { id: student.id },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
            }
        }, 20000); // 20 second timeout
        it('should reject enrollment with payment for different course', async () => {
            let instructor, student, course1, course2, payment;
            try {
                // Create instructor with unique timestamp to avoid conflicts
                const timestamp = Date.now() + Math.random();
                const instructorEmail = `instructor-wrong-course-${timestamp}@payment-property-test.com`;
                const hashedInstructorPassword = await (0, password_1.hashPassword)('TestPass123');
                instructor = await prisma_1.prisma.user.create({
                    data: {
                        email: instructorEmail,
                        password: hashedInstructorPassword,
                        firstName: 'Test',
                        lastName: 'Instructor',
                        role: 'instructor',
                        emailVerified: true,
                    },
                });
                // Ensure instructor is created before proceeding
                const createdInstructor = await prisma_1.prisma.user.findUnique({
                    where: { id: instructor.id }
                });
                expect(createdInstructor).toBeTruthy();
                // Create student
                const studentEmail = `student-wrong-course-${timestamp}@payment-property-test.com`;
                const hashedStudentPassword = await (0, password_1.hashPassword)('TestPass123');
                student = await prisma_1.prisma.user.create({
                    data: {
                        email: studentEmail,
                        password: hashedStudentPassword,
                        firstName: 'Test',
                        lastName: 'Student',
                        role: 'student',
                        emailVerified: true,
                    },
                });
                // Create two paid courses
                course1 = await courseService.createCourse({
                    title: 'Test Paid Course 1',
                    description: 'First test paid course',
                    instructorId: instructor.id,
                    duration: '4 weeks',
                    pricing: 99.99,
                    currency: 'USD',
                    curriculum: 'Test curriculum content 1',
                });
                course2 = await courseService.createCourse({
                    title: 'Test Paid Course 2',
                    description: 'Second test paid course',
                    instructorId: instructor.id,
                    duration: '6 weeks',
                    pricing: 149.99,
                    currency: 'USD',
                    curriculum: 'Test curriculum content 2',
                });
                // Publish both courses
                await courseService.updateCourse(course1.id, instructor.id, { isPublished: true });
                await courseService.updateCourse(course2.id, instructor.id, { isPublished: true });
                // Create a completed payment for course1
                payment = await prisma_1.prisma.payment.create({
                    data: {
                        studentId: student.id,
                        courseId: course1.id, // Payment is for course1
                        amount: 99.99,
                        currency: 'USD',
                        status: 'completed',
                        paymentProvider: 'stripe',
                        transactionId: `test_session_wrong_course_${Date.now()}`,
                    },
                });
                // Attempt to enroll in course2 using payment for course1 should fail
                try {
                    await courseService.enrollStudentWithPaymentVerification(course2.id, student.id, payment.id);
                    throw new Error('Should not be able to enroll in different course with wrong payment');
                }
                catch (error) {
                    expect(error.message).toBe('Payment is not for this course');
                }
                // Verify no enrollment was created for course2
                const studentEnrollments = await courseService.getStudentEnrollments(student.id);
                expect(studentEnrollments).toHaveLength(0);
                // But enrollment in course1 with correct payment should work
                const correctEnrollment = await courseService.enrollStudentWithPaymentVerification(course1.id, student.id, payment.id);
                expect(correctEnrollment.courseId).toBe(course1.id);
                expect(correctEnrollment.studentId).toBe(student.id);
            }
            finally {
                // Clean up
                if (course1 && student) {
                    try {
                        await prisma_1.prisma.enrollment.deleteMany({
                            where: {
                                studentId: student.id,
                                courseId: course1.id,
                            },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
                if (payment) {
                    try {
                        await prisma_1.prisma.payment.delete({
                            where: { id: payment.id },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
                if (course1) {
                    try {
                        await prisma_1.prisma.course.delete({
                            where: { id: course1.id },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
                if (course2) {
                    try {
                        await prisma_1.prisma.course.delete({
                            where: { id: course2.id },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
                if (instructor) {
                    try {
                        await prisma_1.prisma.user.delete({
                            where: { id: instructor.id },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
                if (student) {
                    try {
                        await prisma_1.prisma.user.delete({
                            where: { id: student.id },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
            }
        }, 25000); // 25 second timeout
    });
});
//# sourceMappingURL=paymentService.property.test.js.map