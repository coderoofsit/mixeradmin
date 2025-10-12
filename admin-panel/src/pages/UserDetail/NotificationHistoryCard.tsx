import { useState, useEffect } from 'react'
import { Bell, Filter, ChevronLeft, ChevronRight, Clock, CheckCircle, Circle } from 'lucide-react'
import { adminApi } from '../../services/api'
import LoadingSpinner from '../../components/LoadingSpinner'

interface Notification {
  _id: string
  type: string
  title: string
  body: string
  read: boolean
  readAt?: string
  createdAt: string
  status: string
  priority: string
}

interface NotificationHistoryCardProps {
  userId: string
}

const notificationTypeColors = {
  like: 'bg-pink-100 text-pink-800',
  match: 'bg-green-100 text-green-800',
  chat_message: 'bg-blue-100 text-blue-800',
  event_approved: 'bg-emerald-100 text-emerald-800',
  event_suspended: 'bg-red-100 text-red-800',
  event_capacity_full: 'bg-orange-100 text-orange-800',
  background_verification: 'bg-purple-100 text-purple-800',
  broadcast: 'bg-indigo-100 text-indigo-800',
  test: 'bg-gray-100 text-gray-800',
  system: 'bg-slate-100 text-slate-800',
  feedback: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-800'
}

const getNotificationTypeColor = (type: string) => {
  return notificationTypeColors[type as keyof typeof notificationTypeColors] || notificationTypeColors.other
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).replace(/\//g, '-')
}

export default function NotificationHistoryCard({ userId }: NotificationHistoryCardProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState({
    type: '',
    read: ''
  })

  const fetchNotifications = async (page = 1) => {
    try {
      setLoading(true)
      const params = {
        page,
        limit: 8,
        ...(filters.type && { type: filters.type }),
        ...(filters.read !== '' && { read: filters.read === 'true' })
      }
      
      const response = await adminApi.getUserNotifications(userId, params)
      if (response.data.success) {
        setNotifications(response.data.data.notifications)
        setTotalPages(response.data.data.pagination.totalPages)
        setTotalCount(response.data.data.pagination.totalCount)
        setCurrentPage(page)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchNotifications(1)
    }
  }, [userId, filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchNotifications(newPage)
    }
  }

  if (loading && notifications.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-var(--text-primary) flex items-center">
          <Bell className="h-5 w-5 mr-2 text-var(--primary)" />
          Notifications
        </h3>
        <span className="text-sm text-var(--text-muted)">{totalCount} total</span>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select
          value={filters.type}
          onChange={(e) => handleFilterChange('type', e.target.value)}
          className="text-xs px-2 py-1 rounded border border-var(--border) bg-var(--bg-primary) text-var(--text-primary)"
        >
          <option value="">All Types</option>
          <option value="like">Like</option>
          <option value="match">Match</option>
          {/* <option value="event_approved">Event Approved</option>
          <option value="event_suspended">Event Suspended</option> */}
          <option value="background_verification">Background Check</option>
          <option value="broadcast">Broadcast</option>
          <option value="system">System</option>
          <option value="feedback">Feedback</option>
        </select>
        
        <select
          value={filters.read}
          onChange={(e) => handleFilterChange('read', e.target.value)}
          className="text-xs px-2 py-1 rounded border border-var(--border) bg-var(--bg-primary) text-var(--text-primary)"
        >
          <option value="">All Status</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Bell className="h-8 w-8 text-var(--text-muted) mb-2" />
            <p className="text-sm text-var(--text-muted)">No notifications found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  notification.read 
                    ? 'bg-var(--bg-tertiary) border-var(--border)' 
                    : 'bg-var(--primary)/5 border-var(--primary)/20'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationTypeColor(notification.type)}`}>
                      {notification.type.replace('_', ' ')}
                    </span>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-var(--primary) rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-var(--text-muted)">
                    <Clock className="h-3 w-3" />
                    {formatRelativeTime(notification.createdAt)}
                  </div>
                </div>
                
                <h4 className="font-medium text-var(--text-primary) text-sm mb-1">
                  {notification.title}
                </h4>
                
                <p className="text-xs text-var(--text-secondary) line-clamp-2">
                  {notification.body}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    {notification.read ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <Circle className="h-3 w-3 text-var(--text-muted)" />
                    )}
                    <span className="text-xs text-var(--text-muted)">
                      {notification.read ? 'Read' : 'Unread'}
                    </span>
                  </div>
                  
                  <span className={`text-xs px-2 py-1 rounded ${
                    notification.status === 'sent' ? 'bg-green-100 text-green-800' :
                    notification.status === 'failed' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {notification.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-var(--border) flex-shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1 rounded hover:bg-var(--bg-tertiary) disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            
            <span className="text-sm text-var(--text-muted)">
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1 rounded hover:bg-var(--bg-tertiary) disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          
          <div className="text-xs text-var(--text-muted)">
            {notifications.length} of {totalCount} notifications
          </div>
        </div>
      )}
    </div>
  )
}
