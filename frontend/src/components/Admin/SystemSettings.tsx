import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './';
import { FadeIn } from '../Animation';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';

// Types
interface SystemConfig {
  id: string;
  category: string;
  key: string;
  value: any;
  description: string;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface FeatureToggle {
  key: string;
  enabled: boolean;
  description: string;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  category: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ConfigBackup {
  id: string;
  configId: string;
  configKey: string;
  previousValue: any;
  newValue: any;
  changedBy: string;
  createdAt: string;
}

// Icons
const SettingsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const ToggleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
  </svg>
);

const HistoryIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

// Tab type
type TabType = 'general' | 'email' | 'features' | 'backups';

// Toggle Switch Component
const ToggleSwitch = ({ enabled, onChange, disabled = false }: { enabled: boolean; onChange: (enabled: boolean) => void; disabled?: boolean }) => (
  <button
    type="button"
    onClick={() => !disabled && onChange(!enabled)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
      enabled ? 'bg-blue-600' : 'bg-gray-200'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    <span
      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`}
    />
  </button>
);

// Config Form Modal
const ConfigFormModal = ({
  config,
  onClose,
  onSave,
  loading,
}: {
  config: SystemConfig | null;
  onClose: () => void;
  onSave: (data: { category: string; key: string; value: any; description: string }) => void;
  loading: boolean;
}) => {
  const [category, setCategory] = useState(config?.category || 'general');
  const [key, setKey] = useState(config?.key || '');
  const [value, setValue] = useState(config?.value !== undefined ? JSON.stringify(config.value, null, 2) : '');
  const [description, setDescription] = useState(config?.description || '');
  const [valueError, setValueError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsedValue = JSON.parse(value);
      setValueError('');
      onSave({ category, key, value: parsedValue, description });
    } catch {
      setValueError('Invalid JSON value');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {config ? 'Edit Configuration' : 'Add Configuration'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">General</option>
              <option value="email">Email</option>
              <option value="payment">Payment</option>
              <option value="features">Features</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              disabled={!!config}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              placeholder="config_key"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Value (JSON)</label>
            <textarea
              value={value}
              onChange={(e) => setValue(e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm ${
                valueError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder='{"key": "value"}'
              required
            />
            {valueError && <p className="mt-1 text-sm text-red-500">{valueError}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Configuration description"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Email Template Form Modal
const EmailTemplateFormModal = ({
  template,
  onClose,
  onSave,
  loading,
}: {
  template: EmailTemplate | null;
  onClose: () => void;
  onSave: (data: Partial<EmailTemplate>) => void;
  loading: boolean;
}) => {
  const [name, setName] = useState(template?.name || '');
  const [subject, setSubject] = useState(template?.subject || '');
  const [htmlContent, setHtmlContent] = useState(template?.htmlContent || '');
  const [textContent, setTextContent] = useState(template?.textContent || '');
  const [variables, setVariables] = useState(template?.variables?.join(', ') || '');
  const [category, setCategory] = useState(template?.category || 'notification');
  const [isActive, setIsActive] = useState(template?.isActive ?? true);
  const [showPreview, setShowPreview] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      subject,
      htmlContent,
      textContent,
      variables: variables.split(',').map(v => v.trim()).filter(Boolean),
      category,
      isActive,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 my-8 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {template ? 'Edit Email Template' : 'Create Email Template'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="welcome_email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="auth">Authentication</option>
                <option value="course">Course</option>
                <option value="payment">Payment</option>
                <option value="notification">Notification</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Welcome to Motion Studio, {{firstName}}!"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Variables (comma-separated)</label>
            <input
              type="text"
              value={variables}
              onChange={(e) => setVariables(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="firstName, lastName, email, courseName"
            />
            <p className="mt-1 text-xs text-gray-500">Use {'{{variableName}}'} in your content</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">HTML Content</label>
              <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="<html><body><h1>Hello {{firstName}}</h1></body></html>"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plain Text Content</label>
              <textarea
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                placeholder="Hello {{firstName}},\n\nWelcome to Motion Studio!"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <ToggleSwitch enabled={isActive} onChange={setIsActive} />
              <span className="text-sm text-gray-700">Active</span>
            </label>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <EyeIcon />
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
          </div>

          {showPreview && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2">HTML Preview</h4>
              <div
                className="bg-white border border-gray-200 rounded p-4 max-h-48 overflow-auto"
                dangerouslySetInnerHTML={{ __html: htmlContent }}
              />
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Template'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Main System Settings Component
const SystemSettings = () => {
  // State
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [features, setFeatures] = useState<FeatureToggle[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [backups, setBackups] = useState<ConfigBackup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<SystemConfig | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

  // Get admin token
  const getAdminToken = () => localStorage.getItem('adminToken');

  // Fetch configurations
  const fetchConfigs = useCallback(async () => {
    try {
      const token = getAdminToken();
      const response = await fetch('${API_URL}/admin/settings/configs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch configurations');
      const data = await response.json();
      setConfigs(data.configs || []);
    } catch (err: any) {
      console.error('Configs error:', err);
      // Set demo data
      setConfigs([
        { id: '1', category: 'general', key: 'site_name', value: 'Motion Studio', description: 'Platform name', updatedBy: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '2', category: 'general', key: 'support_email', value: 'support@motionstudio.com', description: 'Support email address', updatedBy: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '3', category: 'payment', key: 'stripe_enabled', value: true, description: 'Enable Stripe payments', updatedBy: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);
    }
  }, []);

  // Fetch feature toggles
  const fetchFeatures = useCallback(async () => {
    try {
      const token = getAdminToken();
      const response = await fetch('${API_URL}/admin/settings/features', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch features');
      const data = await response.json();
      setFeatures(data.features || []);
    } catch (err: any) {
      console.error('Features error:', err);
      // Set demo data
      setFeatures([
        { key: 'feature_course_reviews', enabled: true, description: 'Allow students to leave course reviews' },
        { key: 'feature_discussion_forums', enabled: true, description: 'Enable discussion forums on courses' },
        { key: 'feature_certificates', enabled: false, description: 'Generate completion certificates' },
        { key: 'feature_live_sessions', enabled: false, description: 'Enable live video sessions' },
        { key: 'feature_portfolio_public', enabled: true, description: 'Make portfolio publicly accessible' },
      ]);
    }
  }, []);

  // Fetch email templates
  const fetchTemplates = useCallback(async () => {
    try {
      const token = getAdminToken();
      const response = await fetch('${API_URL}/admin/settings/email-templates', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch templates');
      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err: any) {
      console.error('Templates error:', err);
      // Set demo data
      setTemplates([
        { id: '1', name: 'welcome_email', subject: 'Welcome to Motion Studio!', htmlContent: '<h1>Welcome!</h1>', textContent: 'Welcome!', variables: ['firstName', 'email'], category: 'auth', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '2', name: 'course_enrollment', subject: 'You\'re enrolled in {{courseName}}', htmlContent: '<h1>Enrollment Confirmed</h1>', textContent: 'Enrollment Confirmed', variables: ['firstName', 'courseName'], category: 'course', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: '3', name: 'payment_receipt', subject: 'Payment Receipt - {{amount}}', htmlContent: '<h1>Payment Receipt</h1>', textContent: 'Payment Receipt', variables: ['firstName', 'amount', 'courseName'], category: 'payment', isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      ]);
    }
  }, []);

  // Fetch backups
  const fetchBackups = useCallback(async () => {
    try {
      const token = getAdminToken();
      const response = await fetch('${API_URL}/admin/settings/backups?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch backups');
      const data = await response.json();
      setBackups(data.backups || []);
    } catch (err: any) {
      console.error('Backups error:', err);
      setBackups([]);
    }
  }, []);

  // Save configuration
  const saveConfig = async (data: { category: string; key: string; value: any; description: string }) => {
    setSaving(true);
    try {
      const token = getAdminToken();
      const response = await fetch('${API_URL}/admin/settings/configs', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save configuration');
      await fetchConfigs();
      await fetchBackups();
      setShowConfigModal(false);
      setEditingConfig(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete configuration
  const deleteConfig = async (key: string) => {
    if (!confirm('Are you sure you want to delete this configuration?')) return;
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/settings/configs/${key}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete configuration');
      await fetchConfigs();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Toggle feature
  const toggleFeature = async (key: string, enabled: boolean) => {
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/settings/features/${key}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ enabled }),
      });
      if (!response.ok) throw new Error('Failed to toggle feature');
      setFeatures(prev => prev.map(f => f.key === key ? { ...f, enabled } : f));
    } catch (err: any) {
      alert(err.message);
      // Revert on error
      setFeatures(prev => prev.map(f => f.key === key ? { ...f, enabled: !enabled } : f));
    }
  };

  // Save email template
  const saveTemplate = async (data: Partial<EmailTemplate>) => {
    setSaving(true);
    try {
      const token = getAdminToken();
      const url = editingTemplate
        ? `/api/admin/settings/email-templates/${editingTemplate.id}`
        : '${API_URL}/admin/settings/email-templates';
      const method = editingTemplate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to save template');
      await fetchTemplates();
      setShowTemplateModal(false);
      setEditingTemplate(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete template
  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/settings/email-templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to delete template');
      await fetchTemplates();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Rollback configuration
  const rollbackConfig = async (backupId: string) => {
    if (!confirm('Are you sure you want to rollback to this configuration?')) return;
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/settings/backups/${backupId}/rollback`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to rollback configuration');
      await fetchConfigs();
      await fetchBackups();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchConfigs(), fetchFeatures(), fetchTemplates(), fetchBackups()]);
      setLoading(false);
    };
    loadData();
  }, [fetchConfigs, fetchFeatures, fetchTemplates, fetchBackups]);

  // Tab content
  const tabs = [
    { id: 'general' as TabType, label: 'General Settings', icon: SettingsIcon },
    { id: 'email' as TabType, label: 'Email Templates', icon: EmailIcon },
    { id: 'features' as TabType, label: 'Feature Toggles', icon: ToggleIcon },
    { id: 'backups' as TabType, label: 'Change History', icon: HistoryIcon },
  ];

  if (loading) {
    return (
      <AdminLayout title="System Settings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="System Settings">
      <FadeIn>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Configuration</h2>
            <p className="text-gray-600">Manage platform settings, email templates, and feature toggles</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">System Configurations</h3>
                <button
                  onClick={() => { setEditingConfig(null); setShowConfigModal(true); }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon />
                  <span className="ml-2">Add Configuration</span>
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {configs.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No configurations found</div>
                ) : (
                  configs.map((config) => (
                    <div key={config.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-medium text-gray-900">{config.key}</span>
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">{config.category}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{config.description}</p>
                        <p className="text-xs text-gray-400 mt-1 font-mono">
                          Value: {typeof config.value === 'object' ? JSON.stringify(config.value) : String(config.value)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditingConfig(config); setShowConfigModal(true); }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => deleteConfig(config.key)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Email Templates</h3>
                <button
                  onClick={() => { setEditingTemplate(null); setShowTemplateModal(true); }}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon />
                  <span className="ml-2">Add Template</span>
                </button>
              </div>
              <div className="divide-y divide-gray-200">
                {templates.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No email templates found</div>
                ) : (
                  templates.map((template) => (
                    <div key={template.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">{template.name}</span>
                          <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">{template.category}</span>
                          <span className={`px-2 py-0.5 text-xs rounded ${template.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {template.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Variables: {template.variables.length > 0 ? template.variables.join(', ') : 'None'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditingTemplate(template); setShowTemplateModal(true); }}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <EditIcon />
                        </button>
                        <button
                          onClick={() => deleteTemplate(template.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Feature Toggles</h3>
                <p className="text-sm text-gray-500 mt-1">Enable or disable platform features instantly</p>
              </div>
              <div className="divide-y divide-gray-200">
                {features.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No feature toggles configured</div>
                ) : (
                  features.map((feature) => (
                    <div key={feature.key} className="p-4 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">{feature.key.replace('feature_', '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                      </div>
                      <ToggleSwitch
                        enabled={feature.enabled}
                        onChange={(enabled) => toggleFeature(feature.key, enabled)}
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'backups' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Configuration Change History</h3>
                <p className="text-sm text-gray-500 mt-1">View and rollback configuration changes</p>
              </div>
              <div className="divide-y divide-gray-200">
                {backups.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No configuration changes recorded</div>
                ) : (
                  backups.map((backup) => (
                    <div key={backup.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-medium text-gray-900">{backup.configKey}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(backup.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Previous:</span>
                              <span className="ml-2 font-mono text-red-600">
                                {typeof backup.previousValue === 'object' ? JSON.stringify(backup.previousValue) : String(backup.previousValue)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">New:</span>
                              <span className="ml-2 font-mono text-green-600">
                                {typeof backup.newValue === 'object' ? JSON.stringify(backup.newValue) : String(backup.newValue)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => rollbackConfig(backup.id)}
                          className="inline-flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          title="Rollback to this version"
                        >
                          <RefreshIcon />
                          <span className="ml-1">Rollback</span>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modals */}
        {showConfigModal && (
          <ConfigFormModal
            config={editingConfig}
            onClose={() => { setShowConfigModal(false); setEditingConfig(null); }}
            onSave={saveConfig}
            loading={saving}
          />
        )}

        {showTemplateModal && (
          <EmailTemplateFormModal
            template={editingTemplate}
            onClose={() => { setShowTemplateModal(false); setEditingTemplate(null); }}
            onSave={saveTemplate}
            loading={saving}
          />
        )}
      </FadeIn>
    </AdminLayout>
  );
};

export default SystemSettings;

