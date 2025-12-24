import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './';
import DataTable, { ColumnDef, PaginationConfig, SortingConfig, SortDirection } from './DataTable';
import SearchAndFilter, { FilterOption, FilterValue } from './SearchAndFilter';
import BulkActions, { BulkAction, BulkActionIcons } from './BulkActions';
import { useAuth } from '../../hooks/useAuth';

interface Instructor {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructor: Instructor;
  duration: string;
  pricing: number;
  currency: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    enrollments: number;
    lessons: number;
    assignments: number;
  };
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
}

interface Assignment {
  id: string;
  title: string;
  description: string;
  submissionType: string;
  deadline: string;
  createdAt: string;
  _count: {
    submissions: number;
  };
}

interface Enrollment {
  id: string;
  studentId: string;
  enrolledAt: string;
  progressPercentage: number;
  status: string;
  student: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface CourseDetail extends Course {
  lessons: Lesson[];
  assignments: Assignment[];
  enrollments: Enrollment[];
}

interface CoursesResponse {
  courses: Course[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CourseManagement = () => {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalItems: 0,
  });

  // Sorting state
  const [sorting, setSorting] = useState<{ column: string | null; direction: SortDirection }>({
    column: 'createdAt',
    direction: 'desc',
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});

  // Modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
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

      const response = await fetch(`${API_URL}/api/admin/courses?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data: CoursesResponse = await response.json();
      setCourses(data.courses);
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
    fetchCourses();
  }, [fetchCourses]);

  const fetchCourseDetail = useCallback(async (courseId: string) => {
    if (!token) return;
    
    setDetailLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/courses/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch course details');
      }

      const data: CourseDetail = await response.json();
      setSelectedCourse(data);
      setShowDetailModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setDetailLoading(false);
    }
  }, [token]);

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

  const handlePublishCourses = async (selectedCourses: Course[]) => {
    if (!token) return;
    
    const courseIds = selectedCourses.map(c => c.id);
    await fetch(`${API_URL}/api/admin/courses/bulk/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseIds, isPublished: true }),
    });
    setSelectedIds([]);
    fetchCourses();
  };

  const handleUnpublishCourses = async (selectedCourses: Course[]) => {
    if (!token) return;
    
    const courseIds = selectedCourses.map(c => c.id);
    await fetch(`${API_URL}/api/admin/courses/bulk/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseIds, isPublished: false }),
    });
    setSelectedIds([]);
    fetchCourses();
  };

  const handleDeleteCourses = async (selectedCourses: Course[]) => {
    if (!token) return;
    
    const courseIds = selectedCourses.map(c => c.id);
    await fetch(`${API_URL}/api/admin/courses/bulk/delete`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ courseIds }),
    });
    setSelectedIds([]);
    fetchCourses();
  };

  const handleTogglePublish = async (course: Course) => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/admin/courses/${course.id}/publish`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });

      if (!response.ok) {
        throw new Error('Failed to update course status');
      }

      fetchCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const columns: ColumnDef<Course>[] = [
    {
      id: 'title',
      header: 'Title',
      accessor: 'title',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value as string}</div>
          <div className="text-xs text-gray-500 truncate max-w-xs">{row.description}</div>
        </div>
      ),
    },
    {
      id: 'instructor',
      header: 'Instructor',
      accessor: (row) => `${row.instructor.firstName || ''} ${row.instructor.lastName || ''}`.trim() || row.instructor.email,
      sortable: false,
      render: (_, row) => (
        <div>
          <div className="text-sm text-gray-900">
            {`${row.instructor.firstName || ''} ${row.instructor.lastName || ''}`.trim() || '—'}
          </div>
          <div className="text-xs text-gray-500">{row.instructor.email}</div>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'isPublished',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
        }`}>
          {value ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      id: 'enrollments',
      header: 'Enrollments',
      accessor: (row) => row._count.enrollments,
      align: 'center',
    },
    {
      id: 'lessons',
      header: 'Lessons',
      accessor: (row) => row._count.lessons,
      align: 'center',
      hiddenOnMobile: true,
    },
    {
      id: 'pricing',
      header: 'Price',
      accessor: 'pricing',
      sortable: true,
      render: (value, row) => (
        <span className="text-sm">
          {(value as number) === 0 ? (
            <span className="text-green-600 font-medium">Free</span>
          ) : (
            `${row.currency} ${(value as number).toFixed(2)}`
          )}
        </span>
      ),
      hiddenOnMobile: true,
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessor: (row) => new Date(row.createdAt).toLocaleDateString(),
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
              handleTogglePublish(row);
            }}
            className={`p-1 transition-colors ${
              row.isPublished 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-green-500 hover:text-green-600'
            }`}
            title={row.isPublished ? 'Unpublish' : 'Publish'}
          >
            {row.isPublished ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              fetchCourseDetail(row.id);
            }}
            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
            title="View details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
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
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
      ],
    },
  ];

  const bulkActions: BulkAction<Course>[] = [
    {
      id: 'publish',
      label: 'Publish',
      icon: BulkActionIcons.Activate,
      action: handlePublishCourses,
      confirmationMessage: 'Are you sure you want to publish the selected courses? They will become visible to all users.',
    },
    {
      id: 'unpublish',
      label: 'Unpublish',
      icon: BulkActionIcons.Suspend,
      action: handleUnpublishCourses,
      confirmationMessage: 'Are you sure you want to unpublish the selected courses? They will no longer be visible to users.',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: BulkActionIcons.Delete,
      action: handleDeleteCourses,
      variant: 'danger',
      confirmationMessage: 'Are you sure you want to delete the selected courses? This action cannot be undone and will remove all associated lessons, assignments, and enrollments.',
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

  const selectedCourses = courses.filter(c => selectedIds.includes(c.id));

  return (
    <AdminLayout 
      title="Course Management"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Courses' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-gray-600">
              Manage all courses, control publication status, and view enrollment data.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <SearchAndFilter
          searchPlaceholder="Search by title, description, or instructor..."
          filters={filterOptions}
          onSearch={handleSearch}
          onFilter={handleFilter}
          searchValue={searchQuery}
          filterValues={filters}
        />

        {/* Bulk Actions */}
        <BulkActions
          selectedItems={selectedCourses}
          actions={bulkActions}
          onClearSelection={() => setSelectedIds([])}
          itemLabel="course"
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Data Table */}
        <DataTable
          data={courses}
          columns={columns}
          loading={loading}
          pagination={paginationConfig}
          sorting={sortingConfig}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyMessage="No courses found"
          onRowClick={(course) => fetchCourseDetail(course.id)}
        />

        {/* Course Detail Modal */}
        {showDetailModal && selectedCourse && (
          <CourseDetailModal
            course={selectedCourse}
            loading={detailLoading}
            onClose={() => {
              setShowDetailModal(false);
              setSelectedCourse(null);
            }}
            onPublishToggle={() => {
              handleTogglePublish(selectedCourse);
              setShowDetailModal(false);
              setSelectedCourse(null);
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
};


// Course Detail Modal Component
interface CourseDetailModalProps {
  course: CourseDetail;
  loading: boolean;
  onClose: () => void;
  onPublishToggle: () => void;
}

const CourseDetailModal = ({ course, loading, onClose, onPublishToggle }: CourseDetailModalProps) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'assignments' | 'enrollments'>('overview');

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full p-6">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                By {course.instructor.firstName} {course.instructor.lastName} ({course.instructor.email})
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                {course.isPublished ? 'Published' : 'Draft'}
              </span>
              <button
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px px-6">
              {(['overview', 'lessons', 'assignments', 'enrollments'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab === 'lessons' && ` (${course.lessons.length})`}
                  {tab === 'assignments' && ` (${course.assignments.length})`}
                  {tab === 'enrollments' && ` (${course._count.enrollments})`}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{course._count.enrollments}</div>
                    <div className="text-sm text-gray-500">Enrollments</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{course._count.lessons}</div>
                    <div className="text-sm text-gray-500">Lessons</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">{course._count.assignments}</div>
                    <div className="text-sm text-gray-500">Assignments</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-gray-900">
                      {course.pricing === 0 ? 'Free' : `${course.currency} ${course.pricing}`}
                    </div>
                    <div className="text-sm text-gray-500">Price</div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{course.description}</p>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Duration</h3>
                    <p className="text-gray-600">{course.duration}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Created</h3>
                    <p className="text-gray-600">{new Date(course.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={onPublishToggle}
                    className={`px-4 py-2 text-sm font-medium rounded-lg ${
                      course.isPublished
                        ? 'text-yellow-700 bg-yellow-50 hover:bg-yellow-100'
                        : 'text-green-700 bg-green-50 hover:bg-green-100'
                    }`}
                  >
                    {course.isPublished ? 'Unpublish Course' : 'Publish Course'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'lessons' && (
              <div className="space-y-4">
                {course.lessons.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No lessons in this course yet.</p>
                ) : (
                  course.lessons.map((lesson) => (
                    <div key={lesson.id} className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {lesson.order}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{lesson.title}</div>
                          <div className="text-sm text-gray-500">{lesson.description}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        lesson.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {lesson.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'assignments' && (
              <div className="space-y-4">
                {course.assignments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No assignments in this course yet.</p>
                ) : (
                  course.assignments.map((assignment) => (
                    <div key={assignment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-medium text-gray-900">{assignment.title}</div>
                          <div className="text-sm text-gray-500 mt-1">{assignment.description}</div>
                        </div>
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          {assignment._count.submissions} submissions
                        </span>
                      </div>
                      <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                        <span>Type: {assignment.submissionType}</span>
                        <span>Deadline: {new Date(assignment.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'enrollments' && (
              <div className="space-y-4">
                {course.enrollments.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No students enrolled in this course yet.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Student</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Enrolled</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Progress</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {course.enrollments.map((enrollment) => (
                          <tr key={enrollment.id}>
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">
                                {enrollment.student.firstName} {enrollment.student.lastName}
                              </div>
                              <div className="text-xs text-gray-500">{enrollment.student.email}</div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500">
                              {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${enrollment.progressPercentage}%` }}
                                  />
                                </div>
                                <span className="text-sm text-gray-600">{enrollment.progressPercentage}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                enrollment.status === 'completed' ? 'bg-green-100 text-green-700' :
                                enrollment.status === 'active' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseManagement;
