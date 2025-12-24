"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fc = __importStar(require("fast-check"));
const auth_1 = require("../auth");
const jwt_1 = require("../../utils/jwt");
/**
 * Feature: motion-studio-platform, Property 2: Course Access Control
 * Validates: Requirements 7.4
 *
 * For any paid course and any student, if the student has not completed a payment
 * transaction, the student should be unable to access course content and should
 * see a purchase prompt.
 */
// Mock prisma for testing
jest.mock('../../utils/prisma', () => ({
    prisma: {
        course: {
            findUnique: jest.fn(),
        },
        payment: {
            findFirst: jest.fn(),
        },
        enrollment: {
            findUnique: jest.fn(),
        },
    },
}));
const prisma_1 = require("../../utils/prisma");
const mockPrisma = prisma_1.prisma;
describe('Property-Based Tests: Course Access Control', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    describe('Property 2: Course Access Control', () => {
        it('should deny access to paid courses without payment for students', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate random course and student data
            fc.record({
                courseId: fc.uuid(),
                pricing: fc.integer({ min: 1, max: 1000 }), // Paid course
                instructorId: fc.uuid(),
            }), fc.record({
                userId: fc.uuid(),
                email: fc.emailAddress(),
                role: fc.constant('student'),
            }), async (courseData, userData) => {
                // Assume the student is different from the instructor
                fc.pre(userData.userId !== courseData.instructorId);
                // Generate a valid token for the student
                const tokenPayload = {
                    userId: userData.userId,
                    email: userData.email,
                    role: userData.role,
                };
                const validToken = (0, jwt_1.generateToken)(tokenPayload);
                // Mock course exists and is published
                mockPrisma.course.findUnique.mockResolvedValue({
                    id: courseData.courseId,
                    isPublished: true,
                    pricing: courseData.pricing,
                    instructorId: courseData.instructorId,
                });
                // Mock no payment found (student hasn't paid)
                mockPrisma.payment.findFirst.mockResolvedValue(null);
                // Create mock request
                const mockRequest = {
                    params: { courseId: courseData.courseId },
                    headers: {
                        authorization: `Bearer ${validToken}`,
                    },
                    user: tokenPayload,
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Call the course access middleware
                const middleware = (0, auth_1.requireCourseEnrollment)('courseId');
                await middleware(mockRequest, mockResponse, mockNext);
                // Verify that access was denied with payment required error
                expect(mockResponse.status).toHaveBeenCalledWith(402);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    error: 'This is a paid course. Please complete payment first.',
                });
                expect(mockNext).not.toHaveBeenCalled();
            }), { numRuns: 100 });
        });
        it('should allow access to paid courses with completed payment for students', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate random course and student data
            fc.record({
                courseId: fc.uuid(),
                pricing: fc.integer({ min: 1, max: 1000 }), // Paid course
                instructorId: fc.uuid(),
            }), fc.record({
                userId: fc.uuid(),
                email: fc.emailAddress(),
                role: fc.constant('student'),
            }), async (courseData, userData) => {
                // Assume the student is different from the instructor
                fc.pre(userData.userId !== courseData.instructorId);
                // Generate a valid token for the student
                const tokenPayload = {
                    userId: userData.userId,
                    email: userData.email,
                    role: userData.role,
                };
                const validToken = (0, jwt_1.generateToken)(tokenPayload);
                // Mock course exists and is published
                mockPrisma.course.findUnique.mockResolvedValue({
                    id: courseData.courseId,
                    isPublished: true,
                    pricing: courseData.pricing,
                    instructorId: courseData.instructorId,
                });
                // Mock successful payment found
                mockPrisma.payment.findFirst.mockResolvedValue({
                    id: fc.sample(fc.uuid(), 1)[0],
                    studentId: userData.userId,
                    courseId: courseData.courseId,
                    status: 'completed',
                });
                // Mock enrollment exists
                mockPrisma.enrollment.findUnique.mockResolvedValue({
                    studentId: userData.userId,
                    courseId: courseData.courseId,
                });
                // Create mock request
                const mockRequest = {
                    params: { courseId: courseData.courseId },
                    headers: {
                        authorization: `Bearer ${validToken}`,
                    },
                    user: tokenPayload,
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Call the course access middleware
                const middleware = (0, auth_1.requireCourseEnrollment)('courseId');
                await middleware(mockRequest, mockResponse, mockNext);
                // Verify that access was granted
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
                expect(mockNext).toHaveBeenCalled();
            }), { numRuns: 100 });
        });
        it('should allow access to free courses without payment for enrolled students', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate random course and student data
            fc.record({
                courseId: fc.uuid(),
                pricing: fc.constant(0), // Free course
                instructorId: fc.uuid(),
            }), fc.record({
                userId: fc.uuid(),
                email: fc.emailAddress(),
                role: fc.constant('student'),
            }), async (courseData, userData) => {
                // Assume the student is different from the instructor
                fc.pre(userData.userId !== courseData.instructorId);
                // Generate a valid token for the student
                const tokenPayload = {
                    userId: userData.userId,
                    email: userData.email,
                    role: userData.role,
                };
                const validToken = (0, jwt_1.generateToken)(tokenPayload);
                // Mock course exists and is published
                mockPrisma.course.findUnique.mockResolvedValue({
                    id: courseData.courseId,
                    isPublished: true,
                    pricing: courseData.pricing,
                    instructorId: courseData.instructorId,
                });
                // Mock enrollment exists (no payment check needed for free courses)
                mockPrisma.enrollment.findUnique.mockResolvedValue({
                    studentId: userData.userId,
                    courseId: courseData.courseId,
                });
                // Create mock request
                const mockRequest = {
                    params: { courseId: courseData.courseId },
                    headers: {
                        authorization: `Bearer ${validToken}`,
                    },
                    user: tokenPayload,
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Call the course access middleware
                const middleware = (0, auth_1.requireCourseEnrollment)('courseId');
                await middleware(mockRequest, mockResponse, mockNext);
                // Verify that access was granted
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
                expect(mockNext).toHaveBeenCalled();
            }), { numRuns: 10 });
        });
        it('should deny access to courses for non-enrolled students', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate random course and student data
            fc.record({
                courseId: fc.uuid(),
                pricing: fc.integer({ min: 0, max: 1000 }), // Any course
                instructorId: fc.uuid(),
            }), fc.record({
                userId: fc.uuid(),
                email: fc.emailAddress(),
                role: fc.constant('student'),
            }), async (courseData, userData) => {
                // Assume the student is different from the instructor
                fc.pre(userData.userId !== courseData.instructorId);
                // Generate a valid token for the student
                const tokenPayload = {
                    userId: userData.userId,
                    email: userData.email,
                    role: userData.role,
                };
                const validToken = (0, jwt_1.generateToken)(tokenPayload);
                // Mock course exists and is published
                mockPrisma.course.findUnique.mockResolvedValue({
                    id: courseData.courseId,
                    isPublished: true,
                    pricing: courseData.pricing,
                    instructorId: courseData.instructorId,
                });
                // Mock payment exists for paid courses (if applicable)
                if (courseData.pricing > 0) {
                    mockPrisma.payment.findFirst.mockResolvedValue({
                        id: fc.sample(fc.uuid(), 1)[0],
                        studentId: userData.userId,
                        courseId: courseData.courseId,
                        status: 'completed',
                    });
                }
                // Mock no enrollment found
                mockPrisma.enrollment.findUnique.mockResolvedValue(null);
                // Create mock request
                const mockRequest = {
                    params: { courseId: courseData.courseId },
                    headers: {
                        authorization: `Bearer ${validToken}`,
                    },
                    user: tokenPayload,
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Call the course access middleware
                const middleware = (0, auth_1.requireCourseEnrollment)('courseId');
                await middleware(mockRequest, mockResponse, mockNext);
                // Verify that access was denied
                expect(mockResponse.status).toHaveBeenCalledWith(403);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    error: 'You are not enrolled in this course',
                });
                expect(mockNext).not.toHaveBeenCalled();
            }), { numRuns: 10 });
        });
        it('should allow instructors to access their own courses', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate random course data where instructor owns the course
            fc.record({
                courseId: fc.uuid(),
                pricing: fc.integer({ min: 0, max: 1000 }), // Any course
                instructorId: fc.uuid(),
            }), async (courseData) => {
                // Generate a valid token for the instructor (same as course instructor)
                const tokenPayload = {
                    userId: courseData.instructorId, // Same as course instructor
                    email: fc.sample(fc.emailAddress(), 1)[0],
                    role: 'instructor',
                };
                const validToken = (0, jwt_1.generateToken)(tokenPayload);
                // Mock course exists and is published
                mockPrisma.course.findUnique.mockResolvedValue({
                    id: courseData.courseId,
                    isPublished: true,
                    pricing: courseData.pricing,
                    instructorId: courseData.instructorId,
                });
                // Create mock request
                const mockRequest = {
                    params: { courseId: courseData.courseId },
                    headers: {
                        authorization: `Bearer ${validToken}`,
                    },
                    user: tokenPayload,
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Call the course access middleware
                const middleware = (0, auth_1.requireCourseEnrollment)('courseId');
                await middleware(mockRequest, mockResponse, mockNext);
                // Verify that access was granted (no enrollment/payment check for instructors)
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
                expect(mockNext).toHaveBeenCalled();
            }), { numRuns: 10 });
        });
        it('should allow admins to access any course', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate random course and admin data
            fc.record({
                courseId: fc.uuid(),
                pricing: fc.integer({ min: 0, max: 1000 }), // Any course
                instructorId: fc.uuid(),
            }), fc.record({
                userId: fc.uuid(),
                email: fc.emailAddress(),
                role: fc.constant('admin'),
            }), async (courseData, userData) => {
                // Generate a valid token for the admin
                const tokenPayload = {
                    userId: userData.userId,
                    email: userData.email,
                    role: userData.role,
                };
                const validToken = (0, jwt_1.generateToken)(tokenPayload);
                // Mock course exists and is published
                mockPrisma.course.findUnique.mockResolvedValue({
                    id: courseData.courseId,
                    isPublished: true,
                    pricing: courseData.pricing,
                    instructorId: courseData.instructorId,
                });
                // Create mock request
                const mockRequest = {
                    params: { courseId: courseData.courseId },
                    headers: {
                        authorization: `Bearer ${validToken}`,
                    },
                    user: tokenPayload,
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Call the course access middleware
                const middleware = (0, auth_1.requireCourseEnrollment)('courseId');
                await middleware(mockRequest, mockResponse, mockNext);
                // Verify that access was granted (no enrollment/payment check for admins)
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
                expect(mockNext).toHaveBeenCalled();
            }), { numRuns: 10 });
        });
        it('should deny access to unpublished courses for students', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate random course and student data
            fc.record({
                courseId: fc.uuid(),
                pricing: fc.integer({ min: 0, max: 1000 }), // Any course
                instructorId: fc.uuid(),
            }), fc.record({
                userId: fc.uuid(),
                email: fc.emailAddress(),
                role: fc.constant('student'),
            }), async (courseData, userData) => {
                // Assume the student is different from the instructor
                fc.pre(userData.userId !== courseData.instructorId);
                // Generate a valid token for the student
                const tokenPayload = {
                    userId: userData.userId,
                    email: userData.email,
                    role: userData.role,
                };
                const validToken = (0, jwt_1.generateToken)(tokenPayload);
                // Mock course exists but is NOT published
                mockPrisma.course.findUnique.mockResolvedValue({
                    id: courseData.courseId,
                    isPublished: false, // Unpublished course
                    pricing: courseData.pricing,
                    instructorId: courseData.instructorId,
                });
                // Create mock request
                const mockRequest = {
                    params: { courseId: courseData.courseId },
                    headers: {
                        authorization: `Bearer ${validToken}`,
                    },
                    user: tokenPayload,
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Call the course access middleware
                const middleware = (0, auth_1.requireCourseEnrollment)('courseId');
                await middleware(mockRequest, mockResponse, mockNext);
                // Verify that access was denied (course not found for unpublished)
                expect(mockResponse.status).toHaveBeenCalledWith(404);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    error: 'Course not found',
                });
                expect(mockNext).not.toHaveBeenCalled();
            }), { numRuns: 10 });
        });
    });
});
//# sourceMappingURL=courseAccess.property.test.js.map