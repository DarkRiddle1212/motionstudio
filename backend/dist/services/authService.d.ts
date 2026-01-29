export interface SignUpData {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
}
export interface LoginData {
    email: string;
    password: string;
}
export interface AdminLoginData extends LoginData {
    ipAddress: string;
    userAgent: string;
}
export interface AuthResponse {
    user: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        role: string;
        emailVerified: boolean;
    };
    token: string;
}
export interface AdminAuthResponse extends AuthResponse {
    sessionId: string;
    sessionTimeout: number;
    adminLevel: 'admin' | 'super_admin';
}
export declare class AuthService {
    private emailService;
    private auditService;
    constructor();
    signUp(data: SignUpData): Promise<{
        user: any;
        message: string;
    }>;
    login(data: LoginData): Promise<AuthResponse>;
    adminLogin(data: AdminLoginData): Promise<AdminAuthResponse>;
    adminLogout(userId: string, sessionId: string, ipAddress: string, userAgent: string): Promise<void>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    getUserProfile(userId: string): Promise<{
        id: string;
        createdAt: Date;
        role: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        emailVerified: boolean;
    }>;
    resendVerificationEmail(email: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=authService.d.ts.map