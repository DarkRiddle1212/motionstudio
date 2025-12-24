import { prisma } from '../utils/prisma';
import { AuditService } from './auditService';

const auditService = new AuditService();

// Types
export interface SystemConfigData {
  category: string;
  key: string;
  value: any;
  description: string;
}

export interface EmailTemplateData {
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: string;
  isActive?: boolean;
}

export interface FeatureToggle {
  key: string;
  enabled: boolean;
  description: string;
}

// System Configuration Service
export class SystemConfigService {
  // Get all system configurations
  async getAllConfigs(category?: string) {
    const where = category ? { category } : {};
    const configs = await prisma.systemConfig.findMany({
      where,
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    return configs.map(config => ({
      ...config,
      value: JSON.parse(config.value),
    }));
  }

  // Get single configuration by key
  async getConfigByKey(key: string) {
    const config = await prisma.systemConfig.findUnique({
      where: { key },
    });

    if (!config) {
      throw new Error('Configuration not found');
    }

    return {
      ...config,
      value: JSON.parse(config.value),
    };
  }

  // Create or update configuration
  async upsertConfig(
    data: SystemConfigData,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const existingConfig = await prisma.systemConfig.findUnique({
      where: { key: data.key },
    });

    const valueString = JSON.stringify(data.value);

    // Create backup if updating
    if (existingConfig) {
      await prisma.configBackup.create({
        data: {
          configId: existingConfig.id,
          configKey: existingConfig.key,
          previousValue: existingConfig.value,
          newValue: valueString,
          changedBy: adminId,
        },
      });
    }

    const config = await prisma.systemConfig.upsert({
      where: { key: data.key },
      update: {
        value: valueString,
        description: data.description,
        category: data.category,
        updatedBy: adminId,
      },
      create: {
        key: data.key,
        value: valueString,
        description: data.description,
        category: data.category,
        updatedBy: adminId,
      },
    });

    // Log the action
    await auditService.logAction({
      adminId,
      action: existingConfig ? 'config_updated' : 'config_created',
      resourceType: 'system_config',
      resourceId: config.id,
      changes: {
        key: data.key,
        category: data.category,
        previousValue: existingConfig ? JSON.parse(existingConfig.value) : null,
        newValue: data.value,
      },
      ipAddress,
      userAgent,
    });

    return {
      ...config,
      value: JSON.parse(config.value),
    };
  }

  // Delete configuration
  async deleteConfig(key: string, adminId: string, ipAddress: string, userAgent: string) {
    const config = await prisma.systemConfig.findUnique({
      where: { key },
    });

    if (!config) {
      throw new Error('Configuration not found');
    }

    await prisma.systemConfig.delete({
      where: { key },
    });

    // Log the action
    await auditService.logAction({
      adminId,
      action: 'config_deleted',
      resourceType: 'system_config',
      resourceId: config.id,
      changes: {
        key: config.key,
        category: config.category,
        value: JSON.parse(config.value),
      },
      ipAddress,
      userAgent,
    });

    return { message: 'Configuration deleted successfully' };
  }

  // Get configuration backups
  async getConfigBackups(configKey?: string, limit: number = 50) {
    const where = configKey ? { configKey } : {};
    const backups = await prisma.configBackup.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return backups.map(backup => ({
      ...backup,
      previousValue: JSON.parse(backup.previousValue),
      newValue: JSON.parse(backup.newValue),
    }));
  }

  // Rollback configuration to previous value
  async rollbackConfig(
    backupId: string,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const backup = await prisma.configBackup.findUnique({
      where: { id: backupId },
    });

    if (!backup) {
      throw new Error('Backup not found');
    }

    const config = await prisma.systemConfig.findUnique({
      where: { key: backup.configKey },
    });

    if (!config) {
      throw new Error('Configuration not found');
    }

    // Create new backup before rollback
    await prisma.configBackup.create({
      data: {
        configId: config.id,
        configKey: config.key,
        previousValue: config.value,
        newValue: backup.previousValue,
        changedBy: adminId,
      },
    });

    // Update config with previous value
    const updatedConfig = await prisma.systemConfig.update({
      where: { key: backup.configKey },
      data: {
        value: backup.previousValue,
        updatedBy: adminId,
      },
    });

    // Log the action
    await auditService.logAction({
      adminId,
      action: 'config_rollback',
      resourceType: 'system_config',
      resourceId: config.id,
      changes: {
        key: config.key,
        rolledBackFrom: JSON.parse(config.value),
        rolledBackTo: JSON.parse(backup.previousValue),
        backupId,
      },
      ipAddress,
      userAgent,
    });

    return {
      ...updatedConfig,
      value: JSON.parse(updatedConfig.value),
    };
  }

  // Feature Toggles
  async getFeatureToggles() {
    const configs = await prisma.systemConfig.findMany({
      where: { category: 'features' },
      orderBy: { key: 'asc' },
    });

    return configs.map(config => ({
      key: config.key,
      enabled: JSON.parse(config.value),
      description: config.description,
    }));
  }

  async toggleFeature(
    key: string,
    enabled: boolean,
    adminId: string,
    ipAddress: string,
    userAgent: string
  ) {
    const config = await prisma.systemConfig.findUnique({
      where: { key },
    });

    if (!config || config.category !== 'features') {
      throw new Error('Feature toggle not found');
    }

    const previousValue = JSON.parse(config.value);

    // Create backup
    await prisma.configBackup.create({
      data: {
        configId: config.id,
        configKey: config.key,
        previousValue: config.value,
        newValue: JSON.stringify(enabled),
        changedBy: adminId,
      },
    });

    const updatedConfig = await prisma.systemConfig.update({
      where: { key },
      data: {
        value: JSON.stringify(enabled),
        updatedBy: adminId,
      },
    });

    // Log the action
    await auditService.logAction({
      adminId,
      action: 'feature_toggled',
      resourceType: 'feature_toggle',
      resourceId: config.id,
      changes: {
        key,
        previousValue,
        newValue: enabled,
      },
      ipAddress,
      userAgent,
    });

    return {
      key: updatedConfig.key,
      enabled: JSON.parse(updatedConfig.value),
      description: updatedConfig.description,
    };
  }
}
