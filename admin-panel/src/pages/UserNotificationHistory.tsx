import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Bell, Filter, ChevronLeft, ChevronRight, Clock, CheckCircle, Circle, ArrowLeft, User as UserIcon, AlertCircle } from 'lucide-react'
import { adminApi } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { formatUTCDateTime } from '../utils/dateUtils'
import toast from 'react-hot-toast'

interface SenderInfo {
  _id: string
  email: string
  images: Array<{
    url: string
    isPrimary: boolean
    uploadedAt: string
    _id: string
  }>
  name: string
}

interface Notification {
  _id: string
  userId: string
  type: string
  title: string
  body: string
  data?: {
    type?: string
    status?: string
    action?: string
    notes?: string
    notificationID?: string
    timestamp?: string
    senderId?: string
    matchedUserName?: string
    likerName?: string
    [key: string]: any
  }
  image?: string | null
  senderId?: SenderInfo | null
  appName?: string
  status: string
  deliveryStatus?: {
    success: boolean
    messageId?: string | null
    error?: string | null
    sentAt?: string
  }
  read: boolean
  readAt?: string | null
  priority: string
  expiresAt?: string | null
  fcmDeliveryDetails?: {
    successCount: number
    failureCount: number
    totalTokens: number
    errors?: string[] | null
    errorType?: string
  }
  notificationID?: string
  createdAt: string
  updatedAt: string
  __v?: number
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

const notificationStatusColors = {
  sent: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800'
}

const getNotificationTypeColor = (type: string) => {
  return notificationTypeColors[type as keyof typeof notificationTypeColors] || notificationTypeColors.other
}

const getNotificationStatusColor = (status: string) => {
  return notificationStatusColors[status as keyof typeof notificationStatusColors] || 'bg-gray-100 text-gray-800'
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

export default function UserNotificationHistory() {
  const { userId } = useParams<{ userId: string }>()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [userName, setUserName] = useState<string>('')
  const [userEmail, setUserEmail] = useState<string>('')
  const [userImage, setUserImage] = useState<string>('')
  const [filters, setFilters] = useState({
    type: '',
    read: '',
    status: ''
  })

  const fetchUserData = useCallback(async () => {
    if (!userId) return
    
    try {
      // User data will be fetched from the notifications response
      // No separate call needed
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }, [userId])

  const fetchNotifications = useCallback(async (page = 1) => {
    if (!userId) return
    
    try {
      setLoading(true)
      const params = {
        page,
        limit: 20,
        ...(filters.type && { type: filters.type }),
        ...(filters.read !== '' && { read: filters.read === 'true' }),
        ...(filters.status && { status: filters.status })
      }
      
      const response = await adminApi.getUserNotifications(userId, params)
      if (response.data.success) {
        setNotifications(response.data.data.notifications)
        setTotalPages(response.data.data.pagination.totalPages)
        setTotalCount(response.data.data.pagination.totalCount)
        setCurrentPage(page)
        
        // Set user details from the response if available
        if (response.data.data.userName) {
          setUserName(response.data.data.userName)
        }
        if (response.data.data.userEmail) {
          setUserEmail(response.data.data.userEmail)
        }
        if (response.data.data.userImage) {
          setUserImage(response.data.data.userImage)
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }, [userId, filters.type, filters.read, filters.status])

  useEffect(() => {
    if (userId) {
      fetchUserData()
      fetchNotifications(1)
    }
  }, [userId, fetchNotifications, fetchUserData])

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchNotifications(newPage)
    }
  }

  const getStatusSummary = () => {
    const summary = {
      sent: 0,
      delivered: 0,
      failed: 0,
      pending: 0,
      read: 0,
      unread: 0
    }

    notifications.forEach(notification => {
      if (notification.status === 'sent') summary.sent++
      if (notification.deliveryStatus?.success) summary.delivered++
      if (notification.status === 'failed') summary.failed++
      if (notification.status === 'pending') summary.pending++
      if (notification.read) summary.read++
      else summary.unread++
    })

    return summary
  }

  const statusSummary = getStatusSummary()

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/notifications')}
            className="p-2 hover:bg-var(--bg-tertiary) rounded-lg transition-all flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5 text-var(--text-primary)" />
          </button>
          <div className="flex items-center gap-3">
            {userImage && (
              <img 
                src={userImage} 
                alt={userName} 
                className="w-12 h-12 rounded-full object-cover border-2 border-var(--border)"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-var(--text-primary) flex items-center gap-2">
                <Bell className="h-7 w-7 text-var(--primary)" />
                {userName ? `${userName}'s Notification History` : 'Notification History'}
              </h1>
              {userEmail && (
                <p className="text-sm text-var(--text-muted) mt-0.5">{userEmail}</p>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => navigate(`/users/${userId}`)}
          className="px-4 py-2 bg-var(--primary) text-white rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
        >
          <UserIcon className="h-4 w-4" />
          View User Profile
        </button>
      </div>

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-var(--card-bg) border border-var(--border) rounded-xl p-4">
          <div className="text-sm text-var(--text-muted)">Total</div>
          <div className="text-2xl font-bold text-var(--text-primary) mt-1">
            {totalCount}
          </div>
        </div>
        <div className="bg-var(--card-bg) border border-var(--border) rounded-xl p-4">
          <div className="text-sm text-var(--text-muted)">Sent</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {statusSummary.sent}
          </div>
        </div>
        <div className="bg-var(--card-bg) border border-var(--border) rounded-xl p-4">
          <div className="text-sm text-var(--text-muted)">Delivered</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {statusSummary.delivered}
          </div>
        </div>
        <div className="bg-var(--card-bg) border border-var(--border) rounded-xl p-4">
          <div className="text-sm text-var(--text-muted)">Failed</div>
          <div className="text-2xl font-bold text-red-600 mt-1">
            {statusSummary.failed}
          </div>
        </div>
        <div className="bg-var(--card-bg) border border-var(--border) rounded-xl p-4">
          <div className="text-sm text-var(--text-muted)">Read</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {statusSummary.read}
          </div>
        </div>
        <div className="bg-var(--card-bg) border border-var(--border) rounded-xl p-4">
          <div className="text-sm text-var(--text-muted)">Unread</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">
            {statusSummary.unread}
          </div>
        </div>
      </div>

      {/* Filters */}
      {/* <div className="bg-var(--card-bg) border border-var(--border) rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-var(--text-muted)" />
          <h3 className="text-sm font-medium text-var(--text-primary)">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-var(--text-muted) mb-1">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) text-sm focus:outline-none focus:ring-2 focus:ring-var(--primary)"
            >
              <option value="">All Types</option>
              <option value="like">Like</option>
              <option value="match">Match</option>
              <option value="chat_message">Chat Message</option>
              <option value="event_approved">Event Approved</option>
              <option value="event_suspended">Event Suspended</option>
              <option value="background_verification">Background Check</option>
              <option value="broadcast">Broadcast</option>
              <option value="system">System</option>
              <option value="feedback">Feedback</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-var(--text-muted) mb-1">Read Status</label>
            <select
              value={filters.read}
              onChange={(e) => handleFilterChange('read', e.target.value)}
              className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) text-sm focus:outline-none focus:ring-2 focus:ring-var(--primary)"
            >
              <option value="">All Status</option>
              <option value="false">Unread</option>
              <option value="true">Read</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-var(--text-muted) mb-1">Delivery Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) text-sm focus:outline-none focus:ring-2 focus:ring-var(--primary)"
            >
              <option value="">All Status</option>
              <option value="sent">Sent</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div> */}

      {/* Notifications List */}
      <div className="bg-var(--card-bg) border border-var(--border) rounded-xl p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Bell className="h-12 w-12 text-var(--text-muted) mb-4" />
            <p className="text-lg font-medium text-var(--text-primary)">No notifications found</p>
            <p className="text-sm text-var(--text-muted) mt-1">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 rounded-lg border transition-all duration-200 ${
                  notification.read 
                    ? 'bg-var(--bg-tertiary) border-var(--border)' 
                    : 'bg-var(--primary)/5 border-var(--primary)/20'
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {/* Notification or Sender Image */}
                  {notification.image ? (
                    <img 
                      src={notification.image} 
                      alt="Notification" 
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : notification.senderId && typeof notification.senderId === 'object' && notification.senderId.images?.length > 0 ? (
                    <img 
                      src={notification.senderId.images.find(img => img.isPrimary)?.url || notification.senderId.images[0].url} 
                      alt={notification.senderId.name} 
                      className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                    />
                  ) : null}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationTypeColor(notification.type)}`}>
                          {notification.type.replace(/_/g, ' ')}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationStatusColor(notification.status)}`}>
                          {notification.status}
                        </span>
                        {!notification.read && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium">
                            <Circle className="h-2 w-2 fill-orange-800" />
                            Unread
                          </div>
                        )}
                        {notification.appName && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {notification.appName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-var(--text-muted) flex-shrink-0 ml-2">
                        <Clock className="h-3 w-3" />
                        {formatRelativeTime(notification.createdAt)}
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-var(--text-primary) text-base mb-2">
                      {notification.title}
                    </h4>
                    
                    <p className="text-sm text-var(--text-secondary) mb-3">
                      {notification.body}
                    </p>
                  </div>
                </div>
                
                {/* Additional Data Section */}
                {(notification.data?.notes || notification.data?.matchedUserName || notification.data?.likerName || notification.data?.action) && (
                  <div className="mb-3 p-3 bg-var(--bg-secondary) rounded-lg space-y-2">
                    {notification.data.matchedUserName && (
                      <div>
                        <span className="text-xs text-var(--text-muted)">Matched With: </span>
                        <span className="text-sm text-var(--text-primary) font-medium">{notification.data.matchedUserName}</span>
                      </div>
                    )}
                    {notification.data.likerName && (
                      <div>
                        <span className="text-xs text-var(--text-muted)">Liked By: </span>
                        <span className="text-sm text-var(--text-primary) font-medium">{notification.data.likerName}</span>
                      </div>
                    )}
                    {notification.data.action && (
                      <div>
                        <span className="text-xs text-var(--text-muted)">Action: </span>
                        <span className="text-sm text-var(--text-primary)">{notification.data.action.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                    {notification.data.notes && (
                      <div>
                        <div className="text-xs text-var(--text-muted) mb-1">Admin Notes:</div>
                        <div className="text-sm text-var(--text-primary)">{notification.data.notes}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* FCM Delivery Errors */}
                {notification.fcmDeliveryDetails?.errors && notification.fcmDeliveryDetails.errors.length > 0 && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs font-medium text-red-800 mb-1">
                          FCM Delivery Errors {notification.fcmDeliveryDetails.errorType && `(${notification.fcmDeliveryDetails.errorType})`}
                        </div>
                        <ul className="text-xs text-red-700 space-y-1">
                          {notification.fcmDeliveryDetails.errors.map((error, idx) => (
                            <li key={idx}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-var(--border)">
                  <div>
                    <div className="text-xs text-var(--text-muted)">Read Status</div>
                    <div className="flex items-center gap-1 mt-1">
                      {notification.read ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-var(--text-primary)">Read</span>
                        </>
                      ) : (
                        <>
                          <Circle className="h-3 w-3 text-var(--text-muted)" />
                          <span className="text-xs text-var(--text-primary)">Unread</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-xs text-var(--text-muted)">Priority</div>
                    <div className="text-xs text-var(--text-primary) mt-1 capitalize">
                      {notification.priority}
                    </div>
                  </div>
                  
                  {notification.deliveryStatus && (
                    <>
                      <div>
                        <div className="text-xs text-var(--text-muted)">Delivery</div>
                        <div className="text-xs text-var(--text-primary) mt-1">
                          {notification.deliveryStatus.success ? '✓ Success' : '✗ Failed'}
                        </div>
                      </div>
                      
                      {notification.fcmDeliveryDetails && (
                        <div>
                          <div className="text-xs text-var(--text-muted)">FCM Tokens</div>
                          <div className="text-xs text-var(--text-primary) mt-1">
                            {notification.fcmDeliveryDetails.successCount}/{notification.fcmDeliveryDetails.totalTokens}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {notification.notificationID && (
                    <div>
                      <div className="text-xs text-var(--text-muted)">Notification ID</div>
                      <div className="text-xs text-var(--text-primary) mt-1 truncate" title={notification.notificationID}>
                        {notification.notificationID.substring(0, 8)}...
                      </div>
                    </div>
                  )}

                  {notification.senderId && typeof notification.senderId === 'object' && (
                    <div>
                      <div className="text-xs text-var(--text-muted)">Sender</div>
                      <div className="text-xs text-var(--text-primary) mt-1 font-medium">
                        {notification.senderId.name}
                      </div>
                    </div>
                  )}

                  {notification.deliveryStatus?.messageId && (
                    <div>
                      <div className="text-xs text-var(--text-muted)">Message ID</div>
                      <div className="text-xs text-var(--text-primary) mt-1 truncate" title={notification.deliveryStatus.messageId}>
                        {notification.deliveryStatus.messageId.substring(0, 8)}...
                      </div>
                    </div>
                  )}

                  {notification.deliveryStatus?.error && (
                    <div className="col-span-2">
                      <div className="text-xs text-var(--text-muted)">Delivery Error</div>
                      <div className="text-xs text-red-600 mt-1">
                        {notification.deliveryStatus.error}
                      </div>
                    </div>
                  )}
                  
                  {notification.readAt && (
                    <div>
                      <div className="text-xs text-var(--text-muted)">Read At</div>
                      <div className="text-xs text-var(--text-primary) mt-1">
                        {formatUTCDateTime(notification.readAt)}
                      </div>
                    </div>
                  )}

                  {notification.expiresAt && (
                    <div>
                      <div className="text-xs text-var(--text-muted)">Expires At</div>
                      <div className="text-xs text-var(--text-primary) mt-1">
                        {formatUTCDateTime(notification.expiresAt)}
                      </div>
                    </div>
                  )}

                  {notification.deliveryStatus?.sentAt && (
                    <div>
                      <div className="text-xs text-var(--text-muted)">Sent At</div>
                      <div className="text-xs text-var(--text-primary) mt-1">
                        {formatUTCDateTime(notification.deliveryStatus.sentAt)}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-xs text-var(--text-muted)">Updated At</div>
                    <div className="text-xs text-var(--text-primary) mt-1">
                      {formatUTCDateTime(notification.updatedAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-var(--border)">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded hover:bg-var(--bg-tertiary) disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              
              <span className="text-sm text-var(--text-muted) px-3">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded hover:bg-var(--bg-tertiary) disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
            
            <div className="text-xs text-var(--text-muted)">
              Showing {notifications.length} of {totalCount} notifications
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

