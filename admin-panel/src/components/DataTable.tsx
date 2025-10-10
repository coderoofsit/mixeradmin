import React, { useState } from 'react'
import { Search, ChevronLeft, ChevronRight, MoreHorizontal, ChevronDown } from 'lucide-react'

interface Column {
  key: string
  label: React.ReactNode
  render?: (value: any, row: any) => React.ReactNode
  sortable?: boolean
  width?: string
}

interface DataTableProps {
  columns: Column[]
  data: any[]
  loading?: boolean
  searchable?: boolean
  pagination?: {
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    limit?: number
    onLimitChange?: (limit: number) => void
  }
  onSearch?: (term: string) => void
  onRowClick?: (row: any) => void
  emptyMessage?: string
  className?: string
  fullHeight?: boolean
  expandable?: boolean
  expandableContent?: (row: any) => React.ReactNode
  onRowExpand?: (row: any) => void
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  loading = false,
  searchable = true,
  pagination,
  onSearch,
  onRowClick,
  emptyMessage = 'No data available',
  className = '',
  fullHeight = false,
  expandable = false,
  expandableContent,
  onRowExpand
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortColumn, setSortColumn] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    onSearch?.(value)
  }

  const toggleRowExpansion = (rowId: string, row: any) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(rowId)) {
      newExpandedRows.delete(rowId)
    } else {
      newExpandedRows.add(rowId)
      // Call onRowExpand callback when expanding
      onRowExpand?.(row)
    }
    setExpandedRows(newExpandedRows)
  }

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnKey)
      setSortDirection('asc')
    }
  }

  const renderCell = (column: Column, row: any) => {
    const value = row[column.key]
    
    if (column.render) {
      return column.render(value, row)
    }
    
    // Handle objects that shouldn't be rendered directly
    if (value && typeof value === 'object' && !React.isValidElement(value)) {
      // For location objects, format them nicely
      if (value.venue || value.address || value.city) {
        if (value.venue) {
          return `${value.venue}${value.city ? `, ${value.city}` : ''}${value.state ? `, ${value.state}` : ''}`
        } else if (value.address) {
          return `${value.address}${value.city ? `, ${value.city}` : ''}${value.state ? `, ${value.state}` : ''}`
        } else if (value.city) {
          return `${value.city}${value.state ? `, ${value.state}` : ''}`
        }
        return 'Location available'
      }
      
      // For other objects, show a generic message
      return '[Object]'
    }
    
    return value
  }

  if (loading) {
    return (
      <div className={`table-container ${className}`}>
        <div className="p-8">
          <div className="flex items-center justify-center space-x-2">
            <div className="loading-spinner h-6 w-6"></div>
            <span style={{color: 'var(--text-secondary)'}}>Loading data...</span>
          </div>
        </div>
      </div>
    )
  }

  const tableContainerClass = fullHeight 
    ? "glass-card flex flex-col" 
    : "table-container"

  const tableWrapperClass = fullHeight 
    ? "flex-1 overflow-y-auto" 
    : "overflow-x-auto custom-scrollbar"

  const tableStyle = fullHeight 
    ? { height: 'calc(100vh - 200px)', minHeight: '400px', maxHeight: 'calc(100vh - 150px)' }
    : {}

  return (
    <div className={`${fullHeight ? '' : 'space-y-4'} ${className}`}>
      {/* Search Bar */}
      {/*{searchable && (
        <div className="search-container">
          <Search className="search-icon h-4 w-4" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
        </div>
      )}*/}

      {/* Table */}
      <div className={tableContainerClass} style={tableStyle}>
        <div className={tableWrapperClass}>
          <table className="table">
            <thead className="table-header">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className={`table-header-cell ${column.sortable ? 'cursor-pointer' : ''}`}
                    style={{ width: column.width }}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && sortColumn === column.key && (
                        <span className="text-primary-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="table-body">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="table-cell text-center py-12">
                    <div className="empty-state">
                      <div className="empty-state-icon">
                        <Search className="h-12 w-12" />
                      </div>
                      <h3 className="empty-state-title">No data found</h3>
                      <p className="empty-state-description">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, index) => {
                  const rowId = row.id || row._id || index.toString()
                  const isExpanded = expandedRows.has(rowId)
                  
                  if (expandable && expandableContent) {
                    return (
                      <React.Fragment key={rowId}>
                        <tr 
                          className={`table-row ${onRowClick ? 'cursor-pointer' : ''}`}
                          onClick={() => onRowClick?.(row)}
                        >
                          {columns.map((column, colIndex) => (
                            <td key={column.key} className="table-cell">
                              {colIndex === 0 && (
                                <div className="flex items-center">
                                  <button
                                    className="mr-2 p-1 rounded hover:bg-var(--bg-tertiary) transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleRowExpansion(rowId, row)
                                    }}
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4 text-var(--text-secondary)" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-var(--text-secondary)" />
                                    )}
                                  </button>
                                  {renderCell(column, row)}
                                </div>
                              )}
                              {colIndex > 0 && renderCell(column, row)}
                            </td>
                          ))}
                        </tr>
                        {isExpanded && (
                          <tr>
                            <td colSpan={columns.length} className="table-cell bg-var(--bg-secondary)">
                              <div className="glass-card p-4 rounded-lg m-2">
                                {expandableContent(row)}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )
                  }
                  
                  return (
                    <tr 
                      key={rowId} 
                      className={`table-row ${onRowClick ? 'cursor-pointer' : ''}`}
                      onClick={() => onRowClick?.(row)}
                    >
                      {columns.map((column) => (
                        <td key={column.key} className="table-cell">
                          {renderCell(column, row)}
                        </td>
                      ))}
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && (pagination.totalPages > 1 || pagination.onLimitChange) && (
          <div className={`flex items-center justify-between p-4 border-t border-var(--border) text-sm ${fullHeight ? 'bg-var(--bg-tertiary)' : ''}`}>
            <div className="flex items-center space-x-4">
              <span className="text-var(--text-primary)">Page {pagination.currentPage} of {pagination.totalPages}</span>
              <span className="text-var(--text-muted)">Showing {data.length} items</span>
              {/* {pagination.limit && (
                // <span className="text-var(--text-muted)">Limit: {pagination.limit} per page</span>
              )} */}
              {pagination.onLimitChange && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm whitespace-nowrap text-var(--text-secondary)">Per page:</label>
                  <select 
                    value={pagination.limit || 20} 
                    onChange={(e) => pagination.onLimitChange?.(Number(e.target.value))}
                    className="select px-2 py-1 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={20}>20</option>
                    <option value={25}>25</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="pagination">
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="pagination-button"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <button
                      key={page}
                      onClick={() => pagination.onPageChange(page)}
                      className={`pagination-button ${
                        page === pagination.currentPage ? 'pagination-button-active' : ''
                      }`}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>
              
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="pagination-button"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DataTable 