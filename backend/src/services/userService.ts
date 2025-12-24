import { prisma } from '../utils/prisma';
import { hashPassword } from '../utils/password';
import { AuditService } from './auditService';
import { EmailService } from './emailService';

export interface UserFilters {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'instructor' | 'admin';
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  role?: 'student' | 'instructor' | 'admin';
  emailVerified?: boolean;
}

export class UserService {
  private auditService: AuditService;
  private emailService: EmailService;

  constructor() {
    this.auditService = new AuditService();
    this.emailService = new EmailService();
  }

  async getUsers(filters: UserFilters) {
    const {
      search,
      role,
      page = 1,
      pageSize = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = filters;

    const where: any = {};

    // Search filter - search by email, firstName, or lastName
    if (search) {
      where.OR = [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ];
    }

    // Role filter
    if (role) {
      where.role = role;
    }

    // Get total count
    const totalItems = await prisma.user.count({ where });

    // Get users with pagination
    const users = await prisma.user.findMany({
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
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return {
      users: users.map(user => ({
        ...user,
        enrollmentCount: user._count.enrollments,
        courseCount: user._count.instructorCourses,
        paymentCount: user._count.payments,
      })),
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
      },
    };
  }


  async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        enrollments: {
          select: {
            id: true,
            courseId: true,
            enrolledAt: true,
            progressPercentage: true,
            status: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { enrolledAt: 'desc' },
        },
        payments: {
          select: {
            id: true,
            amount: true,
            currency: true,
            status: true,
            createdAt: true,
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        instructorCourses: {
          select: {
            id: true,
            title: true,
            isPublished: true,
            _count: {
              select: {
                enrollments: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async createUser(input: CreateUserInput, adminId: string, ipAddress: string, userAgent: string) {
    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('Email already in use');
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        firstName: input.firstName,
        lastName: input.lastName,
        role: input.role,
        emailVerified: true, // Admin-created users are pre-verified
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
      },
    });

    // Log the action
    await this.auditService.logAdminAction({
      adminId,
      action: 'CREATE_USER',
      resourceType: 'user',
      resourceId: user.id,
      details: {
        email: user.email,
        role: user.role,
      },
      ipAddress,
      userAgent,
    });

    return user;
  }

  async updateUser(
    userId: string,
    input: UpdateUserInput,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    const changes: Record<string, { from: any; to: any }> = {};

    // Track changes for audit
    if (input.firstName !== undefined && input.firstName !== existingUser.firstName) {
      changes.firstName = { from: existingUser.firstName, to: input.firstName };
    }
    if (input.lastName !== undefined && input.lastName !== existingUser.lastName) {
      changes.lastName = { from: existingUser.lastName, to: input.lastName };
    }
    if (input.role !== undefined && input.role !== existingUser.role) {
      changes.role = { from: existingUser.role, to: input.role };
    }
    if (input.emailVerified !== undefined && input.emailVerified !== existingUser.emailVerified) {
      changes.emailVerified = { from: existingUser.emailVerified, to: input.emailVerified };
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Log the action with changes
    await this.auditService.logAdminAction({
      adminId,
      action: 'UPDATE_USER',
      resourceType: 'user',
      resourceId: user.id,
      changes,
      ipAddress,
      userAgent,
    });

    return user;
  }


  async changeUserRole(
    userId: string,
    newRole: 'student' | 'instructor' | 'admin',
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    if (existingUser.role === newRole) {
      throw new Error('User already has this role');
    }

    const oldRole = existingUser.role;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
      },
    });

    // Log the role change
    await this.auditService.logAdminAction({
      adminId,
      action: 'CHANGE_USER_ROLE',
      resourceType: 'user',
      resourceId: user.id,
      details: {
        email: user.email,
        oldRole,
        newRole,
      },
      ipAddress,
      userAgent,
    });

    return user;
  }

  async suspendUser(
    userId: string,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // For now, we'll use emailVerified as a proxy for account status
    // In a real app, you'd add a 'status' field to the User model
    const user = await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: false },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
      },
    });

    // Log the suspension
    await this.auditService.logAdminAction({
      adminId,
      action: 'SUSPEND_USER',
      resourceType: 'user',
      resourceId: user.id,
      details: { email: user.email },
      ipAddress,
      userAgent,
    });

    // Send suspension notification email
    try {
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Account Suspended - Motion Design Studio',
        html: this.generateSuspensionEmailTemplate(user.firstName || undefined),
        text: `Dear ${user.firstName || 'User'},

Your Motion Design Studio account has been suspended by an administrator.

If you believe this is an error or have questions about this action, please contact our support team at support@motionstudio.com.

Best regards,
Motion Design Studio Team`
      });
    } catch (error) {
      console.error('Failed to send suspension notification email:', error);
      // Don't throw error here - suspension was successful, just email failed
    }

    return user;
  }

  async activateUser(
    userId: string,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
      },
    });

    // Log the activation
    await this.auditService.logAdminAction({
      adminId,
      action: 'ACTIVATE_USER',
      resourceType: 'user',
      resourceId: user.id,
      details: { email: user.email },
      ipAddress,
      userAgent,
    });

    // Send activation notification email
    try {
      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Account Activated - Motion Design Studio',
        html: this.generateActivationEmailTemplate(user.firstName || undefined),
        text: `Dear ${user.firstName || 'User'},

Your Motion Design Studio account has been activated by an administrator.

You can now access all features of your account. Welcome back!

Best regards,
Motion Design Studio Team`
      });
    } catch (error) {
      console.error('Failed to send activation notification email:', error);
      // Don't throw error here - activation was successful, just email failed
    }

    return user;
  }

  async deleteUser(
    userId: string,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    // Prevent deleting yourself
    if (userId === adminId) {
      throw new Error('Cannot delete your own account');
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    // Log the deletion
    await this.auditService.logAdminAction({
      adminId,
      action: 'DELETE_USER',
      resourceType: 'user',
      resourceId: userId,
      details: { email: existingUser.email, role: existingUser.role },
      ipAddress,
      userAgent,
    });

    return { success: true };
  }

  private generateSuspensionEmailTemplate(firstName?: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Suspended - Motion Design Studio</title>
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
            text-align: center;
        }
        .content h2 {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            color: #2B2B2E;
            margin-bottom: 20px;
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
        .link {
            color: #C89AA6;
            text-decoration: none;
        }
        .link:hover {
            text-decoration: underline;
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
                <h2>Account Suspended</h2>
                
                <p>Dear ${firstName || 'User'},</p>
                
                <p>Your Motion Design Studio account has been suspended by an administrator.</p>
                
                <p>If you believe this is an error or have questions about this action, please contact our support team.</p>
            </div>
            
            <div class="footer">
                <p>Need help? Contact us at <a href="mailto:support@motionstudio.com" class="link">support@motionstudio.com</a></p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
  }

  private generateActivationEmailTemplate(firstName?: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Account Activated - Motion Design Studio</title>
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
            text-align: center;
        }
        .content h2 {
            font-family: 'Playfair Display', serif;
            font-size: 24px;
            color: #2B2B2E;
            margin-bottom: 20px;
        }
        .content p {
            font-size: 16px;
            color: #2B2B2E;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            background-color: #2B2B2E;
            color: #F9D6DC;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: background-color 0.3s ease;
        }
        .cta-button:hover {
            background-color: #C89AA6;
            color: #2B2B2E;
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
        .link {
            color: #C89AA6;
            text-decoration: none;
        }
        .link:hover {
            text-decoration: underline;
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
                <h2>Account Activated</h2>
                
                <p>Dear ${firstName || 'User'},</p>
                
                <p>Your Motion Design Studio account has been activated by an administrator.</p>
                
                <p>You can now access all features of your account. Welcome back!</p>
                
                <a href="${process.env.FRONTEND_URL}/courses" class="cta-button">Explore Courses</a>
            </div>
            
            <div class="footer">
                <p>Need help? Contact us at <a href="mailto:support@motionstudio.com" class="link">support@motionstudio.com</a></p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
  }
}
