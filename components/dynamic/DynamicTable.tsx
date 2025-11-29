import React, { useState, useMemo } from 'react';
import { cn } from '../../utils/cn';

export interface TableColumn {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (value: any, row: any, index: number) => React.ReactNode;
  filterable?: boolean;
}

export interface DynamicTableProps {
  data: any[];
  columns: TableColumn[];
  className?: string;
  striped?: boolean;
  bordered?: boolean;
  hover?: boolean;
  size?: 'sm' | 'md' | 'lg';
  searchable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  pagination?: boolean;
  pageSize?: number;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: any, index: number) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: any, index: number) => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
    condition?: (row: any) => boolean;
  }>;
}

export const DynamicTable: React.FC<DynamicTableProps> = ({
  data,
  columns,
  className,
  striped = false,
  bordered = false,
  hover = true,
  size = 'md',
  searchable = false,
  sortable = true,
  filterable = false,
  pagination = false,
  pageSize = 10,
  emptyMessage = 'No data available',
  loading = false,
  onRowClick,
  onSort,
  actions = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Filter data based on search and filters
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Apply search filter
    if (searchable && searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(column => {
          const value = row[column.key];
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply column filters
    if (filterable) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          filtered = filtered.filter(row => {
            const cellValue = row[key]?.toString().toLowerCase();
            return cellValue?.includes(value.toLowerCase());
          });
        }
      });
    }

    return filtered;
  }, [data, searchTerm, filters, columns, searchable, filterable]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortColumn || !sortable) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredData, sortColumn, sortDirection, sortable]);

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData;

    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize, pagination]);

  const totalPages = pagination ? Math.ceil(sortedData.length / pageSize) : 1;

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    const column = columns.find(col => col.key === columnKey);
    if (!column?.sortable) return;

    const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(columnKey);
    setSortDirection(newDirection);
    onSort?.(columnKey, newDirection);
  };

  const handleFilterChange = (columnKey: string, value: string) => {
    setFilters(prev => ({ ...prev, [columnKey]: value }));
    setCurrentPage(1);
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const getColumnWidth = (column: TableColumn) => {
    if (column.width) return column.width;
    if (actions.length > 0 && column.key === 'actions') return '1%';
    return 'auto';
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-2"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 rounded mb-1"></div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Search and Filters */}
      {(searchable || filterable) && (
        <div className="mb-4 flex flex-wrap gap-4">
          {searchable && (
            <div className="flex-1 min-w-64">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
          {filterable && columns.filter(col => col.filterable).map(column => (
            <div key={column.key} className="min-w-32">
              <input
                type="text"
                placeholder={`Filter ${column.header}...`}
                value={filters[column.key] || ''}
                onChange={(e) => handleFilterChange(column.key, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className={cn('overflow-x-auto', {
        'border border-gray-200 rounded-lg': bordered
      })}>
        <table className={cn('min-w-full divide-y divide-gray-200', sizeClasses[size])}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map(column => (
                <th
                  key={column.key}
                  className={cn(
                    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                    {
                      'cursor-pointer select-none hover:bg-gray-100': sortable && column.sortable,
                      'text-center': column.align === 'center',
                      'text-right': column.align === 'right'
                    }
                  )}
                  style={{ width: getColumnWidth(column) }}
                  onClick={() => handleSort(column.key)}
                >
                  <div className={cn('flex items-center', {
                    'justify-center': column.align === 'center',
                    'justify-end': column.align === 'right'
                  })}>
                    {column.header}
                    {sortable && column.sortable && sortColumn === column.key && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className={cn('bg-white divide-y divide-gray-200', {
            '[&_tr:nth-child(odd)]:bg-gray-50': striped
          })}>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions.length > 0 ? 1 : 0)} className="px-6 py-8 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn({
                    'hover:bg-gray-50': hover,
                    'cursor-pointer': !!onRowClick
                  })}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {columns.map(column => (
                    <td
                      key={column.key}
                      className={cn('px-6 py-4 whitespace-nowrap', {
                        'text-center': column.align === 'center',
                        'text-right': column.align === 'right'
                      })}
                    >
                      {column.render
                        ? column.render(row[column.key], row, rowIndex)
                        : row[column.key] ?? '-'
                      }
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        {actions.map((action, actionIndex) => {
                          if (action.condition && !action.condition(row)) return null;
                          
                          return (
                            <button
                              key={actionIndex}
                              onClick={(e) => {
                                e.stopPropagation();
                                action.onClick(row, rowIndex);
                              }}
                              className={cn(
                                'text-sm px-2 py-1 rounded focus:outline-none focus:ring-2',
                                {
                                  'text-blue-600 hover:text-blue-900': action.variant === 'primary',
                                  'text-gray-600 hover:text-gray-900': action.variant === 'secondary',
                                  'text-red-600 hover:text-red-900': action.variant === 'danger',
                                  'border border-gray-300 text-gray-700 hover:bg-gray-50': action.variant === 'outline'
                                }
                              )}
                            >
                              {action.icon && <span className="mr-1">{action.icon}</span>}
                              {action.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={cn(
                  'px-3 py-1 text-sm border rounded-md',
                  currentPage === i + 1
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'border-gray-300 hover:bg-gray-50'
                )}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;