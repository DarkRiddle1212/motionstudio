"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokenRemainingTime = exports.isTokenExpired = exports.generateSessionId = exports.verifyAdminToken = exports.verifyToken = exports.generateAdminToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRY || '7d';
const ADMIN_JWT_EXPIRES_IN = process.env.ADMIN_JWT_EXPIRY || '4h'; // Shorter expiry for admin sessions
const generateToken = (payload, isAdmin = false) => {
    const tokenPayload = {
        ...payload,
        issuedAt: Math.floor(Date.now() / 1000),
    };
    if (isAdmin) {
        tokenPayload.sessionId = (0, exports.generateSessionId)();
    }
    const expiresIn = isAdmin ? ADMIN_JWT_EXPIRES_IN : JWT_EXPIRES_IN;
    return jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET, { expiresIn });
};
exports.generateToken = generateToken;
const generateAdminToken = (payload) => {
    const tokenPayload = {
        ...payload,
        issuedAt: Math.floor(Date.now() / 1000),
        sessionId: payload.sessionId || (0, exports.generateSessionId)(),
    };
    return jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET, { expiresIn: ADMIN_JWT_EXPIRES_IN });
};
exports.generateAdminToken = generateAdminToken;
const verifyToken = (token) => {
    return jsonwebtoken_1.default.verify(token, JWT_SECRET);
};
exports.verifyToken = verifyToken;
const verifyAdminToken = (token) => {
    const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
    // Ensure this is actually an admin token by checking for admin-specific fields
    if (!decoded.sessionId || !decoded.adminLevel) {
        throw new Error('Invalid admin token - missing admin fields');
    }
    // Ensure the user has admin role
    if (decoded.role !== 'admin') {
        throw new Error('Invalid admin token - insufficient privileges');
    }
    // Check if token is expired based on admin session timeout
    if (decoded.issuedAt) {
        const tokenAge = Math.floor(Date.now() / 1000) - decoded.issuedAt;
        const maxAge = parseTimeString(ADMIN_JWT_EXPIRES_IN);
        if (tokenAge > maxAge) {
            throw new Error('Admin session expired');
        }
    }
    return decoded;
};
exports.verifyAdminToken = verifyAdminToken;
const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};
exports.generateSessionId = generateSessionId;
const isTokenExpired = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded || !decoded.exp) {
            return true;
        }
        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    }
    catch (error) {
        return true;
    }
};
exports.isTokenExpired = isTokenExpired;
const getTokenRemainingTime = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded || !decoded.exp) {
            return 0;
        }
        const currentTime = Math.floor(Date.now() / 1000);
        return Math.max(0, decoded.exp - currentTime);
    }
    catch (error) {
        return 0;
    }
};
exports.getTokenRemainingTime = getTokenRemainingTime;
// Helper function to parse time strings like '4h', '30m', '7d'
function parseTimeString(timeStr) {
    const match = timeStr.match(/^(\d+)([smhd])$/);
    if (!match) {
        return 3600; // Default to 1 hour
    }
    const value = parseInt(match[1]);
    const unit = match[2];
    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 3600;
        case 'd': return value * 86400;
        default: return 3600;
    }
}
//# sourceMappingURL=jwt.js.map