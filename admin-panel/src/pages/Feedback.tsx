import React, { useEffect, useState } from 'react'
import { adminApi } from '../services/api'
import { Search, Filter, RefreshCw, CheckCircle, XCircle, Trash2, Send, AlertCircle, Sparkles, Eye, Clock, ChevronDown, ChevronUp, X } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import DataTable from '../components/DataTable'
import ConfirmationModal from '../components/ConfirmationModal'

interface FeedbackUserRef {
  _id?: string
  email?: string
  name?: string
  profileCompletion?: number
}

interface FeedbackItem {
  _id: string
  // legacy
  senderId?: string
  receiverId?: string
  type?: string
  subject?: string
  message: string
  status?: 'pending' | 'approved' | 'rejected' | 'processed' | 'sent'
  createdAt: string
  // new fields
  giver?: FeedbackUserRef
  receiver?: FeedbackUserRef
  originalFeedback?: string
  category?: string
  isSent?: boolean
}

function Feedback() {
  const [loading, setLoading] = useState(false)
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'processed'>('all')
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [showApproveModal, setShowApproveModal] = useState(false)
  const [activeItem, setActiveItem] = useState<FeedbackItem | null>(null)
  const [sweetMessage, setSweetMessage] = useState('')
  const [showViewModal, setShowViewModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  
  // Loading states for individual actions
  const [processingItems, setProcessingItems] = useState<Set<string>>(new Set())
  const [approveAndSendLoading, setApproveAndSendLoading] = useState(false)
  
  const getActiveFiltersCount = () => {
    let count = 0
    if (status !== 'all') count++
    if (search.trim()) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  const handleClearAllFilters = () => {
    setStatus('all')
    setSearch('')
    setPage(1)
    setShowFilters(false) // Close filter panel after clearing
  }
  
  // Dynamic pagination limit
  const [limit, setLimit] = useState(20) // Default limit

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    type: 'approve' | 'delete' | 'bulkApprove' | null
    loading: boolean
    itemId?: string
    bulkCount?: number
  }>({
    isOpen: false,
    type: null,
    loading: false
  })

  // Define columns for DataTable
  const columns = [
    { 
      key: 'subject', 
      label: 'Subject',
      render: (value: any, row: any) => (
        <div className="font-medium text-var(--text-primary)">{row.subject}</div>
      )
    },
    { 
      key: 'message', 
      label: 'Message',
      render: (value: any, row: any) => (
        <div className="text-sm text-var(--text-secondary) max-w-xs truncate">{row.message}</div>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (value: any, row: any) => {
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800',
          processed: 'bg-var(--bg-tertiary) text-var(--text-primary)',
          sent: 'bg-purple-100 text-purple-800'
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${(statusColors[row.status as keyof typeof statusColors]) || 'bg-var(--bg-tertiary) text-var(--text-primary)'}`}>
            {row.status}
          </span>
        )
      }
    },
    { 
      key: 'createdAt', 
      label: 'Created',
      render: (value: any, row: any) => (
        <div className="text-sm text-var(--text-muted)">
          {new Date(row.createdAt).toLocaleDateString()}
        </div>
      )
    },
    { 
      key: 'actions', 
      label: 'Actions',
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openView(row)}
            className="btn  btn-sm"
            title="View Details"
          >
            <Eye className="h-3 w-3" />
          </button>
          
          <button 
            onClick={() => remove(row._id)} 
            className="btn  btn-sm text-red-600"
            disabled={processingItems.has(row._id)}
          >
            {processingItems.has(row._id) ? (
              <>
                <LoadingSpinner size="sm" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3 w-3 mr-1" />
              </>
            )}
          </button>
          {row.status === 'pending' && (
            <button 
              onClick={() => openApproveAndSend(row)} 
              className="btn btn-primary btn-sm"
              disabled={processingItems.has(row._id)}
            >
              {processingItems.has(row._id) ? (
                <>
                  <LoadingSpinner size="sm" />
                  Processing...
                </>
              ) : (
                <>
                  Approve & Send
                </>
              )}
            </button>
          )}
          
        </div>
      )
    }
  ]

  const fetchData = async () => {
    try {
      setLoading(true)
      const params: any = { page, limit }
      if (search) params.search = search
      if (status !== 'all') params.status = status
      const res = await adminApi.getFeedback(params)
      const data = res.data.data

      // Normalize various payload shapes
      const rawList = data.items || data.feedback || data || []
      const normalized: FeedbackItem[] = rawList.map((it: any) => ({
        _id: it._id,
        giver: it.giver,
        receiver: it.receiver,
        originalFeedback: it.originalFeedback ?? it.message,
        category: it.category ?? it.type,
        status: it.status,
        isSent: it.isSent,
        createdAt: it.createdAt,
        // legacy fields kept for UI
        type: it.type ?? it.category,
        subject: it.subject ?? `${it.giver?.name || it.giver?.email || 'Anonymous'} → ${it.receiver?.name || it.receiver?.email || 'User'}`,
        message: it.message ?? it.originalFeedback ?? '',
      }))

      setItems(normalized)
      setPages(data.pagination?.pages || data.pagination?.totalPages || 1)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load feedback')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [page, status, search, limit])


  const toggleSelect = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const approve = (id: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'approve',
      loading: false,
      itemId: id
    })
  }

  const handleConfirmApprove = async (processedFeedback: string) => {
    if (!confirmationModal.itemId) return

    try {
      setConfirmationModal(prev => ({ ...prev, loading: true }))
      setProcessingItems(prev => new Set([...prev, confirmationModal.itemId!]))
      await adminApi.processFeedback(confirmationModal.itemId, { action: 'approve', processedFeedback })
      toast.success('Feedback approved')
      fetchData()
    } catch (e) { 
      toast.error('Approve failed') 
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(confirmationModal.itemId!)
        return newSet
      })
      setConfirmationModal({ isOpen: false, type: null, loading: false })
    }
  }

  const reject = async (id: string) => {
    try {
      setProcessingItems(prev => new Set([...prev, id]))
      await adminApi.processFeedback(id, { action: 'reject' })
      toast.success('Feedback rejected')
      fetchData()
    } catch (e) { 
      toast.error('Reject failed') 
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const remove = (id: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      loading: false,
      itemId: id
    })
  }

  const handleConfirmDelete = async () => {
    if (!confirmationModal.itemId) return

    try {
      setConfirmationModal(prev => ({ ...prev, loading: true }))
      setProcessingItems(prev => new Set([...prev, confirmationModal.itemId!]))
      await adminApi.deleteFeedback(confirmationModal.itemId)
      toast.success('Deleted')
      fetchData()
    } catch (e) { 
      toast.error('Delete failed') 
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(confirmationModal.itemId!)
        return newSet
      })
      setConfirmationModal({ isOpen: false, type: null, loading: false })
    }
  }

  const send = async (id: string) => {
    try {
      setProcessingItems(prev => new Set([...prev, id]))
      await adminApi.sendFeedback(id, { })
      toast.success('Sent to receiver')
      fetchData()
    } catch (e) { 
      toast.error('Send failed') 
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const openApproveAndSend = (item: FeedbackItem) => {
    setActiveItem(item)
    // Simple sweetened default version
    const polite = `Hi ${item.receiver?.name || ''}! Someone left you feedback:\n\n"${item.originalFeedback || item.message}"\n\nWe reviewed it and wanted to share it with you.`
    setSweetMessage(polite)
    setShowApproveModal(true)
  }

  const openView = (item: FeedbackItem) => {
    setActiveItem(item)
    setShowViewModal(true)
  }

  const confirmApproveAndSend = async () => {
    if (!activeItem) return
    try {
      setApproveAndSendLoading(true)
      await adminApi.processFeedback(activeItem._id, { action: 'approve', processedFeedback: sweetMessage })
      await adminApi.sendFeedback(activeItem._id, { message: sweetMessage })
      toast.success('Approved and sent')
      setShowApproveModal(false)
      setActiveItem(null)
      setSweetMessage('')
      fetchData()
    } catch (e) {
      toast.error('Approve & send failed')
    } finally {
      setApproveAndSendLoading(false)
    }
  }

  const bulk = (action: 'approve' | 'reject') => {
    if (selected.length === 0) return toast.error('Select at least one')
    
    if (action === 'approve') {
      setConfirmationModal({
        isOpen: true,
        type: 'bulkApprove',
        loading: false,
        bulkCount: selected.length
      })
    } else {
      handleConfirmBulkAction(action)
    }
  }

  const handleConfirmBulkAction = async (action: 'approve' | 'reject', processedFeedback?: string) => {
    try {
      setConfirmationModal(prev => ({ ...prev, loading: true }))
      let payload: any = { feedbackIds: selected, action }
      if (action === 'approve' && processedFeedback) {
        payload.processedFeedback = processedFeedback
      }
      await adminApi.bulkProcessFeedback(payload)
      toast.success(`Bulk ${action} complete`)
      setSelected([])
      fetchData()
    } catch (e) { 
      toast.error('Bulk action failed') 
    } finally {
      setConfirmationModal({ isOpen: false, type: null, loading: false })
    }
  }

  // Handle confirmation modal actions
  const handleConfirmationConfirm = (inputValue?: string) => {
    if (!confirmationModal.type) return

    switch (confirmationModal.type) {
      case 'approve':
        if (inputValue) handleConfirmApprove(inputValue)
        break
      case 'delete':
        handleConfirmDelete()
        break
      case 'bulkApprove':
        if (inputValue) handleConfirmBulkAction('approve', inputValue)
        break
    }
  }

  const handleConfirmationCancel = () => {
    setConfirmationModal({ isOpen: false, type: null, loading: false })
  }

  // Get modal configuration based on type
  const getModalConfig = () => {
    switch (confirmationModal.type) {
      case 'approve':
        return {
          title: 'Approve Feedback',
          message: 'Enter processed feedback to save/share:',
          confirmText: 'Approve Feedback',
          type: 'info' as const,
          requireInput: true,
          inputLabel: 'Processed Feedback',
          inputPlaceholder: 'Your feedback has been reviewed and approved.'
        }
      case 'delete':
        return {
          title: 'Delete Feedback',
          message: 'Are you sure you want to delete this feedback?',
          confirmText: 'Delete Feedback',
          type: 'danger' as const,
          requireInput: false
        }
      case 'bulkApprove':
        return {
          title: 'Bulk Approve Feedback',
          message: `Enter processed feedback to send with approvals for ${confirmationModal.bulkCount} items:`,
          confirmText: 'Approve All',
          type: 'info' as const,
          requireInput: true,
          inputLabel: 'Processed Feedback',
          inputPlaceholder: 'Your feedback has been reviewed and approved.'
        }
      default:
        return {
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          confirmText: 'Confirm',
          type: 'info' as const,
          requireInput: false
        }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <button 
          onClick={fetchData} 
          className="btn btn-primary"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      {/* Search and Filters */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-var(--text-secondary)" />
            <input
              type="text"
              placeholder="Search by sender or receiver name/email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setPage(1), fetchData())}
              className="w-full pl-10 pr-4 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) placeholder-var(--text-muted) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
            />
          </div>
          
          <button
            onClick={() => {
              const activeFiltersCount = getActiveFiltersCount()
              if (activeFiltersCount > 0) {
                handleClearAllFilters()
              } else {
                setShowFilters(!showFilters)
              }
            }}
            className={`flex items-center px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
              getActiveFiltersCount() > 0
                ? 'text-var(--error) bg-var(--bg-primary) border-var(--error) hover:bg-var(--error)/10'
                : 'text-var(--text-primary) bg-var(--bg-primary) border-var(--border) hover:bg-var(--bg-secondary)'
            }`}
          >
            {getActiveFiltersCount() > 0 ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Clear Filter
              </>
            ) : (
              <>
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-var(--text-primary) mb-2">Status</label>
              <select 
                value={status} 
                onChange={e => { setStatus(e.target.value as any); setPage(1) }} 
                className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="processed">Processed</option>
                <option value="sent">Sent</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        searchable={true}
        onSearch={setSearch}
        pagination={{
          currentPage: page,
          totalPages: pages,
          onPageChange: setPage,
          limit,
          onLimitChange: setLimit
        }}
        emptyMessage="No feedback found. Try adjusting your search or filters."
        fullHeight={true}
      />

      {showViewModal && activeItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowViewModal(false)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="font-semibold">Feedback Details</div>
              <button className="text-sm text-gray-500" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-gray-500">Giver</div>
                  <div className="text-gray-900">{activeItem.giver?.name || activeItem.giver?.email || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Receiver</div>
                  <div className="text-gray-900">{activeItem.receiver?.name || activeItem.receiver?.email || '-'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Category</div>
                  <div className="text-gray-900">{activeItem.category || activeItem.type || 'general'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Status</div>
                  <div className="text-gray-900 capitalize">{activeItem.status || 'pending'}</div>
                </div>
                <div>
                  <div className="text-gray-500">Created</div>
                  <div className="text-gray-900">{new Date(activeItem.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div>
                <div className="text-gray-500 mb-1">Original Feedback</div>
                <div className="p-3 bg-gray-50 rounded text-gray-800 whitespace-pre-wrap">
                  {activeItem.originalFeedback || activeItem.message}
                </div>
              </div>
            </div>
            {/* <div className="p-4 border-t flex items-center justify-end space-x-2">
              <button className="btn btn-secondary" onClick={() => setShowViewModal(false)}>Close</button>
            </div> */}
          </div>
        </div>
      )}

      {showApproveModal && activeItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowApproveModal(false)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-xl">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="font-semibold">Approve & Send Feedback</span>
              </div>
              <button className="text-sm text-gray-500" onClick={() => setShowApproveModal(false)}>Close</button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <div className="text-sm text-gray-600 mb-1">Original</div>
                <div className="p-3 bg-gray-50 rounded text-sm text-gray-800 whitespace-pre-wrap">{activeItem.originalFeedback || activeItem.message}</div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Sweetened Version (what the receiver will get)</label>
                <textarea value={sweetMessage} onChange={e => setSweetMessage(e.target.value)} rows={6} className="w-full border rounded-md px-3 py-2" />
              </div>
            </div>
            <div className="p-4 border-t flex items-center justify-end space-x-2">
              <button 
                onClick={() => setShowApproveModal(false)} 
                className="btn btn-secondary"
                disabled={approveAndSendLoading}
              >
                Cancel
              </button>
              <button 
                onClick={confirmApproveAndSend} 
                className="btn btn-primary"
                disabled={approveAndSendLoading}
              >
                {approveAndSendLoading ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-1" />Approve & Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        loading={confirmationModal.loading}
        onConfirm={handleConfirmationConfirm}
        onCancel={handleConfirmationCancel}
        {...getModalConfig()}
      />
    </div>
  )
}

export default Feedback


