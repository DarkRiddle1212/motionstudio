import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './';
import { FadeIn } from '../Animation';
import MetricCard, { MetricIcons } from './MetricCard';
import DataTable, { ColumnDef, PaginationConfig } from './DataTable';
import SearchAndFilter, { FilterOption, FilterValue, DateRange, NumberRange } from './SearchAndFilter';

// Types
interface FinancialMetrics {
  totalRevenue: number;
  periodRevenue: number;
  previousPeriodRevenue: number;
  revenueChange: number;
  totalTransactions: number;
  periodTransactions: number;
  successRate: number;
  averageOrderValue: number;
  refundedAmount: number;
  refundedCount: number;
  failedCount: number;
  period: number;
}

interface PaymentTransaction {
  id: string;
  transactionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentProvider: string;
  createdAt: string;
  student: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
  };
  course: {
    id: string;
    title: string;
    pricing: number;
    currency: string;
  };
}

interface ChartDataPoint {
  date: string;
  revenue: number;
  transactions: number;
}

// Icons
const RefundIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

const SuccessRateIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ExportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    refunded: 'bg-purple-100 text-purple-800',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Simple Revenue Chart Component
const RevenueChart = ({ data, loading }: { data: ChartDataPoint[]; loading: boolean }) => {
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading chart...</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No revenue data available for this period
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map(d => d.revenue), 1);

  return (
    <div className="h-64">
      <div className="flex items-end justify-between h-full gap-1">
        {data.map((point, index) => (
          <div key={index} className="flex-1 flex flex-col items-center group relative">
            <div 
              className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
              style={{ height: `${(point.revenue / maxRevenue) * 100}%`, minHeight: point.revenue > 0 ? '4px' : '0' }}
            />
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
              <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                <div className="font-medium">{point.date}</div>
                <div>${point.revenue.toLocaleString()}</div>
                <div>{point.transactions} transactions</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        <span>{data[0]?.date}</span>
        <span>{data[data.length - 1]?.date}</span>
      </div>
    </div>
  );
};

// Refund Modal Component
const RefundModal = ({ 
  payment, 
  onClose, 
  onConfirm, 
  loading 
}: { 
  payment: PaymentTransaction | null; 
  onClose: () => void; 
  onConfirm: (reason: string) => void;
  loading: boolean;
}) => {
  const [reason, setReason] = useState('');

  if (!payment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Process Refund</h3>
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Transaction ID</p>
            <p className="font-medium">{payment.transactionId}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Amount</p>
              <p className="font-medium">${payment.amount.toFixed(2)} {payment.currency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Student</p>
              <p className="font-medium">{payment.student.email}</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-600">Course</p>
            <p className="font-medium">{payment.course.title}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Refund Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter reason for refund..."
            />
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Warning:</strong> This will revoke the student's access to the course.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Process Refund'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Payment Detail Modal
const PaymentDetailModal = ({ 
  payment, 
  onClose,
  onRefund 
}: { 
  payment: PaymentTransaction | null; 
  onClose: () => void;
  onRefund: () => void;
}) => {
  if (!payment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Status</span>
            <StatusBadge status={payment.status} />
          </div>
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Transaction Info</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Transaction ID</p>
                <p className="font-mono text-xs break-all">{payment.transactionId}</p>
              </div>
              <div>
                <p className="text-gray-500">Amount</p>
                <p className="font-medium">${payment.amount.toFixed(2)} {payment.currency}</p>
              </div>
              <div>
                <p className="text-gray-500">Provider</p>
                <p>{payment.paymentProvider}</p>
              </div>
              <div>
                <p className="text-gray-500">Date</p>
                <p>{new Date(payment.createdAt).toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Student</h4>
            <div className="text-sm">
              <p>{payment.student.firstName} {payment.student.lastName}</p>
              <p className="text-gray-500">{payment.student.email}</p>
            </div>
          </div>
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">Course</h4>
            <p className="text-sm">{payment.course.title}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
          {payment.status === 'completed' && (
            <button
              onClick={onRefund}
              className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Process Refund
            </button>
          )}
        </div>
      </div>
    </div>
  );
};


// Main Component
const FinancialDashboard = () => {
  // State
  const [metrics, setMetrics] = useState<FinancialMetrics | null>(null);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsLoading, setPaymentsLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});
  
  // Modal state
  const [selectedPayment, setSelectedPayment] = useState<PaymentTransaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundLoading, setRefundLoading] = useState(false);
  
  // Period state
  const [period, setPeriod] = useState(30);

  // Get admin token
  const getAdminToken = () => localStorage.getItem('adminToken');

  // Fetch metrics
  const fetchMetrics = useCallback(async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/financial/metrics?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, [period]);

  // Fetch chart data
  const fetchChartData = useCallback(async () => {
    setChartLoading(true);
    try {
      const token = getAdminToken();
      const groupBy = period <= 7 ? 'day' : period <= 30 ? 'day' : 'week';
      const response = await fetch(`/api/admin/financial/revenue-chart?period=${period}&groupBy=${groupBy}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch chart data');
      const data = await response.json();
      setChartData(data.chartData);
    } catch (err: any) {
      console.error('Chart data error:', err);
    } finally {
      setChartLoading(false);
    }
  }, [period]);

  // Fetch payments
  const fetchPayments = useCallback(async () => {
    setPaymentsLoading(true);
    try {
      const token = getAdminToken();
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (filters.status) params.append('status', filters.status as string);
      if (filters.dateRange) {
        const dateRange = filters.dateRange as DateRange;
        if (dateRange.start) params.append('startDate', dateRange.start);
        if (dateRange.end) params.append('endDate', dateRange.end);
      }
      if (filters.amountRange) {
        const amountRange = filters.amountRange as NumberRange;
        if (amountRange.min !== null) params.append('minAmount', amountRange.min.toString());
        if (amountRange.max !== null) params.append('maxAmount', amountRange.max.toString());
      }

      const response = await fetch(`/api/admin/financial/payments?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch payments');
      const data = await response.json();
      setPayments(data.payments);
      setTotalItems(data.pagination.totalItems);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPaymentsLoading(false);
    }
  }, [page, pageSize, searchQuery, filters]);

  // Process refund
  const handleRefund = async (reason: string) => {
    if (!selectedPayment) return;
    
    setRefundLoading(true);
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/financial/payments/${selectedPayment.id}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to process refund');
      }
      
      // Refresh data
      await Promise.all([fetchMetrics(), fetchPayments()]);
      setShowRefundModal(false);
      setSelectedPayment(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setRefundLoading(false);
    }
  };

  // Export report
  const handleExport = async (format: 'csv' | 'json') => {
    try {
      const token = getAdminToken();
      const params = new URLSearchParams({ format });
      
      if (filters.dateRange) {
        const dateRange = filters.dateRange as DateRange;
        if (dateRange.start) params.append('startDate', dateRange.start);
        if (dateRange.end) params.append('endDate', dateRange.end);
      }

      const response = await fetch(`/api/admin/financial/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to export report');
      
      if (format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchMetrics(), fetchChartData(), fetchPayments()]);
      setLoading(false);
    };
    loadData();
  }, [fetchMetrics, fetchChartData, fetchPayments]);

  // Filter options
  const filterOptions: FilterOption[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Completed', value: 'completed' },
        { label: 'Pending', value: 'pending' },
        { label: 'Failed', value: 'failed' },
        { label: 'Refunded', value: 'refunded' },
      ],
    },
    {
      key: 'dateRange',
      label: 'Date Range',
      type: 'date-range',
    },
    {
      key: 'amountRange',
      label: 'Amount Range',
      type: 'number-range',
    },
  ];

  // Table columns
  const columns: ColumnDef<PaymentTransaction>[] = [
    {
      id: 'transactionId',
      header: 'Transaction ID',
      accessor: 'transactionId',
      render: (value) => (
        <span className="font-mono text-xs">{(value as string).substring(0, 20)}...</span>
      ),
    },
    {
      id: 'student',
      header: 'Student',
      accessor: (row) => row.student.email,
      render: (_, row) => (
        <div>
          <p className="font-medium">{row.student.firstName} {row.student.lastName}</p>
          <p className="text-xs text-gray-500">{row.student.email}</p>
        </div>
      ),
    },
    {
      id: 'course',
      header: 'Course',
      accessor: (row) => row.course.title,
      hiddenOnMobile: true,
    },
    {
      id: 'amount',
      header: 'Amount',
      accessor: 'amount',
      sortable: true,
      align: 'right',
      render: (value, row) => (
        <span className="font-medium">${(value as number).toFixed(2)} {row.currency}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      render: (value) => <StatusBadge status={value as string} />,
    },
    {
      id: 'createdAt',
      header: 'Date',
      accessor: 'createdAt',
      sortable: true,
      hiddenOnMobile: true,
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id',
      align: 'center',
      render: (_, row) => (
        <div className="flex gap-2 justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPayment(row);
              setShowDetailModal(true);
            }}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            View
          </button>
          {row.status === 'completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPayment(row);
                setShowRefundModal(true);
              }}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Refund
            </button>
          )}
        </div>
      ),
    },
  ];

  // Pagination config
  const paginationConfig: PaginationConfig = {
    page,
    pageSize,
    totalItems,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    pageSizeOptions: [10, 25, 50, 100],
  };

  if (loading) {
    return (
      <AdminLayout title="Financial Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Financial Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error}
        </div>
      </AdminLayout>
    );
  }


  return (
    <AdminLayout title="Financial Dashboard">
      <FadeIn>
        <div className="space-y-6">
          {/* Header with Period Selector and Export */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
              <p className="text-gray-600">Monitor revenue, transactions, and payment activity</p>
            </div>
            <div className="flex gap-3">
              <select
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={30}>Last 30 days</option>
                <option value={90}>Last 90 days</option>
                <option value={365}>Last year</option>
              </select>
              <div className="relative group">
                <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <ExportIcon />
                  <span className="ml-2">Export</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 hidden group-hover:block z-10">
                  <button
                    onClick={() => handleExport('csv')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Export as JSON
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Revenue"
              value={`$${metrics?.totalRevenue.toLocaleString() || 0}`}
              icon={MetricIcons.Revenue}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
            />
            <MetricCard
              title={`Revenue (${period} days)`}
              value={`$${metrics?.periodRevenue.toLocaleString() || 0}`}
              change={metrics?.revenueChange !== undefined ? {
                value: Math.abs(metrics.revenueChange),
                type: metrics.revenueChange >= 0 ? 'increase' : 'decrease',
                period: 'vs previous period',
              } : undefined}
              icon={MetricIcons.Revenue}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
            <MetricCard
              title="Success Rate"
              value={`${metrics?.successRate || 0}%`}
              icon={<SuccessRateIcon />}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
            <MetricCard
              title="Avg. Order Value"
              value={`$${metrics?.averageOrderValue.toFixed(2) || 0}`}
              icon={MetricIcons.Revenue}
              iconBgColor="bg-orange-100"
              iconColor="text-orange-600"
            />
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard
              title="Total Transactions"
              value={metrics?.totalTransactions || 0}
              icon={MetricIcons.Enrollments}
              iconBgColor="bg-gray-100"
              iconColor="text-gray-600"
            />
            <MetricCard
              title="Refunded"
              value={`$${metrics?.refundedAmount.toLocaleString() || 0} (${metrics?.refundedCount || 0})`}
              icon={<RefundIcon />}
              iconBgColor="bg-red-100"
              iconColor="text-red-600"
            />
            <MetricCard
              title="Failed Transactions"
              value={metrics?.failedCount || 0}
              icon={MetricIcons.Enrollments}
              iconBgColor="bg-yellow-100"
              iconColor="text-yellow-600"
            />
          </div>

          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
            <RevenueChart data={chartData} loading={chartLoading} />
          </div>

          {/* Transactions Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Transactions</h3>
            
            <div className="mb-4">
              <SearchAndFilter
                searchPlaceholder="Search by email, name, course, or transaction ID..."
                filters={filterOptions}
                onSearch={(query) => {
                  setSearchQuery(query);
                  setPage(1);
                }}
                onFilter={(newFilters) => {
                  setFilters(newFilters);
                  setPage(1);
                }}
                searchValue={searchQuery}
                filterValues={filters}
              />
            </div>

            <DataTable
              data={payments}
              columns={columns}
              loading={paymentsLoading}
              pagination={paginationConfig}
              onRowClick={(row) => {
                setSelectedPayment(row);
                setShowDetailModal(true);
              }}
              emptyMessage="No payment transactions found"
            />
          </div>
        </div>
      </FadeIn>

      {/* Modals */}
      {showDetailModal && (
        <PaymentDetailModal
          payment={selectedPayment}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedPayment(null);
          }}
          onRefund={() => {
            setShowDetailModal(false);
            setShowRefundModal(true);
          }}
        />
      )}

      {showRefundModal && (
        <RefundModal
          payment={selectedPayment}
          onClose={() => {
            setShowRefundModal(false);
            setSelectedPayment(null);
          }}
          onConfirm={handleRefund}
          loading={refundLoading}
        />
      )}
    </AdminLayout>
  );
};

export default FinancialDashboard;
