import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import { Modal } from '../Common/Modal';
import { Input } from '../Common/Input';
import { Select } from '../Common/Select';
import { Badge } from '../Common/Badge';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5001/api';

interface ScheduledOperation {
  id: string;
  type: 'bulk_user' | 'bulk_course' | 'data_export';
  operation: any;
  scheduledFor: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  result?: any;
  error?: string;
  createdBy: string;
  createdAt: string;
}

interface ScheduledOperationsProps {
  className?: string;
}

const ScheduledOperations: React.FC<ScheduledOperationsProps> = ({ className = '' }) => {
  const [operations, setOperations] = useState<ScheduledOperation[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [newOperation, setNewOperation] = useState({
    type: 'bulk_user' as const,
    operation: {},
    scheduledFor: ''
  });

  const fetchOperations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('${API_URL}/admin/bulk-operations?type=scheduled', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOperations(data.operations || []);
      }
    } catch (error) {
      console.error('Failed to fetch scheduled operations:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOperations();
    // Set up polling for status updates
    const interval = setInterval(fetchOperations, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, [fetchOperations]);

  const handleScheduleOperation = useCallback(async () => {
    if (!newOperation.scheduledFor) {
      alert('Please select a date and time for the operation');
      return;
    }

    setIsScheduling(true);
    try {
      const response = await fetch('${API_URL}/admin/bulk-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          type: 'schedule_operation',
          scheduledOperation: {
            ...newOperation,
            scheduledFor: new Date(newOperation.scheduledFor)
          }
        })
      });

      if (response.ok) {
        setIsModalOpen(false);
        setNewOperation({
          type: 'bulk_user',
          operation: {},
          scheduledFor: ''
        });
        fetchOperations();
      } else {
        throw new Error('Failed to schedule operation');
      }
    } catch (error) {
      console.error('Failed to schedule operation:', error);
      alert('Failed to schedule operation: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setIsScheduling(false);
    }
  }, [newOperation, fetchOperations]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">Pending</Badge>;
      case 'running':
        return <Badge variant="info">Running</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'failed':
        return <Badge variant="danger">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getOperationTypeLabel = (type: string) => {
    switch (type) {
      case 'bulk_user':
        return 'Bulk User Operation';
      case 'bulk_course':
        return 'Bulk Course Operation';
      case 'data_export':
        return 'Data Export';
      default:
        return type;
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getOperationDescription = (operation: ScheduledOperation) => {
    switch (operation.type) {
      case 'bulk_user':
        const userOp = operation.operation;
        return `${userOp.operation} on ${userOp.userIds?.length || 0} users`;
      case 'bulk_course':
        const courseOp = operation.operation;
        return `${courseOp.operation} on ${courseOp.courseIds?.length || 0} courses`;
      case 'data_export':
        const exportOp = operation.operation;
        return `Export ${exportOp.type} data as ${exportOp.format}`;
      default:
        return 'Unknown operation';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Scheduled Operations</h3>
          <Button onClick={() => setIsModalOpen(true)}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Schedule Operation
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : operations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No scheduled operations found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {operations.map((operation) => (
              <div
                key={operation.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">
                        {getOperationTypeLabel(operation.type)}
                      </h4>
                      {getStatusBadge(operation.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {getOperationDescription(operation)}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Scheduled: {formatDateTime(operation.scheduledFor)}</span>
                      <span>Created: {formatDateTime(operation.createdAt)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {operation.status === 'running' && operation.progress !== undefined && (
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${operation.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500">{operation.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>

                {operation.status === 'completed' && operation.result && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                    <h5 className="text-sm font-medium text-green-800">Results</h5>
                    <div className="text-xs text-green-700 mt-1">
                      {operation.type.startsWith('bulk_') ? (
                        <>
                          <span>✓ {operation.result.success} successful</span>
                          {operation.result.failed > 0 && (
                            <span className="ml-4">✗ {operation.result.failed} failed</span>
                          )}
                        </>
                      ) : operation.type === 'data_export' ? (
                        <span>Export completed: {operation.result.filename}</span>
                      ) : (
                        <span>Operation completed successfully</span>
                      )}
                    </div>
                  </div>
                )}

                {operation.status === 'failed' && operation.error && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                    <h5 className="text-sm font-medium text-red-800">Error</h5>
                    <p className="text-xs text-red-700 mt-1">{operation.error}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Schedule Operation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Operation"
        size="md"
      >
        <div className="space-y-6">
          <Select
            label="Operation Type"
            value={newOperation.type}
            onChange={(value) => setNewOperation({ ...newOperation, type: value as any })}
            options={[
              { value: 'bulk_user', label: 'Bulk User Operation' },
              { value: 'bulk_course', label: 'Bulk Course Operation' },
              { value: 'data_export', label: 'Data Export' }
            ]}
          />

          <Input
            label="Scheduled Date & Time"
            type="datetime-local"
            value={newOperation.scheduledFor}
            onChange={(e) => setNewOperation({ ...newOperation, scheduledFor: e.target.value })}
            min={new Date().toISOString().slice(0, 16)}
            required
          />

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Note
                </h3>
                <p className="mt-1 text-sm text-blue-700">
                  This will create a scheduled operation that will be executed at the specified time. 
                  You can monitor the progress and results in the operations list above.
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isScheduling}
            >
              Cancel
            </Button>
            <Button
              onClick={handleScheduleOperation}
              loading={isScheduling}
              disabled={!newOperation.scheduledFor}
            >
              Schedule Operation
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ScheduledOperations;
