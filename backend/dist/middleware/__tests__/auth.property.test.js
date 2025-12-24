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
const fc = __importStar(require("fast-check"));
const auth_1 = require("../auth");
const jwt_1 = require("../../utils/jwt");
/**
 * Feature: motion-studio-platform, Property 10: Authentication State Consistency
 * Validates: Requirements 3.5
 *
 * For any authenticated user, logging out should clear the session and subsequent
 * requests without a valid token should be rejected with an authentication error.
 */
describe('Property-Based Tests: Authentication Middleware', () => {
    describe('Property 10: Authentication State Consistency', () => {
        it('should reject requests without authorization header', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate random request data
            fc.record({
                method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
                url: fc.string({ minLength: 1, maxLength: 100 }),
                body: fc.object(),
            }), async (requestData) => {
                // Create mock request without authorization header
                const mockRequest = {
                    method: requestData.method,
                    url: requestData.url,
                    body: requestData.body,
                    headers: {}, // No authorization header
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Call the authentication middleware
                (0, auth_1.authenticateToken)(mockRequest, mockResponse, mockNext);
                // Verify that the request was rejected
                expect(mockResponse.status).toHaveBeenCalledWith(401);
                expect(mockResponse.json).toHaveBeenCalledWith({
                    error: 'Authentication required',
                });
                expect(mockNext).not.toHaveBeenCalled();
                expect(mockRequest.user).toBeUndefined();
            }), { numRuns: 10 });
        });
        it('should reject requests with invalid tokens', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate random invalid tokens (non-empty strings that aren't valid JWTs)
            fc.string({ minLength: 1, maxLength: 200 })
                .filter(token => token.trim().length > 0), // Ensure it's not empty/whitespace
            fc.record({
                method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
                url: fc.string({ minLength: 1, maxLength: 100 }),
            }), async (invalidToken, requestData) => {
                // Create mock request with invalid token
                const mockRequest = {
                    method: requestData.method,
                    url: requestData.url,
                    headers: {
                        authorization: `Bearer ${invalidToken}`,
                    },
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Call the authentication middleware
                (0, auth_1.authenticateToken)(mockRequest, mockResponse, mockNext);
                // Verify that the request was rejected
                expect(mockResponse.status).toHaveBeenCalledWith(401);
                // The middleware extracts token using split(' ')[1]
                const authHeader = `Bearer ${invalidToken}`;
                const extractedToken = authHeader.split(' ')[1];
                if (!extractedToken || extractedToken.trim().length === 0) {
                    // No valid token extracted -> "Authentication required"
                    expect(mockResponse.json).toHaveBeenCalledWith({
                        error: 'Authentication required',
                    });
                }
                else {
                    // Token exists but is invalid -> "Session expired, please log in again"
                    expect(mockResponse.json).toHaveBeenCalledWith({
                        error: 'Session expired, please log in again',
                    });
                }
                expect(mockNext).not.toHaveBeenCalled();
                expect(mockRequest.user).toBeUndefined();
            }), { numRuns: 10 });
        });
        it('should accept requests with valid tokens and set user data', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate random valid user data
            fc.record({
                userId: fc.uuid(),
                email: fc.emailAddress(),
                role: fc.constantFrom('student', 'instructor', 'admin'),
            }), fc.record({
                method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
                url: fc.string({ minLength: 1, maxLength: 100 }),
            }), async (userData, requestData) => {
                // Generate a valid token for the user
                const tokenPayload = {
                    userId: userData.userId,
                    email: userData.email,
                    role: userData.role,
                };
                const validToken = (0, jwt_1.generateToken)(tokenPayload);
                // Create mock request with valid token
                const mockRequest = {
                    method: requestData.method,
                    url: requestData.url,
                    headers: {
                        authorization: `Bearer ${validToken}`,
                    },
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Call the authentication middleware
                (0, auth_1.authenticateToken)(mockRequest, mockResponse, mockNext);
                // Verify that the request was accepted
                expect(mockResponse.status).not.toHaveBeenCalled();
                expect(mockResponse.json).not.toHaveBeenCalled();
                expect(mockNext).toHaveBeenCalled();
                // Verify that user data was set correctly
                expect(mockRequest.user).toBeDefined();
                expect(mockRequest.user.userId).toBe(userData.userId);
                expect(mockRequest.user.email).toBe(userData.email);
                expect(mockRequest.user.role).toBe(userData.role);
            }), { numRuns: 10 });
        });
        it('should reject requests with malformed authorization headers', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate malformed authorization headers that result in no token
            fc.oneof(fc.string({ minLength: 1, maxLength: 50 })
                .filter(s => !s.startsWith('Bearer ')), // Random string without "Bearer "
            fc.constant('Bearer'), // Just "Bearer" without token
            fc.constant('Bearer '), // "Bearer " with empty token
            fc.constant('')), fc.record({
                method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
                url: fc.string({ minLength: 1, maxLength: 100 }),
            }), async (malformedAuth, requestData) => {
                // Create mock request with malformed authorization header
                const mockRequest = {
                    method: requestData.method,
                    url: requestData.url,
                    headers: {
                        authorization: malformedAuth,
                    },
                };
                const mockResponse = {
                    status: jest.fn().mockReturnThis(),
                    json: jest.fn().mockReturnThis(),
                };
                const mockNext = jest.fn();
                // Call the authentication middleware
                (0, auth_1.authenticateToken)(mockRequest, mockResponse, mockNext);
                // The middleware logic: if no token is extracted, it returns "Authentication required"
                // If a token exists but is invalid, it returns "Session expired, please log in again"
                const authHeader = malformedAuth;
                const token = authHeader && authHeader.split(' ')[1];
                expect(mockResponse.status).toHaveBeenCalledWith(401);
                if (!token) {
                    // No token extracted -> "Authentication required"
                    expect(mockResponse.json).toHaveBeenCalledWith({
                        error: 'Authentication required',
                    });
                }
                else {
                    // Token exists but is invalid -> "Session expired, please log in again"
                    expect(mockResponse.json).toHaveBeenCalledWith({
                        error: 'Session expired, please log in again',
                    });
                }
                expect(mockNext).not.toHaveBeenCalled();
                expect(mockRequest.user).toBeUndefined();
            }), { numRuns: 10 });
        });
        it('should maintain authentication state consistency across multiple requests', async () => {
            await fc.assert(fc.asyncProperty(
            // Generate user data and multiple request scenarios
            fc.record({
                userId: fc.uuid(),
                email: fc.emailAddress(),
                role: fc.constantFrom('student', 'instructor', 'admin'),
            }), fc.array(fc.record({
                method: fc.constantFrom('GET', 'POST', 'PUT', 'DELETE'),
                url: fc.string({ minLength: 1, maxLength: 100 }),
            }), { minLength: 2, maxLength: 5 }), async (userData, requests) => {
                // Generate a valid token for the user
                const tokenPayload = {
                    userId: userData.userId,
                    email: userData.email,
                    role: userData.role,
                };
                const validToken = (0, jwt_1.generateToken)(tokenPayload);
                // Test multiple requests with the same token
                for (const requestData of requests) {
                    const mockRequest = {
                        method: requestData.method,
                        url: requestData.url,
                        headers: {
                            authorization: `Bearer ${validToken}`,
                        },
                    };
                    const mockResponse = {
                        status: jest.fn().mockReturnThis(),
                        json: jest.fn().mockReturnThis(),
                    };
                    const mockNext = jest.fn();
                    // Call the authentication middleware
                    (0, auth_1.authenticateToken)(mockRequest, mockResponse, mockNext);
                    // Verify consistent behavior across all requests
                    expect(mockResponse.status).not.toHaveBeenCalled();
                    expect(mockResponse.json).not.toHaveBeenCalled();
                    expect(mockNext).toHaveBeenCalled();
                    // Verify consistent user data
                    expect(mockRequest.user).toBeDefined();
                    expect(mockRequest.user.userId).toBe(userData.userId);
                    expect(mockRequest.user.email).toBe(userData.email);
                    expect(mockRequest.user.role).toBe(userData.role);
                }
            }), { numRuns: 10 });
        });
    });
});
//# sourceMappingURL=auth.property.test.js.map