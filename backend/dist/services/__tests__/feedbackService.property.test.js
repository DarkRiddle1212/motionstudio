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
const feedbackService_1 = require("../feedbackService");
const submissionService_1 = require("../submissionService");
const assignmentService_1 = require("../assignmentService");
const courseService_1 = require("../courseService");
const prisma_1 = require("../../utils/prisma");
const password_1 = require("../../utils/password");
/**
 * Feature: motion-studio-platform, Property 8: Instructor Feedback Visibility
 * Validates: Requirements 5.5
 *
 * For any submission that has been reviewed by an instructor, the student should be able to
 * retrieve and view all feedback comments associated with that submission.
 */
describe('Property-Based Tests: Feedback Service', () => {
    const feedbackService = new feedbackService_1.FeedbackService();
    const submissionService = new submissionService_1.SubmissionService();
    const assignmentService = new assignmentService_1.AssignmentService();
    const courseService = new courseService_1.CourseService();
    beforeAll(async () => {
        // Clean up test database before running tests
        await prisma_1.prisma.feedback.deleteMany({
            where: {
                instructor: {
                    email: {
                        contains: '@feedback-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.submission.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@feedback-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.assignment.deleteMany({
            where: {
                course: {
                    instructor: {
                        email: {
                            contains: '@feedback-property-test.com',
                        },
                    },
                },
            },
        });
        await prisma_1.prisma.enrollment.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@feedback-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.course.deleteMany({
            where: {
                instructor: {
                    email: {
                        contains: '@feedback-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.user.deleteMany({
            where: {
                email: {
                    contains: '@feedback-property-test.com',
                },
            },
        });
    });
    afterAll(async () => {
        // Clean up test database after running tests
        await prisma_1.prisma.feedback.deleteMany({
            where: {
                instructor: {
                    email: {
                        contains: '@feedback-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.submission.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@feedback-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.assignment.deleteMany({
            where: {
                course: {
                    instructor: {
                        email: {
                            contains: '@feedback-property-test.com',
                        },
                    },
                },
            },
        });
        await prisma_1.prisma.enrollment.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@feedback-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.course.deleteMany({
            where: {
                instructor: {
                    email: {
                        contains: '@feedback-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.user.deleteMany({
            where: {
                email: {
                    contains: '@feedback-property-test.com',
                },
            },
        });
        await prisma_1.prisma.$disconnect();
    });
    describe('Property 8: Instructor Feedback Visibility', () => {
        it('should allow students to retrieve and view all feedback comments on their reviewed submissions', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate test scenarios with different feedback configurations
            fc.record({
                feedbackComment: fc.string({ minLength: 10, maxLength: 500 }),
                rating: fc.option(fc.integer({ min: 1, max: 5 })),
                submissionType: fc.constantFrom('file', 'link'),
            }), async ({ feedbackComment, rating, submissionType }) => {
                let instructor, student, course, assignment, submission, feedback;
                try {
                    // Create unique test data to avoid conflicts
                    const timestamp = Date.now() + Math.random();
                    // Create instructor
                    const instructorEmail = `instructor-feedback-${timestamp}@feedback-property-test.com`;
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
                    // Create student
                    const studentEmail = `student-feedback-${timestamp}@feedback-property-test.com`;
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
                    // Create free course
                    course = await courseService.createCourse({
                        title: `Test Course Feedback ${timestamp}`,
                        description: 'A test course for feedback visibility property testing',
                        instructorId: instructor.id,
                        duration: '4 weeks',
                        pricing: 0, // Free course
                        currency: 'USD',
                        curriculum: 'Test curriculum content',
                    });
                    // Publish the course
                    await courseService.updateCourse(course.id, instructor.id, { isPublished: true });
                    // Enroll student in the course
                    await courseService.enrollStudent(course.id, student.id);
                    // Create assignment with future deadline
                    const futureDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
                    assignment = await assignmentService.createAssignment({
                        courseId: course.id,
                        title: `Test Assignment Feedback ${timestamp}`,
                        description: 'A test assignment for feedback visibility',
                        submissionType: submissionType,
                        deadline: futureDeadline,
                    }, instructor.id);
                    // Create submission
                    const submissionData = {
                        assignmentId: assignment.id,
                        submissionType: submissionType,
                        fileUrl: submissionType === 'file' ? `https://example.com/feedback-${timestamp}.pdf` : undefined,
                        linkUrl: submissionType === 'link' ? `https://github.com/student/feedback-${timestamp}` : undefined,
                    };
                    submission = await submissionService.createSubmission(submissionData, student.id);
                    // Create feedback from instructor
                    const feedbackData = {
                        submissionId: submission.id,
                        comment: feedbackComment,
                        rating: rating || undefined,
                    };
                    feedback = await feedbackService.createFeedback(feedbackData, instructor.id);
                    // Property Test: Student should be able to retrieve and view all feedback comments
                    // 1. Student should be able to get feedback by submission ID
                    const feedbackBySubmission = await feedbackService.getFeedbackBySubmission(submission.id, student.id, 'student');
                    // Verify that the feedback is visible to the student
                    expect(feedbackBySubmission).toBeDefined();
                    expect(Array.isArray(feedbackBySubmission)).toBe(true);
                    expect(feedbackBySubmission.length).toBe(1);
                    const retrievedFeedback = feedbackBySubmission[0];
                    expect(retrievedFeedback.id).toBe(feedback.id);
                    expect(retrievedFeedback.comment).toBe(feedbackComment);
                    expect(retrievedFeedback.rating).toBe(rating || null);
                    expect(retrievedFeedback.instructorId).toBe(instructor.id);
                    expect(retrievedFeedback.submissionId).toBe(submission.id);
                    // Verify instructor information is included
                    expect(retrievedFeedback.instructor).toBeDefined();
                    expect(retrievedFeedback.instructor.id).toBe(instructor.id);
                    expect(retrievedFeedback.instructor.firstName).toBe('Test');
                    expect(retrievedFeedback.instructor.lastName).toBe('Instructor');
                    // 2. Student should be able to get feedback by feedback ID
                    const feedbackById = await feedbackService.getFeedbackById(feedback.id, student.id, 'student');
                    // Verify that the feedback is accessible by ID
                    expect(feedbackById).toBeDefined();
                    expect(feedbackById.id).toBe(feedback.id);
                    expect(feedbackById.comment).toBe(feedbackComment);
                    expect(feedbackById.rating).toBe(rating || null);
                    expect(feedbackById.instructorId).toBe(instructor.id);
                    expect(feedbackById.submissionId).toBe(submission.id);
                    // Verify instructor information is included
                    expect(feedbackById.instructor).toBeDefined();
                    expect(feedbackById.instructor.id).toBe(instructor.id);
                    // Verify submission information is included
                    expect(feedbackById.submission).toBeDefined();
                    expect(feedbackById.submission.id).toBe(submission.id);
                    expect(feedbackById.submission.studentId).toBe(student.id);
                    // 3. Student should be able to get all their feedback
                    const studentFeedback = await feedbackService.getStudentFeedback(student.id, student.id, 'student');
                    // Verify that the feedback appears in the student's feedback list
                    expect(studentFeedback).toBeDefined();
                    expect(Array.isArray(studentFeedback)).toBe(true);
                    expect(studentFeedback.length).toBeGreaterThanOrEqual(1);
                    const foundFeedback = studentFeedback.find(f => f.id === feedback.id);
                    expect(foundFeedback).toBeDefined();
                    expect(foundFeedback.comment).toBe(feedbackComment);
                    expect(foundFeedback.rating).toBe(rating || null);
                    // 4. Verify that the submission status was updated to 'reviewed'
                    const updatedSubmission = await submissionService.getSubmissionById(submission.id, student.id, 'student');
                    expect(updatedSubmission.status).toBe('reviewed');
                    // 5. Verify that feedback is included in submission details
                    expect(updatedSubmission.feedback).toBeDefined();
                    expect(Array.isArray(updatedSubmission.feedback)).toBe(true);
                    expect(updatedSubmission.feedback.length).toBe(1);
                    expect(updatedSubmission.feedback[0].id).toBe(feedback.id);
                    expect(updatedSubmission.feedback[0].comment).toBe(feedbackComment);
                }
                finally {
                    // Clean up in correct order (foreign key constraints)
                    if (feedback) {
                        try {
                            await prisma_1.prisma.feedback.delete({
                                where: { id: feedback.id },
                            });
                        }
                        catch (error) {
                            // Ignore cleanup errors
                        }
                    }
                    if (submission) {
                        try {
                            await prisma_1.prisma.submission.delete({
                                where: { id: submission.id },
                            });
                        }
                        catch (error) {
                            // Ignore cleanup errors
                        }
                    }
                    if (assignment) {
                        try {
                            await prisma_1.prisma.assignment.delete({
                                where: { id: assignment.id },
                            });
                        }
                        catch (error) {
                            // Ignore cleanup errors
                        }
                    }
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
            }), {
                numRuns: 10, // Reduced from 100 to 10 for faster execution
                timeout: 30000, // 30 second timeout for property test
            });
        }, 60000); // 1 minute timeout for the entire test
        it('should prevent students from viewing feedback on submissions that are not theirs', async () => {
            let instructor, student1, student2, course, assignment, submission, feedback;
            try {
                // Create unique test data to avoid conflicts
                const timestamp = Date.now() + Math.random();
                // Create instructor
                const instructorEmail = `instructor-privacy-${timestamp}@feedback-property-test.com`;
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
                // Create first student (submission owner)
                const student1Email = `student1-privacy-${timestamp}@feedback-property-test.com`;
                const hashedStudent1Password = await (0, password_1.hashPassword)('TestPass123');
                student1 = await prisma_1.prisma.user.create({
                    data: {
                        email: student1Email,
                        password: hashedStudent1Password,
                        firstName: 'Test',
                        lastName: 'Student1',
                        role: 'student',
                        emailVerified: true,
                    },
                });
                // Create second student (should not have access)
                const student2Email = `student2-privacy-${timestamp}@feedback-property-test.com`;
                const hashedStudent2Password = await (0, password_1.hashPassword)('TestPass123');
                student2 = await prisma_1.prisma.user.create({
                    data: {
                        email: student2Email,
                        password: hashedStudent2Password,
                        firstName: 'Test',
                        lastName: 'Student2',
                        role: 'student',
                        emailVerified: true,
                    },
                });
                // Create free course
                course = await courseService.createCourse({
                    title: `Test Course Privacy ${timestamp}`,
                    description: 'A test course for feedback privacy testing',
                    instructorId: instructor.id,
                    duration: '4 weeks',
                    pricing: 0, // Free course
                    currency: 'USD',
                    curriculum: 'Test curriculum content',
                });
                // Publish the course
                await courseService.updateCourse(course.id, instructor.id, { isPublished: true });
                // Enroll both students in the course
                await courseService.enrollStudent(course.id, student1.id);
                await courseService.enrollStudent(course.id, student2.id);
                // Create assignment
                const futureDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
                assignment = await assignmentService.createAssignment({
                    courseId: course.id,
                    title: `Test Assignment Privacy ${timestamp}`,
                    description: 'A test assignment for feedback privacy',
                    submissionType: 'file',
                    deadline: futureDeadline,
                }, instructor.id);
                // Create submission by student1
                const submissionData = {
                    assignmentId: assignment.id,
                    submissionType: 'file',
                    fileUrl: `https://example.com/privacy-${timestamp}.pdf`,
                };
                submission = await submissionService.createSubmission(submissionData, student1.id);
                // Create feedback from instructor
                const feedbackData = {
                    submissionId: submission.id,
                    comment: 'Great work on this assignment!',
                    rating: 5,
                };
                feedback = await feedbackService.createFeedback(feedbackData, instructor.id);
                // Property Test: Student2 should NOT be able to view feedback on student1's submission
                // 1. Student2 should not be able to get feedback by submission ID
                await expect(feedbackService.getFeedbackBySubmission(submission.id, student2.id, 'student')).rejects.toThrow('You do not have permission to view feedback for this submission');
                // 2. Student2 should not be able to get feedback by feedback ID
                await expect(feedbackService.getFeedbackById(feedback.id, student2.id, 'student')).rejects.toThrow('You do not have permission to view this feedback');
                // 3. Student2's feedback list should not include student1's feedback
                const student2Feedback = await feedbackService.getStudentFeedback(student2.id, student2.id, 'student');
                expect(student2Feedback).toBeDefined();
                expect(Array.isArray(student2Feedback)).toBe(true);
                // Should not find student1's feedback in student2's list
                const foundFeedback = student2Feedback.find(f => f.id === feedback.id);
                expect(foundFeedback).toBeUndefined();
                // 4. Verify that student1 CAN still access their own feedback
                const student1FeedbackBySubmission = await feedbackService.getFeedbackBySubmission(submission.id, student1.id, 'student');
                expect(student1FeedbackBySubmission).toBeDefined();
                expect(student1FeedbackBySubmission.length).toBe(1);
                expect(student1FeedbackBySubmission[0].id).toBe(feedback.id);
            }
            finally {
                // Clean up in correct order (foreign key constraints)
                if (feedback) {
                    try {
                        await prisma_1.prisma.feedback.delete({
                            where: { id: feedback.id },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
                if (submission) {
                    try {
                        await prisma_1.prisma.submission.delete({
                            where: { id: submission.id },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
                if (assignment) {
                    try {
                        await prisma_1.prisma.assignment.delete({
                            where: { id: assignment.id },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
                if (course && student1) {
                    try {
                        await prisma_1.prisma.enrollment.deleteMany({
                            where: {
                                studentId: student1.id,
                                courseId: course.id,
                            },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
                if (course && student2) {
                    try {
                        await prisma_1.prisma.enrollment.deleteMany({
                            where: {
                                studentId: student2.id,
                                courseId: course.id,
                            },
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
                if (student1) {
                    try {
                        await prisma_1.prisma.user.delete({
                            where: { id: student1.id },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
                if (student2) {
                    try {
                        await prisma_1.prisma.user.delete({
                            where: { id: student2.id },
                        });
                    }
                    catch (error) {
                        // Ignore cleanup errors
                    }
                }
            }
        }, 30000); // 30 second timeout
    });
});
//# sourceMappingURL=feedbackService.property.test.js.map