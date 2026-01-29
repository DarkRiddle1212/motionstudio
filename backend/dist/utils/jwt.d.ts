export interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    issuedAt?: number;
    sessionId?: string;
}
export interface AdminJwtPayload extends JwtPayload {
    sessionId: string;
    adminLevel: 'admin' | 'super_admin';
}
export declare const generateToken: (payload: JwtPayload, isAdmin?: boolean) => string;
export declare const generateAdminToken: (payload: AdminJwtPayload) => string;
export declare const verifyToken: (token: string) => JwtPayload;
export declare const verifyAdminToken: (token: string) => AdminJwtPayload;
export declare const generateSessionId: () => string;
export declare const isTokenExpired: (token: string) => boolean;
export declare const getTokenRemainingTime: (token: string) => number;
//# sourceMappingURL=jwt.d.ts.map