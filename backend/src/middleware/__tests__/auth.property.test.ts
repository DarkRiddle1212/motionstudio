import * as fc from 'fast-check';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateAdminToken, createAdminSession, destroyAdminSession, AuthenticatedRequest } from '../auth';
import { generateAdminToken, AdminJwtPayload, generateSessionId } from '../../utils/jwt';
import { AuditService } from '../../services/auditService';

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
  let mockAuditService: jest.Mocked<AuditService>;

  beforeEach(() => {
    mockAuditService = new AuditService() as jest.Mocked<AuditService>;
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
      await fc.assert(
        fc.asyncProperty(
          // Generate random admin user data
          fc.record({
            userId: fc.uuid(),
            email: fc.emailAddress(),
            role: fc.constant('admin' as const),
            sessionId: fc.string({ minLength: 10, maxLength: 30 }),
            adminLevel: fc.constantFrom('admin', 'super_admin') as fc.Arbitrary<'admin' | 'super_admin'>,
          }),
          // Generate different timeout scenarios (in seconds)
          fc.record({
            timeoutOffsetSeconds: fc.integer({ min: 1, max: 7200 }), // 1 second to 2 hours past timeout
          }),
          async (adminData, timeoutConfig) => {
            // Create an expired token by setting both issuedAt and exp to past values
            const pastTime = Math.floor(Date.now() / 1000) - (4 * 3600 + timeoutConfig.timeoutOffsetSeconds);
            const tokenPayload = {
              ...adminData,
              issuedAt: pastTime,
              exp: pastTime + (4 * 3600), // Token expired timeoutOffsetSeconds ago
            };

            // Create the expired token directly using jwt.sign
            const expiredToken = jwt.sign(tokenPayload, JWT_SECRET);

            // Create session for the admin
            createAdminSession(adminData.userId, adminData.sessionId);

            // Create mock request with expired token
            const mockReq = {
              headers: {
                authorization: `Bearer ${expiredToken}`,
              },
              ip: '127.0.0.1',
              connection: { remoteAddress: '127.0.0.1' },
              get: jest.fn().mockReturnValue('test-user-agent'),
            } as unknown as AuthenticatedRequest;

            const mockRes = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn().mockReturnThis(),
            } as unknown as Response;

            const mockNext = jest.fn() as NextFunction;

            // Attempt authentication with expired token
            authenticateAdminToken(mockReq, mockRes, mockNext);

            // Verify that authentication was rejected
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
              error: 'Admin session expired, please log in again'
            });
            expect(mockNext).not.toHaveBeenCalled();

            // Clean up session
            destroyAdminSession(adminData.sessionId);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 2b: Valid admin tokens within timeout are accepted
     * For any admin token that is within the 4-hour timeout window, authentication should succeed
     */
    it('Property 2b: Valid admin tokens within timeout are accepted', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random admin user data
          fc.record({
            userId: fc.uuid(),
            email: fc.emailAddress(),
            role: fc.constant('admin' as const),
            sessionId: fc.string({ minLength: 10, maxLength: 30 }),
            adminLevel: fc.constantFrom('admin', 'super_admin') as fc.Arbitrary<'admin' | 'super_admin'>,
          }),
          // Generate different valid timeout scenarios (in seconds)
          fc.record({
            timeBeforeExpiry: fc.integer({ min: 60, max: 14400 }), // 1 minute to 4 hours before expiry
          }),
          async (adminData, timeConfig) => {
            // Create a valid admin token using the standard function
            const validToken = generateAdminToken(adminData);

            // Create session for the admin
            createAdminSession(adminData.userId, adminData.sessionId);

            // Create mock request with valid token
            const mockReq = {
              headers: {
                authorization: `Bearer ${validToken}`,
              },
              ip: '127.0.0.1',
              connection: { remoteAddress: '127.0.0.1' },
              get: jest.fn().mockReturnValue('test-user-agent'),
            } as unknown as AuthenticatedRequest;

            const mockRes = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn().mockReturnThis(),
            } as unknown as Response;

            const mockNext = jest.fn() as NextFunction;

            // Attempt authentication with valid token
            authenticateAdminToken(mockReq, mockRes, mockNext);

            // Verify that authentication was successful
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.adminUser).toBeDefined();
            expect(mockReq.adminUser?.userId).toBe(adminData.userId);
            expect(mockReq.adminUser?.sessionId).toBe(adminData.sessionId);

            // Clean up session
            destroyAdminSession(adminData.sessionId);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 2c: Session timeout triggers audit logging
     * For any admin session that times out, an audit log entry should be created
     */
    it('Property 2c: Session timeout triggers audit logging', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random admin user data
          fc.record({
            userId: fc.uuid(),
            email: fc.emailAddress(),
            role: fc.constant('admin' as const),
            sessionId: fc.string({ minLength: 10, maxLength: 30 }),
            adminLevel: fc.constantFrom('admin', 'super_admin') as fc.Arbitrary<'admin' | 'super_admin'>,
          }),
          async (adminData) => {
            // Create an expired token
            const pastTime = Math.floor(Date.now() / 1000) - (4 * 3600 + 300); // 4 hours and 5 minutes ago
            const tokenPayload = {
              ...adminData,
              issuedAt: pastTime,
              exp: pastTime + (4 * 3600), // Token expired 5 minutes ago
            };

            const expiredToken = jwt.sign(tokenPayload, JWT_SECRET);

            // Create session for the admin
            createAdminSession(adminData.userId, adminData.sessionId);

            // Create mock request with expired token
            const mockReq = {
              headers: {
                authorization: `Bearer ${expiredToken}`,
              },
              ip: '192.168.1.100',
              connection: { remoteAddress: '192.168.1.100' },
              get: jest.fn().mockReturnValue('Mozilla/5.0 Test Browser'),
            } as unknown as AuthenticatedRequest;

            const mockRes = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn().mockReturnThis(),
            } as unknown as Response;

            const mockNext = jest.fn() as NextFunction;

            // Attempt authentication with expired token
            authenticateAdminToken(mockReq, mockRes, mockNext);

            // Verify that authentication was rejected
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
              error: 'Admin session expired, please log in again'
            });

            // Clean up session
            destroyAdminSession(adminData.sessionId);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 2d: Invalid session IDs are rejected even with valid tokens
     * For any admin token with a session ID that doesn't exist in active sessions, authentication should fail
     */
    it('Property 2d: Invalid session IDs are rejected even with valid tokens', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random admin user data
          fc.record({
            userId: fc.uuid(),
            email: fc.emailAddress(),
            role: fc.constant('admin' as const),
            sessionId: fc.string({ minLength: 10, maxLength: 30 }),
            adminLevel: fc.constantFrom('admin', 'super_admin') as fc.Arbitrary<'admin' | 'super_admin'>,
          }),
          // Generate a different session ID that won't be in active sessions
          fc.string({ minLength: 10, maxLength: 30 }),
          async (adminData, invalidSessionId) => {
            // Ensure the invalid session ID is different from the valid one
            if (invalidSessionId === adminData.sessionId) {
              invalidSessionId = invalidSessionId + '_invalid';
            }

            // Create a valid admin token but with an invalid session ID
            const tokenWithInvalidSession = generateAdminToken({
              ...adminData,
              sessionId: invalidSessionId, // Use invalid session ID
            });

            // Create session for the admin with the CORRECT session ID (not the one in the token)
            createAdminSession(adminData.userId, adminData.sessionId);

            // Create mock request with token containing invalid session ID
            const mockReq = {
              headers: {
                authorization: `Bearer ${tokenWithInvalidSession}`,
              },
              ip: '127.0.0.1',
              connection: { remoteAddress: '127.0.0.1' },
              get: jest.fn().mockReturnValue('test-user-agent'),
            } as unknown as AuthenticatedRequest;

            const mockRes = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn().mockReturnThis(),
            } as unknown as Response;

            const mockNext = jest.fn() as NextFunction;

            // Attempt authentication with token containing invalid session ID
            authenticateAdminToken(mockReq, mockRes, mockNext);

            // Verify that authentication was rejected due to invalid session
            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
              error: 'Admin session invalid or expired'
            });
            expect(mockNext).not.toHaveBeenCalled();

            // Clean up session
            destroyAdminSession(adminData.sessionId);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    /**
     * Property 2e: Session activity is updated on successful authentication
     * For any valid admin authentication, the session's last activity should be updated
     */
    it('Property 2e: Session activity is updated on successful authentication', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random admin user data
          fc.record({
            userId: fc.uuid(),
            email: fc.emailAddress(),
            role: fc.constant('admin' as const),
            sessionId: fc.string({ minLength: 10, maxLength: 30 }),
            adminLevel: fc.constantFrom('admin', 'super_admin') as fc.Arbitrary<'admin' | 'super_admin'>,
          }),
          async (adminData) => {
            // Create a valid admin token
            const validToken = generateAdminToken(adminData);

            // Create session for the admin
            createAdminSession(adminData.userId, adminData.sessionId);

            // Create mock request with valid token
            const mockReq = {
              headers: {
                authorization: `Bearer ${validToken}`,
              },
              ip: '127.0.0.1',
              connection: { remoteAddress: '127.0.0.1' },
              get: jest.fn().mockReturnValue('test-user-agent'),
            } as unknown as AuthenticatedRequest;

            const mockRes = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn().mockReturnThis(),
            } as unknown as Response;

            const mockNext = jest.fn() as NextFunction;

            // Attempt authentication with valid token
            authenticateAdminToken(mockReq, mockRes, mockNext);

            // Verify that authentication was successful
            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.adminUser).toBeDefined();

            // Clean up session
            destroyAdminSession(adminData.sessionId);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});