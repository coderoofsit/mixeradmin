import React, { useEffect, useState } from 'react'
import { adminApi } from '../services/api'
import { Search, Filter, RefreshCw, CheckCircle, XCircle, Trash2, Send, AlertCircle, Sparkles, Eye, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import DataTable from '../components/DataTable'

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
  }
  
  // Dynamic pagination limit
  const [limit, setLimit] = useState(20) // Default limit

  // Define columns for DataTable
  const columns = [
    { 
      key: 'subject', 
      label: 'Subject',
      render: (value: any, row: any) => (
        <div className="font-medium text-gray-900">{row.subject}</div>
      )
    },
    { 
      key: 'message', 
      label: 'Message',
      render: (value: any, row: any) => (
        <div className="text-sm text-gray-600 max-w-xs truncate">{row.message}</div>
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
          processed: 'bg-blue-100 text-blue-800',
          sent: 'bg-purple-100 text-purple-800'
        }
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${(statusColors[row.status as keyof typeof statusColors]) || 'bg-gray-100 text-gray-800'}`}>
            {row.status}
          </span>
        )
      }
    },
    { 
      key: 'createdAt', 
      label: 'Created',
      render: (value: any, row: any) => (
        <div className="text-sm text-gray-500">
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
            className="btn btn-primary btn-sm"
            title="View Details"
          >
            <Eye className="h-3 w-3" />
          </button>
          
          <button 
            onClick={() => remove(row._id)} 
            className="btn btn-primary btn-sm text-red-600"
            disabled={processingItems.has(row._id)}
          >
            {processingItems.has(row._id) ? (
              <>
                <LoadingSpinner size="sm" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3 w-3 mr-1" />Delete
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

  const approve = async (id: string) => {
    try {
      setProcessingItems(prev => new Set([...prev, id]))
      const defaultMsg = 'Your feedback has been reviewed and approved.'
      const msg = window.prompt('Enter processed feedback to save/share:', defaultMsg) || defaultMsg
      await adminApi.processFeedback(id, { action: 'approve', processedFeedback: msg })
      toast.success('Feedback approved')
      fetchData()
    } catch (e) { 
      toast.error('Approve failed') 
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
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

  const remove = async (id: string) => {
    if (!confirm('Delete this feedback?')) return
    try {
      setProcessingItems(prev => new Set([...prev, id]))
      await adminApi.deleteFeedback(id)
      toast.success('Deleted')
      fetchData()
    } catch (e) { 
      toast.error('Delete failed') 
    } finally {
      setProcessingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
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

  const bulk = async (action: 'approve' | 'reject') => {
    if (selected.length === 0) return toast.error('Select at least one')
    try {
      let payload: any = { feedbackIds: selected, action }
      if (action === 'approve') {
        const defaultMsg = 'Your feedback has been reviewed and approved.'
        const msg = window.prompt('Enter processed feedback to send with approvals:', defaultMsg) || defaultMsg
        payload.processedFeedback = msg
      }
      await adminApi.bulkProcessFeedback(payload)
      toast.success(`Bulk ${action} complete`)
      setSelected([])
      fetchData()
    } catch (e) { toast.error('Bulk action failed') }
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

      {/* Filters */}
      <div className="glass-card">
        <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-4 w-full">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <label className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>Search:</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && (setPage(1), fetchData())} 
                  placeholder="Search by sender or receiver name/email..." 
                  className="input pl-9 pr-3 py-2 w-95.25" 
                  style={{width: '381px'}}
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <label className="text-sm font-medium" style={{color: 'var(--text-primary)'}}>Status:</label>
              <select 
                value={status} 
                onChange={e => { setStatus(e.target.value as any); setPage(1) }} 
                className="select px-3 py-2"
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
          
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
              </span>
            )}
            <button
              onClick={handleClearAllFilters}
              disabled={activeFiltersCount === 0}
              className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                activeFiltersCount > 0
                  ? 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                  : 'border-gray-300 text-gray-400 bg-gray-50 cursor-not-allowed'
              }`}
            >
              <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear All Filters
            </button>
          </div>
        </div>
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
    </div>
  )
}

export default Feedback


