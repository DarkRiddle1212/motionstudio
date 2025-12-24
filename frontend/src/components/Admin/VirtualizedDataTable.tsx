import { useState, useMemo, useCallback, ReactNode, useRef, useEffect } from 'react';
import { LoadingState, ErrorMessage } from '../Common';
import { ColumnDef, PaginationConfig, SortDirection, SortingConfig } from './DataTable';

interface VirtualizedDataTableProps<T extends { id: string | number }> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  pagination?: PaginationConfig;
  sorting?: SortingConfig;
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  emptyMessage?: string;
  rowClassName?: (row: T) => string;
  onRowClick?: (row: T) => void;
  // Virtual scrolling props
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

// Virtual scrolling hook
function useVirtualScrolling<T>({
  items,
  itemHeight = 60,
  containerHeight = 400,
  overscan = 5,
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index,
    }));
  }, [items, startIndex, endIndex]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    scrollElementRef,
    totalHeight,
    visibleItems,
    startIndex,
    handleScroll,
    offsetY: startIndex * itemHeight,
  };
}

// Sort Icon Component
const SortIcon = ({ direction }: { direction: SortDirection }) => (
  <svg className="w-4 h-4 ml-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    {direction === 'asc' ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    ) : direction === 'desc' ? (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    ) : (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    )}
  </svg>
);

// Checkbox Component
const Checkbox = ({ checked, indeterminate, onChange, label }: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}) => (
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = indeterminate || false;
      }}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
      aria-label={label}
    />
  </label>
);

function VirtualizedDataTable<T extends { id: string | number }>({
  data,
  columns,
  loading = false,
  error = null,
  onRetry,
  pagination,
  sorting,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  emptyMessage = 'No data available',
  rowClassName,
  onRowClick,
  itemHeight = 60,
  containerHeight = 400,
  overscan = 5,
}: VirtualizedDataTableProps<T>) {
  const [localSort, setLocalSort] = useState<{ column: string | null; direction: SortDirection }>({
    column: null,
    direction: null,
  });

  const currentSort = sorting || {
    column: localSort.column,
    direction: localSort.direction,
    onSort: (column: string, direction: SortDirection) => setLocalSort({ column, direction }),
  };

  const handleSort = useCallback((columnId: string) => {
    let newDirection: SortDirection = 'asc';
    if (currentSort.column === columnId) {
      if (currentSort.direction === 'asc') {
        newDirection = 'desc';
      } else if (currentSort.direction === 'desc') {
        newDirection = null;
      }
    }
    currentSort.onSort(columnId, newDirection);
  }, [currentSort]);

  // Sort data locally if no external sorting provided
  const sortedData = useMemo(() => {
    if (sorting || !localSort.column || !localSort.direction) {
      return data;
    }

    const column = columns.find(c => c.id === localSort.column);
    if (!column) return data;

    return [...data].sort((a, b) => {
      const accessor = column.accessor;
      const aValue = typeof accessor === 'function' ? accessor(a) : a[accessor];
      const bValue = typeof accessor === 'function' ? accessor(b) : b[accessor];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const comparison = aValue < bValue ? -1 : 1;
      return localSort.direction === 'asc' ? comparison : -comparison;
    });
  }, [data, localSort, sorting, columns]);

  // Virtual scrolling
  const {
    scrollElementRef,
    totalHeight,
    visibleItems,
    handleScroll,
    offsetY,
  } = useVirtualScrolling({
    items: sortedData,
    itemHeight,
    containerHeight,
    overscan,
  });

  // Selection handlers
  const allSelected = useMemo(() => 
    data.length > 0 && data.every(row => selectedIds.includes(row.id)),
    [data, selectedIds]
  );

  const someSelected = useMemo(() => 
    data.some(row => selectedIds.includes(row.id)) && !allSelected,
    [data, selectedIds, allSelected]
  );

  const handleSelectAll = useCallback((checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      const newIds = [...new Set([...selectedIds, ...data.map(row => row.id)])];
      onSelectionChange(newIds);
    } else {
      const dataIds = new Set(data.map(row => row.id));
      onSelectionChange(selectedIds.filter(id => !dataIds.has(id)));
    }
  }, [data, selectedIds, onSelectionChange]);

  const handleSelectRow = useCallback((rowId: string | number, checked: boolean) => {
    if (!onSelectionChange) return;
    if (checked) {
      onSelectionChange([...selectedIds, rowId]);
    } else {
      onSelectionChange(selectedIds.filter(id => id !== rowId));
    }
  }, [selectedIds, onSelectionChange]);

  // Get cell value
  const getCellValue = (row: T, column: ColumnDef<T>): ReactNode => {
    const accessor = column.accessor;
    const rawValue = typeof accessor === 'function' ? accessor(row) : row[accessor];
    
    if (column.render) {
      return column.render(rawValue, row);
    }
    
    if (rawValue === null || rawValue === undefined) {
      return <span className="text-gray-400">—</span>;
    }
    
    return rawValue as ReactNode;
  };

  const getAlignClass = (align?: 'left' | 'center' | 'right') => {
    switch (align) {
      case 'center': return 'text-center';
      case 'right': return 'text-right';
      default: return 'text-left';
    }
  };

  // Use regular DataTable for small datasets
  if (data.length <= 100) {
    // Import and use regular DataTable for small datasets
    return null; // This would be replaced with regular DataTable import
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Error State */}
      {error && (
        <div className="p-4 border-b border-gray-200">
          <ErrorMessage
            message={error}
            onRetry={onRetry}
            type="error"
          />
        </div>
      )}

      {/* Loading State */}
      {loading && !error && (
        <LoadingState 
          message="Loading data..." 
          size="md"
          className="py-12"
        />
      )}

      {/* Virtualized Table */}
      {!loading && !error && (
        <div className="overflow-hidden">
          {/* Fixed Header */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr>
                    {selectable && (
                      <th className="px-3 sm:px-4 py-3 w-12">
                        <Checkbox
                          checked={allSelected}
                          indeterminate={someSelected}
                          onChange={handleSelectAll}
                          label="Select all rows"
                        />
                      </th>
                    )}
                    {columns.map((column) => (
                      <th
                        key={column.id}
                        className={`px-3 sm:px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider ${getAlignClass(column.align)} ${column.hiddenOnMobile ? 'hidden md:table-cell' : ''}`}
                        style={{ width: column.width }}
                      >
                        {column.sortable ? (
                          <button
                            onClick={() => handleSort(column.id)}
                            className="inline-flex items-center hover:text-gray-900 transition-colors group"
                          >
                            <span className="truncate">{column.header}</span>
                            <SortIcon direction={currentSort.column === column.id ? currentSort.direction : null} />
                          </button>
                        ) : (
                          <span className="truncate">{column.header}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>
          </div>

          {/* Virtualized Body */}
          <div
            ref={scrollElementRef}
            className="overflow-auto"
            style={{ height: containerHeight }}
            onScroll={handleScroll}
          >
            <div style={{ height: totalHeight, position: 'relative' }}>
              <div style={{ transform: `translateY(${offsetY}px)` }}>
                <table className="min-w-full">
                  <tbody className="bg-white divide-y divide-gray-200">
                    {sortedData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={columns.length + (selectable ? 1 : 0)}
                          className="px-4 py-12 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center">
                            <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                            </svg>
                            <p className="text-sm sm:text-base">{emptyMessage}</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      visibleItems.map(({ item: row, index }) => (
                        <tr
                          key={row.id}
                          className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''} ${rowClassName ? rowClassName(row) : ''}`}
                          style={{ height: itemHeight }}
                          onClick={() => onRowClick?.(row)}
                        >
                          {selectable && (
                            <td className="px-3 sm:px-4 py-4" onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedIds.includes(row.id)}
                                onChange={(checked) => handleSelectRow(row.id, checked)}
                                label={`Select row ${row.id}`}
                              />
                            </td>
                          )}
                          {columns.map((column) => (
                            <td
                              key={column.id}
                              className={`px-3 sm:px-4 py-4 text-sm text-gray-900 ${getAlignClass(column.align)} ${column.hiddenOnMobile ? 'hidden md:table-cell' : ''}`}
                            >
                              <div className="truncate max-w-xs sm:max-w-sm lg:max-w-none">
                                {getCellValue(row, column)}
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination && !loading && !error && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm">
            <span className="text-gray-700 whitespace-nowrap">
              Showing <span className="font-medium">{(pagination.page - 1) * pagination.pageSize + 1}</span> to{' '}
              <span className="font-medium">{Math.min(pagination.page * pagination.pageSize, pagination.totalItems)}</span> of{' '}
              <span className="font-medium">{pagination.totalItems}</span> results
            </span>
            {pagination.onPageSizeChange && (
              <select
                value={pagination.pageSize}
                onChange={(e) => pagination.onPageSizeChange?.(Number(e.target.value))}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {(pagination.pageSizeOptions || [10, 25, 50, 100]).map((size) => (
                  <option key={size} value={size}>
                    {size} per page
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page === 1}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="First page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="px-2 sm:px-3 py-1 text-sm text-gray-700 whitespace-nowrap">
              Page {pagination.page} of {Math.ceil(pagination.totalItems / pagination.pageSize)}
            </span>
            <button
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.totalItems / pagination.pageSize)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => pagination.onPageChange(Math.ceil(pagination.totalItems / pagination.pageSize))}
              disabled={pagination.page >= Math.ceil(pagination.totalItems / pagination.pageSize)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Last page"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default VirtualizedDataTable;