import { useState, useCallback, useEffect, useRef } from 'react';

export interface FilterOption {
  key: string;
  label: string;
  type: 'select' | 'date-range' | 'number-range';
  options?: { label: string; value: string }[];
}

export interface DateRange {
  start: string;
  end: string;
}

export interface NumberRange {
  min: number | null;
  max: number | null;
}

export type FilterValue = string | DateRange | NumberRange;

export interface SearchAndFilterProps {
  searchPlaceholder?: string;
  filters?: FilterOption[];
  onSearch: (query: string) => void;
  onFilter: (filters: Record<string, FilterValue>) => void;
  searchValue?: string;
  filterValues?: Record<string, FilterValue>;
  debounceMs?: number;
}

const SearchAndFilter = ({
  searchPlaceholder = 'Search...',
  filters = [],
  onSearch,
  onFilter,
  searchValue = '',
  filterValues = {},
  debounceMs = 300,
}: SearchAndFilterProps) => {
  const [localSearch, setLocalSearch] = useState(searchValue);
  const [localFilters, setLocalFilters] = useState<Record<string, FilterValue>>(filterValues);
  const [showFilters, setShowFilters] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Sync external search value
  useEffect(() => {
    setLocalSearch(searchValue);
  }, [searchValue]);

  // Sync external filter values
  useEffect(() => {
    setLocalFilters(filterValues);
  }, [filterValues]);

  // Debounced search
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearch(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      onSearch(value);
    }, debounceMs);
  }, [onSearch, debounceMs]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    setLocalSearch('');
    onSearch('');
  }, [onSearch]);

  // Handle filter change
  const handleFilterChange = useCallback((key: string, value: FilterValue) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFilter(newFilters);
  }, [localFilters, onFilter]);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setLocalFilters({});
    onFilter({});
  }, [onFilter]);

  // Count active filters
  const activeFilterCount = Object.values(localFilters).filter(v => {
    if (typeof v === 'string') return v !== '';
    if ('start' in v || 'end' in v) return (v as DateRange).start || (v as DateRange).end;
    if ('min' in v || 'max' in v) return (v as NumberRange).min !== null || (v as NumberRange).max !== null;
    return false;
  }).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={localSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="block w-full pl-10 pr-10 py-3 sm:py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
          />
          {localSearch && (
            <button
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 touch-manipulation"
              aria-label="Clear search"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>


        {/* Filter Toggle Button */}
        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center justify-center px-4 py-3 sm:py-2.5 border rounded-lg text-sm font-medium transition-colors touch-manipulation ${
              showFilters || activeFilterCount > 0
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
            }`}
          >
            <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <span className="whitespace-nowrap">Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-600 text-white rounded-full flex-shrink-0">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filter Panel */}
      {showFilters && filters.length > 0 && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-700">Filters</h4>
            {activeFilterCount > 0 && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  {filter.label}
                </label>
                {filter.type === 'select' && filter.options && (
                  <select
                    value={(localFilters[filter.key] as string) || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                    className="block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
                  >
                    <option value="">All</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                {filter.type === 'date-range' && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="date"
                      value={(localFilters[filter.key] as DateRange)?.start || ''}
                      onChange={(e) => handleFilterChange(filter.key, {
                        ...(localFilters[filter.key] as DateRange || {}),
                        start: e.target.value,
                      })}
                      className="block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
                      placeholder="Start"
                    />
                    <input
                      type="date"
                      value={(localFilters[filter.key] as DateRange)?.end || ''}
                      onChange={(e) => handleFilterChange(filter.key, {
                        ...(localFilters[filter.key] as DateRange || {}),
                        end: e.target.value,
                      })}
                      className="block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
                      placeholder="End"
                    />
                  </div>
                )}
                {filter.type === 'number-range' && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="number"
                      value={(localFilters[filter.key] as NumberRange)?.min ?? ''}
                      onChange={(e) => handleFilterChange(filter.key, {
                        ...(localFilters[filter.key] as NumberRange || {}),
                        min: e.target.value ? Number(e.target.value) : null,
                      })}
                      className="block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={(localFilters[filter.key] as NumberRange)?.max ?? ''}
                      onChange={(e) => handleFilterChange(filter.key, {
                        ...(localFilters[filter.key] as NumberRange || {}),
                        max: e.target.value ? Number(e.target.value) : null,
                      })}
                      className="block w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 touch-manipulation"
                      placeholder="Max"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAndFilter;
