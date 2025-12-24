import { Request, Response, NextFunction } from 'express';
import { verifyToken, verifyAdminToken, JwtPayload, AdminJwtPayload, isTokenExpired, getTokenRemainingTime } from '../utils/jwt';
import { prisma } from '../utils/prisma';
import { AuditService } from '../services/auditService';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
  adminUser?: AdminJwtPayload;
}

const auditService = new AuditService();

// Store active admin sessions in memory (in production, use Redis or database)
const activeAdminSessions = new Map<string, { userId: string; sessionId: string; lastActivity: Date }>();

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Session expired, please log in again' });
  }
};

export const authenticateAdminToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  try {
    const decoded = verifyAdminToken(token);
    
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
  } catch (error) {
    // Log session timeout
    if (error instanceof Error && error.message.includes('expired')) {
      const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      
      // Try to get user ID from expired token for logging
      try {
        const expiredToken = token.split('.')[1];
        const decoded = JSON.parse(Buffer.from(expiredToken, 'base64').toString());
        if (decoded.userId) {
          auditService.logAuthAction(
            decoded.userId,
            'session_timeout',
            clientIp,
            userAgent,
            { reason: 'Token expired' }
          );
        }
      } catch (logError) {
        // Ignore logging errors
      }
    }
    
    return res.status(401).json({ error: 'Admin session expired, please log in again' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'You do not have permission to access this resource' });
    }

    next();
  };
};

export const requireAdminRole = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.adminUser) {
    return res.status(401).json({ error: 'Admin authentication required' });
  }

  if (req.adminUser.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }

  next();
};

export const sessionTimeoutWarning = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token && req.adminUser) {
    const remainingTime = getTokenRemainingTime(token);
    const warningThreshold = 15 * 60; // 15 minutes
    
    if (remainingTime > 0 && remainingTime < warningThreshold) {
      res.setHeader('X-Session-Warning', 'true');
      res.setHeader('X-Session-Remaining', remainingTime.toString());
    }
  }

  next();
};

export const createAdminSession = (userId: string, sessionId: string): void => {
  activeAdminSessions.set(sessionId, {
    userId,
    sessionId,
    lastActivity: new Date(),
  });
};

export const destroyAdminSession = (sessionId: string): void => {
  activeAdminSessions.delete(sessionId);
};

export const getActiveAdminSessions = (): Array<{ userId: string; sessionId: string; lastActivity: Date }> => {
  return Array.from(activeAdminSessions.values());
};

export const forceLogoutAdminSession = async (sessionId: string, adminId: string, ipAddress: string, userAgent: string): Promise<boolean> => {
  const session = activeAdminSessions.get(sessionId);
  if (session) {
    destroyAdminSession(sessionId);
    
    // Log the forced logout
    await auditService.logAuthAction(
      session.userId,
      'force_logout',
      ipAddress,
      userAgent,
      { forcedBy: adminId, sessionId }
    );
    
    return true;
  }
  return false;
};

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

export const requireCourseEnrollment = (courseIdParam: string = 'courseId') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const courseId = req.params[courseIdParam];
      
      if (!courseId) {
        return res.status(400).json({ error: 'Course ID is required' });
      }

      // Check if course exists and is published
      const course = await prisma.course.findUnique({
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
          const payment = await prisma.payment.findFirst({
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
        const enrollment = await prisma.enrollment.findUnique({
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

    } catch (error: any) {
      console.error('Course access control error:', error);
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };
};

export const requireLessonAccess = () => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    try {
      const lessonId = req.params.id;
      
      if (!lessonId) {
        return res.status(400).json({ error: 'Lesson ID is required' });
      }

      // Get lesson and its course information
      const lesson = await prisma.lesson.findUnique({
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
          const payment = await prisma.payment.findFirst({
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
        const enrollment = await prisma.enrollment.findUnique({
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

    } catch (error: any) {
      console.error('Lesson access control error:', error);
      return res.status(500).json({ error: 'An unexpected error occurred' });
    }
  };
};