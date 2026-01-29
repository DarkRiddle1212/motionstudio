import React, { useState, useCallback } from 'react';
import { Card } from '../Common/Card';
import { Button } from '../Common/Button';
import { Modal } from '../Common/Modal';
import { Input } from '../Common/Input';
import { Select } from '../Common/Select';
import { Textarea } from '../Common/Textarea';

interface BulkOperationsManagerProps {
  selectedItems: any[];
  itemType: 'users' | 'courses';
  onClearSelection: () => void;
  onRefresh: () => void;
}

interface BulkOperationResult {
  success: number;
  failed: number;
  errors: string[];
}

const BulkOperationsManager: React.FC<BulkOperationsManagerProps> = ({
  selectedItems,
  itemType,
  onClearSelection,
  onRefresh
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [operationType, setOperationType] = useState<string>('');
  const [operationParams, setOperationParams] = useState<any>({});
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<BulkOperationResult | null>(null);

  const userOperations = [
    { value: 'activate', label: 'Activate Users', variant: 'default' as const },
    { value: 'suspend', label: 'Suspend Users', variant: 'danger' as const },
    { value: 'delete', label: 'Delete Users', variant: 'danger' as const },
    { value: 'changeRole', label: 'Change Role', variant: 'default' as const },
    { value: 'sendEmail', label: 'Send Email', variant: 'default' as const },
  ];

  const courseOperations = [
    { value: 'publish', label: 'Publish Courses', variant: 'default' as const },
    { value: 'unpublish', label: 'Unpublish Courses', variant: 'default' as const },
    { value: 'archive', label: 'Archive Courses', variant: 'default' as const },
    { value: 'delete', label: 'Delete Courses', variant: 'danger' as const },
  ];

  const operations = itemType === 'users' ? userOperations : courseOperations;

  const handleOperationSelect = useCallback((operation: string) => {
    setOperationType(operation);
    setOperationParams({});
    setIsModalOpen(true);
  }, []);

  const handleExecuteOperation = useCallback(async () => {
    if (!operationType || selectedItems.length === 0) return;

    setIsExecuting(true);
    try {
      const payload = {
        type: itemType === 'users' ? 'bulk_users' : 'bulk_courses',
        operation: {
          [itemType === 'users' ? 'userIds' : 'courseIds']: selectedItems.map(item => item.id),
          operation: operationType,
          ...(Object.keys(operationParams).length > 0 && { parameters: operationParams })
        }
      };

      const response = await fetch('/api/admin/bulk-operations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Failed to execute bulk operation');
      }

      const data = await response.json();
      setResult(data.result);
      onClearSelection();
      onRefresh();
    } catch (error) {
      console.error('Bulk operation failed:', error);
      setResult({
        success: 0,
        failed: selectedItems.length,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsExecuting(false);
    }
  }, [operationType, selectedItems, itemType, operationParams, onClearSelection, onRefresh]);

  const renderOperationForm = () => {
    switch (operationType) {
      case 'changeRole':
        return (
          <div className="space-y-4">
            <Select
              label="New Role"
              value={operationParams.newRole || ''}
              onChange={(value) => setOperationParams({ ...operationParams, newRole: value })}
              options={[
                { value: 'student', label: 'Student' },
                { value: 'instructor', label: 'Instructor' },
                { value: 'admin', label: 'Admin' }
              ]}
              required
            />
          </div>
        );

      case 'sendEmail':
        return (
          <div className="space-y-4">
            <Input
              label="Email Subject"
              value={operationParams.emailSubject || ''}
              onChange={(e) => setOperationParams({ ...operationParams, emailSubject: e.target.value })}
              required
            />
            <Textarea
              label="Email Content"
              value={operationParams.emailContent || ''}
              onChange={(e) => setOperationParams({ ...operationParams, emailContent: e.target.value })}
              rows={6}
              required
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getConfirmationMessage = () => {
    const count = selectedItems.length;
    const itemLabel = itemType === 'users' ? 'user' : 'course';
    const pluralLabel = count === 1 ? itemLabel : `${itemLabel}s`;
    
    switch (operationType) {
      case 'delete':
        return `Are you sure you want to delete ${count} ${pluralLabel}? This action cannot be undone.`;
      case 'suspend':
        return `Are you sure you want to suspend ${count} ${pluralLabel}? They will lose access to the platform.`;
      case 'activate':
        return `Are you sure you want to activate ${count} ${pluralLabel}? They will regain access to the platform.`;
      case 'changeRole':
        return `Are you sure you want to change the role of ${count} ${pluralLabel} to ${operationParams.newRole}?`;
      case 'sendEmail':
        return `Are you sure you want to send an email to ${count} ${pluralLabel}?`;
      default:
        return `Are you sure you want to perform this operation on ${count} ${pluralLabel}?`;
    }
  };

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full text-sm font-medium">
              {selectedItems.length}
            </div>
            <span className="text-sm font-medium text-blue-900">
              {selectedItems.length} {itemType === 'users' ? 'user' : 'course'}{selectedItems.length !== 1 ? 's' : ''} selected
            </span>
            <button
              onClick={onClearSelection}
              className="text-sm text-blue-600 hover:text-blue-700 underline"
            >
              Clear selection
            </button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {operations.map((operation) => (
              <Button
                key={operation.value}
                onClick={() => handleOperationSelect(operation.value)}
                variant={operation.variant}
                size="sm"
              >
                {operation.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Bulk ${operations.find(op => op.value === operationType)?.label}`}
        size="md"
      >
        <div className="space-y-6">
          {renderOperationForm()}
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Confirm Bulk Operation
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  {getConfirmationMessage()}
                </p>
              </div>
            </div>
          </div>

          {result && (
            <div className={`border rounded-lg p-4 ${
              result.failed === 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            }`}>
              <h4 className={`font-medium ${
                result.failed === 0 ? 'text-green-800' : 'text-red-800'
              }`}>
                Operation Results
              </h4>
              <div className="mt-2 text-sm">
                <p className="text-green-700">✓ {result.success} successful</p>
                {result.failed > 0 && (
                  <>
                    <p className="text-red-700">✗ {result.failed} failed</p>
                    {result.errors.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-red-800">Errors:</p>
                        <ul className="list-disc list-inside text-red-700">
                          {result.errors.slice(0, 5).map((error, index) => (
                            <li key={index}>{error}</li>
                          ))}
                          {result.errors.length > 5 && (
                            <li>... and {result.errors.length - 5} more errors</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isExecuting}
            >
              {result ? 'Close' : 'Cancel'}
            </Button>
            {!result && (
              <Button
                onClick={handleExecuteOperation}
                loading={isExecuting}
                disabled={
                  isExecuting ||
                  (operationType === 'changeRole' && !operationParams.newRole) ||
                  (operationType === 'sendEmail' && (!operationParams.emailSubject || !operationParams.emailContent))
                }
              >
                Execute Operation
              </Button>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default BulkOperationsManager;