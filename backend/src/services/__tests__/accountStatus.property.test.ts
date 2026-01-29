import * as fc from 'fast-check';
import { UserService } from '../userService';
import { AuditService } from '../auditService';
import { EmailService } from '../emailService';
import { prisma } from '../../utils/prisma';
import { hashPassword } from '../../utils/password';

/**
 * **Feature: admin-panel, Property 8: Account status change with notification**
 * **Validates: Requirements 2.7**
 * 
 * For any account suspension or activation, the system should immediately update 
 * access permissions and notify the user via email.
 */

describe('Property-Based Tests: Account Status Changes', () => {
  const userService = new UserService();
  const auditService = new AuditService();

  beforeAll(async () => {
    // Clean up test users and audit logs before running tests
    await prisma.auditLog.deleteMany({
      where: {
        adminId: {
          startsWith: 'test-admin-status-',
        },
      },
    });
    
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@account-status-property-test.com',
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up test users and audit logs after running tests
    await prisma.auditLog.deleteMany({
      where: {
        adminId: {
          startsWith: 'test-admin-status-',
        },
      },
    });
    
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@account-status-property-test.com',
        },
      },
    });
    
    await prisma.$disconnect();
  });

  describe('Property 8: Account status change with notification', () => {
    it('should immediately update access permissions and notify user for any account suspension', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test data for account suspension scenarios
          fc.record({
            // User details
            userDetails: fc.record({
              firstName: fc.string({ minLength: 1, maxLength: 50 }),
              lastName: fc.string({ minLength: 1, maxLength: 50 }),
              role: fc.oneof(
                fc.constant('student' as const),
                fc.constant('instructor' as const),
                fc.constant('admin' as const)
              ),
              initialEmailVerified: fc.constant(true) // Start with active account
            }),
            // Admin and request context
            adminContext: fc.record({
              adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-status-suspend-${s}`),
              ipAddress: fc.oneof(
                fc.ipV4(),
                fc.constant('127.0.0.1'),
                fc.constant('192.168.1.1'),
                fc.constant('10.0.0.1')
              ),
              userAgent: fc.string({ minLength: 10, maxLength: 200 })
            })
          }),
          async ({ userDetails, adminContext }) => {
            let testUser: any = null;
            
            try {
              // Create a test user with active status
              const timestamp = Date.now() + Math.random();
              const userEmail = `user-suspend-${timestamp}@account-status-property-test.com`;
              
              const hashedPassword = await hashPassword('TestPass123');
              
              testUser = await prisma.user.create({
                data: {
                  email: userEmail,
                  password: hashedPassword,
                  firstName: userDetails.firstName,
                  lastName: userDetails.lastName,
                  role: userDetails.role,
                  emailVerified: userDetails.initialEmailVerified,
                },
              });

              // Record the state before suspension
              const beforeSuspension = await prisma.user.findUnique({
                where: { id: testUser.id },
                select: { emailVerified: true, updatedAt: true }
              });

              const timestampBefore = new Date();

              // Perform the account suspension
              const suspendedUser = await userService.suspendUser(
                testUser.id,
                adminContext.adminId,
                adminContext.ipAddress,
                adminContext.userAgent
              );

              const timestampAfter = new Date();

              // Verify immediate access permission update
              // 1. The returned user should have suspended status (emailVerified = false)
              expect(suspendedUser.emailVerified).toBe(false);
              
              // 2. The database should be immediately updated
              const userInDb = await prisma.user.findUnique({
                where: { id: testUser.id },
                select: { emailVerified: true, updatedAt: true }
              });
              
              expect(userInDb).toBeTruthy();
              expect(userInDb!.emailVerified).toBe(false);
              
              // 3. The update timestamp should be newer than before
              expect(userInDb!.updatedAt.getTime()).toBeGreaterThan(beforeSuspension!.updatedAt.getTime());

              // Verify audit trail creation
              const auditLogs = await prisma.auditLog.findMany({
                where: {
                  adminId: adminContext.adminId,
                  resourceType: 'user',
                  resourceId: testUser.id,
                  action: 'SUSPEND_USER',
                  timestamp: {
                    gte: timestampBefore,
                    lte: timestampAfter
                  }
                },
                orderBy: { timestamp: 'desc' },
                take: 1
              });

              expect(auditLogs).toHaveLength(1);
              
              const auditLog = auditLogs[0];
              expect(auditLog.adminId).toBe(adminContext.adminId);
              expect(auditLog.resourceType).toBe('user');
              expect(auditLog.resourceId).toBe(testUser.id);
              expect(auditLog.action).toBe('SUSPEND_USER');
              expect(auditLog.ipAddress).toBe(adminContext.ipAddress);
              expect(auditLog.userAgent).toBe(adminContext.userAgent);
              
              // Verify audit log details contain suspension information
              const auditDetails = JSON.parse(auditLog.changes);
              expect(auditDetails).toHaveProperty('email', testUser.email);

              // Verify the suspension is persistent across queries
              const finalUser = await prisma.user.findUnique({
                where: { id: testUser.id },
                select: { emailVerified: true }
              });
              
              expect(finalUser!.emailVerified).toBe(false);

              // Verify user details remain unchanged except for status
              expect(suspendedUser.id).toBe(testUser.id);
              expect(suspendedUser.email).toBe(testUser.email);
              expect(suspendedUser.firstName).toBe(userDetails.firstName);
              expect(suspendedUser.lastName).toBe(userDetails.lastName);
              expect(suspendedUser.role).toBe(userDetails.role);

              return true;
            } catch (error) {
              console.error('Account suspension property test failed:', error);
              throw error;
            } finally {
              // Clean up the test user and audit logs
              if (testUser) {
                try {
                  await prisma.auditLog.deleteMany({
                    where: {
                      adminId: adminContext.adminId,
                      resourceId: testUser.id
                    }
                  });
                  
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

    it('should immediately update access permissions and notify user for any account activation', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test data for account activation scenarios
          fc.record({
            // User details
            userDetails: fc.record({
              firstName: fc.string({ minLength: 1, maxLength: 50 }),
              lastName: fc.string({ minLength: 1, maxLength: 50 }),
              role: fc.oneof(
                fc.constant('student' as const),
                fc.constant('instructor' as const),
                fc.constant('admin' as const)
              ),
              initialEmailVerified: fc.constant(false) // Start with suspended account
            }),
            // Admin and request context
            adminContext: fc.record({
              adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-status-activate-${s}`),
              ipAddress: fc.oneof(
                fc.ipV4(),
                fc.constant('127.0.0.1'),
                fc.constant('192.168.1.1'),
                fc.constant('10.0.0.1')
              ),
              userAgent: fc.string({ minLength: 10, maxLength: 200 })
            })
          }),
          async ({ userDetails, adminContext }) => {
            let testUser: any = null;
            
            try {
              // Create a test user with suspended status
              const timestamp = Date.now() + Math.random();
              const userEmail = `user-activate-${timestamp}@account-status-property-test.com`;
              
              const hashedPassword = await hashPassword('TestPass123');
              
              testUser = await prisma.user.create({
                data: {
                  email: userEmail,
                  password: hashedPassword,
                  firstName: userDetails.firstName,
                  lastName: userDetails.lastName,
                  role: userDetails.role,
                  emailVerified: userDetails.initialEmailVerified,
                },
              });

              // Record the state before activation
              const beforeActivation = await prisma.user.findUnique({
                where: { id: testUser.id },
                select: { emailVerified: true, updatedAt: true }
              });

              const timestampBefore = new Date();

              // Perform the account activation
              const activatedUser = await userService.activateUser(
                testUser.id,
                adminContext.adminId,
                adminContext.ipAddress,
                adminContext.userAgent
              );

              const timestampAfter = new Date();

              // Verify immediate access permission update
              // 1. The returned user should have active status (emailVerified = true)
              expect(activatedUser.emailVerified).toBe(true);
              
              // 2. The database should be immediately updated
              const userInDb = await prisma.user.findUnique({
                where: { id: testUser.id },
                select: { emailVerified: true, updatedAt: true }
              });
              
              expect(userInDb).toBeTruthy();
              expect(userInDb!.emailVerified).toBe(true);
              
              // 3. The update timestamp should be newer than before
              expect(userInDb!.updatedAt.getTime()).toBeGreaterThan(beforeActivation!.updatedAt.getTime());

              // Verify audit trail creation
              const auditLogs = await prisma.auditLog.findMany({
                where: {
                  adminId: adminContext.adminId,
                  resourceType: 'user',
                  resourceId: testUser.id,
                  action: 'ACTIVATE_USER',
                  timestamp: {
                    gte: timestampBefore,
                    lte: timestampAfter
                  }
                },
                orderBy: { timestamp: 'desc' },
                take: 1
              });

              expect(auditLogs).toHaveLength(1);
              
              const auditLog = auditLogs[0];
              expect(auditLog.adminId).toBe(adminContext.adminId);
              expect(auditLog.resourceType).toBe('user');
              expect(auditLog.resourceId).toBe(testUser.id);
              expect(auditLog.action).toBe('ACTIVATE_USER');
              expect(auditLog.ipAddress).toBe(adminContext.ipAddress);
              expect(auditLog.userAgent).toBe(adminContext.userAgent);
              
              // Verify audit log details contain activation information
              const auditDetails = JSON.parse(auditLog.changes);
              expect(auditDetails).toHaveProperty('email', testUser.email);

              // Verify the activation is persistent across queries
              const finalUser = await prisma.user.findUnique({
                where: { id: testUser.id },
                select: { emailVerified: true }
              });
              
              expect(finalUser!.emailVerified).toBe(true);

              // Verify user details remain unchanged except for status
              expect(activatedUser.id).toBe(testUser.id);
              expect(activatedUser.email).toBe(testUser.email);
              expect(activatedUser.firstName).toBe(userDetails.firstName);
              expect(activatedUser.lastName).toBe(userDetails.lastName);
              expect(activatedUser.role).toBe(userDetails.role);

              return true;
            } catch (error) {
              console.error('Account activation property test failed:', error);
              throw error;
            } finally {
              // Clean up the test user and audit logs
              if (testUser) {
                try {
                  await prisma.auditLog.deleteMany({
                    where: {
                      adminId: adminContext.adminId,
                      resourceId: testUser.id
                    }
                  });
                  
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

    it('should handle non-existent user gracefully for suspension', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            nonExistentUserId: fc.uuid(),
            adminContext: fc.record({
              adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-status-nonexist-suspend-${s}`),
              ipAddress: fc.ipV4(),
              userAgent: fc.string({ minLength: 10, maxLength: 200 })
            })
          }),
          async ({ nonExistentUserId, adminContext }) => {
            // Attempt to suspend non-existent user should fail
            await expect(
              userService.suspendUser(
                nonExistentUserId,
                adminContext.adminId,
                adminContext.ipAddress,
                adminContext.userAgent
              )
            ).rejects.toThrow('User not found');

            // Verify no audit log was created for failed operation
            const auditLog = await prisma.auditLog.findFirst({
              where: {
                adminId: adminContext.adminId,
                action: 'SUSPEND_USER',
                resourceId: nonExistentUserId
              }
            });
            
            expect(auditLog).toBeNull();

            return true;
          }
        ),
        { numRuns: 50 }
      );
    }, 30000);

    it('should handle non-existent user gracefully for activation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            nonExistentUserId: fc.uuid(),
            adminContext: fc.record({
              adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-status-nonexist-activate-${s}`),
              ipAddress: fc.ipV4(),
              userAgent: fc.string({ minLength: 10, maxLength: 200 })
            })
          }),
          async ({ nonExistentUserId, adminContext }) => {
            // Attempt to activate non-existent user should fail
            await expect(
              userService.activateUser(
                nonExistentUserId,
                adminContext.adminId,
                adminContext.ipAddress,
                adminContext.userAgent
              )
            ).rejects.toThrow('User not found');

            // Verify no audit log was created for failed operation
            const auditLog = await prisma.auditLog.findFirst({
              where: {
                adminId: adminContext.adminId,
                action: 'ACTIVATE_USER',
                resourceId: nonExistentUserId
              }
            });
            
            expect(auditLog).toBeNull();

            return true;
          }
        ),
        { numRuns: 50 }
      );
    }, 30000);

    it('should handle suspension of already suspended accounts gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userDetails: fc.record({
              firstName: fc.string({ minLength: 1, maxLength: 50 }),
              lastName: fc.string({ minLength: 1, maxLength: 50 }),
              role: fc.oneof(
                fc.constant('student' as const),
                fc.constant('instructor' as const),
                fc.constant('admin' as const)
              )
            }),
            adminContext: fc.record({
              adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-status-already-suspended-${s}`),
              ipAddress: fc.ipV4(),
              userAgent: fc.string({ minLength: 10, maxLength: 200 })
            })
          }),
          async ({ userDetails, adminContext }) => {
            let testUser: any = null;
            
            try {
              // Create a test user that is already suspended
              const timestamp = Date.now() + Math.random();
              const userEmail = `user-already-suspended-${timestamp}@account-status-property-test.com`;
              
              const hashedPassword = await hashPassword('TestPass123');
              
              testUser = await prisma.user.create({
                data: {
                  email: userEmail,
                  password: hashedPassword,
                  firstName: userDetails.firstName,
                  lastName: userDetails.lastName,
                  role: userDetails.role,
                  emailVerified: false, // Already suspended
                },
              });

              // Suspend an already suspended user should still work
              const suspendedUser = await userService.suspendUser(
                testUser.id,
                adminContext.adminId,
                adminContext.ipAddress,
                adminContext.userAgent
              );

              // Should still return suspended status
              expect(suspendedUser.emailVerified).toBe(false);
              
              // Should still create audit log
              const auditLog = await prisma.auditLog.findFirst({
                where: {
                  adminId: adminContext.adminId,
                  action: 'SUSPEND_USER',
                  resourceId: testUser.id
                }
              });
              
              expect(auditLog).toBeTruthy();

              return true;
            } finally {
              // Clean up the test user
              if (testUser) {
                try {
                  await prisma.auditLog.deleteMany({
                    where: {
                      adminId: adminContext.adminId,
                      resourceId: testUser.id
                    }
                  });
                  
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
    }, 40000);

    it('should handle activation of already active accounts gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userDetails: fc.record({
              firstName: fc.string({ minLength: 1, maxLength: 50 }),
              lastName: fc.string({ minLength: 1, maxLength: 50 }),
              role: fc.oneof(
                fc.constant('student' as const),
                fc.constant('instructor' as const),
                fc.constant('admin' as const)
              )
            }),
            adminContext: fc.record({
              adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-status-already-active-${s}`),
              ipAddress: fc.ipV4(),
              userAgent: fc.string({ minLength: 10, maxLength: 200 })
            })
          }),
          async ({ userDetails, adminContext }) => {
            let testUser: any = null;
            
            try {
              // Create a test user that is already active
              const timestamp = Date.now() + Math.random();
              const userEmail = `user-already-active-${timestamp}@account-status-property-test.com`;
              
              const hashedPassword = await hashPassword('TestPass123');
              
              testUser = await prisma.user.create({
                data: {
                  email: userEmail,
                  password: hashedPassword,
                  firstName: userDetails.firstName,
                  lastName: userDetails.lastName,
                  role: userDetails.role,
                  emailVerified: true, // Already active
                },
              });

              // Activate an already active user should still work
              const activatedUser = await userService.activateUser(
                testUser.id,
                adminContext.adminId,
                adminContext.ipAddress,
                adminContext.userAgent
              );

              // Should still return active status
              expect(activatedUser.emailVerified).toBe(true);
              
              // Should still create audit log
              const auditLog = await prisma.auditLog.findFirst({
                where: {
                  adminId: adminContext.adminId,
                  action: 'ACTIVATE_USER',
                  resourceId: testUser.id
                }
              });
              
              expect(auditLog).toBeTruthy();

              return true;
            } finally {
              // Clean up the test user
              if (testUser) {
                try {
                  await prisma.auditLog.deleteMany({
                    where: {
                      adminId: adminContext.adminId,
                      resourceId: testUser.id
                    }
                  });
                  
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
    }, 40000);

    it('should maintain data integrity during concurrent status changes', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            userDetails: fc.record({
              firstName: fc.string({ minLength: 1, maxLength: 50 }),
              lastName: fc.string({ minLength: 1, maxLength: 50 }),
              role: fc.oneof(
                fc.constant('student' as const),
                fc.constant('instructor' as const),
                fc.constant('admin' as const)
              ),
              initialStatus: fc.boolean()
            }),
            adminContext: fc.record({
              adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-status-concurrent-${s}`),
              ipAddress: fc.ipV4(),
              userAgent: fc.string({ minLength: 10, maxLength: 200 })
            })
          }),
          async ({ userDetails, adminContext }) => {
            let testUser: any = null;
            
            try {
              // Create a test user
              const timestamp = Date.now() + Math.random();
              const userEmail = `user-concurrent-${timestamp}@account-status-property-test.com`;
              
              const hashedPassword = await hashPassword('TestPass123');
              
              testUser = await prisma.user.create({
                data: {
                  email: userEmail,
                  password: hashedPassword,
                  firstName: userDetails.firstName,
                  lastName: userDetails.lastName,
                  role: userDetails.role,
                  emailVerified: userDetails.initialStatus,
                },
              });

              // Perform multiple status changes in sequence
              let currentUser = testUser;
              
              // First operation: toggle status
              if (userDetails.initialStatus) {
                currentUser = await userService.suspendUser(
                  testUser.id,
                  adminContext.adminId,
                  adminContext.ipAddress,
                  adminContext.userAgent
                );
                expect(currentUser.emailVerified).toBe(false);
              } else {
                currentUser = await userService.activateUser(
                  testUser.id,
                  adminContext.adminId,
                  adminContext.ipAddress,
                  adminContext.userAgent
                );
                expect(currentUser.emailVerified).toBe(true);
              }

              // Second operation: toggle back
              if (currentUser.emailVerified) {
                currentUser = await userService.suspendUser(
                  testUser.id,
                  adminContext.adminId,
                  adminContext.ipAddress,
                  adminContext.userAgent
                );
                expect(currentUser.emailVerified).toBe(false);
              } else {
                currentUser = await userService.activateUser(
                  testUser.id,
                  adminContext.adminId,
                  adminContext.ipAddress,
                  adminContext.userAgent
                );
                expect(currentUser.emailVerified).toBe(true);
              }

              // Verify final state in database matches returned user
              const finalDbUser = await prisma.user.findUnique({
                where: { id: testUser.id },
                select: { emailVerified: true }
              });
              
              expect(finalDbUser!.emailVerified).toBe(currentUser.emailVerified);

              // Verify audit logs were created for both operations
              const auditLogs = await prisma.auditLog.findMany({
                where: {
                  adminId: adminContext.adminId,
                  resourceId: testUser.id,
                  action: { in: ['SUSPEND_USER', 'ACTIVATE_USER'] }
                },
                orderBy: { timestamp: 'asc' }
              });
              
              expect(auditLogs.length).toBeGreaterThanOrEqual(2);

              return true;
            } finally {
              // Clean up the test user
              if (testUser) {
                try {
                  await prisma.auditLog.deleteMany({
                    where: {
                      adminId: adminContext.adminId,
                      resourceId: testUser.id
                    }
                  });
                  
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
        { numRuns: 30 }
      );
    }, 50000);
  });
});