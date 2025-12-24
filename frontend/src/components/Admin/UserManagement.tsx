import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from './';
import DataTable, { ColumnDef, PaginationConfig, SortingConfig, SortDirection } from './DataTable';
import SearchAndFilter, { FilterOption, FilterValue } from './SearchAndFilter';
import BulkActions, { BulkAction, BulkActionIcons } from './BulkActions';
import { useAuth } from '../../hooks/useAuth';

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  emailVerified: boolean;
  createdAt: string;
  enrollmentCount: number;
  courseCount: number;
}

interface UsersResponse {
  users: User[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserManagement = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('page', pagination.page.toString());
      params.append('pageSize', pagination.pageSize.toString());
      
      if (searchQuery) params.append('search', searchQuery);
      if (filters.role) params.append('role', filters.role as string);
      if (sorting.column) {
        params.append('sortBy', sorting.column);
        params.append('sortOrder', sorting.direction || 'desc');
      }

      const response = await fetch(`${API_URL}/api/admin/users?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data: UsersResponse = await response.json();
      setUsers(data.users);
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
    fetchUsers();
  }, [fetchUsers]);


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

  const handleSuspendUsers = async (selectedUsers: User[]) => {
    if (!token) return;
    
    for (const user of selectedUsers) {
      await fetch(`${API_URL}/api/admin/users/${user.id}/suspend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
    setSelectedIds([]);
    fetchUsers();
  };

  const handleActivateUsers = async (selectedUsers: User[]) => {
    if (!token) return;
    
    for (const user of selectedUsers) {
      await fetch(`${API_URL}/api/admin/users/${user.id}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
    setSelectedIds([]);
    fetchUsers();
  };

  const handleDeleteUsers = async (selectedUsers: User[]) => {
    if (!token) return;
    
    for (const user of selectedUsers) {
      await fetch(`${API_URL}/api/admin/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    }
    setSelectedIds([]);
    fetchUsers();
  };

  const columns: ColumnDef<User>[] = [
    {
      id: 'email',
      header: 'Email',
      accessor: 'email',
      sortable: true,
    },
    {
      id: 'name',
      header: 'Name',
      accessor: (row) => `${row.firstName || ''} ${row.lastName || ''}`.trim() || '—',
      sortable: true,
    },
    {
      id: 'role',
      header: 'Role',
      accessor: 'role',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value === 'admin' ? 'bg-purple-100 text-purple-700' :
          value === 'instructor' ? 'bg-blue-100 text-blue-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {(value as string).charAt(0).toUpperCase() + (value as string).slice(1)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'emailVerified',
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {value ? 'Active' : 'Suspended'}
        </span>
      ),
    },
    {
      id: 'enrollments',
      header: 'Enrollments',
      accessor: 'enrollmentCount',
      align: 'center',
      hiddenOnMobile: true,
    },
    {
      id: 'createdAt',
      header: 'Joined',
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
              setSelectedUser(row);
              setShowEditModal(true);
            }}
            className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
            title="Edit user"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const filterOptions: FilterOption[] = [
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { label: 'Student', value: 'student' },
        { label: 'Instructor', value: 'instructor' },
        { label: 'Admin', value: 'admin' },
      ],
    },
  ];

  const bulkActions: BulkAction<User>[] = [
    {
      id: 'activate',
      label: 'Activate',
      icon: BulkActionIcons.Activate,
      action: handleActivateUsers,
    },
    {
      id: 'suspend',
      label: 'Suspend',
      icon: BulkActionIcons.Suspend,
      action: handleSuspendUsers,
      confirmationMessage: 'Are you sure you want to suspend the selected users? They will not be able to log in.',
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: BulkActionIcons.Delete,
      action: handleDeleteUsers,
      variant: 'danger',
      confirmationMessage: 'Are you sure you want to delete the selected users? This action cannot be undone.',
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

  const selectedUsers = users.filter(u => selectedIds.includes(u.id));

  return (
    <AdminLayout 
      title="User Management"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Users' },
      ]}
    >
      <div className="space-y-6">
        {/* Header with Create Button */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <p className="text-gray-600">
              Manage all platform users including students, instructors, and administrators.
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add User
          </button>
        </div>

        {/* Search and Filters */}
        <SearchAndFilter
          searchPlaceholder="Search by email, name..."
          filters={filterOptions}
          onSearch={handleSearch}
          onFilter={handleFilter}
          searchValue={searchQuery}
          filterValues={filters}
        />

        {/* Bulk Actions */}
        <BulkActions
          selectedItems={selectedUsers}
          actions={bulkActions}
          onClearSelection={() => setSelectedIds([])}
          itemLabel="user"
        />

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Data Table */}
        <DataTable
          data={users}
          columns={columns}
          loading={loading}
          pagination={paginationConfig}
          sorting={sortingConfig}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          emptyMessage="No users found"
          onRowClick={(user) => {
            setSelectedUser(user);
            setShowEditModal(true);
          }}
        />

        {/* Create User Modal */}
        {showCreateModal && (
          <CreateUserModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={() => {
              setShowCreateModal(false);
              fetchUsers();
            }}
            token={token}
          />
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onSuccess={() => {
              setShowEditModal(false);
              setSelectedUser(null);
              fetchUsers();
            }}
            token={token}
          />
        )}
      </div>
    </AdminLayout>
  );
};


// Create User Modal Component
interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: () => void;
  token: string | null;
}

const CreateUserModal = ({ onClose, onSuccess, token }: CreateUserModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'instructor',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Create New User</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
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
                {loading ? 'Creating...' : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};


// Edit User Modal Component
interface EditUserModalProps {
  user: User;
  onClose: () => void;
  onSuccess: () => void;
  token: string | null;
}

const EditUserModal = ({ user, onClose, onSuccess, token }: EditUserModalProps) => {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    role: user.role,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update user');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const endpoint = user.emailVerified ? 'suspend' : 'activate';
      const response = await fetch(`${API_URL}/api/admin/users/${user.id}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || `Failed to ${endpoint} user`);
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
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Edit User</h2>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Email: <span className="font-medium">{user.email}</span></p>
            <p className="text-sm text-gray-600">
              Status: 
              <span className={`ml-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                user.emailVerified ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {user.emailVerified ? 'Active' : 'Suspended'}
              </span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">Student</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <button
                type="button"
                onClick={handleStatusToggle}
                disabled={loading}
                className={`w-full px-4 py-2 text-sm font-medium rounded-lg ${
                  user.emailVerified
                    ? 'text-red-700 bg-red-50 hover:bg-red-100'
                    : 'text-green-700 bg-green-50 hover:bg-green-100'
                } disabled:opacity-50`}
              >
                {user.emailVerified ? 'Suspend Account' : 'Activate Account'}
              </button>
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
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
