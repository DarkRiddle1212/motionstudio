import * as fc from 'fast-check';
import { AuditService, AuditLogEntry } from '../auditService';
import { prisma } from '../../utils/prisma';

/**
 * Feature: admin-panel, Property 3: Audit logging for admin actions
 * Validates: Requirements 1.5
 * 
 * For any administrative action performed, the system should create an audit log entry 
 * with timestamp, user identification, and action details.
 */

describe('Property-Based Tests: Audit Service', () => {
  const auditService = new AuditService();

  beforeAll(async () => {
    // Clean up test audit logs before running tests
    await prisma.auditLog.deleteMany({
      where: {
        adminId: {
          startsWith: 'test-admin-',
        },
      },
    });
  });

  afterAll(async () => {
    // Clean up test audit logs after running tests
    await prisma.auditLog.deleteMany({
      where: {
        adminId: {
          startsWith: 'test-admin-',
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('Property 3: Audit logging for admin actions', () => {
    it('should create audit log entry for any administrative action with required fields', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate random admin action data
          fc.record({
            adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-${s}`),
            action: fc.oneof(
              fc.constant('user_create'),
              fc.constant('user_update'),
              fc.constant('user_suspend'),
              fc.constant('course_publish'),
              fc.constant('course_unpublish'),
              fc.constant('payment_refund'),
              fc.constant('system_config_update'),
              fc.constant('project_create'),
              fc.constant('scholarship_grant')
            ),
            resourceType: fc.oneof(
              fc.constant('user'),
              fc.constant('course'),
              fc.constant('payment'),
              fc.constant('system'),
              fc.constant('project'),
              fc.constant('scholarship')
            ),
            resourceId: fc.string({ minLength: 1, maxLength: 50 }),
            changes: fc.option(fc.dictionary(
              fc.string({ minLength: 1, maxLength: 20 }),
              fc.record({
                from: fc.oneof(fc.string(), fc.integer(), fc.boolean()),
                to: fc.oneof(fc.string(), fc.integer(), fc.boolean())
              })
            ), { nil: undefined }),
            ipAddress: fc.oneof(
              fc.ipV4(),
              fc.ipV6(),
              fc.constant('127.0.0.1'),
              fc.constant('::1')
            ),
            userAgent: fc.string({ minLength: 10, maxLength: 200 }),
            details: fc.option(fc.dictionary(
              fc.string({ minLength: 1, maxLength: 20 }),
              fc.oneof(fc.string(), fc.integer(), fc.boolean())
            ), { nil: undefined })
          }),
          async (auditEntry: AuditLogEntry) => {
            const timestampBefore = new Date();
            
            // Log the administrative action
            await auditService.logAdminAction(auditEntry);
            
            const timestampAfter = new Date();
            
            // Verify that an audit log entry was created
            const createdLog = await prisma.auditLog.findFirst({
              where: {
                adminId: auditEntry.adminId,
                action: auditEntry.action,
                resourceType: auditEntry.resourceType,
                resourceId: auditEntry.resourceId,
              },
              orderBy: {
                timestamp: 'desc'
              }
            });
            
            // Assert that the log entry exists
            expect(createdLog).toBeTruthy();
            expect(createdLog!.adminId).toBe(auditEntry.adminId);
            expect(createdLog!.action).toBe(auditEntry.action);
            expect(createdLog!.resourceType).toBe(auditEntry.resourceType);
            expect(createdLog!.resourceId).toBe(auditEntry.resourceId);
            
            // Verify timestamp is within reasonable bounds
            expect(createdLog!.timestamp).toBeInstanceOf(Date);
            expect(createdLog!.timestamp.getTime()).toBeGreaterThanOrEqual(timestampBefore.getTime());
            expect(createdLog!.timestamp.getTime()).toBeLessThanOrEqual(timestampAfter.getTime());
            
            // Verify IP address and user agent are stored correctly
            expect(createdLog!.ipAddress).toBe(auditEntry.ipAddress);
            expect(createdLog!.userAgent).toBe(auditEntry.userAgent);
            
            // Verify changes are stored as JSON string and can be parsed
            if (auditEntry.changes) {
              expect(createdLog!.changes).toBeTruthy();
              const parsedChanges = JSON.parse(createdLog!.changes!);
              expect(parsedChanges).toEqual(auditEntry.changes);
            }
            
            // Clean up: delete the created log entry
            await prisma.auditLog.delete({
              where: { id: createdLog!.id }
            });
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for property test

    it('should handle audit logging failures gracefully without throwing errors', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate invalid audit entry data that might cause database errors
          fc.record({
            adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-${s}`),
            action: fc.string({ minLength: 1, maxLength: 100 }),
            resourceType: fc.string({ minLength: 1, maxLength: 50 }),
            resourceId: fc.string({ minLength: 1, maxLength: 50 }),
            changes: fc.option(fc.object(), { nil: undefined }),
            ipAddress: fc.string({ minLength: 1, maxLength: 100 }),
            userAgent: fc.string({ minLength: 1, maxLength: 500 }),
          }),
          async (auditEntry: AuditLogEntry) => {
            // The audit service should not throw errors even with problematic data
            // This ensures that audit logging failures don't break the main application flow
            await expect(auditService.logAdminAction(auditEntry)).resolves.not.toThrow();
          }
        ),
        { numRuns: 50 }
      );
    }, 20000); // 20 second timeout

    it('should create unique audit log entries for concurrent admin actions', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate multiple concurrent admin actions
          fc.array(
            fc.record({
              adminId: fc.string({ minLength: 1, maxLength: 50 }).map(s => `test-admin-${s}`),
              action: fc.oneof(
                fc.constant('user_create'),
                fc.constant('course_publish'),
                fc.constant('payment_refund')
              ),
              resourceType: fc.oneof(
                fc.constant('user'),
                fc.constant('course'),
                fc.constant('payment')
              ),
              resourceId: fc.string({ minLength: 1, maxLength: 50 }),
              ipAddress: fc.ipV4(),
              userAgent: fc.string({ minLength: 10, maxLength: 100 }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          async (auditEntries: AuditLogEntry[]) => {
            const timestampBefore = new Date();
            
            // Execute all audit logging operations concurrently
            await Promise.all(
              auditEntries.map(entry => auditService.logAdminAction(entry))
            );
            
            const timestampAfter = new Date();
            
            // Verify that all entries were created
            for (const entry of auditEntries) {
              const createdLog = await prisma.auditLog.findFirst({
                where: {
                  adminId: entry.adminId,
                  action: entry.action,
                  resourceType: entry.resourceType,
                  resourceId: entry.resourceId,
                  timestamp: {
                    gte: timestampBefore,
                    lte: timestampAfter
                  }
                }
              });
              
              expect(createdLog).toBeTruthy();
              expect(createdLog!.adminId).toBe(entry.adminId);
              expect(createdLog!.action).toBe(entry.action);
              expect(createdLog!.resourceType).toBe(entry.resourceType);
              expect(createdLog!.resourceId).toBe(entry.resourceId);
            }
            
            // Clean up: delete all created log entries
            await prisma.auditLog.deleteMany({
              where: {
                adminId: {
                  in: auditEntries.map(e => e.adminId)
                },
                timestamp: {
                  gte: timestampBefore,
                  lte: timestampAfter
                }
              }
            });
          }
        ),
        { numRuns: 20 }
      );
    }, 25000); // 25 second timeout
  });
});