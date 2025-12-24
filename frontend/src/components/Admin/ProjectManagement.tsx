import { useState, useEffect, useCallback } from 'react';
import AdminLayout from './AdminLayout';
import DataTable, { ColumnDef, PaginationConfig } from './DataTable';
import SearchAndFilter, { FilterOption } from './SearchAndFilter';
import BulkActions, { BulkAction, BulkActionIcons } from './BulkActions';
import { useAuth } from '../../hooks/useAuth';

interface Project {
  id: string;
  title: string;
  description: string;
  goal: string;
  solution: string;
  motionBreakdown: string;
  toolsUsed: string[];
  thumbnailUrl: string;
  caseStudyUrl: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProjectFormData {
  title: string;
  description: string;
  goal: string;
  solution: string;
  motionBreakdown: string;
  toolsUsed: string;
  thumbnailUrl: string;
  caseStudyUrl: string;
  isPublished: boolean;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const ProjectManagement = () => {
  const { token } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>({
    title: '',
    description: '',
    goal: '',
    solution: '',
    motionBreakdown: '',
    toolsUsed: '',
    thumbnailUrl: '',
    caseStudyUrl: '',
    isPublished: false,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // Drag and drop state
  const [draggedProject, setDraggedProject] = useState<Project | null>(null);
  const [showReorderMode, setShowReorderMode] = useState(false);

  const fetchProjects = useCallback(async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortBy: 'order',
        sortOrder: 'asc',
      });
      
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`${API_BASE}/api/admin/projects?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to fetch projects');
      
      const data = await response.json();
      setProjects(data.projects);
      setTotalItems(data.pagination.totalItems);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, page, pageSize, searchQuery, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.goal.trim()) errors.goal = 'Goal is required';
    if (!formData.solution.trim()) errors.solution = 'Solution is required';
    if (!formData.motionBreakdown.trim()) errors.motionBreakdown = 'Motion breakdown is required';
    if (!formData.thumbnailUrl.trim()) errors.thumbnailUrl = 'Thumbnail URL is required';
    if (!formData.caseStudyUrl.trim()) errors.caseStudyUrl = 'Case study URL is required';
    
    // Validate URLs
    const urlPattern = /^https?:\/\/.+/;
    if (formData.thumbnailUrl && !urlPattern.test(formData.thumbnailUrl)) {
      errors.thumbnailUrl = 'Invalid URL format';
    }
    if (formData.caseStudyUrl && !urlPattern.test(formData.caseStudyUrl)) {
      errors.caseStudyUrl = 'Invalid URL format';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProject = () => {
    setModalMode('create');
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      goal: '',
      solution: '',
      motionBreakdown: '',
      toolsUsed: '',
      thumbnailUrl: '',
      caseStudyUrl: '',
      isPublished: false,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEditProject = (project: Project) => {
    setModalMode('edit');
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      goal: project.goal,
      solution: project.solution,
      motionBreakdown: project.motionBreakdown,
      toolsUsed: project.toolsUsed.join(', '),
      thumbnailUrl: project.thumbnailUrl,
      caseStudyUrl: project.caseStudyUrl,
      isPublished: project.isPublished,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const toolsUsedArray = formData.toolsUsed
        .split(',')
        .map(t => t.trim())
        .filter(t => t.length > 0);
      
      const payload = {
        ...formData,
        toolsUsed: toolsUsedArray,
      };
      
      const url = modalMode === 'create'
        ? `${API_BASE}/api/admin/projects`
        : `${API_BASE}/api/admin/projects/${editingProject?.id}`;
      
      const response = await fetch(url, {
        method: modalMode === 'create' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save project');
      }
      
      setShowModal(false);
      fetchProjects();
    } catch (err: any) {
      setFormErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (project: Project) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/projects/${project.id}/publish`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isPublished: !project.isPublished }),
      });
      
      if (!response.ok) throw new Error('Failed to update publication status');
      
      fetchProjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!response.ok) throw new Error('Failed to delete project');
      
      fetchProjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBulkPublish = async (ids: (string | number)[], publish: boolean) => {
    try {
      const response = await fetch(`${API_BASE}/api/admin/projects/bulk/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectIds: ids, isPublished: publish }),
      });
      
      if (!response.ok) throw new Error('Failed to update projects');
      
      setSelectedIds([]);
      fetchProjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleBulkDelete = async (ids: (string | number)[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} projects?`)) return;
    
    try {
      const response = await fetch(`${API_BASE}/api/admin/projects/bulk/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectIds: ids }),
      });
      
      if (!response.ok) throw new Error('Failed to delete projects');
      
      setSelectedIds([]);
      fetchProjects();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (project: Project) => {
    setDraggedProject(project);
  };

  const handleDragOver = (e: React.DragEvent, targetProject: Project) => {
    e.preventDefault();
    if (!draggedProject || draggedProject.id === targetProject.id) return;
  };

  const handleDrop = async (targetProject: Project) => {
    if (!draggedProject || draggedProject.id === targetProject.id) return;
    
    const newProjects = [...projects];
    const draggedIndex = newProjects.findIndex(p => p.id === draggedProject.id);
    const targetIndex = newProjects.findIndex(p => p.id === targetProject.id);
    
    // Remove dragged item and insert at target position
    const [removed] = newProjects.splice(draggedIndex, 1);
    newProjects.splice(targetIndex, 0, removed);
    
    // Update order values
    const projectOrders = newProjects.map((p, index) => ({
      id: p.id,
      order: index + 1,
    }));
    
    setProjects(newProjects.map((p, index) => ({ ...p, order: index + 1 })));
    setDraggedProject(null);
    
    // Save to backend
    try {
      const response = await fetch(`${API_BASE}/api/admin/projects/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectOrders }),
      });
      
      if (!response.ok) throw new Error('Failed to reorder projects');
    } catch (err: any) {
      setError(err.message);
      fetchProjects(); // Revert on error
    }
  };

  const columns: ColumnDef<Project>[] = [
    {
      id: 'order',
      header: 'Order',
      accessor: 'order',
      sortable: true,
      width: '80px',
      render: (value) => (
        <span className="text-gray-500 font-mono">#{value as number}</span>
      ),
    },
    {
      id: 'thumbnail',
      header: 'Thumbnail',
      accessor: 'thumbnailUrl',
      width: '100px',
      render: (value) => (
        <img
          src={value as string}
          alt="Project thumbnail"
          className="w-16 h-12 object-cover rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64x48?text=No+Image';
          }}
        />
      ),
    },
    {
      id: 'title',
      header: 'Title',
      accessor: 'title',
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900">{value as string}</div>
          <div className="text-sm text-gray-500 truncate max-w-xs">{row.description}</div>
        </div>
      ),
    },
    {
      id: 'tools',
      header: 'Tools',
      accessor: (row) => row.toolsUsed.join(', '),
      hiddenOnMobile: true,
      render: (_, row) => (
        <div className="flex flex-wrap gap-1">
          {row.toolsUsed.slice(0, 3).map((tool, i) => (
            <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
              {tool}
            </span>
          ))}
          {row.toolsUsed.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
              +{row.toolsUsed.length - 3}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      accessor: 'isPublished',
      sortable: true,
      render: (value) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value ? 'Published' : 'Draft'}
        </span>
      ),
    },
    {
      id: 'createdAt',
      header: 'Created',
      accessor: 'createdAt',
      sortable: true,
      hiddenOnMobile: true,
      render: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      accessor: 'id',
      align: 'right',
      render: (_, row) => (
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); handleTogglePublish(row); }}
            className={`p-1.5 rounded hover:bg-gray-100 ${
              row.isPublished ? 'text-yellow-600' : 'text-green-600'
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
            onClick={(e) => { e.stopPropagation(); handleEditProject(row); }}
            className="p-1.5 text-blue-600 rounded hover:bg-blue-50"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDeleteProject(row.id); }}
            className="p-1.5 text-red-600 rounded hover:bg-red-50"
            title="Delete"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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
        { label: 'All', value: '' },
        { label: 'Published', value: 'published' },
        { label: 'Draft', value: 'draft' },
      ],
    },
  ];

  const bulkActions: BulkAction<Project>[] = [
    {
      id: 'publish',
      label: 'Publish',
      icon: BulkActionIcons.Activate,
      action: async (items) => handleBulkPublish(items.map(i => i.id), true),
    },
    {
      id: 'unpublish',
      label: 'Unpublish',
      icon: BulkActionIcons.Suspend,
      action: async (items) => handleBulkPublish(items.map(i => i.id), false),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: BulkActionIcons.Delete,
      action: async (items) => handleBulkDelete(items.map(i => i.id)),
      confirmationMessage: 'Are you sure you want to delete the selected projects?',
    },
  ];

  const pagination: PaginationConfig = {
    page,
    pageSize,
    totalItems,
    onPageChange: setPage,
    onPageSizeChange: setPageSize,
    pageSizeOptions: [10, 25, 50],
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleFilter = (filters: Record<string, unknown>) => {
    setStatusFilter(filters.status as string || '');
    setPage(1);
  };

  return (
    <AdminLayout
      title="Project Portfolio Management"
      breadcrumbs={[
        { label: 'Admin', href: '/admin' },
        { label: 'Projects' },
      ]}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleCreateProject}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Project
            </button>
            <button
              onClick={() => setShowReorderMode(!showReorderMode)}
              className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
                showReorderMode
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              {showReorderMode ? 'Done Reordering' : 'Reorder Projects'}
            </button>
          </div>
        </div>

        {/* Search and Filter */}
        <SearchAndFilter
          searchPlaceholder="Search projects..."
          filters={filterOptions}
          onSearch={handleSearch}
          onFilter={handleFilter}
        />

        {/* Bulk Actions */}
        {selectedIds.length > 0 && (
          <BulkActions
            selectedItems={projects.filter(p => selectedIds.includes(p.id))}
            actions={bulkActions}
            onClearSelection={() => setSelectedIds([])}
          />
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="float-right text-red-500 hover:text-red-700">
              ×
            </button>
          </div>
        )}

        {/* Reorder Mode View */}
        {showReorderMode ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <p className="text-sm text-gray-600 mb-4">
              Drag and drop projects to reorder them. Changes are saved automatically.
            </p>
            <div className="space-y-2">
              {projects.map((project) => (
                <div
                  key={project.id}
                  draggable
                  onDragStart={() => handleDragStart(project)}
                  onDragOver={(e) => handleDragOver(e, project)}
                  onDrop={() => handleDrop(project)}
                  className={`flex items-center gap-4 p-3 bg-gray-50 rounded-lg cursor-move hover:bg-gray-100 transition-colors ${
                    draggedProject?.id === project.id ? 'opacity-50' : ''
                  }`}
                >
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                    </svg>
                  </div>
                  <span className="text-gray-500 font-mono text-sm w-8">#{project.order}</span>
                  <img
                    src={project.thumbnailUrl}
                    alt={project.title}
                    className="w-12 h-9 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48x36?text=No+Image';
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{project.title}</div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    project.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.isPublished ? 'Published' : 'Draft'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Data Table View */
          <DataTable
            data={projects}
            columns={columns}
            loading={loading}
            pagination={pagination}
            selectable
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            emptyMessage="No projects found"
            onRowClick={handleEditProject}
          />
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)} />
            
            <div className="relative inline-block w-full max-w-2xl p-6 my-8 text-left align-middle bg-white rounded-lg shadow-xl transform transition-all">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {modalMode === 'create' ? 'Create New Project' : 'Edit Project'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {formErrors.submit && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                  {formErrors.submit}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.title ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Project title"
                    />
                    {formErrors.title && <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Brief project description"
                    />
                    {formErrors.description && <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Goal <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.goal}
                      onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                      rows={2}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.goal ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="What was the project goal?"
                    />
                    {formErrors.goal && <p className="mt-1 text-sm text-red-500">{formErrors.goal}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Solution <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.solution}
                      onChange={(e) => setFormData({ ...formData, solution: e.target.value })}
                      rows={2}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.solution ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="How was the goal achieved?"
                    />
                    {formErrors.solution && <p className="mt-1 text-sm text-red-500">{formErrors.solution}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Motion Breakdown <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.motionBreakdown}
                      onChange={(e) => setFormData({ ...formData, motionBreakdown: e.target.value })}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.motionBreakdown ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Describe the motion design approach"
                    />
                    {formErrors.motionBreakdown && <p className="mt-1 text-sm text-red-500">{formErrors.motionBreakdown}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tools Used
                    </label>
                    <input
                      type="text"
                      value={formData.toolsUsed}
                      onChange={(e) => setFormData({ ...formData, toolsUsed: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="After Effects, Figma, Lottie (comma-separated)"
                    />
                    <p className="mt-1 text-xs text-gray-500">Separate multiple tools with commas</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thumbnail URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.thumbnailUrl ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="https://example.com/thumbnail.jpg"
                    />
                    {formErrors.thumbnailUrl && <p className="mt-1 text-sm text-red-500">{formErrors.thumbnailUrl}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Case Study URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="url"
                      value={formData.caseStudyUrl}
                      onChange={(e) => setFormData({ ...formData, caseStudyUrl: e.target.value })}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        formErrors.caseStudyUrl ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="https://example.com/case-study"
                    />
                    {formErrors.caseStudyUrl && <p className="mt-1 text-sm text-red-500">{formErrors.caseStudyUrl}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isPublished}
                        onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Publish immediately</span>
                    </label>
                    <p className="mt-1 text-xs text-gray-500 ml-6">
                      Published projects will be visible on the public portfolio
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                    disabled={submitting}
                  >
                    {submitting && (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                    )}
                    {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Project' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ProjectManagement;
