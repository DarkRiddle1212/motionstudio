"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentService = void 0;
const prisma_1 = require("../utils/prisma");
class AssignmentService {
    async createAssignment(data, instructorId) {
        // First verify the instructor owns this course
        const course = await prisma_1.prisma.course.findUnique({
            where: { id: data.courseId },
            select: { instructorId: true, isPublished: true },
        });
        if (!course) {
            throw new Error('Course not found');
        }
        if (course.instructorId !== instructorId) {
            throw new Error('You do not have permission to create assignments for this course');
        }
        const assignment = await prisma_1.prisma.assignment.create({
            data: {
                courseId: data.courseId,
                title: data.title,
                description: data.description,
                submissionType: data.submissionType,
                deadline: data.deadline,
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        instructor: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        submissions: true,
                    },
                },
            },
        });
        return assignment;
    }
    async getAssignmentsByCourse(courseId, userId, userRole) {
        // First verify access to the course
        const course = await prisma_1.prisma.course.findUnique({
            where: { id: courseId },
            select: {
                id: true,
                isPublished: true,
                instructorId: true,
                pricing: true,
            },
        });
        if (!course) {
            throw new Error('Course not found');
        }
        if (!course.isPublished) {
            throw new Error('Course not found');
        }
        // Check access permissions
        if (userRole === 'instructor' && course.instructorId !== userId) {
            throw new Error('You do not have permission to view assignments for this course');
        }
        if (userRole === 'student') {
            // For paid courses, check payment
            if (course.pricing > 0) {
                const payment = await prisma_1.prisma.payment.findFirst({
                    where: {
                        studentId: userId,
                        courseId: courseId,
                        status: 'completed',
                    },
                });
                if (!payment) {
                    throw new Error('This is a paid course. Please complete payment first.');
                }
            }
            // Check enrollment
            const enrollment = await prisma_1.prisma.enrollment.findUnique({
                where: {
                    studentId_courseId: {
                        studentId: userId,
                        courseId: courseId,
                    },
                },
            });
            if (!enrollment) {
                throw new Error('You are not enrolled in this course');
            }
        }
        const assignments = await prisma_1.prisma.assignment.findMany({
            where: { courseId },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                _count: {
                    select: {
                        submissions: true,
                    },
                },
            },
            orderBy: {
                deadline: 'asc',
            },
        });
        return assignments;
    }
    async getAssignmentById(assignmentId, userId, userRole) {
        const assignment = await prisma_1.prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        instructorId: true,
                        isPublished: true,
                        pricing: true,
                    },
                },
                _count: {
                    select: {
                        submissions: true,
                    },
                },
            },
        });
        if (!assignment) {
            throw new Error('Assignment not found');
        }
        if (!assignment.course.isPublished) {
            throw new Error('Assignment not found');
        }
        // Check access permissions
        if (userRole === 'instructor' && assignment.course.instructorId !== userId) {
            throw new Error('You do not have permission to view this assignment');
        }
        if (userRole === 'student') {
            // For paid courses, check payment
            if (assignment.course.pricing > 0) {
                const payment = await prisma_1.prisma.payment.findFirst({
                    where: {
                        studentId: userId,
                        courseId: assignment.courseId,
                        status: 'completed',
                    },
                });
                if (!payment) {
                    throw new Error('This is a paid course. Please complete payment first.');
                }
            }
            // Check enrollment
            const enrollment = await prisma_1.prisma.enrollment.findUnique({
                where: {
                    studentId_courseId: {
                        studentId: userId,
                        courseId: assignment.courseId,
                    },
                },
            });
            if (!enrollment) {
                throw new Error('You are not enrolled in this course');
            }
        }
        return assignment;
    }
    async updateAssignment(assignmentId, instructorId, data) {
        // First verify the instructor owns the course for this assignment
        const existingAssignment = await prisma_1.prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                course: {
                    select: { instructorId: true },
                },
            },
        });
        if (!existingAssignment) {
            throw new Error('Assignment not found');
        }
        if (existingAssignment.course.instructorId !== instructorId) {
            throw new Error('You do not have permission to update this assignment');
        }
        const updatedAssignment = await prisma_1.prisma.assignment.update({
            where: { id: assignmentId },
            data,
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        instructor: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                            },
                        },
                    },
                },
                _count: {
                    select: {
                        submissions: true,
                    },
                },
            },
        });
        return updatedAssignment;
    }
    async deleteAssignment(assignmentId, instructorId) {
        // First verify the instructor owns the course for this assignment
        const existingAssignment = await prisma_1.prisma.assignment.findUnique({
            where: { id: assignmentId },
            include: {
                course: {
                    select: { instructorId: true },
                },
            },
        });
        if (!existingAssignment) {
            throw new Error('Assignment not found');
        }
        if (existingAssignment.course.instructorId !== instructorId) {
            throw new Error('You do not have permission to delete this assignment');
        }
        await prisma_1.prisma.assignment.delete({
            where: { id: assignmentId },
        });
        return { message: 'Assignment deleted successfully' };
    }
    async getAssignmentsByInstructor(instructorId) {
        const assignments = await prisma_1.prisma.assignment.findMany({
            where: {
                course: {
                    instructorId: instructorId,
                },
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
                _count: {
                    select: {
                        submissions: true,
                    },
                },
            },
            orderBy: {
                deadline: 'asc',
            },
        });
        return assignments;
    }
}
exports.AssignmentService = AssignmentService;
//# sourceMappingURL=assignmentService.js.map