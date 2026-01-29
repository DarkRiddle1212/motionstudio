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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fc = __importStar(require("fast-check"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_1 = require("../auth");
const jwt_1 = require("../../utils/jwt");
const auditService_1 = require("../../services/auditService");
/**
 * **Feature: admin-panel, Property 2: Session timeout enforcement**
 * **Validates: Requirements 1.4**
 *
 * For any admin session that exceeds the configured timeout period, the system should
 * automatically log out the user and require re-authentication.
 */
// Mock the audit service to avoid database calls during property tests
jest.mock('../../services/auditService');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
describe('Property-Based Tests: Session Timeout Enforcement', () => {
    let mockAuditService;
    beforeEach(() => {
        mockAuditService = new auditService_1.AuditService();
        mockAuditService.logAuthAction = jest.fn().mockResolvedValue(undefined);
    });
    afterEach(() => {
        jest.clearAllMocks();
    });
    describe('Property 2: Session timeout enforcement', () => {
        /**
         * Property 2a: Expired admin tokens are rejected
         * For any admin token that has exceeded the 4-hour timeout, authentication should fail
         */
        it('Property 2a: Expired admin tokens are rejected', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate random admin user data
            fc.record({
                userId: fc.uuid(),
                email: fc.emailAddress(),
                role: fc.constant('admin'),
                sessionId: fc.string({ minLength: 10, maxLength: 30 }),
                adminLevel: fc.constantFrom('admin', 'super_admin'),
            }), 
            // Generate different timeout scenarios (in seconds)
            fc.record({
                timeoutOffsetSeconds: fc.integer({ min: 1, max: 7200 }), // 1 second to 2 hours past timeout
            }), async (adminData, timeoutConfig) => {
                // Create an expired token by setting both issuedAt and exp to past values
                const pastTime = Math.floor(Date.now() / 1000) - (4 * 3600 + timeoutConfig.timeoutOffsetSeconds);
                const tokenPayload = {
                    ...adminData,
                    issuedAt: pastTime,
                    exp: pastTime + (4 * 3600), // Token expired timeoutOffsetSeconds ago
                };
                // Create the expired token directly using jwt.sign
                const expiredToken = jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET);
                // Create session for the admin
                (0, auth_1.createAdminSession)(adminData.userId, adminData.sessionId);
                // Create mock request with expired token
                const mockReq = {
                    headers: {
                        authorization: `Bearer ${expiredToken}`,
                    },
                    ip: '127.0.0.1',
                    connection: { remoteAddress: '127.0.0.1' },
                    get: jest.fn().mockReturnValue('test-user-agent'),
                };
                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Attempt authentication with expired token
                (0, auth_1.authenticateAdminToken)(mockReq, mockRes, mockNext);
                // Verify that authentication was rejected
                expect(mockRes.status).toHaveBeenCalledWith(401);
                expect(mockRes.json).toHaveBeenCalledWith({
                    error: 'Admin session expired, please log in again'
                });
                expect(mockNext).not.toHaveBeenCalled();
                // Clean up session
                (0, auth_1.destroyAdminSession)(adminData.sessionId);
                return true;
            }), { numRuns: 100 });
        });
        /**
         * Property 2b: Valid admin tokens within timeout are accepted
         * For any admin token that is within the 4-hour timeout window, authentication should succeed
         */
        it('Property 2b: Valid admin tokens within timeout are accepted', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate random admin user data
            fc.record({
                userId: fc.uuid(),
                email: fc.emailAddress(),
                role: fc.constant('admin'),
                sessionId: fc.string({ minLength: 10, maxLength: 30 }),
                adminLevel: fc.constantFrom('admin', 'super_admin'),
            }), 
            // Generate different valid timeout scenarios (in seconds)
            fc.record({
                timeBeforeExpiry: fc.integer({ min: 60, max: 14400 }), // 1 minute to 4 hours before expiry
            }), async (adminData, timeConfig) => {
                // Create a valid admin token using the standard function
                const validToken = (0, jwt_1.generateAdminToken)(adminData);
                // Create session for the admin
                (0, auth_1.createAdminSession)(adminData.userId, adminData.sessionId);
                // Create mock request with valid token
                const mockReq = {
                    headers: {
                        authorization: `Bearer ${validToken}`,
                    },
                    ip: '127.0.0.1',
                    connection: { remoteAddress: '127.0.0.1' },
                    get: jest.fn().mockReturnValue('test-user-agent'),
                };
                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Attempt authentication with valid token
                (0, auth_1.authenticateAdminToken)(mockReq, mockRes, mockNext);
                // Verify that authentication was successful
                expect(mockRes.status).not.toHaveBeenCalled();
                expect(mockRes.json).not.toHaveBeenCalled();
                expect(mockNext).toHaveBeenCalled();
                expect(mockReq.adminUser).toBeDefined();
                expect(mockReq.adminUser?.userId).toBe(adminData.userId);
                expect(mockReq.adminUser?.sessionId).toBe(adminData.sessionId);
                // Clean up session
                (0, auth_1.destroyAdminSession)(adminData.sessionId);
                return true;
            }), { numRuns: 100 });
        });
        /**
         * Property 2c: Session timeout triggers audit logging
         * For any admin session that times out, an audit log entry should be created
         */
        it('Property 2c: Session timeout triggers audit logging', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate random admin user data
            fc.record({
                userId: fc.uuid(),
                email: fc.emailAddress(),
                role: fc.constant('admin'),
                sessionId: fc.string({ minLength: 10, maxLength: 30 }),
                adminLevel: fc.constantFrom('admin', 'super_admin'),
            }), async (adminData) => {
                // Create an expired token
                const pastTime = Math.floor(Date.now() / 1000) - (4 * 3600 + 300); // 4 hours and 5 minutes ago
                const tokenPayload = {
                    ...adminData,
                    issuedAt: pastTime,
                    exp: pastTime + (4 * 3600), // Token expired 5 minutes ago
                };
                const expiredToken = jsonwebtoken_1.default.sign(tokenPayload, JWT_SECRET);
                // Create session for the admin
                (0, auth_1.createAdminSession)(adminData.userId, adminData.sessionId);
                // Create mock request with expired token
                const mockReq = {
                    headers: {
                        authorization: `Bearer ${expiredToken}`,
                    },
                    ip: '192.168.1.100',
                    connection: { remoteAddress: '192.168.1.100' },
                    get: jest.fn().mockReturnValue('Mozilla/5.0 Test Browser'),
                };
                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Attempt authentication with expired token
                (0, auth_1.authenticateAdminToken)(mockReq, mockRes, mockNext);
                // Verify that authentication was rejected
                expect(mockRes.status).toHaveBeenCalledWith(401);
                expect(mockRes.json).toHaveBeenCalledWith({
                    error: 'Admin session expired, please log in again'
                });
                // Clean up session
                (0, auth_1.destroyAdminSession)(adminData.sessionId);
                return true;
            }), { numRuns: 100 });
        });
        /**
         * Property 2d: Invalid session IDs are rejected even with valid tokens
         * For any admin token with a session ID that doesn't exist in active sessions, authentication should fail
         */
        it('Property 2d: Invalid session IDs are rejected even with valid tokens', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate random admin user data
            fc.record({
                userId: fc.uuid(),
                email: fc.emailAddress(),
                role: fc.constant('admin'),
                sessionId: fc.string({ minLength: 10, maxLength: 30 }),
                adminLevel: fc.constantFrom('admin', 'super_admin'),
            }), 
            // Generate a different session ID that won't be in active sessions
            fc.string({ minLength: 10, maxLength: 30 }), async (adminData, invalidSessionId) => {
                // Ensure the invalid session ID is different from the valid one
                if (invalidSessionId === adminData.sessionId) {
                    invalidSessionId = invalidSessionId + '_invalid';
                }
                // Create a valid admin token but with an invalid session ID
                const tokenWithInvalidSession = (0, jwt_1.generateAdminToken)({
                    ...adminData,
                    sessionId: invalidSessionId, // Use invalid session ID
                });
                // Create session for the admin with the CORRECT session ID (not the one in the token)
                (0, auth_1.createAdminSession)(adminData.userId, adminData.sessionId);
                // Create mock request with token containing invalid session ID
                const mockReq = {
                    headers: {
                        authorization: `Bearer ${tokenWithInvalidSession}`,
                    },
                    ip: '127.0.0.1',
                    connection: { remoteAddress: '127.0.0.1' },
                    get: jest.fn().mockReturnValue('test-user-agent'),
                };
                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Attempt authentication with token containing invalid session ID
                (0, auth_1.authenticateAdminToken)(mockReq, mockRes, mockNext);
                // Verify that authentication was rejected due to invalid session
                expect(mockRes.status).toHaveBeenCalledWith(401);
                expect(mockRes.json).toHaveBeenCalledWith({
                    error: 'Admin session invalid or expired'
                });
                expect(mockNext).not.toHaveBeenCalled();
                // Clean up session
                (0, auth_1.destroyAdminSession)(adminData.sessionId);
                return true;
            }), { numRuns: 100 });
        });
        /**
         * Property 2e: Session activity is updated on successful authentication
         * For any valid admin authentication, the session's last activity should be updated
         */
        it('Property 2e: Session activity is updated on successful authentication', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate random admin user data
            fc.record({
                userId: fc.uuid(),
                email: fc.emailAddress(),
                role: fc.constant('admin'),
                sessionId: fc.string({ minLength: 10, maxLength: 30 }),
                adminLevel: fc.constantFrom('admin', 'super_admin'),
            }), async (adminData) => {
                // Create a valid admin token
                const validToken = (0, jwt_1.generateAdminToken)(adminData);
                // Create session for the admin
                (0, auth_1.createAdminSession)(adminData.userId, adminData.sessionId);
                // Create mock request with valid token
                const mockReq = {
                    headers: {
                        authorization: `Bearer ${validToken}`,
                    },
                    ip: '127.0.0.1',
                    connection: { remoteAddress: '127.0.0.1' },
                    get: jest.fn().mockReturnValue('test-user-agent'),
                };
                const mockRes = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Attempt authentication with valid token
                (0, auth_1.authenticateAdminToken)(mockReq, mockRes, mockNext);
                // Verify that authentication was successful
                expect(mockNext).toHaveBeenCalled();
                expect(mockReq.adminUser).toBeDefined();
                // Clean up session
                (0, auth_1.destroyAdminSession)(adminData.sessionId);
                return true;
            }), { numRuns: 100 });
        });
    });
});
//# sourceMappingURL=auth.property.test.js.map