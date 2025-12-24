import { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import DataTable, { ColumnDef } from './DataTable';
import SearchAndFilter, { FilterOption } from './SearchAndFilter';
import MetricCard, { MetricIcons } from './MetricCard';
import { Modal, Button } from '../Common';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface SecurityStats {
  totalEvents: number;
  loginAttempts: number;
  failedLogins: number;
  suspiciousActivities: number;
  criticalEvents: number;
  highSeverityEvents: number;
  dailyEvents: { date: string; count: number }[];
  period: number;
}

interface SecurityEvent {
  id: string;
  type: string;
  userId: string | null;
  ipAddress: string;
  userAgent: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: Record<string, any>;
  timestamp: string;
}

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
}

interface ActiveSession {
  id: string;
  sessionId: string;
  userId: string;
  email: string;
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

type TabType = 'overview' | 'events' | 'audit' | 'sessions';

const SecurityMonitoring = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [stats, setStats] = useState<SecurityStats | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [eventsPage, setEventsPage] = useState(1);
  const [eventsTotalItems, setEventsTotalItems] = useState(0);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalItems, setAuditTotalItems] = useState(0);
  
  // Filter state
  const [eventFilters, setEventFilters] = useState<Record<string, any>>({});
  const [auditFilters, setAuditFilters] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showForceLogoutModal, setShowForceLogoutModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ActiveSession | null>(null);
  const [forceLogoutReason, setForceLogoutReason] = useState('');
  
  // Export state
  const [exporting, setExporting] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/security/stats?period=7`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch security stats');
      const data = await response.json();
      setStats(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [getAuthHeaders]);

  const fetchEvents = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: eventsPage.toString(),
        pageSize: '20',
        ...eventFilters,
      });
      const response = await fetch(`${API_BASE}/api/admin/security/events?${params}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch security events');
      const data = await response.json();
      setEvents(data.events);
      setEventsTotalItems(data.total);
    } catch (err: any) {
      setError(err.message);
    }
  }, [getAuthHeaders, eventsPage, eventFilters]);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: auditPage.toString(),
        pageSize: '20',
        search: searchQuery,
        ...auditFilters,
      });
      const response = await fetch(`${API_BASE}/api/admin/security/audit-logs?${params}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      const data = await response.json();
      setAuditLogs(data.logs);
      setAuditTotalItems(data.pagination.totalItems);
    } catch (err: any) {
      setError(err.message);
    }
  }, [getAuthHeaders, auditPage, auditFilters, searchQuery]);

  const fetchSessions = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/security/sessions`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Failed to fetch active sessions');
      const data = await response.json();
      setSessions(data.sessions);
    } catch (err: any) {
      setError(err.message);
    }
  }, [getAuthHeaders]);

  const handleForceLogout = async () => {
    if (!selectedSession) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/security/sessions/${selectedSession.sessionId}/force-logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ reason: forceLogoutReason }),
      });
      
      if (!response.ok) throw new Error('Failed to force logout');
      
      setShowForceLogoutModal(false);
      setSelectedSession(null);
      setForceLogoutReason('');
      fetchSessions(); // Refresh sessions list
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleExportAuditLogs = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        format: 'csv',
        ...auditFilters,
      });
      const response = await fetch(`${API_BASE}/api/admin/security/audit-logs/export?${params}`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) throw new Error('Failed to export audit logs');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchStats(),
          activeTab === 'events' && fetchEvents(),
          activeTab === 'audit' && fetchAuditLogs(),
          activeTab === 'sessions' && fetchSessions(),
        ].filter(Boolean));
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [activeTab, fetchStats, fetchEvents, fetchAuditLogs, fetchSessions]);

  // Column definitions for security events table
  const eventColumns: ColumnDef<SecurityEvent>[] = [
    {
      id: 'timestamp',
      header: 'Time',
      accessor: 'timestamp',
      render: (_, event) => new Date(event.timestamp).toLocaleString(),
    },
    {
      id: 'type',
      header: 'Event Type',
      accessor: 'type',
      render: (_, event) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          event.type.includes('login') ? 'bg-blue-100 text-blue-800' :
          event.type.includes('failed') ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {event.type.replace(/_/g, ' ').toUpperCase()}
        </span>
      ),
    },
    {
      id: 'severity',
      header: 'Severity',
      accessor: 'severity',
      render: (_, event) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          event.severity === 'critical' ? 'bg-red-100 text-red-800' :
          event.severity === 'high' ? 'bg-orange-100 text-orange-800' :
          event.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {event.severity.toUpperCase()}
        </span>
      ),
    },
    {
      id: 'ipAddress',
      header: 'IP Address',
      accessor: 'ipAddress',
    },
    {
      id: 'userAgent',
      header: 'User Agent',
      accessor: 'userAgent',
      render: (_, event) => (
        <span className="truncate max-w-xs" title={event.userAgent}>
          {event.userAgent}
        </span>
      ),
    },
  ];

  // Column definitions for audit logs table
  const auditColumns: ColumnDef<AuditLog>[] = [
    {
      id: 'timestamp',
      header: 'Time',
      accessor: 'timestamp',
      render: (_, log) => new Date(log.timestamp).toLocaleString(),
    },
    {
      id: 'action',
      header: 'Action',
      accessor: 'action',
      render: (_, log) => (
        <span className="font-medium text-gray-900">
          {log.action.replace(/_/g, ' ').toUpperCase()}
        </span>
      ),
    },
    {
      id: 'resourceType',
      header: 'Resource',
      accessor: 'resourceType',
      render: (_, log) => (
        <span className="text-sm text-gray-600">
          {log.resourceType} ({log.resourceId})
        </span>
      ),
    },
    {
      id: 'ipAddress',
      header: 'IP Address',
      accessor: 'ipAddress',
    },
    {
      id: 'details',
      header: 'Details',
      accessor: 'id',
      render: (_, log) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSelectedLog(log);
            setShowLogModal(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  // Column definitions for active sessions table
  const sessionColumns: ColumnDef<ActiveSession>[] = [
    {
      id: 'user',
      header: 'User',
      accessor: 'email',
      render: (_, session) => (
        <div>
          <div className="font-medium text-gray-900">
            {session.user ? `${session.user.firstName} ${session.user.lastName}` : 'Unknown'}
          </div>
          <div className="text-sm text-gray-500">{session.email}</div>
        </div>
      ),
    },
    {
      id: 'loginTime',
      header: 'Login Time',
      accessor: 'loginTime',
      render: (_, session) => new Date(session.loginTime).toLocaleString(),
    },
    {
      id: 'lastActivity',
      header: 'Last Activity',
      accessor: 'lastActivity',
      render: (_, session) => new Date(session.lastActivity).toLocaleString(),
    },
    {
      id: 'ipAddress',
      header: 'IP Address',
      accessor: 'ipAddress',
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id',
      render: (_, session) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            setSelectedSession(session);
            setShowForceLogoutModal(true);
          }}
        >
          Force Logout
        </Button>
      ),
    },
  ];

  // Filter options for security events
  const eventFilterOptions: FilterOption[] = [
    {
      key: 'type',
      label: 'Event Type',
      type: 'select',
      options: [
        { label: 'All Types', value: '' },
        { label: 'Login Attempt', value: 'login_attempt' },
        { label: 'Failed Login', value: 'failed_login' },
        { label: 'Suspicious Activity', value: 'suspicious_activity' },
        { label: 'Permission Escalation', value: 'permission_escalation' },
      ],
    },
    {
      key: 'severity',
      label: 'Severity',
      type: 'select',
      options: [
        { label: 'All Severities', value: '' },
        { label: 'Critical', value: 'critical' },
        { label: 'High', value: 'high' },
        { label: 'Medium', value: 'medium' },
        { label: 'Low', value: 'low' },
      ],
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'date-range',
    },
  ];

  // Filter options for audit logs
  const auditFilterOptions: FilterOption[] = [
    {
      key: 'action',
      label: 'Action Type',
      type: 'select',
      options: [
        { label: 'All Actions', value: '' },
        { label: 'User Management', value: 'user_' },
        { label: 'Course Management', value: 'course_' },
        { label: 'Payment Management', value: 'payment_' },
        { label: 'System Configuration', value: 'config_' },
      ],
    },
    {
      key: 'resourceType',
      label: 'Resource Type',
      type: 'select',
      options: [
        { label: 'All Resources', value: '' },
        { label: 'User', value: 'user' },
        { label: 'Course', value: 'course' },
        { label: 'Payment', value: 'payment' },
        { label: 'System Config', value: 'system_config' },
      ],
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'date-range',
    },
  ];

  if (loading) {
    return (
      <AdminLayout title="Security Monitoring" breadcrumbs={[{ label: 'Security Monitoring' }]}>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Security Monitoring" breadcrumbs={[{ label: 'Security Monitoring' }]}>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800">Error: {error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Security Monitoring" breadcrumbs={[{ label: 'Security Monitoring' }]}>
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'events', label: 'Security Events' },
              { id: 'audit', label: 'Audit Logs' },
              { id: 'sessions', label: 'Active Sessions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-6">
            {/* Security Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Total Events"
                value={stats.totalEvents}
                icon={MetricIcons.Activity}
              />
              <MetricCard
                title="Login Attempts"
                value={stats.loginAttempts}
                icon={MetricIcons.Users}
              />
              <MetricCard
                title="Failed Logins"
                value={stats.failedLogins}
                icon={MetricIcons.Warning}
              />
              <MetricCard
                title="Critical Events"
                value={stats.criticalEvents}
                icon={MetricIcons.Alert}
              />
            </div>

            {/* Recent Activity Chart */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security Events (Last 7 Days)</h3>
              <div className="h-64 flex items-end space-x-2">
                {stats.dailyEvents.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div
                      className="bg-blue-500 w-full rounded-t"
                      style={{
                        height: `${Math.max((day.count / Math.max(...stats.dailyEvents.map(d => d.count))) * 200, 4)}px`,
                      }}
                    ></div>
                    <div className="text-xs text-gray-500 mt-2">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Security Events Tab */}
        {activeTab === 'events' && (
          <div className="space-y-6">
            <SearchAndFilter
              searchPlaceholder="Search security events..."
              filters={eventFilterOptions}
              onSearch={(query) => setSearchQuery(query)}
              onFilter={(filters) => setEventFilters(filters)}
            />
            
            <DataTable
              data={events}
              columns={eventColumns}
              loading={loading}
              pagination={{
                page: eventsPage,
                pageSize: 20,
                totalItems: eventsTotalItems,
                onPageChange: setEventsPage,
              }}
            />
          </div>
        )}

        {/* Audit Logs Tab */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <SearchAndFilter
                searchPlaceholder="Search audit logs..."
                filters={auditFilterOptions}
                onSearch={(query) => setSearchQuery(query)}
                onFilter={(filters) => setAuditFilters(filters)}
              />
              
              <Button
                onClick={handleExportAuditLogs}
                disabled={exporting}
                className="ml-4"
              >
                {exporting ? 'Exporting...' : 'Export Audit Logs'}
              </Button>
            </div>
            
            <DataTable
              data={auditLogs}
              columns={auditColumns}
              loading={loading}
              pagination={{
                page: auditPage,
                pageSize: 20,
                totalItems: auditTotalItems,
                onPageChange: setAuditPage,
              }}
            />
          </div>
        )}

        {/* Active Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Active Admin Sessions</h3>
              <Button onClick={fetchSessions} variant="secondary">
                Refresh Sessions
              </Button>
            </div>
            
            <DataTable
              data={sessions}
              columns={sessionColumns}
              loading={loading}
            />
          </div>
        )}

        {/* Audit Log Details Modal */}
        <Modal
          isOpen={showLogModal}
          onClose={() => setShowLogModal(false)}
          title="Audit Log Details"
        >
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Action</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.action}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resource Type</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.resourceType}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Resource ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.resourceId}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">IP Address</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLog.ipAddress}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">User Agent</label>
                  <p className="mt-1 text-sm text-gray-900 break-all">{selectedLog.userAgent}</p>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Changes</label>
                <pre className="mt-1 text-sm text-gray-900 bg-gray-50 p-3 rounded border overflow-auto max-h-64">
                  {JSON.stringify(selectedLog.changes, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </Modal>

        {/* Force Logout Modal */}
        <Modal
          isOpen={showForceLogoutModal}
          onClose={() => setShowForceLogoutModal(false)}
          title="Force Logout Session"
        >
          {selectedSession && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                <div className="text-yellow-800">
                  <strong>Warning:</strong> This will immediately terminate the user's session.
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">User</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedSession.user ? 
                    `${selectedSession.user.firstName} ${selectedSession.user.lastName} (${selectedSession.email})` :
                    selectedSession.email
                  }
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Reason for Force Logout</label>
                <textarea
                  value={forceLogoutReason}
                  onChange={(e) => setForceLogoutReason(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Enter reason for forcing logout..."
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowForceLogoutModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleForceLogout}
                  disabled={!forceLogoutReason.trim()}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Force Logout
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </AdminLayout>
  );
};

export default SecurityMonitoring;