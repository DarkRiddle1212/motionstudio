"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireLessonAccess = exports.requireCourseEnrollment = exports.requireRole = exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../utils/prisma");
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    try {
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Session expired, please log in again' });
    }
};
exports.authenticateToken = authenticateToken;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'You do not have permission to access this resource' });
        }
        next();
    };
};
exports.requireRole = requireRole;
const requireCourseEnrollment = (courseIdParam = 'courseId') => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        try {
            const courseId = req.params[courseIdParam];
            if (!courseId) {
                return res.status(400).json({ error: 'Course ID is required' });
            }
            // Check if course exists and is published
            const course = await prisma_1.prisma.course.findUnique({
                where: { id: courseId },
                select: {
                    id: true,
                    isPublished: true,
                    pricing: true,
                    instructorId: true
                },
            });
            if (!course) {
                return res.status(404).json({ error: 'Course not found' });
            }
            if (!course.isPublished) {
                return res.status(404).json({ error: 'Course not found' });
            }
            // Allow instructors to access their own courses
            if (req.user.role === 'instructor' && course.instructorId === req.user.userId) {
                return next();
            }
            // Allow admins to access any course
            if (req.user.role === 'admin') {
                return next();
            }
            // For students, check enrollment
            if (req.user.role === 'student') {
                // For paid courses, check if student has completed payment and is enrolled
                if (course.pricing > 0) {
                    // Check for successful payment
                    const payment = await prisma_1.prisma.payment.findFirst({
                        where: {
                            studentId: req.user.userId,
                            courseId: courseId,
                            status: 'completed',
                        },
                    });
                    if (!payment) {
                        return res.status(402).json({ error: 'This is a paid course. Please complete payment first.' });
                    }
                }
                // Check enrollment for both free and paid courses
                const enrollment = await prisma_1.prisma.enrollment.findUnique({
                    where: {
                        studentId_courseId: {
                            studentId: req.user.userId,
                            courseId: courseId,
                        },
                    },
                });
                if (!enrollment) {
                    return res.status(403).json({ error: 'You are not enrolled in this course' });
                }
                return next();
            }
            // Default: deny access
            return res.status(403).json({ error: 'You do not have permission to access this course' });
        }
        catch (error) {
            console.error('Course access control error:', error);
            return res.status(500).json({ error: 'An unexpected error occurred' });
        }
    };
};
exports.requireCourseEnrollment = requireCourseEnrollment;
const requireLessonAccess = () => {
    return async (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        try {
            const lessonId = req.params.id;
            if (!lessonId) {
                return res.status(400).json({ error: 'Lesson ID is required' });
            }
            // Get lesson and its course information
            const lesson = await prisma_1.prisma.lesson.findUnique({
                where: { id: lessonId },
                select: {
                    id: true,
                    courseId: true,
                    isPublished: true,
                    course: {
                        select: {
                            id: true,
                            isPublished: true,
                            pricing: true,
                            instructorId: true,
                        },
                    },
                },
            });
            if (!lesson) {
                return res.status(404).json({ error: 'Lesson not found' });
            }
            if (!lesson.isPublished) {
                return res.status(404).json({ error: 'Lesson not found' });
            }
            if (!lesson.course.isPublished) {
                return res.status(404).json({ error: 'Course not found' });
            }
            // Allow instructors to access their own course lessons
            if (req.user.role === 'instructor' && lesson.course.instructorId === req.user.userId) {
                return next();
            }
            // Allow admins to access any lesson
            if (req.user.role === 'admin') {
                return next();
            }
            // For students, check enrollment and payment
            if (req.user.role === 'student') {
                // For paid courses, check if student has completed payment
                if (lesson.course.pricing > 0) {
                    const payment = await prisma_1.prisma.payment.findFirst({
                        where: {
                            studentId: req.user.userId,
                            courseId: lesson.courseId,
                            status: 'completed',
                        },
                    });
                    if (!payment) {
                        return res.status(402).json({ error: 'This is a paid course. Please complete payment first.' });
                    }
                }
                // Check enrollment for both free and paid courses
                const enrollment = await prisma_1.prisma.enrollment.findUnique({
                    where: {
                        studentId_courseId: {
                            studentId: req.user.userId,
                            courseId: lesson.courseId,
                        },
                    },
                });
                if (!enrollment) {
                    return res.status(403).json({ error: 'You are not enrolled in this course' });
                }
                return next();
            }
            // Default: deny access
            return res.status(403).json({ error: 'You do not have permission to access this lesson' });
        }
        catch (error) {
            console.error('Lesson access control error:', error);
            return res.status(500).json({ error: 'An unexpected error occurred' });
        }
    };
};
exports.requireLessonAccess = requireLessonAccess;
//# sourceMappingURL=auth.js.map