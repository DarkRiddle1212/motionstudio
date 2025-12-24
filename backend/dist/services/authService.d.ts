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
export declare class AuthService {
    private emailService;
    constructor();
    signUp(data: SignUpData): Promise<{
        user: any;
        message: string;
    }>;
    login(data: LoginData): Promise<AuthResponse>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    getUserProfile(userId: string): Promise<{
        email: string;
        firstName: string | null;
        lastName: string | null;
        id: string;
        role: string;
        emailVerified: boolean;
        createdAt: Date;
    }>;
    resendVerificationEmail(email: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=authService.d.ts.map