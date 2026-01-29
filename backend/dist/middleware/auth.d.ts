import { Request, Response, NextFunction } from 'express';
import { JwtPayload, AdminJwtPayload } from '../utils/jwt';
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
    adminUser?: AdminJwtPayload;
}
export declare const authenticateToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authenticateAdminToken: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireRole: (roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const requireAdminRole: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const sessionTimeoutWarning: (req: AuthenticatedRequest, res: Response, next: NextFunction) => void;
export declare const createAdminSession: (userId: string, sessionId: string) => void;
export declare const destroyAdminSession: (sessionId: string) => void;
export declare const getActiveAdminSessions: () => Array<{
    userId: string;
    sessionId: string;
    lastActivity: Date;
}>;
export declare const forceLogoutAdminSession: (sessionId: string, adminId: string, ipAddress: string, userAgent: string) => Promise<boolean>;
export declare const requireCourseEnrollment: (courseIdParam?: string) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
export declare const requireLessonAccess: () => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
//# sourceMappingURL=auth.d.ts.map