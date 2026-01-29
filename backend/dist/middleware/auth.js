"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireLessonAccess = exports.requireCourseEnrollment = exports.forceLogoutAdminSession = exports.getActiveAdminSessions = exports.destroyAdminSession = exports.createAdminSession = exports.sessionTimeoutWarning = exports.requireAdminRole = exports.requireRole = exports.authenticateAdminToken = exports.authenticateToken = void 0;
const jwt_1 = require("../utils/jwt");
const prisma_1 = require("../utils/prisma");
const auditService_1 = require("../services/auditService");
const auditService = new auditService_1.AuditService();
// Store active admin sessions in memory (in production, use Redis or database)
const activeAdminSessions = new Map();
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
const authenticateAdminToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    if (!token) {
        return res.status(401).json({ error: 'Admin authentication required' });
    }
    try {
        const decoded = (0, jwt_1.verifyAdminToken)(token);
        // Check if session is still active
        if (decoded.sessionId) {
            const session = activeAdminSessions.get(decoded.sessionId);
            if (!session || session.userId !== decoded.userId) {
                return res.status(401).json({ error: 'Admin session invalid or expired' });
            }
            // Update last activity
            session.lastActivity = new Date();
            activeAdminSessions.set(decoded.sessionId, session);
        }
        req.adminUser = decoded;
        req.user = decoded; // Also set regular user for compatibility
        next();
    }
    catch (error) {
        // Log session timeout
        if (error instanceof Error && error.message.includes('expired')) {
            const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
            const userAgent = req.get('User-Agent') || 'unknown';
            // Try to get user ID from expired token for logging
            try {
                const expiredToken = token.split('.')[1];
                const decoded = JSON.parse(Buffer.from(expiredToken, 'base64').toString());
                if (decoded.userId) {
                    auditService.logAuthAction(decoded.userId, 'session_timeout', clientIp, userAgent, { reason: 'Token expired' });
                }
            }
            catch (logError) {
                // Ignore logging errors
            }
        }
        return res.status(401).json({ error: 'Admin session expired, please log in again' });
    }
};
exports.authenticateAdminToken = authenticateAdminToken;
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
const requireAdminRole = (req, res, next) => {
    if (!req.adminUser) {
        return res.status(401).json({ error: 'Admin authentication required' });
    }
    if (req.adminUser.role !== 'admin') {
        return res.status(403).json({ error: 'Admin privileges required' });
    }
    next();
};
exports.requireAdminRole = requireAdminRole;
const sessionTimeoutWarning = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token && req.adminUser) {
        const remainingTime = (0, jwt_1.getTokenRemainingTime)(token);
        const warningThreshold = 15 * 60; // 15 minutes
        if (remainingTime > 0 && remainingTime < warningThreshold) {
            res.setHeader('X-Session-Warning', 'true');
            res.setHeader('X-Session-Remaining', remainingTime.toString());
        }
    }
    next();
};
exports.sessionTimeoutWarning = sessionTimeoutWarning;
const createAdminSession = (userId, sessionId) => {
    activeAdminSessions.set(sessionId, {
        userId,
        sessionId,
        lastActivity: new Date(),
    });
};
exports.createAdminSession = createAdminSession;
const destroyAdminSession = (sessionId) => {
    activeAdminSessions.delete(sessionId);
};
exports.destroyAdminSession = destroyAdminSession;
const getActiveAdminSessions = () => {
    return Array.from(activeAdminSessions.values());
};
exports.getActiveAdminSessions = getActiveAdminSessions;
const forceLogoutAdminSession = async (sessionId, adminId, ipAddress, userAgent) => {
    const session = activeAdminSessions.get(sessionId);
    if (session) {
        (0, exports.destroyAdminSession)(sessionId);
        // Log the forced logout
        await auditService.logAuthAction(session.userId, 'force_logout', ipAddress, userAgent, { forcedBy: adminId, sessionId });
        return true;
    }
    return false;
};
exports.forceLogoutAdminSession = forceLogoutAdminSession;
// Cleanup expired sessions periodically
setInterval(() => {
    const now = new Date();
    const sessionTimeout = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    for (const [sessionId, session] of activeAdminSessions.entries()) {
        if (now.getTime() - session.lastActivity.getTime() > sessionTimeout) {
            activeAdminSessions.delete(sessionId);
        }
    }
}, 60 * 1000); // Check every minute
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