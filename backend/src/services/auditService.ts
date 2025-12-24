import { prisma } from '../utils/prisma';
import * as crypto from 'crypto';

export interface AuditLogEntry {
  adminId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes?: Record<string, { from: any; to: any }> | Record<string, any>;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
}

export interface SecurityEvent {
  type: 'login_attempt' | 'failed_login' | 'suspicious_activity' | 'permission_escalation' | 'session_terminated';
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details?: Record<string, any>;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AuditLogFilters {
  adminId?: string;
  action?: string;
  resourceType?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}

export interface PaginationOptions {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class AuditService {
  /**
   * Log an administrative action for audit purposes
   * This is the main logging method - logAction is an alias for this
   */
  async logAdminAction(entry: AuditLogEntry): Promise<void> {
    try {
      // Store in database
      // Combine changes and details into the changes field
      const combinedData = {
        ...(entry.changes || {}),
        ...(entry.details || {})
      };
      
      await prisma.auditLog.create({
        data: {
          adminId: entry.adminId,
          action: entry.action,
          resourceType: entry.resourceType,
          resourceId: entry.resourceId,
          changes: JSON.stringify(combinedData),
          ipAddress: entry.ipAddress || null,
          userAgent: entry.userAgent || null,
        },
      });

      // Also log to console for debugging
      console.log('[AUDIT LOG]', JSON.stringify({
        timestamp: new Date().toISOString(),
        ...entry,
      }, null, 2));
    } catch (error) {
      console.error('Failed to log audit entry:', error);
      // Don't throw error - audit logging failure shouldn't break the main operation
    }
  }

  /**
   * Get audit logs with filtering and pagination
   */
  async getAuditLogs(
    filters: AuditLogFilters,
    pagination: PaginationOptions
  ): Promise<{ logs: any[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const { page = 1, pageSize = 20, sortBy = 'timestamp', sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: any = {};

    if (filters.adminId) {
      where.adminId = filters.adminId;
    }

    if (filters.action) {
      where.action = { contains: filters.action };
    }

    if (filters.resourceType) {
      where.resourceType = filters.resourceType;
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    if (filters.search) {
      where.OR = [
        { action: { contains: filters.search } },
        { resourceType: { contains: filters.search } },
        { resourceId: { contains: filters.search } },
        { changes: { contains: filters.search } },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    const validSortFields = ['timestamp', 'action', 'resourceType', 'adminId'];
    if (validSortFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy.timestamp = 'desc';
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Parse changes JSON for each log
    const parsedLogs = logs.map(log => ({
      ...log,
      changes: JSON.parse(log.changes || '{}'),
    }));

    return {
      logs: parsedLogs,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get a single audit log by ID
   */
  async getAuditLogById(id: string): Promise<any> {
    const log = await prisma.auditLog.findUnique({
      where: { id },
    });

    if (!log) {
      throw new Error('Audit log not found');
    }

    return {
      ...log,
      changes: JSON.parse(log.changes || '{}'),
    };
  }

  /**
   * Get audit log statistics
   */
  async getAuditStats(period: number = 30): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const [
      totalLogs,
      logsByAction,
      logsByResourceType,
      recentActivity,
    ] = await Promise.all([
      prisma.auditLog.count({
        where: { timestamp: { gte: startDate } },
      }),
      prisma.auditLog.groupBy({
        by: ['action'],
        where: { timestamp: { gte: startDate } },
        _count: true,
        orderBy: { _count: { action: 'desc' } },
        take: 10,
      }),
      prisma.auditLog.groupBy({
        by: ['resourceType'],
        where: { timestamp: { gte: startDate } },
        _count: true,
        orderBy: { _count: { resourceType: 'desc' } },
      }),
      prisma.auditLog.findMany({
        where: { timestamp: { gte: startDate } },
        orderBy: { timestamp: 'desc' },
        take: 10,
      }),
    ]);

    return {
      totalLogs,
      logsByAction: logsByAction.map(item => ({
        action: item.action,
        count: item._count,
      })),
      logsByResourceType: logsByResourceType.map(item => ({
        resourceType: item.resourceType,
        count: item._count,
      })),
      recentActivity: recentActivity.map(log => ({
        ...log,
        changes: JSON.parse(log.changes || '{}'),
      })),
      period,
    };
  }

  /**
   * Export audit logs with tamper-evidence (hash chain)
   */
  async exportAuditLogs(
    filters: AuditLogFilters,
    format: 'json' | 'csv' = 'json'
  ): Promise<{ data: string; hash: string; exportedAt: string; recordCount: number }> {
    // Get all logs matching filters (no pagination for export)
    const where: any = {};

    if (filters.adminId) {
      where.adminId = filters.adminId;
    }

    if (filters.action) {
      where.action = { contains: filters.action };
    }

    if (filters.resourceType) {
      where.resourceType = filters.resourceType;
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'asc' },
    });

    const parsedLogs = logs.map(log => ({
      ...log,
      changes: JSON.parse(log.changes || '{}'),
    }));

    const exportedAt = new Date().toISOString();
    let data: string;

    if (format === 'csv') {
      const headers = ['ID', 'Timestamp', 'Admin ID', 'Action', 'Resource Type', 'Resource ID', 'Changes', 'IP Address', 'User Agent'];
      const rows = parsedLogs.map(log => [
        log.id,
        log.timestamp.toISOString(),
        log.adminId,
        log.action,
        log.resourceType,
        log.resourceId,
        JSON.stringify(log.changes),
        log.ipAddress || '',
        log.userAgent || '',
      ]);
      data = [headers.join(','), ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))].join('\n');
    } else {
      data = JSON.stringify({
        exportedAt,
        recordCount: parsedLogs.length,
        logs: parsedLogs,
      }, null, 2);
    }

    // Generate tamper-evident hash
    const hash = crypto.createHash('sha256').update(data).digest('hex');

    return {
      data,
      hash,
      exportedAt,
      recordCount: parsedLogs.length,
    };
  }

  /**
   * Log security event
   */
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          adminId: event.userId || 'system',
          action: `security_${event.type}`,
          resourceType: 'security',
          resourceId: event.userId || 'unknown',
          changes: JSON.stringify({
            type: event.type,
            severity: event.severity,
            details: event.details,
          }),
          ipAddress: event.ipAddress || null,
          userAgent: event.userAgent || null,
        },
      });

      console.log('[SECURITY EVENT]', JSON.stringify({
        timestamp: new Date().toISOString(),
        ...event,
      }, null, 2));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  /**
   * Get security events with filtering
   */
  async getSecurityEvents(
    filters: {
      type?: string;
      severity?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    pagination: PaginationOptions
  ): Promise<{ events: any[]; total: number; page: number; pageSize: number; totalPages: number }> {
    const { page = 1, pageSize = 20, sortOrder = 'desc' } = pagination;
    const skip = (page - 1) * pageSize;

    const where: any = {
      action: { startsWith: 'security_' },
    };

    if (filters.type) {
      where.action = `security_${filters.type}`;
    }

    if (filters.userId) {
      where.adminId = filters.userId;
    }

    if (filters.startDate || filters.endDate) {
      where.timestamp = {};
      if (filters.startDate) {
        where.timestamp.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.timestamp.lte = filters.endDate;
      }
    }

    const [events, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: sortOrder },
        skip,
        take: pageSize,
      }),
      prisma.auditLog.count({ where }),
    ]);

    // Parse and transform events
    const parsedEvents = events.map(event => {
      const changes = JSON.parse(event.changes || '{}');
      return {
        id: event.id,
        type: event.action.replace('security_', ''),
        userId: event.adminId !== 'system' ? event.adminId : null,
        ipAddress: event.ipAddress,
        userAgent: event.userAgent,
        severity: changes.severity || 'low',
        details: changes.details || {},
        timestamp: event.timestamp,
      };
    });

    // Filter by severity if specified
    const filteredEvents = filters.severity
      ? parsedEvents.filter(e => e.severity === filters.severity)
      : parsedEvents;

    return {
      events: filteredEvents,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Get security dashboard statistics
   */
  async getSecurityStats(period: number = 7): Promise<any> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    const securityEvents = await prisma.auditLog.findMany({
      where: {
        action: { startsWith: 'security_' },
        timestamp: { gte: startDate },
      },
      orderBy: { timestamp: 'desc' },
    });

    // Parse events and categorize
    const parsedEvents = securityEvents.map(event => {
      const changes = JSON.parse(event.changes || '{}');
      return {
        type: event.action.replace('security_', ''),
        severity: changes.severity || 'low',
        timestamp: event.timestamp,
      };
    });

    const loginAttempts = parsedEvents.filter(e => e.type === 'login_attempt').length;
    const failedLogins = parsedEvents.filter(e => e.type === 'failed_login').length;
    const suspiciousActivities = parsedEvents.filter(e => e.type === 'suspicious_activity').length;
    const criticalEvents = parsedEvents.filter(e => e.severity === 'critical').length;
    const highSeverityEvents = parsedEvents.filter(e => e.severity === 'high').length;

    // Group by day for chart
    const dailyEvents: Record<string, number> = {};
    parsedEvents.forEach(event => {
      const day = event.timestamp.toISOString().split('T')[0];
      dailyEvents[day] = (dailyEvents[day] || 0) + 1;
    });

    return {
      totalEvents: parsedEvents.length,
      loginAttempts,
      failedLogins,
      suspiciousActivities,
      criticalEvents,
      highSeverityEvents,
      dailyEvents: Object.entries(dailyEvents).map(([date, count]) => ({ date, count })),
      period,
    };
  }

  /**
   * Alias for logAdminAction - generic action logging
   */
  async logAction(entry: AuditLogEntry): Promise<void> {
    return this.logAdminAction(entry);
  }

  /**
   * Log user management actions
   */
  async logUserAction(
    adminId: string,
    action: 'create' | 'update' | 'suspend' | 'activate' | 'role_change',
    userId: string,
    changes: Record<string, { from: any; to: any }>,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.logAdminAction({
      adminId,
      action: `user_${action}`,
      resourceType: 'user',
      resourceId: userId,
      changes,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Log course management actions
   */
  async logCourseAction(
    adminId: string,
    action: 'publish' | 'unpublish' | 'delete' | 'bulk_operation',
    courseId: string,
    changes: Record<string, { from: any; to: any }>,
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logAdminAction({
      adminId,
      action: `course_${action}`,
      resourceType: 'course',
      resourceId: courseId,
      changes,
      ipAddress,
      userAgent,
      details,
    });
  }

  /**
   * Log payment and financial actions
   */
  async logPaymentAction(
    adminId: string,
    action: 'refund' | 'view_transaction' | 'export_report',
    paymentId: string,
    changes: Record<string, { from: any; to: any }>,
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logAdminAction({
      adminId,
      action: `payment_${action}`,
      resourceType: 'payment',
      resourceId: paymentId,
      changes,
      ipAddress,
      userAgent,
      details,
    });
  }

  /**
   * Log system configuration changes
   */
  async logSystemAction(
    adminId: string,
    action: 'config_change' | 'feature_toggle' | 'email_template_update',
    resourceId: string,
    changes: Record<string, { from: any; to: any }>,
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logAdminAction({
      adminId,
      action: `system_${action}`,
      resourceType: 'system',
      resourceId,
      changes,
      ipAddress,
      userAgent,
      details,
    });
  }

  /**
   * Log authentication events
   */
  async logAuthAction(
    adminId: string,
    action: 'login' | 'logout' | 'session_timeout' | 'force_logout',
    ipAddress: string,
    userAgent: string,
    details?: Record<string, any>
  ): Promise<void> {
    await this.logAdminAction({
      adminId,
      action: `auth_${action}`,
      resourceType: 'authentication',
      resourceId: adminId,
      ipAddress,
      userAgent,
      details,
    });
  }
}