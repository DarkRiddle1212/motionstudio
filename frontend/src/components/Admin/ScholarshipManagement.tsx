import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './';
import DataTable, { ColumnDef, PaginationConfig, SortingConfig, SortDirection } from './DataTable';
import SearchAndFilter, { FilterOption, FilterValue } from './SearchAndFilter';
import MetricCard, { MetricIcons } from './MetricCard';
import { useAuth } from '../../hooks/useAuth';

interface Scholarship {
  id: string;
  studentId: string;
  courseId: string;
  discountPercentage: number;
  reason: string;
  grantedById: string;
  grantedAt: string;
  expiresAt: string | null;
  status: 'active' | 'expired' | 'revoked';
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
  };
}

interface ScholarshipStats {
  totalScholarships: number;
  activeScholarships: number;
  revokedScholarships: number;
  expiredScholarships: number;
  fullScholarships: number;
  totalScholarshipValue: number;
}

interface Student {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}

interface Course {
  id: string;
  title: string;
  pricing: number;
  currency: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const ScholarshipManagement = () => {
  const { token } = useAuth();
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [stats, setStats] = useState<ScholarshipStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
  });

  // Sorting state
  const [sorting, setSorting] = useState<{ column: string | null; direction: SortDirection }>({
    column: 'grantedAt',
    direction: 'desc',
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showManualEnrollModal, setShowManualEnrollModal] = useState(false);
  const [selectedScholarship, setSelectedScholarship] = useState<Scholarship | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);


  const fetchStats = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/admin/scholarships/stats`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [token]);

  const fetchScholarships = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('pageSize', pagination.pageSize.toString());
      
      if (searchQuery) params.append('search', searchQuery);
      if (filters.status) params.append('status', filters.status as string);
      if (sorting.column) {
        params.append('sortBy', sorting.column);
        params.append('sortOrder', sorting.direction || 'desc');
      }

      const response = await fetch(`${API_URL}/admin/scholarships?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch scholarships');
      }

      const data = await response.json();
      setScholarships(data.scholarships);
      setPagination(prev => ({
        ...prev,
        totalItems: data.pagination.totalItems,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [token, pagination.page, pagination.pageSize, searchQuery, filters, sorting]);

  useEffect(() => {
    fetchStats();
    fetchScholarships();
  }, [fetchStats, fetchScholarships]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleFilter = useCallback((newFilters: Record<string, FilterValue>) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  const handleSort = useCallback((column: string, direction: SortDirection) => {
    setSorting({ column, direction });
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const handleRevokeScholarship = async (scholarshipId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to revoke this scholarship? The student will lose course access if it was a full scholarship.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/admin/scholarships/${scholarshipId}/revoke`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to revoke scholarship');
      }

      fetchScholarships();
      fetchStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An error occurred');
    }
  };


  const columns: ColumnDef<Scholarship>[] = [
    {
      id: 'student',
      header: 'Student',
      accessor: (row) => (
        <div>
          <p className="font-medium text-gray-900">
            {row.student.firstName || ''} {row.student.lastName || ''}
          </p>
          <p className="text-sm text-gray-500">{row.student.email}</p>
        </div>
      ),
      sortable: false,
    },
    {
      id: 'course',
      header: 'Course',
      accessor: (row) => row.course.title,
      sortable: false,
    },
    {
      id: 'discount',
      header: 'Discount',
      accessor: (row) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          row.discountPercentage === 100 
            ? 'bg-green-100 text-green-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {row.discountPercentage}%
        </span>
      ),
      sortable: true,
      align: 'center',
    },
    {
      id: 'value',
      header: 'Value',
      accessor: (row) => `$${((row.course.pricing * row.discountPercentage) / 100).toFixed(2)}`,
      align: 'right',
      hiddenOnMobile: true,
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'status',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === 'active' ? 'bg-green-100 text-green-700' :
          value === 'revoked' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {(value as string).charAt(0).toUpperCase() + (value as string).slice(1)}
        </span>
      ),
      sortable: true,
    },
    {
      id: 'grantedAt',
      header: 'Granted',
      accessor: (row) => new Date(row.grantedAt).toLocaleDateString(),
      sortable: true,
      hiddenOnMobile: true,
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: () => null,
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedScholarship(row);
              setShowDetailModal(true);
            }}
            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
            title="View details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {row.status === 'active' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRevokeScholarship(row.id);
              }}
              className="p-1 text-gray-500 hover:text-red-600 transition-colors"
              title="Revoke scholarship"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </button>
          )}
        </div>
      ),
    },
  ];

  const filterOptions: FilterOption[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Expired', value: 'expired' },
        { label: 'Revoked', value: 'revoked' },
      ],
    },
  ];

  const paginationConfig: PaginationConfig = {
    page: pagination.page,
    pageSize: pagination.pageSize,
    totalItems: pagination.totalItems,
    onPageChange: handlePageChange,
    onPageSizeChange: handlePageSizeChange,
    pageSizeOptions: [10, 25, 50, 100],
  };

  const sortingConfig: SortingConfig = {
    column: sorting.column,
    direction: sorting.direction,
    onSort: handleSort,
  };


  return (
    <AdminLayout 
      title="Scholarship Management"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Scholarships' },
      ]}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Active Scholarships"
              value={stats.activeScholarships}
              icon={MetricIcons.Users}
              iconBgColor="bg-green-100"
              iconColor="text-green-600"
            />
            <MetricCard
              title="Full Scholarships"
              value={stats.fullScholarships}
              icon={MetricIcons.Enrollments}
              iconBgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
            <MetricCard
              title="Total Value"
              value={`$${stats.totalScholarshipValue.toFixed(2)}`}
              icon={MetricIcons.Revenue}
              iconBgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
            <MetricCard
              title="Revoked"
              value={stats.revokedScholarships}
              icon={MetricIcons.Courses}
              iconBgColor="bg-red-100"
              iconColor="text-red-600"
            />
          </div>
        )}

        {/* Header with Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-gray-600">
              Manage scholarships and manual enrollments for students.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowManualEnrollModal(true)}
              className="inline-flex items-center px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Manual Enroll
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Grant Scholarship
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <SearchAndFilter
          searchPlaceholder="Search by student, course, or reason..."
          filters={filterOptions}
          onSearch={handleSearch}
          onFilter={handleFilter}
          searchValue={searchQuery}
          filterValues={filters}
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Data Table */}
        <DataTable
          data={scholarships}
          columns={columns}
          loading={loading}
          pagination={paginationConfig}
          sorting={sortingConfig}
          emptyMessage="No scholarships found"
          onRowClick={(scholarship) => {
            setSelectedScholarship(scholarship);
            setShowDetailModal(true);
          }}
        />

        {/* Create Scholarship Modal */}
        {showCreateModal && (
          <CreateScholarshipModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchScholarships();
              fetchStats();
            }}
            token={token}
          />
        )}

        {/* Manual Enrollment Modal */}
        {showManualEnrollModal && (
          <ManualEnrollmentModal
            onClose={() => setShowManualEnrollModal(false)}
            onSuccess={() => {
              setShowManualEnrollModal(false);
              fetchScholarships();
            }}
            token={token}
          />
        )}

        {/* Scholarship Detail Modal */}
        {showDetailModal && selectedScholarship && (
          <ScholarshipDetailModal
            scholarship={selectedScholarship}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedScholarship(null);
            }}
            onRevoke={() => {
              handleRevokeScholarship(selectedScholarship.id);
              setShowDetailModal(false);
              setSelectedScholarship(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};


// Create Scholarship Modal Component
interface CreateScholarshipModalProps {
  onClose: () => void;
  onSuccess: () => void;
  token: string | null;
}

const CreateScholarshipModal = ({ onClose, onSuccess, token }: CreateScholarshipModalProps) => {
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    discountPercentage: 100,
    reason: '',
    expiresAt: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      if (!token) return;
      try {
        const params = new URLSearchParams();
        if (studentSearch) params.append('search', studentSearch);
        if (formData.courseId) params.append('courseId', formData.courseId);
        
        const response = await fetch(`${API_URL}/admin/scholarships/eligible/students?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students);
        }
      } catch (err) {
        console.error('Failed to fetch students:', err);
      }
    };
    fetchStudents();
  }, [token, studentSearch, formData.courseId]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      if (!token) return;
      try {
        const params = new URLSearchParams();
        if (courseSearch) params.append('search', courseSearch);
        
        const response = await fetch(`${API_URL}/admin/scholarships/available/courses?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, [token, courseSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/admin/scholarships`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          expiresAt: formData.expiresAt || undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create scholarship');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const selectedCourse = courses.find(c => c.id === formData.courseId);
  const scholarshipValue = selectedCourse 
    ? (selectedCourse.pricing * formData.discountPercentage / 100).toFixed(2)
    : '0.00';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Grant Scholarship</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
              <input
                type="text"
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <input
                type="text"
                placeholder="Search courses..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} (${course.pricing})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount Percentage: {formData.discountPercentage}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={formData.discountPercentage}
                onChange={(e) => setFormData({ ...formData, discountPercentage: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>0%</span>
                <span>50%</span>
                <span>100% (Full)</span>
              </div>
              {selectedCourse && (
                <p className="mt-1 text-sm text-gray-600">
                  Scholarship value: <span className="font-medium">${scholarshipValue}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                rows={3}
                placeholder="Enter the reason for granting this scholarship..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (Optional)</label>
              <input
                type="date"
                value={formData.expiresAt}
                onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Grant Scholarship'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


// Manual Enrollment Modal Component
interface ManualEnrollmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  token: string | null;
}

const ManualEnrollmentModal = ({ onClose, onSuccess, token }: ManualEnrollmentModalProps) => {
  const [formData, setFormData] = useState({
    studentId: '',
    courseId: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [courseSearch, setCourseSearch] = useState('');

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      if (!token) return;
      try {
        const params = new URLSearchParams();
        if (studentSearch) params.append('search', studentSearch);
        
        const response = await fetch(`${API_URL}/admin/scholarships/eligible/students?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStudents(data.students);
        }
      } catch (err) {
        console.error('Failed to fetch students:', err);
      }
    };
    fetchStudents();
  }, [token, studentSearch]);

  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      if (!token) return;
      try {
        const params = new URLSearchParams();
        if (courseSearch) params.append('search', courseSearch);
        
        const response = await fetch(`${API_URL}/admin/scholarships/available/courses?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setCourses(data.courses);
        }
      } catch (err) {
        console.error('Failed to fetch courses:', err);
      }
    };
    fetchCourses();
  }, [token, courseSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/admin/enrollments/manual`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to enroll student');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Manual Enrollment</h2>
          <p className="text-sm text-gray-600 mb-4">
            Enroll a student in a course without requiring payment. This bypasses the normal payment flow.
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
              <input
                type="text"
                placeholder="Search students..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <select
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a student...</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} ({student.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
              <input
                type="text"
                placeholder="Search courses..."
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
              />
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a course...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title} (${course.pricing})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Manual Enrollment</label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                required
                rows={3}
                placeholder="Enter the reason for this manual enrollment..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Enrolling...' : 'Enroll Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


// Scholarship Detail Modal Component
interface ScholarshipDetailModalProps {
  scholarship: Scholarship;
  onClose: () => void;
  onRevoke: () => void;
}

const ScholarshipDetailModal = ({ scholarship, onClose, onRevoke }: ScholarshipDetailModalProps) => {
  const scholarshipValue = (scholarship.course.pricing * scholarship.discountPercentage / 100).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Scholarship Details</h2>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
              scholarship.status === 'active' ? 'bg-green-100 text-green-700' :
              scholarship.status === 'revoked' ? 'bg-red-100 text-red-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {scholarship.status.charAt(0).toUpperCase() + scholarship.status.slice(1)}
            </span>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Student</h3>
              <p className="font-medium text-gray-900">
                {scholarship.student.firstName} {scholarship.student.lastName}
              </p>
              <p className="text-sm text-gray-500">{scholarship.student.email}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Course</h3>
              <p className="font-medium text-gray-900">{scholarship.course.title}</p>
              <p className="text-sm text-gray-500">Original price: ${scholarship.course.pricing}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Discount</h3>
                <p className="text-2xl font-bold text-blue-600">{scholarship.discountPercentage}%</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-1">Value</h3>
                <p className="text-2xl font-bold text-green-600">${scholarshipValue}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Reason</h3>
              <p className="text-gray-900">{scholarship.reason}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Granted:</span>
                <p className="font-medium">{new Date(scholarship.grantedAt).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-gray-500">Expires:</span>
                <p className="font-medium">
                  {scholarship.expiresAt 
                    ? new Date(scholarship.expiresAt).toLocaleDateString() 
                    : 'Never'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
            {scholarship.status === 'active' && (
              <button
                type="button"
                onClick={onRevoke}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
              >
                Revoke Scholarship
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScholarshipManagement;

