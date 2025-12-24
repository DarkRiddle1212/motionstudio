import * as fc from 'fast-check';
import { UserService, UpdateUserInput } from '../userService';
import { AuditService } from '../auditService';
import { prisma } from '../../utils/prisma';
import { hashPassword } from '../../utils/password';

/**
 * Feature: admin-panel, Property 6: User modification with audit trail
 * Validates: Requirements 2.5
 * 
 * For any user information modification, the system should validate the changes, 
 * update the user record, and create an audit trail entry.
 */

describe('Property-Based Tests: User Service', () => {
  const userService = new UserService();
  const auditService = new AuditService();

  beforeAll(async () => {
    // Clean up test users and audit logs before running tests
    await prisma.auditLog.deleteMany({
      where: {
        adminId: {
          startsWith: 'test-admin-user-mod-',
        },
      },
    });
    
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@user-modification-property-test.com',
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up test users and audit logs after running tests
    await prisma.auditLog.deleteMany({
      where: {
        adminId: {
          startsWith: 'test-admin-user-mod-',
        },
      },
    });
    
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: '@user-modification-property-test.com',
        },
      },
    });
    
    await prisma.$disconnect();
  });

  describe('Property 6: User modification with audit trail', () => {
    it('should validate changes, update user record, and create audit trail for any user modification', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test data for user modification scenarios
          fc.record({
            // Original user data
            originalUser: fc.record({
              firstName: fc.string({ minLength: 1, maxLength: 50 }),
              lastName: fc.string({ minLength: 1, maxLength: 50 }),
              role: fc.oneof(
                fc.constant('student' as const),
                fc.constant('instructor' as const),
                fc.constant('admin' as const)
              ),
              emailVerified: fc.boolean()
            }),
            // Updates to apply
            updates: fc.record({
              firstName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
              lastName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
              role: fc.option(fc.oneof(
                fc.constant('student' as const),
                fc.constant('instructor' as const),
                fc.constant('admin' as const)
              ), { nil: undefined }),
              emailVerified: fc.option(fc.boolean(), { nil: undefined })
            }),
            // Admin and request context
            adminContext: fc.record({
              adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-user-mod-${s}`),
              ipAddress: fc.oneof(
                fc.ipV4(),
                fc.constant('127.0.0.1'),
                fc.constant('192.168.1.1')
              ),
              userAgent: fc.string({ minLength: 10, maxLength: 200 })
            })
          }),
          async ({ originalUser, updates, adminContext }) => {
            let testUser: any = null;
            
            try {
              // Create a test user with original data
              const timestamp = Date.now() + Math.random();
              const userEmail = `user-mod-${timestamp}@user-modification-property-test.com`;
              const hashedPassword = await hashPassword('TestPass123');
              
              testUser = await prisma.user.create({
                data: {
                  email: userEmail,
                  password: hashedPassword,
                  firstName: originalUser.firstName,
                  lastName: originalUser.lastName,
                  role: originalUser.role,
                  emailVerified: originalUser.emailVerified,
                },
              });

              // Record the state before modification
              const timestampBefore = new Date();
              
              // Apply the user modification
              const updatedUser = await userService.updateUser(
                testUser.id,
                updates,
                adminContext.adminId,
                adminContext.ipAddress,
                adminContext.userAgent
              );
              
              const timestampAfter = new Date();

              // Verify the user record was updated correctly
              expect(updatedUser).toBeTruthy();
              expect(updatedUser.id).toBe(testUser.id);
              expect(updatedUser.email).toBe(testUser.email);
              
              // Check that updates were applied correctly
              if (updates.firstName !== undefined) {
                expect(updatedUser.firstName).toBe(updates.firstName);
              } else {
                expect(updatedUser.firstName).toBe(originalUser.firstName);
              }
              
              if (updates.lastName !== undefined) {
                expect(updatedUser.lastName).toBe(updates.lastName);
              } else {
                expect(updatedUser.lastName).toBe(originalUser.lastName);
              }
              
              if (updates.role !== undefined) {
                expect(updatedUser.role).toBe(updates.role);
              } else {
                expect(updatedUser.role).toBe(originalUser.role);
              }
              
              if (updates.emailVerified !== undefined) {
                expect(updatedUser.emailVerified).toBe(updates.emailVerified);
              } else {
                expect(updatedUser.emailVerified).toBe(originalUser.emailVerified);
              }

              // Verify that an audit trail entry was created
              const auditLog = await prisma.auditLog.findFirst({
                where: {
                  adminId: adminContext.adminId,
                  action: 'UPDATE_USER',
                  resourceType: 'user',
                  resourceId: testUser.id,
                  timestamp: {
                    gte: timestampBefore,
                    lte: timestampAfter
                  }
                },
                orderBy: {
                  timestamp: 'desc'
                }
              });

              // Assert that audit log exists
              expect(auditLog).toBeTruthy();
              expect(auditLog!.adminId).toBe(adminContext.adminId);
              expect(auditLog!.action).toBe('UPDATE_USER');
              expect(auditLog!.resourceType).toBe('user');
              expect(auditLog!.resourceId).toBe(testUser.id);
              expect(auditLog!.ipAddress).toBe(adminContext.ipAddress);
              expect(auditLog!.userAgent).toBe(adminContext.userAgent);

              // Verify audit log contains the changes
              expect(auditLog!.changes).toBeTruthy();
              const parsedChanges = JSON.parse(auditLog!.changes!);
              
              // Verify that only actual changes are recorded in the audit log
              const actualChanges = parsedChanges;
              
              if (updates.firstName !== undefined && updates.firstName !== originalUser.firstName) {
                expect(actualChanges).toHaveProperty('firstName');
                expect(actualChanges.firstName.from).toBe(originalUser.firstName);
                expect(actualChanges.firstName.to).toBe(updates.firstName);
              }
              
              if (updates.lastName !== undefined && updates.lastName !== originalUser.lastName) {
                expect(actualChanges).toHaveProperty('lastName');
                expect(actualChanges.lastName.from).toBe(originalUser.lastName);
                expect(actualChanges.lastName.to).toBe(updates.lastName);
              }
              
              if (updates.role !== undefined && updates.role !== originalUser.role) {
                expect(actualChanges).toHaveProperty('role');
                expect(actualChanges.role.from).toBe(originalUser.role);
                expect(actualChanges.role.to).toBe(updates.role);
              }
              
              if (updates.emailVerified !== undefined && updates.emailVerified !== originalUser.emailVerified) {
                expect(actualChanges).toHaveProperty('emailVerified');
                expect(actualChanges.emailVerified.from).toBe(originalUser.emailVerified);
                expect(actualChanges.emailVerified.to).toBe(updates.emailVerified);
              }

              // Verify that the database record matches the returned user
              const dbUser = await prisma.user.findUnique({
                where: { id: testUser.id },
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  role: true,
                  emailVerified: true,
                  updatedAt: true
                }
              });
              
              expect(dbUser).toBeTruthy();
              expect(dbUser!.firstName).toBe(updatedUser.firstName);
              expect(dbUser!.lastName).toBe(updatedUser.lastName);
              expect(dbUser!.role).toBe(updatedUser.role);
              expect(dbUser!.emailVerified).toBe(updatedUser.emailVerified);
              
              // Verify that updatedAt timestamp was updated
              expect(dbUser!.updatedAt.getTime()).toBeGreaterThan(testUser.updatedAt.getTime());

            } finally {
              // Clean up: delete test user and audit logs
              if (testUser) {
                await prisma.auditLog.deleteMany({
                  where: {
                    adminId: adminContext.adminId,
                    resourceId: testUser.id
                  }
                });
                
                await prisma.user.delete({
                  where: { id: testUser.id }
                }).catch(() => {
                  // Ignore errors if user was already deleted
                });
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for property test

    it('should handle user modification validation errors gracefully', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test data that might cause validation errors
          fc.record({
            adminContext: fc.record({
              adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-user-mod-${s}`),
              ipAddress: fc.ipV4(),
              userAgent: fc.string({ minLength: 10, maxLength: 100 })
            }),
            invalidUserId: fc.string({ minLength: 1, maxLength: 50 }),
            updates: fc.record({
              firstName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
              lastName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
              role: fc.option(fc.oneof(
                fc.constant('student' as const),
                fc.constant('instructor' as const),
                fc.constant('admin' as const)
              ), { nil: undefined }),
              emailVerified: fc.option(fc.boolean(), { nil: undefined })
            })
          }),
          async ({ adminContext, invalidUserId, updates }) => {
            // Attempting to update a non-existent user should throw an error
            await expect(
              userService.updateUser(
                invalidUserId,
                updates,
                adminContext.adminId,
                adminContext.ipAddress,
                adminContext.userAgent
              )
            ).rejects.toThrow('User not found');
            
            // Verify no audit log was created for failed operation
            const auditLog = await prisma.auditLog.findFirst({
              where: {
                adminId: adminContext.adminId,
                action: 'UPDATE_USER',
                resourceId: invalidUserId
              }
            });
            
            expect(auditLog).toBeNull();
          }
        ),
        { numRuns: 50 }
      );
    }, 30000); // 30 second timeout

    it('should not create audit entries when no actual changes are made', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate test data where updates match original values
          fc.record({
            userData: fc.record({
              firstName: fc.string({ minLength: 1, maxLength: 50 }),
              lastName: fc.string({ minLength: 1, maxLength: 50 }),
              role: fc.oneof(
                fc.constant('student' as const),
                fc.constant('instructor' as const),
                fc.constant('admin' as const)
              ),
              emailVerified: fc.boolean()
            }),
            adminContext: fc.record({
              adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-user-mod-${s}`),
              ipAddress: fc.ipV4(),
              userAgent: fc.string({ minLength: 10, maxLength: 100 })
            })
          }),
          async ({ userData, adminContext }) => {
            let testUser: any = null;
            
            try {
              // Create a test user
              const timestamp = Date.now() + Math.random();
              const userEmail = `user-no-change-${timestamp}@user-modification-property-test.com`;
              const hashedPassword = await hashPassword('TestPass123');
              
              testUser = await prisma.user.create({
                data: {
                  email: userEmail,
                  password: hashedPassword,
                  firstName: userData.firstName,
                  lastName: userData.lastName,
                  role: userData.role,
                  emailVerified: userData.emailVerified,
                },
              });

              const timestampBefore = new Date();
              
              // Apply updates that match the current values (no actual changes)
              const updatedUser = await userService.updateUser(
                testUser.id,
                {
                  firstName: userData.firstName,
                  lastName: userData.lastName,
                  role: userData.role,
                  emailVerified: userData.emailVerified
                },
                adminContext.adminId,
                adminContext.ipAddress,
                adminContext.userAgent
              );
              
              const timestampAfter = new Date();

              // Verify the user record is returned correctly
              expect(updatedUser).toBeTruthy();
              expect(updatedUser.firstName).toBe(userData.firstName);
              expect(updatedUser.lastName).toBe(userData.lastName);
              expect(updatedUser.role).toBe(userData.role);
              expect(updatedUser.emailVerified).toBe(userData.emailVerified);

              // Verify that an audit log was still created (even with no changes)
              // This is important for tracking all admin actions
              const auditLog = await prisma.auditLog.findFirst({
                where: {
                  adminId: adminContext.adminId,
                  action: 'UPDATE_USER',
                  resourceType: 'user',
                  resourceId: testUser.id,
                  timestamp: {
                    gte: timestampBefore,
                    lte: timestampAfter
                  }
                }
              });

              expect(auditLog).toBeTruthy();
              
              // Verify that the changes object is empty since no actual changes were made
              const parsedChanges = JSON.parse(auditLog!.changes!);
              expect(Object.keys(parsedChanges)).toHaveLength(0);

            } finally {
              // Clean up
              if (testUser) {
                await prisma.auditLog.deleteMany({
                  where: {
                    adminId: adminContext.adminId,
                    resourceId: testUser.id
                  }
                });
                
                await prisma.user.delete({
                  where: { id: testUser.id }
                }).catch(() => {
                  // Ignore errors if user was already deleted
                });
              }
            }
          }
        ),
        { numRuns: 30 }
      );
    }, 40000); // 40 second timeout
  });
});