"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackService = void 0;
const prisma_1 = require("../utils/prisma");
class FeedbackService {
    async createFeedback(data, instructorId) {
        // First verify the submission exists and the instructor has access
        const submission = await prisma_1.prisma.submission.findUnique({
            where: { id: data.submissionId },
            include: {
                assignment: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                instructorId: true,
                                isPublished: true,
                            },
                        },
                    },
                },
            },
        });
        if (!submission) {
            throw new Error('Submission not found');
        }
        if (!submission.assignment.course.isPublished) {
            throw new Error('Submission not found');
        }
        // Check if instructor has permission to give feedback on this submission
        if (submission.assignment.course.instructorId !== instructorId) {
            throw new Error('You do not have permission to provide feedback on this submission');
        }
        // Validate rating if provided
        if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
            throw new Error('Rating must be between 1 and 5');
        }
        // Check if feedback already exists for this submission by this instructor
        const existingFeedback = await prisma_1.prisma.feedback.findFirst({
            where: {
                submissionId: data.submissionId,
                instructorId: instructorId,
            },
        });
        if (existingFeedback) {
            throw new Error('Feedback already exists for this submission');
        }
        // Create the feedback
        const feedback = await prisma_1.prisma.feedback.create({
            data: {
                submissionId: data.submissionId,
                instructorId: instructorId,
                comment: data.comment,
                rating: data.rating,
            },
            include: {
                instructor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                submission: {
                    include: {
                        assignment: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                        student: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });
        // Update submission status to reviewed
        await prisma_1.prisma.submission.update({
            where: { id: data.submissionId },
            data: { status: 'reviewed' },
        });
        return feedback;
    }
    async getFeedbackById(feedbackId, userId, userRole) {
        const feedback = await prisma_1.prisma.feedback.findUnique({
            where: { id: feedbackId },
            include: {
                instructor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                submission: {
                    include: {
                        assignment: {
                            include: {
                                course: {
                                    select: {
                                        id: true,
                                        instructorId: true,
                                        isPublished: true,
                                        pricing: true,
                                    },
                                },
                            },
                        },
                        student: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });
        if (!feedback) {
            throw new Error('Feedback not found');
        }
        if (!feedback.submission.assignment.course.isPublished) {
            throw new Error('Feedback not found');
        }
        // Check permissions
        if (userRole === 'student') {
            // Students can only view feedback on their own submissions
            if (feedback.submission.studentId !== userId) {
                throw new Error('You do not have permission to view this feedback');
            }
            // Check enrollment and payment for students
            const enrollment = await prisma_1.prisma.enrollment.findUnique({
                where: {
                    studentId_courseId: {
                        studentId: userId,
                        courseId: feedback.submission.assignment.courseId,
                    },
                },
            });
            if (!enrollment) {
                throw new Error('You are not enrolled in this course');
            }
            // For paid courses, check payment
            if (feedback.submission.assignment.course.pricing > 0) {
                const payment = await prisma_1.prisma.payment.findFirst({
                    where: {
                        studentId: userId,
                        courseId: feedback.submission.assignment.courseId,
                        status: 'completed',
                    },
                });
                if (!payment) {
                    throw new Error('This is a paid course. Please complete payment first.');
                }
            }
        }
        else if (userRole === 'instructor') {
            // Instructors can only view feedback they gave or on their course submissions
            if (feedback.instructorId !== userId && feedback.submission.assignment.course.instructorId !== userId) {
                throw new Error('You do not have permission to view this feedback');
            }
        }
        // Admins can view all feedback
        return feedback;
    }
    async getFeedbackBySubmission(submissionId, userId, userRole) {
        // First verify the submission exists and user has access
        const submission = await prisma_1.prisma.submission.findUnique({
            where: { id: submissionId },
            include: {
                assignment: {
                    include: {
                        course: {
                            select: {
                                id: true,
                                instructorId: true,
                                isPublished: true,
                                pricing: true,
                            },
                        },
                    },
                },
            },
        });
        if (!submission) {
            throw new Error('Submission not found');
        }
        if (!submission.assignment.course.isPublished) {
            throw new Error('Submission not found');
        }
        // Check permissions
        if (userRole === 'student') {
            // Students can only view feedback on their own submissions
            if (submission.studentId !== userId) {
                throw new Error('You do not have permission to view feedback for this submission');
            }
            // Check enrollment and payment for students
            const enrollment = await prisma_1.prisma.enrollment.findUnique({
                where: {
                    studentId_courseId: {
                        studentId: userId,
                        courseId: submission.assignment.courseId,
                    },
                },
            });
            if (!enrollment) {
                throw new Error('You are not enrolled in this course');
            }
            // For paid courses, check payment
            if (submission.assignment.course.pricing > 0) {
                const payment = await prisma_1.prisma.payment.findFirst({
                    where: {
                        studentId: userId,
                        courseId: submission.assignment.courseId,
                        status: 'completed',
                    },
                });
                if (!payment) {
                    throw new Error('This is a paid course. Please complete payment first.');
                }
            }
        }
        else if (userRole === 'instructor') {
            // Instructors can only view feedback on submissions for their courses
            if (submission.assignment.course.instructorId !== userId) {
                throw new Error('You do not have permission to view feedback for this submission');
            }
        }
        // Admins can view all feedback
        const feedback = await prisma_1.prisma.feedback.findMany({
            where: { submissionId: submissionId },
            include: {
                instructor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return feedback;
    }
    async updateFeedback(feedbackId, instructorId, data) {
        // First verify the feedback exists and the instructor has permission
        const existingFeedback = await prisma_1.prisma.feedback.findUnique({
            where: { id: feedbackId },
            include: {
                submission: {
                    include: {
                        assignment: {
                            include: {
                                course: {
                                    select: {
                                        id: true,
                                        instructorId: true,
                                        isPublished: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!existingFeedback) {
            throw new Error('Feedback not found');
        }
        if (!existingFeedback.submission.assignment.course.isPublished) {
            throw new Error('Feedback not found');
        }
        // Check if instructor has permission to update this feedback
        if (existingFeedback.instructorId !== instructorId) {
            throw new Error('You do not have permission to update this feedback');
        }
        // Validate rating if provided
        if (data.rating !== undefined && (data.rating < 1 || data.rating > 5)) {
            throw new Error('Rating must be between 1 and 5');
        }
        // Update the feedback
        const updatedFeedback = await prisma_1.prisma.feedback.update({
            where: { id: feedbackId },
            data: {
                comment: data.comment,
                rating: data.rating,
            },
            include: {
                instructor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                submission: {
                    include: {
                        assignment: {
                            select: {
                                id: true,
                                title: true,
                            },
                        },
                        student: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
        });
        return updatedFeedback;
    }
    async getInstructorFeedback(instructorId) {
        const feedback = await prisma_1.prisma.feedback.findMany({
            where: { instructorId: instructorId },
            include: {
                submission: {
                    include: {
                        assignment: {
                            include: {
                                course: {
                                    select: {
                                        id: true,
                                        title: true,
                                        isPublished: true,
                                    },
                                },
                            },
                        },
                        student: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Filter out feedback for unpublished courses
        return feedback.filter(f => f.submission.assignment.course.isPublished);
    }
    async getStudentFeedback(studentId, userId, userRole) {
        // Check permissions - students can only view their own feedback
        if (userRole === 'student' && studentId !== userId) {
            throw new Error('You do not have permission to view this feedback');
        }
        const feedback = await prisma_1.prisma.feedback.findMany({
            where: {
                submission: {
                    studentId: studentId,
                },
            },
            include: {
                instructor: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                submission: {
                    include: {
                        assignment: {
                            include: {
                                course: {
                                    select: {
                                        id: true,
                                        title: true,
                                        isPublished: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Filter out feedback for unpublished courses
        return feedback.filter(f => f.submission.assignment.course.isPublished);
    }
}
exports.FeedbackService = FeedbackService;
//# sourceMappingURL=feedbackService.js.map