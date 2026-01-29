import { useState, useCallback } from 'react';
import { Card, Button, Modal, Input, Select, Textarea } from '../Common';
import { LoadingState, ErrorMessage } from '../Common';
import DataTable, { ColumnDef } from './DataTable';
import BulkActions, { BulkAction, BulkActionIcons } from './BulkActions';

interface BulkOperationResult {
  successful: string[];
  failed: { id: string; error: string }[];
  total: number;
  duplicatesSkipped?: number;
}

interface ExportRequest {
  type: 'users' | 'courses' | 'payments' | 'analytics' | 'comprehensive';
  format: 'csv' | 'json' | 'xlsx';
  filters?: {
    dateRange?: { start: string; end: string };
    userRole?: string;
    courseStatus?: string;
    paymentStatus?: string;
  };
}

interface ImportRequest {
  type: 'users' | 'courses';
  file: File;
  options?: {
    skipDuplicates?: boolean;
    validateOnly?: boolean;
  };
}

interface ScheduledOperation {
  id: string;
  type: string;
  operation: any;
  scheduledFor: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  result?: any;
  error?: string;
  createdAt: string;
}

const BulkOperationsManagement = () => {
  const [activeTab, setActiveTab] = useState<'bulk' | 'export' | 'import' | 'scheduled'>('bulk');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Bulk Operations State
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [bulkOperationModal, setBulkOperationModal] = useState<{
    isOpen: boolean;
    type: 'user' | 'course';
    operation: string;
  }>({ isOpen: false, type: 'user', operation: '' });
  const [bulkOperationData, setBulkOperationData] = useState<any>({});
  
  // Export State
  const [exportRequest, setExportRequest] = useState<ExportRequest>({
    type: 'users',
    format: 'csv',
    filters: {},
  });
  
  // Import State
  const [importRequest, setImportRequest] = useState<Partial<ImportRequest>>({
    type: 'users',
    options: { skipDuplicates: true, validateOnly: false },
  });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importResults, setImportResults] = useState<BulkOperationResult | null>(null);
  
  // Scheduled Operations State
  const [scheduledOperations, setScheduledOperations] = useState<ScheduledOperation[]>([]);

  // Mock data for demonstration
  const mockUsers = [
    { id: '1', email: 'user1@example.com', firstName: 'John', lastName: 'Doe', role: 'student', status: 'active' },
    { id: '2', email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith', role: 'instructor', status: 'active' },
    { id: '3', email: 'user3@example.com', firstName: 'Bob', lastName: 'Johnson', role: 'student', status: 'suspended' },
  ];

  const mockCourses = [
    { id: '1', title: 'Motion Graphics Basics', instructor: 'Jane Smith', status: 'published', enrollments: 45 },
    { id: '2', title: 'Advanced Animation', instructor: 'Jane Smith', status: 'draft', enrollments: 0 },
    { id: '3', title: 'Character Animation', instructor: 'Jane Smith', status: 'published', enrollments: 23 },
  ];

  // User table columns
  const userColumns: ColumnDef<any>[] = [
    { id: 'email', header: 'Email', accessor: 'email', sortable: true },
    { id: 'name', header: 'Name', accessor: (row) => `${row.firstName} ${row.lastName}`, sortable: true },
    { id: 'role', header: 'Role', accessor: 'role', sortable: true },
    { id: 'status', header: 'Status', accessor: 'status', sortable: true },
  ];

  // Course table columns
  const courseColumns: ColumnDef<any>[] = [
    { id: 'title', header: 'Title', accessor: 'title', sortable: true },
    { id: 'instructor', header: 'Instructor', accessor: 'instructor', sortable: true },
    { id: 'status', header: 'Status', accessor: 'status', sortable: true },
    { id: 'enrollments', header: 'Enrollments', accessor: 'enrollments', sortable: true },
  ];

  // Bulk user actions
  const userBulkActions: BulkAction<any>[] = [
    {
      id: 'change_role',
      label: 'Change Role',
      icon: BulkActionIcons.Activate,
      action: async (users) => {
        setBulkOperationModal({ isOpen: true, type: 'user', operation: 'change_role' });
      },
    },
    {
      id: 'suspend',
      label: 'Suspend',
      icon: BulkActionIcons.Suspend,
      variant: 'danger',
      confirmationMessage: 'Are you sure you want to suspend these users?',
      action: async (users) => {
        await executeBulkUserOperation('status_update', users.map(u => u.id), { status: 'suspended' });
      },
    },
    {
      id: 'activate',
      label: 'Activate',
      icon: BulkActionIcons.Activate,
      action: async (users) => {
        await executeBulkUserOperation('status_update', users.map(u => u.id), { status: 'active' });
      },
    },
    {
      id: 'send_email',
      label: 'Send Email',
      icon: BulkActionIcons.Email,
      action: async (users) => {
        setBulkOperationModal({ isOpen: true, type: 'user', operation: 'send_email' });
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: BulkActionIcons.Delete,
      variant: 'danger',
      confirmationMessage: 'Are you sure you want to delete these users? This action cannot be undone.',
      action: async (users) => {
        await executeBulkUserOperation('delete', users.map(u => u.id));
      },
    },
  ];

  // Bulk course actions
  const courseBulkActions: BulkAction<any>[] = [
    {
      id: 'publish',
      label: 'Publish',
      icon: BulkActionIcons.Activate,
      action: async (courses) => {
        await executeBulkCourseOperation('publish', courses.map(c => c.id));
      },
    },
    {
      id: 'unpublish',
      label: 'Unpublish',
      icon: BulkActionIcons.Suspend,
      action: async (courses) => {
        await executeBulkCourseOperation('unpublish', courses.map(c => c.id));
      },
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: BulkActionIcons.Archive,
      confirmationMessage: 'Are you sure you want to archive these courses?',
      action: async (courses) => {
        await executeBulkCourseOperation('archive', courses.map(c => c.id));
      },
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: BulkActionIcons.Delete,
      variant: 'danger',
      confirmationMessage: 'Are you sure you want to delete these courses? This action cannot be undone.',
      action: async (courses) => {
        await executeBulkCourseOperation('delete', courses.map(c => c.id));
      },
    },
  ];

  const executeBulkUserOperation = useCallback(async (
    operation: string,
    userIds: string[],
    data?: any
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful result
      const result: BulkOperationResult = {
        successful: userIds.slice(0, -1), // All but last one succeed
        failed: [{ id: userIds[userIds.length - 1], error: 'User not found' }],
        total: userIds.length,
      };
      
      console.log('Bulk user operation result:', result);
      setSelectedUsers([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const executeBulkCourseOperation = useCallback(async (
    operation: string,
    courseIds: string[]
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful result
      const result: BulkOperationResult = {
        successful: courseIds,
        failed: [],
        total: courseIds.length,
      };
      
      console.log('Bulk course operation result:', result);
      setSelectedCourses([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExport = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock export - in real app, this would download a file
      const filename = `${exportRequest.type}_export_${new Date().toISOString().split('T')[0]}.${exportRequest.format}`;
      console.log('Export completed:', filename);
      
      // Create mock download
      const mockData = exportRequest.type === 'users' ? mockUsers : mockCourses;
      const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setLoading(false);
    }
  }, [exportRequest]);

  const handleImport = useCallback(async () => {
    if (!importFile) {
      setError('Please select a file to import');
      return;
    }
    
    setLoading(true);
    setError(null);
    setImportResults(null);
    
    try {
      // Mock file processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock import results
      const results: BulkOperationResult = {
        successful: ['1', '2', '3'],
        failed: [{ id: '4', error: 'Invalid email format' }],
        total: 4,
        duplicatesSkipped: 1,
      };
      
      setImportResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
    } finally {
      setLoading(false);
    }
  }, [importFile, importRequest]);

  const handleBulkOperationSubmit = useCallback(async () => {
    const { type, operation } = bulkOperationModal;
    
    if (type === 'user') {
      if (operation === 'change_role') {
        await executeBulkUserOperation('role_change', selectedUsers, { role: bulkOperationData.role });
      } else if (operation === 'send_email') {
        await executeBulkUserOperation('email_notification', selectedUsers, {
          emailSubject: bulkOperationData.emailSubject,
          emailContent: bulkOperationData.emailContent,
        });
      }
    }
    
    setBulkOperationModal({ isOpen: false, type: 'user', operation: '' });
    setBulkOperationData({});
  }, [bulkOperationModal, selectedUsers, bulkOperationData, executeBulkUserOperation]);

  const tabs = [
    { id: 'bulk', label: 'Bulk Operations', icon: '⚡' },
    { id: 'export', label: 'Data Export', icon: '📤' },
    { id: 'import', label: 'Data Import', icon: '📥' },
    { id: 'scheduled', label: 'Scheduled Operations', icon: '⏰' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bulk Operations & Data Management</h1>
          <p className="text-gray-600 mt-1">Manage large-scale operations and data import/export</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => setError(null)}
          type="error"
        />
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'bulk' && (
        <div className="space-y-6">
          {/* User Bulk Operations */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Bulk Operations</h3>
              
              <BulkActions
                selectedItems={mockUsers.filter(u => selectedUsers.includes(u.id))}
                actions={userBulkActions}
                onClearSelection={() => setSelectedUsers([])}
                itemLabel="user"
                className="mb-4"
              />
              
              <DataTable
                data={mockUsers}
                columns={userColumns}
                loading={loading}
                selectable
                selectedIds={selectedUsers}
                onSelectionChange={setSelectedUsers}
                emptyMessage="No users found"
              />
            </div>
          </Card>

          {/* Course Bulk Operations */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Bulk Operations</h3>
              
              <BulkActions
                selectedItems={mockCourses.filter(c => selectedCourses.includes(c.id))}
                actions={courseBulkActions}
                onClearSelection={() => setSelectedCourses([])}
                itemLabel="course"
                className="mb-4"
              />
              
              <DataTable
                data={mockCourses}
                columns={courseColumns}
                loading={loading}
                selectable
                selectedIds={selectedCourses}
                onSelectionChange={setSelectedCourses}
                emptyMessage="No courses found"
              />
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'export' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Type
                  </label>
                  <Select
                    value={exportRequest.type}
                    onChange={(value) => setExportRequest(prev => ({ ...prev, type: value as any }))}
                    options={[
                      { value: 'users', label: 'Users' },
                      { value: 'courses', label: 'Courses' },
                      { value: 'payments', label: 'Payments' },
                      { value: 'analytics', label: 'Analytics' },
                      { value: 'comprehensive', label: 'Comprehensive (All Data)' },
                    ]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format
                  </label>
                  <Select
                    value={exportRequest.format}
                    onChange={(value) => setExportRequest(prev => ({ ...prev, format: value as any }))}
                    options={[
                      { value: 'csv', label: 'CSV' },
                      { value: 'json', label: 'JSON' },
                      { value: 'xlsx', label: 'Excel (XLSX)' },
                    ]}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      placeholder="Start date"
                      value={exportRequest.filters?.dateRange?.start || ''}
                      onChange={(e) => setExportRequest(prev => ({
                        ...prev,
                        filters: {
                          ...prev.filters,
                          dateRange: {
                            ...prev.filters?.dateRange,
                            start: e.target.value,
                          },
                        },
                      }))}
                    />
                    <Input
                      type="date"
                      placeholder="End date"
                      value={exportRequest.filters?.dateRange?.end || ''}
                      onChange={(e) => setExportRequest(prev => ({
                        ...prev,
                        filters: {
                          ...prev.filters,
                          dateRange: {
                            ...prev.filters?.dateRange,
                            end: e.target.value,
                          },
                        },
                      }))}
                    />
                  </div>
                </div>
                
                {exportRequest.type === 'users' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      User Role (Optional)
                    </label>
                    <Select
                      value={exportRequest.filters?.userRole || ''}
                      onChange={(value) => setExportRequest(prev => ({
                        ...prev,
                        filters: { ...prev.filters, userRole: value || undefined },
                      }))}
                      options={[
                        { value: '', label: 'All Roles' },
                        { value: 'student', label: 'Students' },
                        { value: 'instructor', label: 'Instructors' },
                        { value: 'admin', label: 'Admins' },
                      ]}
                    />
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                onClick={handleExport}
                disabled={loading}
                className="inline-flex items-center gap-2"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <BulkActionIcons.Export />
                )}
                {loading ? 'Exporting...' : 'Export Data'}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'import' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Import</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Import Type
                  </label>
                  <Select
                    value={importRequest.type || 'users'}
                    onChange={(value) => setImportRequest(prev => ({ ...prev, type: value as any }))}
                    options={[
                      { value: 'users', label: 'Users' },
                      { value: 'courses', label: 'Courses' },
                    ]}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Import File
                  </label>
                  <input
                    type="file"
                    accept=".csv,.json,.xlsx"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importRequest.options?.skipDuplicates || false}
                    onChange={(e) => setImportRequest(prev => ({
                      ...prev,
                      options: { ...prev.options, skipDuplicates: e.target.checked },
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Skip duplicate records</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importRequest.options?.validateOnly || false}
                    onChange={(e) => setImportRequest(prev => ({
                      ...prev,
                      options: { ...prev.options, validateOnly: e.target.checked },
                    }))}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Validate only (don't import)</span>
                </label>
              </div>
              
              <div className="flex justify-end">
                <Button
                  onClick={handleImport}
                  disabled={loading || !importFile}
                  className="inline-flex items-center gap-2"
                >
                  {loading ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                    </svg>
                  )}
                  {loading ? 'Importing...' : 'Import Data'}
                </Button>
              </div>
              
              {/* Import Results */}
              {importResults && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Import Results</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="ml-2 font-medium">{importResults.total}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Successful:</span>
                      <span className="ml-2 font-medium text-green-600">{importResults.successful.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Failed:</span>
                      <span className="ml-2 font-medium text-red-600">{importResults.failed.length}</span>
                    </div>
                    {importResults.duplicatesSkipped !== undefined && (
                      <div>
                        <span className="text-gray-600">Skipped:</span>
                        <span className="ml-2 font-medium text-yellow-600">{importResults.duplicatesSkipped}</span>
                      </div>
                    )}
                  </div>
                  
                  {importResults.failed.length > 0 && (
                    <div className="mt-4">
                      <h5 className="font-medium text-red-900 mb-2">Failed Records:</h5>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {importResults.failed.map((failure, index) => (
                          <div key={index} className="text-sm text-red-700">
                            Record {failure.id}: {failure.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'scheduled' && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduled Operations</h3>
            
            {scheduledOperations.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">No scheduled operations</p>
                <p className="text-sm text-gray-400 mt-1">
                  Scheduled operations will appear here when you schedule bulk operations for future execution.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {scheduledOperations.map((operation) => (
                  <div key={operation.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{operation.type}</h4>
                        <p className="text-sm text-gray-600">
                          Scheduled for {new Date(operation.scheduledFor).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          operation.status === 'completed' ? 'bg-green-100 text-green-800' :
                          operation.status === 'running' ? 'bg-blue-100 text-blue-800' :
                          operation.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {operation.status}
                        </span>
                        {operation.progress !== undefined && (
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${operation.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Bulk Operation Modal */}
      <Modal
        isOpen={bulkOperationModal.isOpen}
        onClose={() => setBulkOperationModal({ isOpen: false, type: 'user', operation: '' })}
        title={`Bulk ${bulkOperationModal.operation.replace('_', ' ')}`}
      >
        <div className="space-y-4">
          {bulkOperationModal.operation === 'change_role' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Role
              </label>
              <Select
                value={bulkOperationData.role || ''}
                onChange={(value) => setBulkOperationData(prev => ({ ...prev, role: value }))}
                options={[
                  { value: 'student', label: 'Student' },
                  { value: 'instructor', label: 'Instructor' },
                  { value: 'admin', label: 'Admin' },
                ]}
              />
            </div>
          )}
          
          {bulkOperationModal.operation === 'send_email' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject
                </label>
                <Input
                  value={bulkOperationData.emailSubject || ''}
                  onChange={(e) => setBulkOperationData(prev => ({ ...prev, emailSubject: e.target.value }))}
                  placeholder="Enter email subject"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content
                </label>
                <Textarea
                  value={bulkOperationData.emailContent || ''}
                  onChange={(e) => setBulkOperationData(prev => ({ ...prev, emailContent: e.target.value }))}
                  placeholder="Enter email content"
                  rows={6}
                />
              </div>
            </>
          )}
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="secondary"
              onClick={() => setBulkOperationModal({ isOpen: false, type: 'user', operation: '' })}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkOperationSubmit}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Execute'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BulkOperationsManagement;