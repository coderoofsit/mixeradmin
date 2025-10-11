import { CreditCard, Calendar, Smartphone, CheckCircle, XCircle, Clock } from 'lucide-react'
import { formatUTCDateTime } from '../../utils/dateUtils'

interface Purchase {
  _id: string
  userId: string
  platform: string
  planName: string
  productId: string
  purchaseToken: string
  status: string
  purchaseDate: string
  expiryDate?: string | null
  rawReceipt: string
  createdAt: string
  updatedAt: string
}

interface PurchaseHistoryCardProps {
  purchases: {
    total: number
    recent: Purchase[]
  }
}

export default function PurchaseHistoryCard({ purchases }: PurchaseHistoryCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'apple':
      case 'ios':
        return <Smartphone className="h-4 w-4 text-gray-600" />
      case 'google':
      case 'android':
        return <Smartphone className="h-4 w-4 text-green-600" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />
    }
  }

  const formatPlanName = (planName: string) => {
    return planName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  if (!purchases || (!purchases.recent || purchases.recent.length === 0)) {
    return (
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
          <CreditCard className="h-5 w-5 mr-2 text-var(--primary)" />
          Purchase History
        </h3>
        <div className="text-center py-6">
          <CreditCard className="h-12 w-12 text-var(--text-muted) mx-auto mb-2" />
          <p className="text-var(--text-muted)">No purchases found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-4">
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
        <CreditCard className="h-5 w-5 mr-2 text-var(--primary)" />
        Purchase History
        <span className="ml-2 badge badge-secondary">{purchases.recent.length}</span>
      </h3>
      
      <div className="space-y-3">
        {purchases.recent.map((purchase) => (
          <div key={purchase._id} className="border border-var(--border) rounded-lg p-3 hover:bg-var(--bg-tertiary) transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                {getPlatformIcon(purchase.platform)}
                <div>
                  <h4 className="font-medium text-var(--text-primary)">
                    {formatPlanName(purchase.planName)}
                  </h4>
                  <p className="text-sm text-var(--text-muted)">
                    {purchase.productId}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(purchase.status)}
                <span className={`badge ${
                  purchase.status === 'active' ? 'badge-success' :
                  purchase.status === 'expired' ? 'badge-danger' :
                  'badge-warning'
                }`}>
                  {purchase.status}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-3 w-3 text-var(--text-muted)" />
                <span className="text-var(--text-muted)">Purchased:</span>
                <span className="text-var(--text-primary) font-medium">
                  {formatUTCDateTime(purchase.purchaseDate)}
                </span>
              </div>
              
              {purchase.expiryDate && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3 w-3 text-var(--text-muted)" />
                  <span className="text-var(--text-muted)">Expires:</span>
                  <span className="text-var(--text-primary) font-medium">
                    {formatUTCDateTime(purchase.expiryDate)}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-2 pt-2 border-t border-var(--border)">
              <div className="flex items-center justify-between text-xs text-var(--text-muted)">
                <span>Platform: {purchase.platform}</span>
                <span>ID: {purchase._id.slice(-8)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
