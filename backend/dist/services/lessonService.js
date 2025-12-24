"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonService = void 0;
const prisma_1 = require("../utils/prisma");
class LessonService {
    async createLesson(data, instructorId) {
        // First verify the instructor owns the course
        const course = await prisma_1.prisma.course.findUnique({
            where: { id: data.courseId },
            select: { instructorId: true },
        });
        if (!course) {
            throw new Error('Course not found');
        }
        if (course.instructorId !== instructorId) {
            throw new Error('You do not have permission to add lessons to this course');
        }
        const lesson = await prisma_1.prisma.lesson.create({
            data: {
                courseId: data.courseId,
                title: data.title,
                description: data.description,
                content: data.content,
                videoUrl: data.videoUrl,
                fileUrls: JSON.stringify(data.fileUrls || []),
                order: data.order,
                isPublished: false, // Lessons start as drafts
            },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
        return lesson;
    }
    async getLessonsByCourse(courseId, studentId, includeUnpublished = false) {
        // If studentId is provided, verify they are enrolled in the course
        if (studentId) {
            const enrollment = await prisma_1.prisma.enrollment.findUnique({
                where: {
                    studentId_courseId: {
                        studentId,
                        courseId,
                    },
                },
            });
            if (!enrollment) {
                throw new Error('You are not enrolled in this course');
            }
        }
        const lessons = await prisma_1.prisma.lesson.findMany({
            where: {
                courseId,
                ...(includeUnpublished ? {} : { isPublished: true }),
            },
            include: {
                completions: studentId ? {
                    where: { studentId },
                    select: {
                        id: true,
                        completedAt: true,
                    },
                } : false,
                _count: {
                    select: {
                        completions: true,
                    },
                },
            },
            orderBy: {
                order: 'asc',
            },
        });
        // Transform the data to include completion status for the student
        return lessons.map(lesson => ({
            ...lesson,
            fileUrls: JSON.parse(lesson.fileUrls),
            isCompleted: studentId ? lesson.completions.length > 0 : false,
            completedAt: studentId && lesson.completions.length > 0 ? lesson.completions[0].completedAt : null,
            completions: undefined, // Remove the completions array from response
        }));
    }
    async getLessonById(lessonId, studentId, includeUnpublished = false) {
        const lesson = await prisma_1.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                        instructorId: true,
                    },
                },
                completions: studentId ? {
                    where: { studentId },
                    select: {
                        id: true,
                        completedAt: true,
                    },
                } : false,
                _count: {
                    select: {
                        completions: true,
                    },
                },
            },
        });
        if (!lesson) {
            throw new Error('Lesson not found');
        }
        // Check if lesson is published (unless we're including unpublished)
        if (!includeUnpublished && !lesson.isPublished) {
            throw new Error('Lesson not found');
        }
        // If studentId is provided, verify they are enrolled in the course
        if (studentId) {
            const enrollment = await prisma_1.prisma.enrollment.findUnique({
                where: {
                    studentId_courseId: {
                        studentId,
                        courseId: lesson.courseId,
                    },
                },
            });
            if (!enrollment) {
                throw new Error('You are not enrolled in this course');
            }
        }
        return {
            ...lesson,
            fileUrls: JSON.parse(lesson.fileUrls),
            isCompleted: studentId ? lesson.completions.length > 0 : false,
            completedAt: studentId && lesson.completions.length > 0 ? lesson.completions[0].completedAt : null,
            completions: undefined, // Remove the completions array from response
        };
    }
    async updateLesson(lessonId, instructorId, data) {
        // First verify the instructor owns the course that contains this lesson
        const lesson = await prisma_1.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                course: {
                    select: { instructorId: true },
                },
            },
        });
        if (!lesson) {
            throw new Error('Lesson not found');
        }
        if (lesson.course.instructorId !== instructorId) {
            throw new Error('You do not have permission to update this lesson');
        }
        const updateData = { ...data };
        if (data.fileUrls) {
            updateData.fileUrls = JSON.stringify(data.fileUrls);
        }
        const updatedLesson = await prisma_1.prisma.lesson.update({
            where: { id: lessonId },
            data: updateData,
            include: {
                course: {
                    select: {
                        id: true,
                        title: true,
                    },
                },
            },
        });
        return {
            ...updatedLesson,
            fileUrls: JSON.parse(updatedLesson.fileUrls),
        };
    }
    async deleteLesson(lessonId, instructorId) {
        // First verify the instructor owns the course that contains this lesson
        const lesson = await prisma_1.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: {
                course: {
                    select: { instructorId: true },
                },
            },
        });
        if (!lesson) {
            throw new Error('Lesson not found');
        }
        if (lesson.course.instructorId !== instructorId) {
            throw new Error('You do not have permission to delete this lesson');
        }
        await prisma_1.prisma.lesson.delete({
            where: { id: lessonId },
        });
        return { message: 'Lesson deleted successfully' };
    }
    async completeLesson(lessonId, studentId) {
        // First verify the lesson exists and is published
        const lesson = await prisma_1.prisma.lesson.findUnique({
            where: { id: lessonId },
            select: { id: true, courseId: true, isPublished: true },
        });
        if (!lesson) {
            throw new Error('Lesson not found');
        }
        if (!lesson.isPublished) {
            throw new Error('Lesson is not available');
        }
        // Verify the student is enrolled in the course
        const enrollment = await prisma_1.prisma.enrollment.findUnique({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId: lesson.courseId,
                },
            },
        });
        if (!enrollment) {
            throw new Error('You are not enrolled in this course');
        }
        // Check if lesson is already completed (idempotent operation)
        const existingCompletion = await prisma_1.prisma.lessonCompletion.findUnique({
            where: {
                studentId_lessonId: {
                    studentId,
                    lessonId,
                },
            },
        });
        if (existingCompletion) {
            // Return existing completion (idempotent)
            return existingCompletion;
        }
        // Create lesson completion
        const completion = await prisma_1.prisma.lessonCompletion.create({
            data: {
                studentId,
                lessonId,
            },
            include: {
                lesson: {
                    select: {
                        id: true,
                        title: true,
                        courseId: true,
                    },
                },
            },
        });
        // Update course progress
        await this.updateCourseProgress(studentId, lesson.courseId);
        return completion;
    }
    async updateCourseProgress(studentId, courseId) {
        // Get total lessons and completed lessons for this course
        const totalLessons = await prisma_1.prisma.lesson.count({
            where: { courseId, isPublished: true },
        });
        const completedLessons = await prisma_1.prisma.lessonCompletion.count({
            where: {
                studentId,
                lesson: {
                    courseId,
                    isPublished: true,
                },
            },
        });
        const progressPercentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
        // Update enrollment progress
        await prisma_1.prisma.enrollment.update({
            where: {
                studentId_courseId: {
                    studentId,
                    courseId,
                },
            },
            data: {
                progressPercentage,
                status: progressPercentage === 100 ? 'completed' : 'active',
                completedAt: progressPercentage === 100 ? new Date() : null,
            },
        });
    }
}
exports.LessonService = LessonService;
//# sourceMappingURL=lessonService.js.map