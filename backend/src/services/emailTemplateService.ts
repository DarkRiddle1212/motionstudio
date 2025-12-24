import { prisma } from '../utils/prisma';
import { AuditService } from './auditService';

const auditService = new AuditService();

// Types
export interface EmailTemplateData {
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: string;
  isActive?: boolean;
}

// Email Template Service
export class EmailTemplateService {
  // Get all email templates
  async getAllTemplates(category?: string) {
    const where = category ? { category } : {};
    const templates = await prisma.emailTemplate.findMany({
      where,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });

    return templates.map(template => ({
      ...template,
      variables: JSON.parse(template.variables),
    }));
  }

  // Get single template by ID
  async getTemplateById(id: string) {
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new Error('Email template not found');
    }

    return {
      ...template,
      variables: JSON.parse(template.variables),
    };
  }

  // Get template by name
  async getTemplateByName(name: string) {
    const template = await prisma.emailTemplate.findUnique({
      where: { name },
    });

    if (!template) {
      throw new Error('Email template not found');
    }

    return {
      ...template,
      variables: JSON.parse(template.variables),
    };
  }

  // Create email template
  async createTemplate(
    data: EmailTemplateData,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    // Check if template with same name exists
    const existing = await prisma.emailTemplate.findUnique({
      where: { name: data.name },
    });

    if (existing) {
      throw new Error('Template with this name already exists');
    }

    const template = await prisma.emailTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        htmlContent: data.htmlContent,
        textContent: data.textContent,
        variables: JSON.stringify(data.variables),
        category: data.category,
        isActive: data.isActive ?? true,
      },
    });

    // Log the action
    await auditService.logAction({
      adminId,
      action: 'email_template_created',
      resourceType: 'email_template',
      resourceId: template.id,
      changes: {
        name: data.name,
        category: data.category,
      },
      ipAddress,
      userAgent,
    });

    return {
      ...template,
      variables: JSON.parse(template.variables),
    };
  }

  // Update email template
  async updateTemplate(
    id: string,
    data: Partial<EmailTemplateData>,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const existing = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Email template not found');
    }

    // Check for name conflict if name is being changed
    if (data.name && data.name !== existing.name) {
      const nameConflict = await prisma.emailTemplate.findUnique({
        where: { name: data.name },
      });
      if (nameConflict) {
        throw new Error('Template with this name already exists');
      }
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.htmlContent !== undefined) updateData.htmlContent = data.htmlContent;
    if (data.textContent !== undefined) updateData.textContent = data.textContent;
    if (data.variables !== undefined) updateData.variables = JSON.stringify(data.variables);
    if (data.category !== undefined) updateData.category = data.category;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    const template = await prisma.emailTemplate.update({
      where: { id },
      data: updateData,
    });

    // Log the action
    await auditService.logAction({
      adminId,
      action: 'email_template_updated',
      resourceType: 'email_template',
      resourceId: template.id,
      changes: {
        name: template.name,
        updatedFields: Object.keys(updateData),
      },
      ipAddress,
      userAgent,
    });

    return {
      ...template,
      variables: JSON.parse(template.variables),
    };
  }

  // Delete email template
  async deleteTemplate(
    id: string,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new Error('Email template not found');
    }

    await prisma.emailTemplate.delete({
      where: { id },
    });

    // Log the action
    await auditService.logAction({
      adminId,
      action: 'email_template_deleted',
      resourceType: 'email_template',
      resourceId: id,
      changes: {
        name: template.name,
        category: template.category,
      },
      ipAddress,
      userAgent,
    });

    return { message: 'Email template deleted successfully' };
  }

  // Toggle template active status
  async toggleTemplateStatus(
    id: string,
    isActive: boolean,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const template = await prisma.emailTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new Error('Email template not found');
    }

    const updatedTemplate = await prisma.emailTemplate.update({
      where: { id },
      data: { isActive },
    });

    // Log the action
    await auditService.logAction({
      adminId,
      action: isActive ? 'email_template_activated' : 'email_template_deactivated',
      resourceType: 'email_template',
      resourceId: id,
      changes: {
        name: template.name,
        previousStatus: template.isActive,
        newStatus: isActive,
      },
      ipAddress,
      userAgent,
    });

    return {
      ...updatedTemplate,
      variables: JSON.parse(updatedTemplate.variables),
    };
  }

  // Preview template with sample data
  previewTemplate(template: { htmlContent: string; textContent: string; variables: string[] }, sampleData: Record<string, string>) {
    let htmlPreview = template.htmlContent;
    let textPreview = template.textContent;

    for (const variable of template.variables) {
      const value = sampleData[variable] || `{{${variable}}}`;
      const regex = new RegExp(`{{${variable}}}`, 'g');
      htmlPreview = htmlPreview.replace(regex, value);
      textPreview = textPreview.replace(regex, value);
    }

    return { htmlPreview, textPreview };
  }

  // Get template categories
  getCategories() {
    return [
      { id: 'auth', label: 'Authentication', description: 'Login, signup, password reset emails' },
      { id: 'course', label: 'Course', description: 'Enrollment, completion, updates' },
      { id: 'payment', label: 'Payment', description: 'Receipts, refunds, subscription' },
      { id: 'notification', label: 'Notification', description: 'General notifications and alerts' },
    ];
  }
}
