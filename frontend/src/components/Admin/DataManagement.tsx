import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './';
import { useAuth } from '../../hooks/useAuth';

interface ExportJob {
  id: string;
  type: 'export' | 'import';
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  createdAt: string;
  completedAt?: string;
  downloadUrl?: string;
  recordCount?: number;
  errors?: string[];
}

interface ExportRequest {
  format: 'csv' | 'json' | 'xlsx';
  tables: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  includeDeleted: boolean;
  filters?: Record<string, any>;
}

interface ImportRequest {
  table: string;
  validateOnly: boolean;
  skipDuplicates: boolean;
  file?: File;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const DataManagement = () => {
  const { token } = useAuth();
  const [jobs, setJobs] = useState<ExportJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Export form state
  const [exportRequest, setExportRequest] = useState<ExportRequest>({
    format: 'csv',
    tables: [],
    includeDeleted: false,
  });
  
  // Import form state
  const [importRequest, setImportRequest] = useState<ImportRequest>({
    table: 'users',
    validateOnly: false,
    skipDuplicates: true,
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'jobs'>('export');

  const availableTables = [
    { id: 'users', label: 'Users', description: 'User accounts and profiles' },
    { id: 'courses', label: 'Courses', description: 'Course content and metadata' },
    { id: 'enrollments', label: 'Enrollments', description: 'Student course enrollments' },
    { id: 'payments', label: 'Payments', description: 'Payment transactions' },
    { id: 'lessons', label: 'Lessons', description: 'Course lessons and content' },
    { id: 'assignments', label: 'Assignments', description: 'Course assignments' },
    { id: 'projects', label: 'Projects', description: 'Portfolio projects' },
    { id: 'scholarships', label: 'Scholarships', description: 'Student scholarships' },
    { id: 'audit_logs', label: 'Audit Logs', description: 'System audit trail' },
  ];

  const handleExport = useCallback(async () => {
    if (!token || exportRequest.tables.length === 0) return;
    
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/admin/bulk-operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          type: 'export_data',
          operation: exportRequest
        })
      });

      if (!response.ok) {
        throw new Error('Failed to export data');
      }

      const data = await response.json();
      setExportResult(data.result);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsExporting(false);
    }
  }, [exportRequest, token]);

  const handleImport = useCallback(async () => {
    if (!importRequest.file) {
      alert('Please select a file to import');
      return;
    }

    setIsImporting(true);
    setImportResult(null);

    try {
      // Parse the file content
      const fileContent = await readFileContent(importRequest.file);
      let data: any[];

      if (importRequest.file.name.endsWith('.json')) {
        data = JSON.parse(fileContent);
      } else if (importRequest.file.name.endsWith('.csv')) {
        data = parseCSV(fileContent);
      } else {
        throw new Error('Unsupported file format. Please use JSON or CSV.');
      }

      const response = await fetch(`${API_URL}/admin/bulk-operations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          type: 'import_data',
          operation: {
            type: importRequest.type,
            data: data,
            options: importRequest.options
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to import data');
      }

      const result = await response.json();
      setImportResult(result.result);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsImporting(false);
    }
  }, [importRequest]);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const parseCSV = (content: string): any[] => {
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        data.push(row);
      }
    }

    return data;
  };

  const renderExportFilters = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            value={exportRequest.filters?.dateRange?.start || ''}
            onChange={(e) => setExportRequest({
              ...exportRequest,
              filters: {
                ...exportRequest.filters,
                dateRange: {
                  ...exportRequest.filters?.dateRange,
                  start: e.target.value
                }
              }
            })}
          />
          <Input
            label="End Date"
            type="date"
            value={exportRequest.filters?.dateRange?.end || ''}
            onChange={(e) => setExportRequest({
              ...exportRequest,
              filters: {
                ...exportRequest.filters,
                dateRange: {
                  ...exportRequest.filters?.dateRange,
                  end: e.target.value
                }
              }
            })}
          />
        </div>

        {exportRequest.type === 'users' && (
          <Select
            label="User Role Filter"
            value={exportRequest.filters?.userRole || ''}
            onChange={(value) => setExportRequest({
              ...exportRequest,
              filters: { ...exportRequest.filters, userRole: value }
            })}
            options={[
              { value: '', label: 'All Roles' },
              { value: 'student', label: 'Students' },
              { value: 'instructor', label: 'Instructors' },
              { value: 'admin', label: 'Admins' }
            ]}
          />
        )}

        {exportRequest.type === 'courses' && (
          <Select
            label="Course Status Filter"
            value={exportRequest.filters?.courseStatus || ''}
            onChange={(value) => setExportRequest({
              ...exportRequest,
              filters: { ...exportRequest.filters, courseStatus: value }
            })}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'published', label: 'Published' },
              { value: 'draft', label: 'Draft' },
              { value: 'archived', label: 'Archived' }
            ]}
          />
        )}

        {exportRequest.type === 'payments' && (
          <Select
            label="Payment Status Filter"
            value={exportRequest.filters?.paymentStatus || ''}
            onChange={(value) => setExportRequest({
              ...exportRequest,
              filters: { ...exportRequest.filters, paymentStatus: value }
            })}
            options={[
              { value: '', label: 'All Statuses' },
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' },
              { value: 'failed', label: 'Failed' },
              { value: 'refunded', label: 'Refunded' }
            ]}
          />
        )}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Data Management</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Export Data</h4>
            <p className="text-sm text-gray-600">
              Export platform data in various formats for reporting and analysis.
            </p>
            <Button
              onClick={() => setExportModalOpen(true)}
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Export Data
            </Button>
          </div>

          {/* Import Section */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Import Data</h4>
            <p className="text-sm text-gray-600">
              Import data from CSV or JSON files with validation and duplicate handling.
            </p>
            <Button
              onClick={() => setImportModalOpen(true)}
              variant="outline"
              className="w-full"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Import Data
            </Button>
          </div>
        </div>
      </Card>

      {/* Export Modal */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export Data"
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Data Type"
              value={exportRequest.type}
              onChange={(value) => setExportRequest({ ...exportRequest, type: value as any })}
              options={exportTypes}
            />
            <Select
              label="Format"
              value={exportRequest.format}
              onChange={(value) => setExportRequest({ ...exportRequest, format: value as any })}
              options={exportFormats}
            />
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-4">Filters</h4>
            {renderExportFilters()}
          </div>

          {exportResult && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800">Export Complete</h4>
              <p className="text-sm text-green-700 mt-1">
                Your export is ready for download.
              </p>
              <div className="mt-3">
                <a
                  href={exportResult.downloadUrl}
                  download={exportResult.filename}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Download {exportResult.filename}
                </a>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setExportModalOpen(false)}
            >
              {exportResult ? 'Close' : 'Cancel'}
            </Button>
            {!exportResult && (
              <Button
                onClick={handleExport}
                loading={isExporting}
              >
                Export Data
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* Import Modal */}
      <Modal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        title="Import Data"
        size="lg"
      >
        <div className="space-y-6">
          <Select
            label="Data Type"
            value={importRequest.type}
            onChange={(value) => setImportRequest({ ...importRequest, type: value as any })}
            options={importTypes}
          />

          <FileUpload
            label="Select File"
            accept=".csv,.json"
            onChange={(files) => {
              if (files && files.length > 0) {
                setImportRequest({ ...importRequest, file: files[0] });
              }
            }}
            helpText="Supported formats: CSV, JSON"
          />

          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Import Options</h4>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importRequest.options.skipDuplicates}
                onChange={(e) => setImportRequest({
                  ...importRequest,
                  options: { ...importRequest.options, skipDuplicates: e.target.checked }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Skip duplicate records</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={importRequest.options.updateExisting}
                onChange={(e) => setImportRequest({
                  ...importRequest,
                  options: { ...importRequest.options, updateExisting: e.target.checked }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Update existing records</span>
            </label>
          </div>

          {importResult && (
            <div className={`border rounded-lg p-4 ${
              importResult.errors.length === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
            }`}>
              <h4 className={`font-medium ${
                importResult.errors.length === 0 ? 'text-green-800' : 'text-yellow-800'
              }`}>
                Import Results
              </h4>
              <div className="mt-2 text-sm">
                <p className="text-green-700">✓ {importResult.imported} records imported</p>
                <p className="text-gray-700">⊘ {importResult.skipped} records skipped</p>
                {importResult.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="font-medium text-red-800">Errors ({importResult.errors.length}):</p>
                    <ul className="list-disc list-inside text-red-700 max-h-32 overflow-y-auto">
                      {importResult.errors.slice(0, 10).map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                      {importResult.errors.length > 10 && (
                        <li>... and {importResult.errors.length - 10} more errors</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setImportModalOpen(false)}
            >
              {importResult ? 'Close' : 'Cancel'}
            </Button>
            {!importResult && (
              <Button
                onClick={handleImport}
                loading={isImporting}
                disabled={!importRequest.file}
              >
                Import Data
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DataManagement;
