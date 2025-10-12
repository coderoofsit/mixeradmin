import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'
import { formatDate, formatPurchaseType, getStatusBadgeColor, getPlatformBadgeColor, getPlanBadgeColor } from '../utils/subscriptionUtils'
import { 
  CreditCard, 
  Search, 
  Filter,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import DataTable from '../components/DataTable'
import toast from 'react-hot-toast'

interface PurchaseHistory {
  purchaseId: string
  planName: string
  productId: string
  platform: string
  status: string
  purchaseDate: string
  expiryDate: string | null
}

interface Subscription {
  userId: string
  userName: string
  userEmail: string
  currentPlan: string | null
  planStatus: 'active' | 'expired' | 'inactive'
  planExpiry: string | null
  totalPurchases: number
  purchaseHistory: PurchaseHistory[]
}

function Subscriptions() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [limit, setLimit] = useState(20)
  
  // Filters
  const [showFilters, setShowFilters] = useState(false)
  const [filterPlanType, setFilterPlanType] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPlatform, setFilterPlatform] = useState('all')
  
  // Purchase history state
  const [fullPurchaseHistory, setFullPurchaseHistory] = useState<{ [userId: string]: PurchaseHistory[] }>({})
  const [loadingHistory, setLoadingHistory] = useState<{ [userId: string]: boolean }>({})
  const [historyLoaded, setHistoryLoaded] = useState<{ [userId: string]: boolean }>({})

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchSubscriptions()
  }, [currentPage, debouncedSearchTerm, filterPlanType, filterStatus, filterPlatform, limit])

  const fetchSubscriptions = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit,
        search: debouncedSearchTerm,
        ...(filterPlanType !== 'all' && { planType: filterPlanType }),
        ...(filterStatus !== 'all' && { status: filterStatus }),
        ...(filterPlatform !== 'all' && { platform: filterPlatform })
      }
      
      console.log('🔍 Fetching subscriptions with params:', params)
      
      const response = await adminApi.getSubscriptions(params)
      console.log('📊 Subscriptions API response:', response.data)
      
      setSubscriptions(response.data.data.subscriptions)
      setTotalPages(response.data.data.pagination.pages)
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      toast.error('Failed to fetch subscriptions')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchSubscriptions()
    toast.success('Subscriptions refreshed')
  }

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.success('Export functionality coming soon')
  }

  const loadFullPurchaseHistory = async (userId: string) => {
    if (historyLoaded[userId] || loadingHistory[userId]) return
    
    setLoadingHistory(prev => ({ ...prev, [userId]: true }))
    try {
      const response = await adminApi.getUserPurchaseHistory(userId)
      if (response.data.success) {
        setFullPurchaseHistory(prev => ({ ...prev, [userId]: response.data.data.purchases }))
        setHistoryLoaded(prev => ({ ...prev, [userId]: true }))
      }
    } catch (error) {
      console.error('Failed to load full purchase history:', error)
      toast.error('Failed to load purchase history')
    } finally {
      setLoadingHistory(prev => ({ ...prev, [userId]: false }))
    }
  }

  const renderPurchaseHistory = (row: Subscription) => {
    const isHistoryLoaded = historyLoaded[row.userId]
    const isLoadingHistory = loadingHistory[row.userId]
    const fullHistory = fullPurchaseHistory[row.userId]
    const displayHistory = isHistoryLoaded ? fullHistory : row.purchaseHistory

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-var(--text-primary)">
            Purchase History ({row.totalPurchases} purchases)
            {!isHistoryLoaded && row.totalPurchases > 50 && (
              <span className="ml-2 text-sm text-var(--text-secondary)">
                (Showing 50 most recent)
              </span>
            )}
          </h3>
          <div className="text-sm text-var(--text-secondary)">
            User: {row.userName} ({row.userEmail})
          </div>
        </div>
        
        {isLoadingHistory && (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-var(--primary)"></div>
            <span className="ml-2 text-sm text-var(--text-secondary)">Loading full history...</span>
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-var(--border)">
                <th className="text-left py-2 px-3 font-medium text-var(--text-secondary)">Plan</th>
                {/* <th className="text-left py-2 px-3 font-medium text-var(--text-secondary)">Product ID</th> */}
                <th className="text-left py-2 px-3 font-medium text-var(--text-secondary)">Platform</th>
                <th className="text-left py-2 px-3 font-medium text-var(--text-secondary)">Status</th>
                <th className="text-left py-2 px-3 font-medium text-var(--text-secondary)">Purchase Date</th>
                <th className="text-left py-2 px-3 font-medium text-var(--text-secondary)">Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {displayHistory?.map((purchase) => (
                <tr key={purchase.purchaseId} className="border-b border-var(--border)/50">
                  <td className="py-2 px-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPlanBadgeColor(purchase.productId)}`}>
                      {formatPurchaseType(purchase.productId)}
                    </span>
                  </td>
                  {/* <td className="py-2 px-3 text-var(--text-primary) font-mono text-xs">
                    {purchase.productId}
                  </td> */}
                  <td className="py-2 px-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPlatformBadgeColor(purchase.platform)}`}>
                      {purchase.platform}
                    </span>
                  </td>
                  <td className="py-2 px-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(purchase.status as any)}`}>
                      {purchase.status}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-var(--text-primary)">
                    {formatDate(purchase.purchaseDate)}
                  </td>
                  <td className="py-2 px-3 text-var(--text-primary)">
                    {formatDate(purchase.expiryDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const columns = [
    {
      key: 'userName',
      label: 'User Name',
      render: (_value: any, row: Subscription) => (
        <div>
          <div className="font-medium text-var(--text-primary)">{row.userName}</div>
          <div className="text-sm text-var(--text-secondary)">{row.userEmail}</div>
        </div>
      )
    },
    {
      key: 'currentPlan',
      label: 'Current Plan',
      render: (_value: any, row: Subscription) => (
        <div>
          {row.currentPlan ? (
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPlanBadgeColor(row.currentPlan)}`}>
              {formatPurchaseType(row.currentPlan)}
            </span>
          ) : (
            <span className="text-var(--text-muted)">No active plan</span>
          )}
        </div>
      )
    },
    {
      key: 'planStatus',
      label: 'Status',
      render: (_value: any, row: Subscription) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(row.planStatus)}`}>
          {row.planStatus}
        </span>
      )
    },
    {
      key: 'planExpiry',
      label: 'Expiry Date',
      render: (_value: any, row: Subscription) => (
        <div className="text-sm">
          {row.planExpiry ? formatDate(row.planExpiry) : 'N/A'}
        </div>
      )
    },
    {
  key: 'totalPurchases',
  label: 'Total Purchases',
  render: (_value: any, row: Subscription) => (
    <div className="flex ">
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-var(--bg-tertiary) text-var(--text-primary)">
        {row.totalPurchases}
      </span>
    </div>
  )
}

  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-primary">
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-var(--text-primary)">Subscription Management</h1>
            <p className="text-var(--text-secondary)">Manage user subscriptions and purchase history</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* <button
            onClick={handleExport}
            className="flex items-center px-4 py-2 text-sm font-medium text-var(--text-primary) bg-var(--bg-primary) border border-var(--border) rounded-lg hover:bg-var(--bg-secondary) transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button> */}
          
          <button
            onClick={handleRefresh}
            className="flex items-center px-4 py-2 text-sm font-medium text-var(--text-primary) bg-var(--bg-primary) border border-var(--border) rounded-lg hover:bg-var(--bg-secondary) transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-var(--text-secondary)" />
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) placeholder-var(--text-muted) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-sm font-medium text-var(--text-primary) bg-var(--bg-primary) border border-var(--border) rounded-lg hover:bg-var(--bg-secondary) transition-colors"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-var(--text-secondary) mb-2">
                Plan Type
              </label>
              <select
                value={filterPlanType}
                onChange={(e) => setFilterPlanType(e.target.value)}
                className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
              >
                <option value="all">All Plans</option>
                <option value="com.mixerltd.mixerltd.basic">Basic</option>
                <option value="com.mixerltd.mixerltd.upgrade">Premium</option>
                <option value="com.mixerltd.mixerltd.quarterly">Quarterly</option>
                <option value="com.mixerltd.mixerltd.background_check">Background Verify</option>
                {/* <option value="background_verify">Background Verify</option> */}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-var(--text-secondary) mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-var(--text-secondary) mb-2">
                Platform
              </label>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
              >
                <option value="all">All Platforms</option>
                <option value="apple">Apple</option>
                <option value="google">Google</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      {/* <div className="glass-card"> */}
        <DataTable
          columns={columns}
          data={subscriptions}
          loading={loading}
          searchable={true}
          expandable={true}
          expandableContent={renderPurchaseHistory}
          onRowExpand={(row) => loadFullPurchaseHistory(row.userId)}
          pagination={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage,
            limit,
            onLimitChange: setLimit
          }}
          emptyMessage="No subscriptions found"
          fullHeight={true}
        />
      {/* </div> */}
    </div>
  )
}

export default Subscriptions
