import { AdminLayout } from './';
import { FadeIn } from '../Animation';
import MetricCard, { MetricIcons } from './MetricCard';

const AdminDashboard = () => {
  return (
    <AdminLayout title="Admin Dashboard">
      <FadeIn>
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-brand-surface-bg rounded-lg shadow-card border border-brand-accent border-opacity-20 p-6">
            <h2 className="text-2xl font-bold text-brand-primary-text mb-2">
              Welcome to Motion Studio Admin Panel
            </h2>
            <p className="text-brand-secondary-text">
              Manage users, courses, payments, and platform settings from this centralized dashboard.
            </p>
          </div>

          {/* Quick Stats Grid using MetricCard component */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <MetricCard
              title="Total Users"
              value="-"
              icon={MetricIcons.Users}
              iconBgColor="bg-brand-accent bg-opacity-20"
              iconColor="text-brand-accent"
            />
            <MetricCard
              title="Active Courses"
              value="-"
              icon={MetricIcons.Courses}
              iconBgColor="bg-brand-success bg-opacity-20"
              iconColor="text-brand-success"
            />
            <MetricCard
              title="Monthly Revenue"
              value="-"
              icon={MetricIcons.Revenue}
              iconBgColor="bg-brand-accent-light bg-opacity-20"
              iconColor="text-brand-accent-light"
            />
            <MetricCard
              title="Enrollments"
              value="-"
              icon={MetricIcons.Enrollments}
              iconBgColor="bg-brand-warning bg-opacity-20"
              iconColor="text-brand-warning"
            />
          </div>

          {/* Recent Activity */}
          <div className="bg-brand-surface-bg rounded-lg shadow-card border border-brand-accent border-opacity-20 p-6">
            <h3 className="text-lg font-semibold text-brand-primary-text mb-4">Recent Activity</h3>
            <div className="text-center py-8 text-brand-secondary-text">
              <svg className="w-12 h-12 mx-auto mb-4 text-brand-muted-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>No recent activity to display</p>
              <p className="text-sm">Activity will appear here as users interact with the platform</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-brand-surface-bg rounded-lg shadow-card border border-brand-accent border-opacity-20 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-brand-primary-text mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button className="p-4 border border-brand-accent border-opacity-20 rounded-lg hover:bg-brand-tertiary-bg transition-colors text-left touch-manipulation">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-brand-accent bg-opacity-20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-5 h-5 text-brand-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-brand-primary-text truncate">Add New User</p>
                    <p className="text-sm text-brand-secondary-text truncate">Create instructor or admin account</p>
                  </div>
                </div>
              </button>

              <button className="p-4 border border-brand-accent border-opacity-20 rounded-lg hover:bg-brand-tertiary-bg transition-colors text-left touch-manipulation">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-brand-success bg-opacity-20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-5 h-5 text-brand-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-brand-primary-text truncate">Generate Report</p>
                    <p className="text-sm text-brand-secondary-text truncate">Export platform analytics</p>
                  </div>
                </div>
              </button>

              <button className="p-4 border border-brand-accent border-opacity-20 rounded-lg hover:bg-brand-tertiary-bg transition-colors text-left touch-manipulation sm:col-span-2 lg:col-span-1">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-brand-accent-light bg-opacity-20 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                    <svg className="w-5 h-5 text-brand-accent-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-brand-primary-text truncate">System Settings</p>
                    <p className="text-sm text-brand-secondary-text truncate">Configure platform options</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </FadeIn>
    </AdminLayout>
  );
};

export default AdminDashboard;
