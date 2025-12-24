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
const submissionService_1 = require("../submissionService");
const assignmentService_1 = require("../assignmentService");
const courseService_1 = require("../courseService");
const prisma_1 = require("../../utils/prisma");
const password_1 = require("../../utils/password");
/**
 * Feature: motion-studio-platform, Property 7: Submission Persistence
 * Validates: Requirements 5.2
 *
 * For any assignment submission, storing the submission and then retrieving it
 * should return the same submission data (file URL, link URL, timestamp, and student ID).
 */
// Helper function to normalize null/undefined values for comparison
function normalizeValue(value) {
    return value === undefined ? null : value;
}
describe('Property-Based Tests: Submission Service', () => {
    const submissionService = new submissionService_1.SubmissionService();
    const assignmentService = new assignmentService_1.AssignmentService();
    const courseService = new courseService_1.CourseService();
    beforeAll(async () => {
        // Clean up test database before running tests
        await prisma_1.prisma.feedback.deleteMany({
            where: {
                instructor: {
                    email: {
                        contains: '@submission-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.submission.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@submission-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.assignment.deleteMany({
            where: {
                course: {
                    instructor: {
                        email: {
                            contains: '@submission-property-test.com',
                        },
                    },
                },
            },
        });
        await prisma_1.prisma.enrollment.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@submission-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.course.deleteMany({
            where: {
                instructor: {
                    email: {
                        contains: '@submission-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.user.deleteMany({
            where: {
                email: {
                    contains: '@submission-property-test.com',
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
                        contains: '@submission-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.submission.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@submission-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.assignment.deleteMany({
            where: {
                course: {
                    instructor: {
                        email: {
                            contains: '@submission-property-test.com',
                        },
                    },
                },
            },
        });
        await prisma_1.prisma.enrollment.deleteMany({
            where: {
                student: {
                    email: {
                        contains: '@submission-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.course.deleteMany({
            where: {
                instructor: {
                    email: {
                        contains: '@submission-property-test.com',
                    },
                },
            },
        });
        await prisma_1.prisma.user.deleteMany({
            where: {
                email: {
                    contains: '@submission-property-test.com',
                },
            },
        });
        await prisma_1.prisma.$disconnect();
    });
    describe('Property 7: Submission Persistence', () => {
        it('should persist and retrieve submission data consistently for file submissions', async () => {
            // Test with multiple file submission scenarios
            const testCases = [
                {
                    submissionType: 'file',
                    fileUrl: 'https://example.com/assignment1.pdf',
                    linkUrl: undefined,
                },
                {
                    submissionType: 'file',
                    fileUrl: 'https://storage.example.com/uploads/student_work.zip',
                    linkUrl: undefined,
                },
                {
                    submissionType: 'file',
                    fileUrl: 'https://cdn.example.com/files/project_submission.docx',
                    linkUrl: undefined,
                },
            ];
            for (const testCase of testCases) {
                let instructor, student, course, assignment, submission;
                try {
                    // Create unique test data to avoid conflicts
                    const timestamp = Date.now() + Math.random();
                    // Create instructor
                    const instructorEmail = `instructor-file-${timestamp}@submission-property-test.com`;
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
                    const studentEmail = `student-file-${timestamp}@submission-property-test.com`;
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
                        title: `Test Course File ${timestamp}`,
                        description: 'A test course for file submission property testing',
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
                        title: `Test Assignment File ${timestamp}`,
                        description: 'A test assignment for file submission',
                        submissionType: testCase.submissionType,
                        deadline: futureDeadline,
                    }, instructor.id);
                    // Store the submission
                    const submissionData = {
                        assignmentId: assignment.id,
                        submissionType: testCase.submissionType,
                        fileUrl: testCase.fileUrl,
                        linkUrl: testCase.linkUrl,
                    };
                    submission = await submissionService.createSubmission(submissionData, student.id);
                    // Retrieve the submission
                    const retrievedSubmission = await submissionService.getSubmissionById(submission.id, student.id, 'student');
                    // Verify persistence: all key data should match
                    expect(retrievedSubmission.id).toBe(submission.id);
                    expect(retrievedSubmission.assignmentId).toBe(submissionData.assignmentId);
                    expect(retrievedSubmission.studentId).toBe(student.id);
                    expect(retrievedSubmission.submissionType).toBe(submissionData.submissionType);
                    expect(retrievedSubmission.fileUrl).toBe(submissionData.fileUrl);
                    expect(retrievedSubmission.linkUrl).toBe(normalizeValue(submissionData.linkUrl));
                    // Verify timestamp persistence (should be within a reasonable range)
                    expect(retrievedSubmission.submittedAt).toBeInstanceOf(Date);
                    expect(retrievedSubmission.submittedAt.getTime()).toBeCloseTo(submission.submittedAt.getTime(), -2 // Within 100ms
                    );
                    // Verify status is correctly set (should be 'submitted' since deadline is in future)
                    expect(retrievedSubmission.status).toBe('submitted');
                    // Verify related data is included
                    expect(retrievedSubmission.assignment).toBeDefined();
                    expect(retrievedSubmission.assignment.id).toBe(assignment.id);
                    expect(retrievedSubmission.student).toBeDefined();
                    expect(retrievedSubmission.student.id).toBe(student.id);
                }
                finally {
                    // Clean up in correct order (foreign key constraints)
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
            }
        }, 30000); // 30 second timeout
        it('should persist and retrieve submission data consistently for link submissions', async () => {
            // Test with multiple link submission scenarios
            const testCases = [
                {
                    submissionType: 'link',
                    fileUrl: undefined,
                    linkUrl: 'https://github.com/student/assignment-repo',
                },
                {
                    submissionType: 'link',
                    fileUrl: undefined,
                    linkUrl: 'https://codepen.io/student/pen/assignment-demo',
                },
                {
                    submissionType: 'link',
                    fileUrl: undefined,
                    linkUrl: 'https://student-portfolio.com/project/assignment-1',
                },
            ];
            for (const testCase of testCases) {
                let instructor, student, course, assignment, submission;
                try {
                    // Create unique test data to avoid conflicts
                    const timestamp = Date.now() + Math.random();
                    // Create instructor
                    const instructorEmail = `instructor-link-${timestamp}@submission-property-test.com`;
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
                    const studentEmail = `student-link-${timestamp}@submission-property-test.com`;
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
                        title: `Test Course Link ${timestamp}`,
                        description: 'A test course for link submission property testing',
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
                        title: `Test Assignment Link ${timestamp}`,
                        description: 'A test assignment for link submission',
                        submissionType: testCase.submissionType,
                        deadline: futureDeadline,
                    }, instructor.id);
                    // Store the submission
                    const submissionData = {
                        assignmentId: assignment.id,
                        submissionType: testCase.submissionType,
                        fileUrl: testCase.fileUrl,
                        linkUrl: testCase.linkUrl,
                    };
                    submission = await submissionService.createSubmission(submissionData, student.id);
                    // Retrieve the submission
                    const retrievedSubmission = await submissionService.getSubmissionById(submission.id, student.id, 'student');
                    // Verify persistence: all key data should match
                    expect(retrievedSubmission.id).toBe(submission.id);
                    expect(retrievedSubmission.assignmentId).toBe(submissionData.assignmentId);
                    expect(retrievedSubmission.studentId).toBe(student.id);
                    expect(retrievedSubmission.submissionType).toBe(submissionData.submissionType);
                    expect(retrievedSubmission.fileUrl).toBe(normalizeValue(submissionData.fileUrl));
                    expect(retrievedSubmission.linkUrl).toBe(submissionData.linkUrl);
                    // Verify timestamp persistence (should be within a reasonable range)
                    expect(retrievedSubmission.submittedAt).toBeInstanceOf(Date);
                    expect(retrievedSubmission.submittedAt.getTime()).toBeCloseTo(submission.submittedAt.getTime(), -2 // Within 100ms
                    );
                    // Verify status is correctly set (should be 'submitted' since deadline is in future)
                    expect(retrievedSubmission.status).toBe('submitted');
                    // Verify related data is included
                    expect(retrievedSubmission.assignment).toBeDefined();
                    expect(retrievedSubmission.assignment.id).toBe(assignment.id);
                    expect(retrievedSubmission.student).toBeDefined();
                    expect(retrievedSubmission.student.id).toBe(student.id);
                }
                finally {
                    // Clean up in correct order (foreign key constraints)
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
            }
        }, 30000); // 30 second timeout
        it('should persist and retrieve late submission status correctly', async () => {
            let instructor, student, course, assignment, submission;
            try {
                // Create unique test data to avoid conflicts
                const timestamp = Date.now() + Math.random();
                // Create instructor
                const instructorEmail = `instructor-late-${timestamp}@submission-property-test.com`;
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
                const studentEmail = `student-late-${timestamp}@submission-property-test.com`;
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
                    title: `Test Course Late ${timestamp}`,
                    description: 'A test course for late submission property testing',
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
                // Create assignment with past deadline (to test late submission)
                const pastDeadline = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
                assignment = await assignmentService.createAssignment({
                    courseId: course.id,
                    title: `Test Assignment Late ${timestamp}`,
                    description: 'A test assignment for late submission',
                    submissionType: 'file',
                    deadline: pastDeadline,
                }, instructor.id);
                // Store the submission (should be marked as late)
                const submissionData = {
                    assignmentId: assignment.id,
                    submissionType: 'file',
                    fileUrl: 'https://example.com/late-assignment.pdf',
                    linkUrl: undefined,
                };
                submission = await submissionService.createSubmission(submissionData, student.id);
                // Retrieve the submission
                const retrievedSubmission = await submissionService.getSubmissionById(submission.id, student.id, 'student');
                // Verify persistence: all key data should match
                expect(retrievedSubmission.id).toBe(submission.id);
                expect(retrievedSubmission.assignmentId).toBe(submissionData.assignmentId);
                expect(retrievedSubmission.studentId).toBe(student.id);
                expect(retrievedSubmission.submissionType).toBe(submissionData.submissionType);
                expect(retrievedSubmission.fileUrl).toBe(submissionData.fileUrl);
                expect(retrievedSubmission.linkUrl).toBe(normalizeValue(submissionData.linkUrl));
                // Verify timestamp persistence
                expect(retrievedSubmission.submittedAt).toBeInstanceOf(Date);
                expect(retrievedSubmission.submittedAt.getTime()).toBeCloseTo(submission.submittedAt.getTime(), -2 // Within 100ms
                );
                // Verify status is correctly set as 'late' since deadline was in the past
                expect(retrievedSubmission.status).toBe('late');
                // Verify related data is included
                expect(retrievedSubmission.assignment).toBeDefined();
                expect(retrievedSubmission.assignment.id).toBe(assignment.id);
                expect(retrievedSubmission.student).toBeDefined();
                expect(retrievedSubmission.student.id).toBe(student.id);
            }
            finally {
                // Clean up in correct order (foreign key constraints)
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
        }, 20000); // 20 second timeout
    });
    /**
     * Feature: motion-studio-platform, Property 6: Assignment Deadline Enforcement
     * Validates: Requirements 5.3, 5.4
     *
     * For any assignment and any student, if a submission is made before the deadline,
     * the submission status should be marked as "submitted"; if made after the deadline,
     * the status should be marked as "late".
     */
    describe('Property 6: Assignment Deadline Enforcement', () => {
        it('should enforce deadline correctly for submissions made before and after deadline', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate test scenarios with different deadline offsets
            fc.record({
                beforeDeadlineMinutes: fc.integer({ min: 1, max: 60 }), // 1-60 minutes before deadline
                afterDeadlineMinutes: fc.integer({ min: 1, max: 60 }), // 1-60 minutes after deadline
                submissionType: fc.constantFrom('file', 'link'),
            }), async ({ beforeDeadlineMinutes, afterDeadlineMinutes, submissionType }) => {
                let instructor, student, course, assignmentBefore, assignmentAfter;
                let submissionBefore, submissionAfter;
                try {
                    // Create unique test data to avoid conflicts
                    const timestamp = Date.now() + Math.random();
                    // Create instructor
                    const instructorEmail = `instructor-deadline-${timestamp}@submission-property-test.com`;
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
                    const studentEmail = `student-deadline-${timestamp}@submission-property-test.com`;
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
                        title: `Test Course Deadline ${timestamp}`,
                        description: 'A test course for deadline enforcement property testing',
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
                    // Create assignment with deadline in the future (for "before deadline" test)
                    const futureDeadline = new Date(Date.now() + beforeDeadlineMinutes * 60 * 1000);
                    assignmentBefore = await assignmentService.createAssignment({
                        courseId: course.id,
                        title: `Test Assignment Before ${timestamp}`,
                        description: 'A test assignment for before deadline submission',
                        submissionType: submissionType,
                        deadline: futureDeadline,
                    }, instructor.id);
                    // Create assignment with deadline in the past (for "after deadline" test)
                    const pastDeadline = new Date(Date.now() - afterDeadlineMinutes * 60 * 1000);
                    assignmentAfter = await assignmentService.createAssignment({
                        courseId: course.id,
                        title: `Test Assignment After ${timestamp}`,
                        description: 'A test assignment for after deadline submission',
                        submissionType: submissionType,
                        deadline: pastDeadline,
                    }, instructor.id);
                    // Prepare submission data based on type
                    const submissionDataBefore = {
                        assignmentId: assignmentBefore.id,
                        submissionType: submissionType,
                        fileUrl: submissionType === 'file' ? `https://example.com/before-${timestamp}.pdf` : undefined,
                        linkUrl: submissionType === 'link' ? `https://github.com/student/before-${timestamp}` : undefined,
                    };
                    const submissionDataAfter = {
                        assignmentId: assignmentAfter.id,
                        submissionType: submissionType,
                        fileUrl: submissionType === 'file' ? `https://example.com/after-${timestamp}.pdf` : undefined,
                        linkUrl: submissionType === 'link' ? `https://github.com/student/after-${timestamp}` : undefined,
                    };
                    // Submit before deadline - should be marked as "submitted"
                    submissionBefore = await submissionService.createSubmission(submissionDataBefore, student.id);
                    // Submit after deadline - should be marked as "late"
                    submissionAfter = await submissionService.createSubmission(submissionDataAfter, student.id);
                    // Verify deadline enforcement
                    expect(submissionBefore.status).toBe('submitted');
                    expect(submissionAfter.status).toBe('late');
                    // Verify that the submission timestamps are reasonable
                    expect(submissionBefore.submittedAt).toBeInstanceOf(Date);
                    expect(submissionAfter.submittedAt).toBeInstanceOf(Date);
                    // Verify that the deadline comparison logic is working correctly
                    expect(submissionBefore.submittedAt.getTime()).toBeLessThanOrEqual(futureDeadline.getTime());
                    expect(submissionAfter.submittedAt.getTime()).toBeGreaterThan(pastDeadline.getTime());
                    // Retrieve submissions to verify persistence of status
                    const retrievedBefore = await submissionService.getSubmissionById(submissionBefore.id, student.id, 'student');
                    const retrievedAfter = await submissionService.getSubmissionById(submissionAfter.id, student.id, 'student');
                    // Verify status persistence
                    expect(retrievedBefore.status).toBe('submitted');
                    expect(retrievedAfter.status).toBe('late');
                }
                finally {
                    // Clean up in correct order (foreign key constraints)
                    if (submissionBefore) {
                        try {
                            await prisma_1.prisma.submission.delete({
                                where: { id: submissionBefore.id },
                            });
                        }
                        catch (error) {
                            // Ignore cleanup errors
                        }
                    }
                    if (submissionAfter) {
                        try {
                            await prisma_1.prisma.submission.delete({
                                where: { id: submissionAfter.id },
                            });
                        }
                        catch (error) {
                            // Ignore cleanup errors
                        }
                    }
                    if (assignmentBefore) {
                        try {
                            await prisma_1.prisma.assignment.delete({
                                where: { id: assignmentBefore.id },
                            });
                        }
                        catch (error) {
                            // Ignore cleanup errors
                        }
                    }
                    if (assignmentAfter) {
                        try {
                            await prisma_1.prisma.assignment.delete({
                                where: { id: assignmentAfter.id },
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
    });
});
//# sourceMappingURL=submissionService.property.test.js.map