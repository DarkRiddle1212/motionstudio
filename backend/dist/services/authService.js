"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../utils/prisma");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const validation_1 = require("../utils/validation");
const emailService_1 = require("./emailService");
class AuthService {
    constructor() {
        this.emailService = new emailService_1.EmailService();
    }
    async signUp(data) {
        const { email, password, firstName, lastName } = data;
        // Validate email format
        if (!(0, validation_1.validateEmail)(email)) {
            throw new Error('Please enter a valid email address');
        }
        // Validate password strength
        const passwordValidation = (0, validation_1.validatePassword)(password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.message);
        }
        // Check if user already exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new Error('Email already registered');
        }
        // Hash password
        const hashedPassword = await (0, password_1.hashPassword)(password);
        // Generate email verification token (simple random string)
        const emailVerificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // Create user
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                emailVerificationToken,
                emailVerificationTokenExpiry,
                role: 'student', // Default role
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                emailVerified: true,
                createdAt: true,
            },
        });
        // Send verification email
        try {
            await this.emailService.sendVerificationEmail(email, emailVerificationToken);
        }
        catch (error) {
            console.error('Failed to send verification email:', error);
            // Don't throw error here - user is created successfully, just email failed
        }
        return {
            user,
            message: 'Account created successfully. Please check your email to verify your account.',
        };
    }
    async login(data) {
        const { email, password } = data;
        // Find user by email
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        // Check password
        const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid email or password');
        }
        // Check if email is verified
        if (!user.emailVerified) {
            throw new Error('Please verify your email before logging in');
        }
        // Generate JWT token
        const tokenPayload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        const token = (0, jwt_1.generateToken)(tokenPayload);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName || undefined,
                lastName: user.lastName || undefined,
                role: user.role,
                emailVerified: user.emailVerified,
            },
            token,
        };
    }
    async verifyEmail(token) {
        try {
            // Find user with this verification token
            const user = await prisma_1.prisma.user.findFirst({
                where: {
                    emailVerificationToken: token,
                    emailVerificationTokenExpiry: {
                        gt: new Date(),
                    },
                },
            });
            if (!user) {
                throw new Error('Invalid or expired verification token');
            }
            // Update user as verified
            await prisma_1.prisma.user.update({
                where: { id: user.id },
                data: {
                    emailVerified: true,
                    emailVerificationToken: null,
                    emailVerificationTokenExpiry: null,
                },
            });
            // Send welcome email
            try {
                await this.emailService.sendWelcomeEmail(user.email, user.firstName || undefined);
            }
            catch (error) {
                console.error('Failed to send welcome email:', error);
                // Don't throw error here - verification was successful, just email failed
            }
            return { message: 'Email verified successfully' };
        }
        catch (error) {
            throw new Error('Invalid or expired verification token');
        }
    }
    async getUserProfile(userId) {
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                emailVerified: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async resendVerificationEmail(email) {
        // Find user by email
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            throw new Error('User not found');
        }
        if (user.emailVerified) {
            throw new Error('Email is already verified');
        }
        // Generate new verification token (simple random string)
        const emailVerificationToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const emailVerificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
        // Update user with new token
        await prisma_1.prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerificationToken,
                emailVerificationTokenExpiry,
            },
        });
        // Send verification email
        try {
            await this.emailService.sendVerificationEmail(email, emailVerificationToken);
        }
        catch (error) {
            console.error('Failed to send verification email:', error);
            throw new Error('Failed to send verification email');
        }
        return { message: 'Verification email sent successfully' };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map