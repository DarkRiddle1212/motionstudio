"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authService_1 = require("../services/authService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const authService = new authService_1.AuthService();
// Sign up endpoint
router.post('/signup', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'All required fields must be filled' });
        }
        const result = await authService.signUp({
            email,
            password,
            firstName,
            lastName,
        });
        res.status(201).json(result);
    }
    catch (error) {
        console.error('Sign up error:', error);
        res.status(400).json({ error: error.message });
    }
});
// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const result = await authService.login({ email, password });
        res.json(result);
    }
    catch (error) {
        console.error('Login error:', error);
        // Return appropriate status codes based on error message
        if (error.message === 'Invalid email or password') {
            return res.status(401).json({ error: error.message });
        }
        if (error.message === 'Please verify your email before logging in') {
            return res.status(403).json({ error: error.message });
        }
        res.status(400).json({ error: error.message });
    }
});
// Email verification endpoint
router.post('/verify-email', async (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(400).json({ error: 'Verification token is required' });
        }
        const result = await authService.verifyEmail(token);
        res.json(result);
    }
    catch (error) {
        console.error('Email verification error:', error);
        res.status(400).json({ error: error.message });
    }
});
// Logout endpoint (client-side token removal, but we can add token blacklisting later)
router.post('/logout', auth_1.authenticateToken, (req, res) => {
    // In a JWT-based system, logout is typically handled client-side by removing the token
    // For enhanced security, you could implement token blacklisting here
    res.json({ message: 'Logged out successfully' });
});
// Get current user profile
router.get('/profile', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        const user = await authService.getUserProfile(req.user.userId);
        res.json({ user });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(404).json({ error: error.message });
    }
});
// Refresh token endpoint
router.post('/refresh-token', auth_1.authenticateToken, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }
        // Generate new token with same payload
        const { generateToken } = await Promise.resolve().then(() => __importStar(require('../utils/jwt')));
        const newToken = generateToken({
            userId: req.user.userId,
            email: req.user.email,
            role: req.user.role,
        });
        res.json({ token: newToken });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        res.status(400).json({ error: error.message });
    }
});
// Resend verification email endpoint
router.post('/resend-verification', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const result = await authService.resendVerificationEmail(email);
        res.json(result);
    }
    catch (error) {
        console.error('Resend verification error:', error);
        if (error.message === 'User not found') {
            return res.status(404).json({ error: error.message });
        }
        if (error.message === 'Email is already verified') {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: error.message });
    }
});
// TEST ONLY - Bypass email verification for testing
router.post('/test-verify', async (req, res) => {
    try {
        // Only allow in development/test environment
        if (process.env.NODE_ENV === 'production') {
            return res.status(404).json({ error: 'Not found' });
        }
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        // Directly mark user as verified for testing
        const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/prisma')));
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerificationToken: null,
                emailVerificationTokenExpiry: null,
            },
        });
        res.json({ message: 'Email verified successfully (test mode)' });
    }
    catch (error) {
        console.error('Test verify error:', error);
        res.status(500).json({ error: error.message });
    }
});
// TEST ONLY - Set user role for testing
router.post('/test-set-role', async (req, res) => {
    try {
        // Only allow in development/test environment
        if (process.env.NODE_ENV === 'production') {
            return res.status(404).json({ error: 'Not found' });
        }
        const { email, role } = req.body;
        if (!email || !role) {
            return res.status(400).json({ error: 'Email and role are required' });
        }
        if (!['student', 'instructor', 'admin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        // Update user role for testing
        const { prisma } = await Promise.resolve().then(() => __importStar(require('../utils/prisma')));
        const user = await prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await prisma.user.update({
            where: { id: user.id },
            data: { role },
        });
        res.json({ message: `User role set to ${role} successfully (test mode)` });
    }
    catch (error) {
        console.error('Test set role error:', error);
        res.status(500).json({ error: error.message });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map