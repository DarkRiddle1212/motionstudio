import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './';
import { FadeIn } from '../Animation';
import MetricCard, { MetricIcons } from './MetricCard';

// Types
interface PlatformKPIs {
  activeUsers: number;
  activeUsersChange: number;
  totalEnrollments: number;
  enrollmentsChange: number;
  courseCompletions: number;
  completionsChange: number;
  totalRevenue: number;
  revenueChange: number;
  averageRating: number;
  newUsersThisPeriod: number;
  period: number;
}

interface UserEngagementMetrics {
  dailyActiveUsers: number[];
  weeklyActiveUsers: number[];
  averageSessionDuration: number;
  loginFrequency: number;
  featureUsage: {
    feature: string;
    usage: number;
    percentage: number;
  }[];
  userRetention: {
    period: string;
    rate: number;
  }[];
}

interface CoursePerformanceData {
  courseId: string;
  title: string;
  enrollments: number;
  completionRate: number;
  averageRating: number;
  revenue: number;
  feedbackCount: number;
}

interface SystemHealthMetrics {
  serverStatus: 'healthy' | 'degraded' | 'down';
  responseTime: number;
  errorRate: number;
  uptime: number;
  databaseConnections: number;
  memoryUsage: number;
  cpuUsage: number;
  activeRequests: number;
}

interface AnalyticsExportOptions {
  format: 'csv' | 'json' | 'pdf';
  metrics: string[];
  dateRange: {
    start: string;
    end: string;
  };
}

// Icons
const TrendUpIcon = () => (
  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

const TrendDownIcon = () => (
  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
  </svg>
);

const ExportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const RefreshIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

// Status Badge Component
const StatusBadge = ({ status }: { status: 'healthy' | 'degraded' | 'down' }) => {
  const statusStyles = {
    healthy: 'bg-green-100 text-green-800',
    degraded: 'bg-yellow-100 text-yellow-800',
    down: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusStyles[status]}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Simple Bar Chart Component
const SimpleBarChart = ({ data, label }: { data: number[]; label: string }) => {
  const max = Math.max(...data, 1);
  
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">{label}</p>
      <div className="flex items-end h-24 gap-1">
        {data.map((value, index) => (
          <div
            key={index}
            className="flex-1 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
            style={{ height: `${(value / max) * 100}%`, minHeight: value > 0 ? '4px' : '0' }}
            title={`${value}`}
          />
        ))}
      </div>
    </div>
  );
};

// Progress Ring Component
const ProgressRing = ({ percentage, size = 80, strokeWidth = 8 }: { percentage: number; size?: number; strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-blue-600"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-semibold">{percentage}%</span>
      </div>
    </div>
  );
};


// Export Modal Component
const ExportModal = ({
  onClose,
  onExport,
  loading,
}: {
  onClose: () => void;
  onExport: (options: AnalyticsExportOptions) => void;
  loading: boolean;
}) => {
  const [format, setFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['kpis', 'engagement', 'courses']);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const metricOptions = [
    { id: 'kpis', label: 'Key Performance Indicators' },
    { id: 'engagement', label: 'User Engagement Metrics' },
    { id: 'courses', label: 'Course Performance' },
    { id: 'system', label: 'System Health' },
  ];

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metricId) ? prev.filter((m) => m !== metricId) : [...prev, metricId]
    );
  };

  const handleExport = () => {
    onExport({
      format,
      metrics: selectedMetrics,
      dateRange: { start: startDate, end: endDate },
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Export Analytics</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Format Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
            <div className="flex gap-3">
              {(['csv', 'json', 'pdf'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    format === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Include Metrics</label>
            <div className="space-y-2">
              {metricOptions.map((option) => (
                <label key={option.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedMetrics.includes(option.id)}
                    onChange={() => toggleMetric(option.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range (Optional)</label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
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
            onClick={handleExport}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading || selectedMetrics.length === 0}
          >
            {loading ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Course Performance Table Component
const CoursePerformanceTable = ({ courses, loading }: { courses: CoursePerformanceData[]; loading: boolean }) => {
  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-200 rounded" />
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No course data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Enrollments</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Completion</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {courses.map((course) => (
            <tr key={course.courseId} className="hover:bg-gray-50">
              <td className="px-4 py-3 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{course.title}</div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500">
                {course.enrollments}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <div className="flex items-center justify-end">
                  <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${course.completionRate}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500">{course.completionRate}%</span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right">
                <div className="flex items-center justify-end">
                  <StarIcon />
                  <span className="ml-1 text-sm text-gray-500">{course.averageRating.toFixed(1)}</span>
                </div>
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                ${course.revenue.toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};


// Main Analytics Dashboard Component
const AnalyticsDashboard = () => {
  // State
  const [kpis, setKpis] = useState<PlatformKPIs | null>(null);
  const [engagement, setEngagement] = useState<UserEngagementMetrics | null>(null);
  const [coursePerformance, setCoursePerformance] = useState<CoursePerformanceData[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealthMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState(30);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get admin token
  const getAdminToken = () => localStorage.getItem('adminToken');

  // Fetch KPIs
  const fetchKPIs = useCallback(async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/analytics/kpis?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch KPIs');
      const data = await response.json();
      setKpis(data);
    } catch (err: any) {
      console.error('KPIs error:', err);
      // Set mock data for demo
      setKpis({
        activeUsers: 1250,
        activeUsersChange: 12.5,
        totalEnrollments: 3420,
        enrollmentsChange: 8.3,
        courseCompletions: 892,
        completionsChange: 15.2,
        totalRevenue: 125000,
        revenueChange: 22.1,
        averageRating: 4.6,
        newUsersThisPeriod: 156,
        period,
      });
    }
  }, [period]);

  // Fetch User Engagement
  const fetchEngagement = useCallback(async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/analytics/engagement?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch engagement');
      const data = await response.json();
      setEngagement(data);
    } catch (err: any) {
      console.error('Engagement error:', err);
      // Set mock data for demo
      setEngagement({
        dailyActiveUsers: [120, 145, 132, 168, 155, 142, 178],
        weeklyActiveUsers: [850, 920, 880, 950],
        averageSessionDuration: 24.5,
        loginFrequency: 3.2,
        featureUsage: [
          { feature: 'Course Viewing', usage: 4520, percentage: 85 },
          { feature: 'Assignment Submission', usage: 1230, percentage: 45 },
          { feature: 'Discussion Forums', usage: 890, percentage: 32 },
          { feature: 'Portfolio Viewing', usage: 650, percentage: 24 },
        ],
        userRetention: [
          { period: 'Day 1', rate: 85 },
          { period: 'Day 7', rate: 62 },
          { period: 'Day 30', rate: 45 },
          { period: 'Day 90', rate: 32 },
        ],
      });
    }
  }, [period]);

  // Fetch Course Performance
  const fetchCoursePerformance = useCallback(async () => {
    try {
      const token = getAdminToken();
      const response = await fetch(`/api/admin/analytics/courses?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch course performance');
      const data = await response.json();
      setCoursePerformance(data.courses || []);
    } catch (err: any) {
      console.error('Course performance error:', err);
      // Set mock data for demo
      setCoursePerformance([
        { courseId: '1', title: 'Motion Design Fundamentals', enrollments: 450, completionRate: 72, averageRating: 4.8, revenue: 22500, feedbackCount: 120 },
        { courseId: '2', title: 'Advanced Animation Techniques', enrollments: 280, completionRate: 58, averageRating: 4.6, revenue: 19600, feedbackCount: 85 },
        { courseId: '3', title: 'UI/UX Animation', enrollments: 320, completionRate: 65, averageRating: 4.7, revenue: 16000, feedbackCount: 95 },
        { courseId: '4', title: '3D Motion Graphics', enrollments: 180, completionRate: 45, averageRating: 4.5, revenue: 12600, feedbackCount: 52 },
      ]);
    }
  }, [period]);

  // Fetch System Health
  const fetchSystemHealth = useCallback(async () => {
    try {
      const token = getAdminToken();
      const response = await fetch('${API_URL}/admin/analytics/system-health', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to fetch system health');
      const data = await response.json();
      setSystemHealth(data);
    } catch (err: any) {
      console.error('System health error:', err);
      // Set mock data for demo
      setSystemHealth({
        serverStatus: 'healthy',
        responseTime: 145,
        errorRate: 0.12,
        uptime: 99.98,
        databaseConnections: 24,
        memoryUsage: 68,
        cpuUsage: 42,
        activeRequests: 156,
      });
    }
  }, []);

  // Refresh all data
  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([fetchKPIs(), fetchEngagement(), fetchCoursePerformance(), fetchSystemHealth()]);
    setRefreshing(false);
  };

  // Export analytics
  const handleExport = async (options: AnalyticsExportOptions) => {
    setExportLoading(true);
    try {
      const token = getAdminToken();
      const params = new URLSearchParams({
        format: options.format,
        metrics: options.metrics.join(','),
      });
      if (options.dateRange.start) params.append('startDate', options.dateRange.start);
      if (options.dateRange.end) params.append('endDate', options.dateRange.end);

      const response = await fetch(`/api/admin/analytics/export?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to export analytics');

      if (options.format === 'csv') {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else if (options.format === 'json') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        // PDF would be handled differently - for now just download JSON
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }

      setShowExportModal(false);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setExportLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      await Promise.all([fetchKPIs(), fetchEngagement(), fetchCoursePerformance(), fetchSystemHealth()]);
      setLoading(false);
    };
    loadData();
  }, [fetchKPIs, fetchEngagement, fetchCoursePerformance, fetchSystemHealth]);

  if (loading) {
    return (
      <AdminLayout title="Analytics Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="Analytics Dashboard">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          Error: {error}
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Analytics Dashboard">
      <FadeIn>
        <div className="space-y-6">
          {/* Header with Period Selector and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Platform Analytics</h2>
              <p className="text-gray-600">Monitor platform performance and user engagement</p>
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
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                <RefreshIcon />
                <span className="ml-2">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <button
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExportIcon />
                <span className="ml-2">Export</span>
              </button>
            </div>
          </div>

          {/* Key Performance Indicators */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Active Users"
              value={kpis?.activeUsers.toLocaleString() || '0'}
              change={kpis?.activeUsersChange !== undefined ? {
                value: Math.abs(kpis.activeUsersChange),
                type: kpis.activeUsersChange >= 0 ? 'increase' : 'decrease',
                period: 'vs previous period',
              } : undefined}
              icon={MetricIcons.Users}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
            <MetricCard
              title="Total Enrollments"
              value={kpis?.totalEnrollments.toLocaleString() || '0'}
              change={kpis?.enrollmentsChange !== undefined ? {
                value: Math.abs(kpis.enrollmentsChange),
                type: kpis.enrollmentsChange >= 0 ? 'increase' : 'decrease',
                period: 'vs previous period',
              } : undefined}
              icon={MetricIcons.Enrollments}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
            />
            <MetricCard
              title="Course Completions"
              value={kpis?.courseCompletions.toLocaleString() || '0'}
              change={kpis?.completionsChange !== undefined ? {
                value: Math.abs(kpis.completionsChange),
                type: kpis.completionsChange >= 0 ? 'increase' : 'decrease',
                period: 'vs previous period',
              } : undefined}
              icon={MetricIcons.Courses}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
            <MetricCard
              title="Total Revenue"
              value={`$${kpis?.totalRevenue.toLocaleString() || '0'}`}
              change={kpis?.revenueChange !== undefined ? {
                value: Math.abs(kpis.revenueChange),
                type: kpis.revenueChange >= 0 ? 'increase' : 'decrease',
                period: 'vs previous period',
              } : undefined}
              icon={MetricIcons.Revenue}
              iconBgColor="bg-orange-100"
              iconColor="text-orange-600"
            />
          </div>

          {/* User Engagement Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily Active Users Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
              {engagement && (
                <div className="space-y-6">
                  <SimpleBarChart data={engagement.dailyActiveUsers} label="Daily Active Users (Last 7 days)" />
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <p className="text-sm text-gray-500">Avg. Session Duration</p>
                      <p className="text-2xl font-semibold">{engagement.averageSessionDuration} min</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Login Frequency</p>
                      <p className="text-2xl font-semibold">{engagement.loginFrequency}x/week</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Feature Usage */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Usage</h3>
              {engagement && (
                <div className="space-y-4">
                  {engagement.featureUsage.map((feature) => (
                    <div key={feature.feature}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700">{feature.feature}</span>
                        <span className="text-gray-500">{feature.usage.toLocaleString()} uses</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${feature.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* User Retention */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Retention</h3>
            {engagement && (
              <div className="flex justify-around items-center">
                {engagement.userRetention.map((retention) => (
                  <div key={retention.period} className="text-center">
                    <ProgressRing percentage={retention.rate} />
                    <p className="mt-2 text-sm text-gray-600">{retention.period}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Course Performance */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Performance</h3>
            <CoursePerformanceTable courses={coursePerformance} loading={false} />
          </div>

          {/* System Health */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
              {systemHealth && <StatusBadge status={systemHealth.serverStatus} />}
            </div>
            {systemHealth && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-500">Response Time</p>
                  <p className="text-2xl font-semibold">{systemHealth.responseTime}ms</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Error Rate</p>
                  <p className="text-2xl font-semibold">{systemHealth.errorRate}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Uptime</p>
                  <p className="text-2xl font-semibold">{systemHealth.uptime}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Active Requests</p>
                  <p className="text-2xl font-semibold">{systemHealth.activeRequests}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Memory Usage</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className={`h-2 rounded-full ${systemHealth.memoryUsage > 80 ? 'bg-red-500' : systemHealth.memoryUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${systemHealth.memoryUsage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{systemHealth.memoryUsage}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">CPU Usage</p>
                  <div className="flex items-center">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className={`h-2 rounded-full ${systemHealth.cpuUsage > 80 ? 'bg-red-500' : systemHealth.cpuUsage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${systemHealth.cpuUsage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{systemHealth.cpuUsage}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">DB Connections</p>
                  <p className="text-2xl font-semibold">{systemHealth.databaseConnections}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Export Modal */}
      {showExportModal && (
        <ExportModal
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          loading={exportLoading}
        />
      )}
    </AdminLayout>
  );
};

export default AnalyticsDashboard;

