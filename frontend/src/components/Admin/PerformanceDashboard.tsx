import { useState, useEffect } from 'react';
import { AdminLayout } from './';
import { FadeIn } from '../Animation';
import MetricCard, { MetricIcons } from './MetricCard';
import { performanceMonitor, checkPerformanceBudget } from '../../utils/performanceMonitor';
import { adminCache } from '../../utils/adminCache';

interface PerformanceStats {
  components: {
    tracked: number;
    slowest: Array<{
      componentName: string;
      renderTime: number;
      updateCount: number;
    }>;
  };
  network: {
    totalRequests: number;
    recentRequests: number;
    averageTime: number;
    slowRequests: Array<{
      url: string;
      duration: number;
      status: number;
    }>;
  };
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
  coreWebVitals: {
    lcp?: number;
    fid?: number;
    cls?: number;
  };
}

const PerformanceDashboard = () => {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [cacheStats, setCacheStats] = useState<any>(null);
  const [budgetCheck, setBudgetCheck] = useState<any>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    const updateStats = () => {
      const summary = performanceMonitor.getSummary();
      setStats(summary as PerformanceStats);
      
      const cache = adminCache.getStats();
      setCacheStats(cache);
      
      const budget = checkPerformanceBudget();
      setBudgetCheck(budget);
    };

    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const toggleMonitoring = () => {
    const newState = !isMonitoring;
    setIsMonitoring(newState);
    performanceMonitor.setEnabled(newState);
  };

  const clearMetrics = () => {
    performanceMonitor.clear();
    adminCache.clear();
    setStats(null);
    setCacheStats(null);
    setBudgetCheck(null);
  };

  const exportMetrics = () => {
    const data = performanceMonitor.exportMetrics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; poor: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.poor) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <AdminLayout title="Performance Dashboard">
      <FadeIn>
        <div className="space-y-6">
          {/* Header Controls */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Performance Monitoring</h2>
                <p className="text-gray-600 mt-1">
                  Monitor admin panel performance metrics and optimize user experience
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={toggleMonitoring}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isMonitoring
                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                      : 'bg-green-100 text-green-700 hover:bg-green-200'
                  }`}
                >
                  {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
                </button>
                <button
                  onClick={exportMetrics}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  Export Data
                </button>
                <button
                  onClick={clearMetrics}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear Metrics
                </button>
              </div>
            </div>
          </div>

          {/* Performance Budget Status */}
          {budgetCheck && (
            <div className={`rounded-lg p-6 ${budgetCheck.passed ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${budgetCheck.passed ? 'bg-green-100' : 'bg-red-100'}`}>
                  {budgetCheck.passed ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div>
                  <h3 className={`font-semibold ${budgetCheck.passed ? 'text-green-800' : 'text-red-800'}`}>
                    Performance Budget {budgetCheck.passed ? 'Passed' : 'Failed'}
                  </h3>
                  {!budgetCheck.passed && (
                    <ul className="mt-2 text-sm text-red-700">
                      {budgetCheck.issues.map((issue: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Core Web Vitals */}
          {stats?.coreWebVitals && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <MetricCard
                title="LCP (Largest Contentful Paint)"
                value={stats.coreWebVitals.lcp ? formatTime(stats.coreWebVitals.lcp) : 'N/A'}
                icon={MetricIcons.Performance}
                iconBgColor="bg-blue-100"
                iconColor={stats.coreWebVitals.lcp ? getPerformanceColor(stats.coreWebVitals.lcp, { good: 2500, poor: 4000 }) : 'text-gray-500'}
              />
              <MetricCard
                title="FID (First Input Delay)"
                value={stats.coreWebVitals.fid ? formatTime(stats.coreWebVitals.fid) : 'N/A'}
                icon={MetricIcons.Performance}
                iconBgColor="bg-green-100"
                iconColor={stats.coreWebVitals.fid ? getPerformanceColor(stats.coreWebVitals.fid, { good: 100, poor: 300 }) : 'text-gray-500'}
              />
              <MetricCard
                title="CLS (Cumulative Layout Shift)"
                value={stats.coreWebVitals.cls ? stats.coreWebVitals.cls.toFixed(3) : 'N/A'}
                icon={MetricIcons.Performance}
                iconBgColor="bg-purple-100"
                iconColor={stats.coreWebVitals.cls ? getPerformanceColor(stats.coreWebVitals.cls, { good: 0.1, poor: 0.25 }) : 'text-gray-500'}
              />
            </div>
          )}

          {/* Performance Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Components Tracked"
              value={stats?.components.tracked || 0}
              icon={MetricIcons.Components}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
            <MetricCard
              title="Network Requests"
              value={stats?.network.recentRequests || 0}
              icon={MetricIcons.Network}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
            />
            <MetricCard
              title="Avg Response Time"
              value={stats?.network.averageTime ? formatTime(stats.network.averageTime) : 'N/A'}
              icon={MetricIcons.Speed}
              iconBgColor="bg-yellow-100"
              iconColor="text-yellow-600"
            />
            <MetricCard
              title="Cache Hit Rate"
              value={cacheStats ? `${((cacheStats.size / (cacheStats.size + 10)) * 100).toFixed(1)}%` : 'N/A'}
              icon={MetricIcons.Cache}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
          </div>

          {/* Memory Usage */}
          {stats?.memory && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory Usage</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatBytes(stats.memory.usedJSHeapSize)}
                  </div>
                  <div className="text-sm text-gray-600">Used Heap</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatBytes(stats.memory.totalJSHeapSize)}
                  </div>
                  <div className="text-sm text-gray-600">Total Heap</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {formatBytes(stats.memory.jsHeapSizeLimit)}
                  </div>
                  <div className="text-sm text-gray-600">Heap Limit</div>
                </div>
              </div>
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(stats.memory.usedJSHeapSize / stats.memory.jsHeapSizeLimit) * 100}%`
                    }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {((stats.memory.usedJSHeapSize / stats.memory.jsHeapSizeLimit) * 100).toFixed(1)}% of limit used
                </div>
              </div>
            </div>
          )}

          {/* Slowest Components */}
          {stats?.components.slowest && stats.components.slowest.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Slowest Components</h3>
              <div className="space-y-3">
                {stats.components.slowest.slice(0, 5).map((component, index) => (
                  <div key={component.componentName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{component.componentName}</div>
                      <div className="text-sm text-gray-600">
                        {component.updateCount} updates
                      </div>
                    </div>
                    <div className={`text-right ${getPerformanceColor(component.renderTime, { good: 16, poor: 50 })}`}>
                      <div className="font-semibold">{formatTime(component.renderTime)}</div>
                      <div className="text-xs">render time</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slow Network Requests */}
          {stats?.network.slowRequests && stats.network.slowRequests.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Slow Network Requests</h3>
              <div className="space-y-3">
                {stats.network.slowRequests.slice(0, 5).map((request, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{request.url}</div>
                      <div className="text-sm text-gray-600">
                        Status: {request.status}
                      </div>
                    </div>
                    <div className="text-right text-red-600">
                      <div className="font-semibold">{formatTime(request.duration)}</div>
                      <div className="text-xs">response time</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cache Statistics */}
          {cacheStats && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache Statistics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{cacheStats.size}</div>
                  <div className="text-sm text-gray-600">Cached Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{cacheStats.maxSize}</div>
                  <div className="text-sm text-gray-600">Max Size</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{cacheStats.expiredCount}</div>
                  <div className="text-sm text-gray-600">Expired</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {((cacheStats.size / cacheStats.maxSize) * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-gray-600">Usage</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </FadeIn>
    </AdminLayout>
  );
};

export default PerformanceDashboard;