import { prisma } from '../utils/prisma';
import { AuditService } from './auditService';
import { EmailService } from './emailService';
import { UserService } from './userService';
import { CourseService } from './courseService';

export interface BulkUserOperation {
  type: 'role_change' | 'status_update' | 'delete' | 'email_notification';
  userIds: string[];
  data?: {
    role?: 'student' | 'instructor' | 'admin';
    status?: 'active' | 'suspended';
    emailSubject?: string;
    emailContent?: string;
  };
}

export interface BulkCourseOperation {
  type: 'publish' | 'unpublish' | 'archive' | 'delete';
  courseIds: string[];
}

export interface DataExportRequest {
  type: 'users' | 'courses' | 'payments' | 'analytics' | 'comprehensive';
  format: 'csv' | 'json' | 'xlsx';
  filters?: {
    dateRange?: { start: Date; end: Date };
    userRole?: string;
    courseStatus?: string;
    paymentStatus?: string;
  };
}

export interface DataImportRequest {
  type: 'users' | 'courses';
  data: any[];
  options?: {
    skipDuplicates?: boolean;
    validateOnly?: boolean;
  };
}

export interface ScheduledOperation {
  id: string;
  type: 'bulk_user' | 'bulk_course' | 'data_export';
  operation: BulkUserOperation | BulkCourseOperation | DataExportRequest;
  scheduledFor: Date;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  result?: any;
  error?: string;
  createdBy: string;
  createdAt: Date;
}

export class BulkOperationsService {
  private auditService: AuditService;
  private emailService: EmailService;
  private userService: UserService;
  private courseService: CourseService;

  constructor() {
    this.auditService = new AuditService();
    this.emailService = new EmailService();
    this.userService = new UserService();
    this.courseService = new CourseService();
  }

  async executeBulkUserOperation(
    operation: BulkUserOperation,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const results = {
      successful: [] as string[],
      failed: [] as { userId: string; error: string }[],
      total: operation.userIds.length,
    };

    // Log the bulk operation start
    await this.auditService.logAdminAction({
      adminId,
      action: `BULK_USER_${operation.type.toUpperCase()}`,
      resourceType: 'user',
      resourceId: 'bulk',
      details: {
        operation: operation.type,
        userCount: operation.userIds.length,
        data: operation.data,
      },
      ipAddress,
      userAgent,
    });

    for (const userId of operation.userIds) {
      try {
        switch (operation.type) {
          case 'role_change':
            if (!operation.data?.role) {
              throw new Error('Role is required for role change operation');
            }
            await this.userService.changeUserRole(
              userId,
              operation.data.role,
              adminId,
              ipAddress,
              userAgent
            );
            break;

          case 'status_update':
            if (!operation.data?.status) {
              throw new Error('Status is required for status update operation');
            }
            if (operation.data.status === 'suspended') {
              await this.userService.suspendUser(userId, adminId, ipAddress, userAgent);
            } else {
              await this.userService.activateUser(userId, adminId, ipAddress, userAgent);
            }
            break;

          case 'delete':
            await this.userService.deleteUser(userId, adminId, ipAddress, userAgent);
            break;

          case 'email_notification':
            if (!operation.data?.emailSubject || !operation.data?.emailContent) {
              throw new Error('Email subject and content are required for email notification');
            }
            const user = await prisma.user.findUnique({
              where: { id: userId },
              select: { email: true, firstName: true },
            });
            if (user) {
              await this.emailService.sendEmail({
                to: user.email,
                subject: operation.data.emailSubject,
                html: this.generateBulkEmailTemplate(
                  operation.data.emailContent,
                  user.firstName || undefined
                ),
                text: operation.data.emailContent,
              });
            }
            break;

          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }

        results.successful.push(userId);
      } catch (error) {
        results.failed.push({
          userId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  async executeBulkCourseOperation(
    operation: BulkCourseOperation,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const results = {
      successful: [] as string[],
      failed: [] as { courseId: string; error: string }[],
      total: operation.courseIds.length,
    };

    // Log the bulk operation start
    await this.auditService.logAdminAction({
      adminId,
      action: `BULK_COURSE_${operation.type.toUpperCase()}`,
      resourceType: 'course',
      resourceId: 'bulk',
      details: {
        operation: operation.type,
        courseCount: operation.courseIds.length,
      },
      ipAddress,
      userAgent,
    });

    for (const courseId of operation.courseIds) {
      try {
        switch (operation.type) {
          case 'publish':
            await prisma.course.update({
              where: { id: courseId },
              data: { isPublished: true },
            });
            break;

          case 'unpublish':
            await prisma.course.update({
              where: { id: courseId },
              data: { isPublished: false },
            });
            break;

          case 'archive':
            // For now, we'll use isPublished: false as archived
            // In a real app, you'd add an 'archived' field
            await prisma.course.update({
              where: { id: courseId },
              data: { isPublished: false },
            });
            break;

          case 'delete':
            // Check if course has enrollments
            const enrollmentCount = await prisma.enrollment.count({
              where: { courseId },
            });
            if (enrollmentCount > 0) {
              throw new Error('Cannot delete course with active enrollments');
            }
            await prisma.course.delete({
              where: { id: courseId },
            });
            break;

          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }

        results.successful.push(courseId);
      } catch (error) {
        results.failed.push({
          courseId,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  async exportData(
    request: DataExportRequest,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    // Log the export request
    await this.auditService.logAdminAction({
      adminId,
      action: 'DATA_EXPORT',
      resourceType: 'system',
      resourceId: 'export',
      details: {
        exportType: request.type,
        format: request.format,
        filters: request.filters,
      },
      ipAddress,
      userAgent,
    });

    let data: any[] = [];

    switch (request.type) {
      case 'users':
        data = await this.exportUsers(request.filters);
        break;
      case 'courses':
        data = await this.exportCourses(request.filters);
        break;
      case 'payments':
        data = await this.exportPayments(request.filters);
        break;
      case 'analytics':
        data = await this.exportAnalytics(request.filters);
        break;
      case 'comprehensive':
        data = await this.exportComprehensive(request.filters);
        break;
      default:
        throw new Error(`Unknown export type: ${request.type}`);
    }

    return {
      data,
      format: request.format,
      filename: `${request.type}_export_${new Date().toISOString().split('T')[0]}.${request.format}`,
      recordCount: data.length,
    };
  }

  async importData(
    request: DataImportRequest,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const results = {
      successful: 0,
      failed: [] as { row: number; error: string; data: any }[],
      total: request.data.length,
      duplicatesSkipped: 0,
    };

    // Log the import request
    await this.auditService.logAdminAction({
      adminId,
      action: 'DATA_IMPORT',
      resourceType: 'system',
      resourceId: 'import',
      details: {
        importType: request.type,
        recordCount: request.data.length,
        options: request.options,
      },
      ipAddress,
      userAgent,
    });

    for (let i = 0; i < request.data.length; i++) {
      const row = request.data[i];
      try {
        switch (request.type) {
          case 'users':
            await this.importUser(row, request.options, adminId, ipAddress, userAgent);
            break;
          case 'courses':
            await this.importCourse(row, request.options, adminId, ipAddress, userAgent);
            break;
          default:
            throw new Error(`Unknown import type: ${request.type}`);
        }
        results.successful++;
      } catch (error) {
        if (error instanceof Error && error.message.includes('already exists') && request.options?.skipDuplicates) {
          results.duplicatesSkipped++;
        } else {
          results.failed.push({
            row: i + 1,
            error: error instanceof Error ? error.message : 'Unknown error',
            data: row,
          });
        }
      }
    }

    return results;
  }

  async scheduleOperation(
    operation: BulkUserOperation | BulkCourseOperation | DataExportRequest,
    scheduledFor: Date,
    adminId: string
  ): Promise<ScheduledOperation> {
    const scheduledOp: ScheduledOperation = {
      id: `sched_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'operation' in operation ? 'bulk_user' : 'type' in operation && operation.type === 'users' ? 'data_export' : 'bulk_course',
      operation,
      scheduledFor,
      status: 'pending',
      createdBy: adminId,
      createdAt: new Date(),
    };

    // In a real app, you'd store this in the database and have a job scheduler
    // For now, we'll just return the scheduled operation
    return scheduledOp;
  }

  private async exportUsers(filters?: any) {
    const where: any = {};
    
    if (filters?.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }
    
    if (filters?.userRole) {
      where.role = filters.userRole;
    }

    return await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            enrollments: true,
            instructorCourses: true,
            payments: true,
          },
        },
      },
    });
  }

  private async exportCourses(filters?: any) {
    const where: any = {};
    
    if (filters?.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }
    
    if (filters?.courseStatus) {
      where.isPublished = filters.courseStatus === 'published';
    }

    return await prisma.course.findMany({
      where,
      include: {
        instructor: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
            assignments: true,
          },
        },
      },
    });
  }

  private async exportPayments(filters?: any) {
    const where: any = {};
    
    if (filters?.dateRange) {
      where.createdAt = {
        gte: filters.dateRange.start,
        lte: filters.dateRange.end,
      };
    }
    
    if (filters?.paymentStatus) {
      where.status = filters.paymentStatus;
    }

    return await prisma.payment.findMany({
      where,
      include: {
        student: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        course: {
          select: {
            title: true,
          },
        },
      },
    });
  }

  private async exportAnalytics(filters?: any) {
    // This would contain aggregated analytics data
    // For now, return basic metrics
    const userCount = await prisma.user.count();
    const courseCount = await prisma.course.count();
    const enrollmentCount = await prisma.enrollment.count();
    const paymentCount = await prisma.payment.count();

    return [{
      metric: 'platform_overview',
      totalUsers: userCount,
      totalCourses: courseCount,
      totalEnrollments: enrollmentCount,
      totalPayments: paymentCount,
      exportedAt: new Date(),
    }];
  }

  private async exportComprehensive(filters?: any) {
    const users = await this.exportUsers(filters);
    const courses = await this.exportCourses(filters);
    const payments = await this.exportPayments(filters);
    const analytics = await this.exportAnalytics(filters);

    return {
      users,
      courses,
      payments,
      analytics,
      exportedAt: new Date(),
    };
  }

  private async importUser(
    userData: any,
    options?: { skipDuplicates?: boolean; validateOnly?: boolean },
    adminId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Validate required fields
    if (!userData.email || !userData.firstName || !userData.lastName) {
      throw new Error('Email, firstName, and lastName are required');
    }

    // Check for duplicates
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    if (options?.validateOnly) {
      return { valid: true };
    }

    // Create user
    return await this.userService.createUser(
      {
        email: userData.email,
        password: userData.password || 'TempPassword123!',
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'student',
      },
      adminId || 'system',
      ipAddress || '127.0.0.1',
      userAgent || 'bulk-import'
    );
  }

  private async importCourse(
    courseData: any,
    options?: { skipDuplicates?: boolean; validateOnly?: boolean },
    adminId?: string,
    ipAddress?: string,
    userAgent?: string
  ) {
    // Validate required fields
    if (!courseData.title || !courseData.description || !courseData.instructorId) {
      throw new Error('Title, description, and instructorId are required');
    }

    // Check if instructor exists
    const instructor = await prisma.user.findUnique({
      where: { id: courseData.instructorId },
    });

    if (!instructor || instructor.role !== 'instructor') {
      throw new Error('Invalid instructor ID');
    }

    if (options?.validateOnly) {
      return { valid: true };
    }

    // Create course
    return await this.courseService.createCourse({
      title: courseData.title,
      description: courseData.description,
      instructorId: courseData.instructorId,
      duration: courseData.duration || '4 weeks',
      pricing: courseData.pricing || 0,
      currency: courseData.currency || 'USD',
      curriculum: courseData.curriculum || '',
      introVideoUrl: courseData.introVideoUrl,
      thumbnailUrl: courseData.thumbnailUrl,
    });
  }

  private generateBulkEmailTemplate(content: string, firstName?: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Motion Design Studio</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #2B2B2E;
            background-color: #F6C1CC;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .email-card {
            background-color: #F9D6DC;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo h1 {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            color: #2B2B2E;
            margin: 0;
        }
        .content {
            text-align: left;
        }
        .content p {
            font-size: 16px;
            color: #2B2B2E;
            margin-bottom: 20px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #C89AA6;
        }
        .footer p {
            font-size: 14px;
            color: #8A8A8E;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="email-card">
            <div class="logo">
                <h1>Motion Design Studio</h1>
            </div>
            
            <div class="content">
                ${firstName ? `<p>Dear ${firstName},</p>` : ''}
                ${content.split('\n').map(line => `<p>${line}</p>`).join('')}
            </div>
            
            <div class="footer">
                <p>Best regards,<br>Motion Design Studio Team</p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
  }
}