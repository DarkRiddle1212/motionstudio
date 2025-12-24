import * as fc from 'fast-check';
import { UserService } from '../userService';
import { AuditService } from '../auditService';
import { prisma } from '../../utils/prisma';
import { hashPassword } from '../../utils/password';

/**
 * **Feature: admin-panel, Property 7: Role change with immediate permission update**
 * **Validates: Requirements 2.6**
 * 
 * For any user role change, the system should immediately update the user's permissions 
 * and send a notification email
 */

describe('Property-Based Tests: Role Change Service', () => {
  const userService = new UserService();
  const auditService = new AuditService();

  beforeAll(async () => {
    // Clean up test users and audit logs before running tests
    await prisma.auditLog.deleteMany({
      where: {
        adminId: {
          startsWith: 'test-admin-role-change-',
        },
      },
    });
    
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@role-change-property-test.com',
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up test users and audit logs after running tests
    await prisma.auditLog.deleteMany({
      where: {
        adminId: {
          startsWith: 'test-admin-role-change-',
        },
      },
    });
    
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@role-change-property-test.com',
        },
      },
    });
    
    await prisma.$disconnect();
  });

  describe('Property 7: Role change with immediate permission update', () => {
    it('should immediately update user permissions and create audit trail for any role change', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test data for role change scenarios
          fc.record({
            // Original user data
            originalRole: fc.oneof(
              fc.constant('student' as const),
              fc.constant('instructor' as const),
              fc.constant('admin' as const)
            ),
            // New role (must be different from original)
            newRole: fc.oneof(
              fc.constant('student' as const),
              fc.constant('instructor' as const),
              fc.constant('admin' as const)
            ),
            // User details
            userDetails: fc.record({
              firstName: fc.string({ minLength: 1, maxLength: 50 }),
              lastName: fc.string({ minLength: 1, maxLength: 50 }),
              emailVerified: fc.boolean()
            }),
            // Admin and request context
            adminContext: fc.record({
              adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-role-change-${s}`),
              ipAddress: fc.oneof(
                fc.ipV4(),
                fc.constant('127.0.0.1'),
                fc.constant('192.168.1.1')
              ),
              userAgent: fc.string({ minLength: 10, maxLength: 200 })
            })
          }),
          async ({ originalRole, newRole, userDetails, adminContext }) => {
            // Skip if roles are the same (no change needed)
            if (originalRole === newRole) {
              return true;
            }

            let testUser: any = null;
            
            try {
              // Create a test user with original role
              const timestamp = Date.now() + Math.random();
              const userEmail = `user-role-change-${timestamp}@role-change-property-test.com`;
              
              const hashedPassword = await hashPassword('TestPass123');
              
              testUser = await prisma.user.create({
                data: {
                  email: userEmail,
                  password: hashedPassword,
                  firstName: userDetails.firstName,
                  lastName: userDetails.lastName,
                  role: originalRole,
                  emailVerified: userDetails.emailVerified,
                },
              });

              // Record the state before role change
              const beforeChange = await prisma.user.findUnique({
                where: { id: testUser.id },
                select: { role: true, updatedAt: true }
              });

              // Perform the role change
              const updatedUser = await userService.changeUserRole(
                testUser.id,
                newRole,
                adminContext.adminId,
                adminContext.ipAddress,
                adminContext.userAgent
              );

              // Verify immediate permission update
              // 1. The returned user should have the new role
              expect(updatedUser.role).toBe(newRole);
              
              // 2. The database should be immediately updated
              const userInDb = await prisma.user.findUnique({
                where: { id: testUser.id },
                select: { role: true, updatedAt: true }
              });
              
              expect(userInDb).toBeTruthy();
              expect(userInDb!.role).toBe(newRole);
              
              // 3. The update timestamp should be newer than before
              expect(userInDb!.updatedAt.getTime()).toBeGreaterThan(beforeChange!.updatedAt.getTime());

              // Verify audit trail creation
              const auditLogs = await prisma.auditLog.findMany({
                where: {
                  adminId: adminContext.adminId,
                  resourceType: 'user',
                  resourceId: testUser.id,
                  action: 'CHANGE_USER_ROLE'
                },
                orderBy: { timestamp: 'desc' },
                take: 1
              });

              expect(auditLogs).toHaveLength(1);
              
              const auditLog = auditLogs[0];
              expect(auditLog.adminId).toBe(adminContext.adminId);
              expect(auditLog.resourceType).toBe('user');
              expect(auditLog.resourceId).toBe(testUser.id);
              expect(auditLog.action).toBe('CHANGE_USER_ROLE');
              expect(auditLog.ipAddress).toBe(adminContext.ipAddress);
              expect(auditLog.userAgent).toBe(adminContext.userAgent);
              
              // Verify audit log details contain role change information
              const auditDetails = JSON.parse(auditLog.changes);
              expect(auditDetails).toHaveProperty('email', testUser.email);
              expect(auditDetails).toHaveProperty('oldRole', originalRole);
              expect(auditDetails).toHaveProperty('newRole', newRole);

              // Verify the role change is persistent across queries
              const finalUser = await prisma.user.findUnique({
                where: { id: testUser.id },
                select: { role: true }
              });
              
              expect(finalUser!.role).toBe(newRole);

              return true;
            } catch (error) {
              console.error('Property test failed:', error);
              throw error;
            } finally {
              // Clean up the test user
              if (testUser) {
                try {
                  await prisma.user.delete({
                    where: { id: testUser.id }
                  });
                } catch (cleanupError) {
                  console.warn('Failed to clean up test user:', cleanupError);
                }
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for property test

    it('should reject role changes to the same role', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            role: fc.oneof(
              fc.constant('student' as const),
              fc.constant('instructor' as const),
              fc.constant('admin' as const)
            ),
            userDetails: fc.record({
              firstName: fc.string({ minLength: 1, maxLength: 50 }),
              lastName: fc.string({ minLength: 1, maxLength: 50 }),
              emailVerified: fc.boolean()
            }),
            adminContext: fc.record({
              adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-role-same-${s}`),
              ipAddress: fc.ipV4(),
              userAgent: fc.string({ minLength: 10, maxLength: 200 })
            })
          }),
          async ({ role, userDetails, adminContext }) => {
            let testUser: any = null;
            
            try {
              // Create a test user
              const timestamp = Date.now() + Math.random();
              const userEmail = `user-same-role-${timestamp}@role-change-property-test.com`;
              
              const hashedPassword = await hashPassword('TestPass123');
              
              testUser = await prisma.user.create({
                data: {
                  email: userEmail,
                  password: hashedPassword,
                  firstName: userDetails.firstName,
                  lastName: userDetails.lastName,
                  role: role,
                  emailVerified: userDetails.emailVerified,
                },
              });

              // Attempt to change role to the same role should fail
              await expect(
                userService.changeUserRole(
                  testUser.id,
                  role, // Same role
                  adminContext.adminId,
                  adminContext.ipAddress,
                  adminContext.userAgent
                )
              ).rejects.toThrow('User already has this role');

              return true;
            } finally {
              // Clean up the test user
              if (testUser) {
                try {
                  await prisma.user.delete({
                    where: { id: testUser.id }
                  });
                } catch (cleanupError) {
                  console.warn('Failed to clean up test user:', cleanupError);
                }
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    }, 30000);

    it('should handle non-existent user gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            nonExistentUserId: fc.uuid(),
            newRole: fc.oneof(
              fc.constant('student' as const),
              fc.constant('instructor' as const),
              fc.constant('admin' as const)
            ),
            adminContext: fc.record({
              adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-role-nonexist-${s}`),
              ipAddress: fc.ipV4(),
              userAgent: fc.string({ minLength: 10, maxLength: 200 })
            })
          }),
          async ({ nonExistentUserId, newRole, adminContext }) => {
            // Attempt to change role for non-existent user should fail
            await expect(
              userService.changeUserRole(
                nonExistentUserId,
                newRole,
                adminContext.adminId,
                adminContext.ipAddress,
                adminContext.userAgent
              )
            ).rejects.toThrow('User not found');

            return true;
          }
        ),
        { numRuns: 30 }
      );
    });

    it('should validate role values', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            validRole: fc.oneof(
              fc.constant('student' as const),
              fc.constant('instructor' as const),
              fc.constant('admin' as const)
            ),
            userDetails: fc.record({
              firstName: fc.string({ minLength: 1, maxLength: 50 }),
              lastName: fc.string({ minLength: 1, maxLength: 50 }),
              emailVerified: fc.boolean()
            }),
            adminContext: fc.record({
              adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-role-valid-${s}`),
              ipAddress: fc.ipV4(),
              userAgent: fc.string({ minLength: 10, maxLength: 200 })
            })
          }),
          async ({ validRole, userDetails, adminContext }) => {
            let testUser: any = null;
            
            try {
              // Create a test user with a different role
              const originalRole = validRole === 'student' ? 'instructor' : 'student';
              const timestamp = Date.now() + Math.random();
              const userEmail = `user-role-valid-${timestamp}@role-change-property-test.com`;
              
              const hashedPassword = await hashPassword('TestPass123');
              
              testUser = await prisma.user.create({
                data: {
                  email: userEmail,
                  password: hashedPassword,
                  firstName: userDetails.firstName,
                  lastName: userDetails.lastName,
                  role: originalRole,
                  emailVerified: userDetails.emailVerified,
                },
              });

              // Valid role change should succeed
              const updatedUser = await userService.changeUserRole(
                testUser.id,
                validRole,
                adminContext.adminId,
                adminContext.ipAddress,
                adminContext.userAgent
              );

              expect(updatedUser.role).toBe(validRole);

              return true;
            } finally {
              // Clean up the test user
              if (testUser) {
                try {
                  await prisma.user.delete({
                    where: { id: testUser.id }
                  });
                } catch (cleanupError) {
                  console.warn('Failed to clean up test user:', cleanupError);
                }
              }
            }
          }
        ),
        { numRuns: 50 }
      );
    }, 30000);
  });
});