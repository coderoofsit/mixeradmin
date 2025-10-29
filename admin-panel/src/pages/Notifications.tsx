import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../services/api'
import { formatUTCDateTime } from '../utils/dateUtils'
import { 
  Bell, 
  Search, 
  RefreshCw, 
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  AlertCircle,
  CheckCircle,
  Clock,
  Send,
  User
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import DataTable from '../components/DataTable'
import toast from 'react-hot-toast'

interface NotificationStats {
  total: number
  read: number
  unread: number
  byStatus: {
    sent: number
    delivered: number
    failed: number
    pending: number
  }
  lastNotificationDate: string
  lastReadDate: string
}

interface UserWithNotifications {
  userId: string
  name: string
  email: string
  age: number
  accountStatus: string
  backgroundVerification: string
  primaryImageUrl: string
  joinedDate: string
  notificationStats: NotificationStats
}

interface SummaryStats {
  totalUsers: number
  usersWithNotifications: number
  usersWithUnreadNotifications: number
  totalNotificationsSent: number
  totalUnreadNotifications: number
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
  limit: number
  hasNextPage: boolean
  hasPrevPage: boolean
}

function Notifications() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<UserWithNotifications[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<SummaryStats | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    hasUnread: 'all',
    accountStatus: 'all',
    notificationStatus: 'all'
  })

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setPagination(prev => ({ ...prev, currentPage: 1 }))
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchUsersWithNotifications()
  }, [pagination.currentPage, debouncedSearchTerm, filters])

  const fetchUsersWithNotifications = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.currentPage,
        limit: pagination.limit,
        search: debouncedSearchTerm || undefined,
        hasUnread: filters.hasUnread !== 'all' ? filters.hasUnread === 'true' : undefined,
        accountStatus: filters.accountStatus !== 'all' ? filters.accountStatus : undefined,
        notificationStatus: filters.notificationStatus !== 'all' ? filters.notificationStatus : undefined
      }
      
      const response = await adminApi.getUsersNotificationStats(params)
      
      if (response.data.success) {
        setUsers(response.data.data.users)
        setSummary(response.data.data.summary)
        setPagination(response.data.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching users with notifications:', error)
      toast.error('Failed to load notification statistics')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      hasUnread: 'all',
      accountStatus: 'all',
      notificationStatus: 'all'
    })
    setSearchTerm('')
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleRowClick = (user: UserWithNotifications) => {
    navigate(`/notifications/user/${user.userId}`)
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'suspended': return 'bg-yellow-100 text-yellow-800'
      case 'banned': return 'bg-red-100 text-red-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (_value: any, user: UserWithNotifications) => (
        <div className="flex items-center gap-3">
          {user.primaryImageUrl ? (
            <img 
              src={user.primaryImageUrl} 
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-var(--primary)/10 flex items-center justify-center">
              <User className="h-5 w-5 text-var(--primary)" />
            </div>
          )}
          <div>
            <div className="font-medium text-var(--text-primary)">{user.name}</div>
            <div className="text-xs text-var(--text-muted)">{user.email}</div>
          </div>
        </div>
      )
    },
    // {
    //   key: 'age',
    //   label: 'Age',
    //   render: (_value: any, user: UserWithNotifications) => (
    //     <span className="text-sm text-var(--text-secondary)">{user.age || 'N/A'}</span>
    //   )
    // },
    {
      key: 'accountStatus',
      label: 'Status',
      render: (_value: any, user: UserWithNotifications) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(user.accountStatus)}`}>
          {user.accountStatus}
        </span>
      )
    },
    {
      key: 'total',
      label: 'Total',
      render: (_value: any, user: UserWithNotifications) => (
        <div className="text-center">
          <div className="text-sm font-semibold text-var(--text-primary)">
            {user.notificationStats.total}
          </div>
          <div className="text-xs text-var(--text-muted)">notifications</div>
        </div>
      )
    },
    {
      key: 'unread',
      label: 'Unread',
      render: (_value: any, user: UserWithNotifications) => (
        <div className="text-center">
          <div className={`text-sm font-semibold ${user.notificationStats.unread > 0 ? 'text-orange-600' : 'text-var(--text-primary)'}`}>
            {user.notificationStats.unread}
          </div>
          <div className="text-xs text-var(--text-muted)">unread</div>
        </div>
      )
    },
    {
      key: 'sent',
      label: 'Sent',
      render: (_value: any, user: UserWithNotifications) => (
        <div className="flex items-center justify-center gap-1">
          <Send className="h-3 w-3 text-blue-600" />
          <span className="text-sm text-var(--text-secondary)">
            {user.notificationStats.byStatus.sent}
          </span>
        </div>
      )
    },
    {
      key: 'delivered',
      label: 'Delivered',
      render: (_value: any, user: UserWithNotifications) => (
        <div className="flex items-center justify-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <span className="text-sm text-var(--text-secondary)">
            {user.notificationStats.byStatus.delivered}
          </span>
        </div>
      )
    },
    {
      key: 'failed',
      label: 'Failed',
      render: (_value: any, user: UserWithNotifications) => (
        <div className="flex items-center justify-center gap-1">
          <AlertCircle className="h-3 w-3 text-red-600" />
          <span className="text-sm text-var(--text-secondary)">
            {user.notificationStats.byStatus.failed}
          </span>
        </div>
      )
    },
    {
      key: 'pending',
      label: 'Pending',
      render: (_value: any, user: UserWithNotifications) => (
        <div className="flex items-center justify-center gap-1">
          <Clock className="h-3 w-3 text-yellow-600" />
          <span className="text-sm text-var(--text-secondary)">
            {user.notificationStats.byStatus.pending}
          </span>
        </div>
      )
    },
    {
      key: 'lastNotification',
      label: 'Last Notification',
      render: (_value: any, user: UserWithNotifications) => (
        <div className="text-xs text-var(--text-muted)">
          {user.notificationStats.lastNotificationDate 
            ? formatUTCDateTime(user.notificationStats.lastNotificationDate)
            : 'Never'}
        </div>
      )
    }
  ]

  const activeFiltersCount = Object.values(filters).filter(v => v !== 'all').length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-var(--text-primary) flex items-center gap-2">
            <Bell className="h-7 w-7 text-var(--primary)" />
            Notifications Overview
          </h1>
          <p className="text-sm text-var(--text-muted) mt-1">
            Monitor notification statistics across all users
          </p>
        </div>
        <button
          onClick={fetchUsersWithNotifications}
          disabled={loading}
          className="px-4 py-2 bg-var(--primary) text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-var(--card-bg) border border-var(--border) rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-var(--text-muted)">Total Users</p>
                <p className="text-2xl font-bold text-var(--text-primary) mt-1">
                  {summary.totalUsers.toLocaleString()}
                </p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-var(--card-bg) border border-var(--border) rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-var(--text-muted)">With Notifications</p>
                <p className="text-2xl font-bold text-var(--text-primary) mt-1">
                  {summary.usersWithNotifications.toLocaleString()}
                </p>
              </div>
              <Bell className="h-8 w-8 text-green-500" />
            </div>
          </div>

          <div className="bg-var(--card-bg) border border-var(--border) rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-var(--text-muted)">With Unread</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {summary.usersWithUnreadNotifications.toLocaleString()}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-var(--card-bg) border border-var(--border) rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-var(--text-muted)">Total Sent</p>
                <p className="text-2xl font-bold text-var(--text-primary) mt-1">
                  {summary.totalNotificationsSent.toLocaleString()}
                </p>
              </div>
              <Send className="h-8 w-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-var(--card-bg) border border-var(--border) rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-var(--text-muted)">Total Unread</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {summary.totalUnreadNotifications.toLocaleString()}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-var(--card-bg) border border-var(--border) rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-var(--text-muted)" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) hover:bg-var(--bg-secondary) transition-all flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-var(--primary) text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) hover:bg-var(--bg-secondary) transition-all flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-var(--border) grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-var(--text-primary) mb-2">
                Unread Status
              </label>
              <select
                value={filters.hasUnread}
                onChange={(e) => handleFilterChange('hasUnread', e.target.value)}
                className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
              >
                <option value="all">All Users</option>
                <option value="true">With Unread</option>
                <option value="false">No Unread</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-var(--text-primary) mb-2">
                Account Status
              </label>
              <select
                value={filters.accountStatus}
                onChange={(e) => handleFilterChange('accountStatus', e.target.value)}
                className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-var(--text-primary) mb-2">
                Notification Status
              </label>
              <select
                value={filters.notificationStatus}
                onChange={(e) => handleFilterChange('notificationStatus', e.target.value)}
                className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
              >
                <option value="all">All Statuses</option>
                <option value="sent">Sent</option>
                <option value="delivered">Delivered</option>
                <option value="failed">Failed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-var(--card-bg) border border-var(--border) rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Bell className="h-12 w-12 text-var(--text-muted) mb-4" />
            <p className="text-lg font-medium text-var(--text-primary)">No users found</p>
            <p className="text-sm text-var(--text-muted) mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={users}
            onRowClick={handleRowClick}
            pagination={{
              currentPage: pagination.currentPage,
              totalPages: pagination.totalPages,
              onPageChange: (page: number) => setPagination(prev => ({ ...prev, currentPage: page })),
              limit: pagination.limit
            }}
          />
        )}
      </div>
    </div>
  )
}

export default Notifications

