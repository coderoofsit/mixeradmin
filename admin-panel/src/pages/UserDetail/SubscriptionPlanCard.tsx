import { Crown, CreditCard, AlertCircle } from 'lucide-react'
import { formatUTCDateOnly, isDateExpired } from '../../utils/dateUtils'

interface SubscriptionPlanCardProps {
  user: {
    adminData: {
      purchases: {
        total: number
        recent: Array<{
          planName: string
          purchaseDate: string
          expiryDate?: string | null
          status: string
        }>
      }
    }
  }
  actionLoading: {
    markPlanAsPaid?: boolean
  }
  onMarkPlanAsPaid: () => void
}

export default function SubscriptionPlanCard({ user, actionLoading, onMarkPlanAsPaid }: SubscriptionPlanCardProps) {
  // Calculate purchase date based on plan type and expiry date
  const calculatePurchaseDate = (planName: string, expiryDate: string): string => {
    const expiry = new Date(expiryDate)
    let durationInDays = 0
    
    // Define plan durations in days
    switch (planName) {
      case 'Basic':
        durationInDays = 30 // 1 month
        break
      case 'Upgrade':
        durationInDays = 30 // 1 month
        break
      case 'Quarterly':
        durationInDays = 90 // 3 months
        break
      default:
        durationInDays = 30 // Default to 1 month
    }
    
    // Calculate purchase date by subtracting duration from expiry date
    const purchaseDate = new Date(expiry)
    purchaseDate.setDate(purchaseDate.getDate() - durationInDays)
    
    return purchaseDate.toISOString()
  }

  // Get the most recent active subscription plan
  const activePlan = user.adminData.purchases.recent.find(purchase => 
    purchase.expiryDate && new Date(purchase.expiryDate) > new Date()
  )

  return (
    <div>
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-4 flex items-center">
        <Crown className="h-5 w-5 mr-2 text-var(--warning)" />
        Subscription Plan
      </h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Crown className="h-5 w-5 text-var(--text-muted)" />
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-var(--text-primary)">Current Plan:</p>
              <span className={`badge ${activePlan ? 'badge-primary' : 'badge-secondary'}`}>
                {activePlan?.planName || 'No Plan'}
              </span>
            </div>
          </div>
          {!activePlan && (
            <button
              onClick={onMarkPlanAsPaid}
              className="btn btn-success btn-sm w-28 whitespace-nowrap"
              disabled={actionLoading.markPlanAsPaid}
              title="Admin can mark this user's subscription plan as paid without requiring user payment"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Mark as Paid
            </button>
          )}
        </div>

        {activePlan && (
          <div className="bg-var(--bg-tertiary) p-3 rounded-lg">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-var(--text-muted)">Purchased at:</p>
                <p className="text-sm font-medium text-var(--text-primary)">
                  {formatUTCDateOnly(activePlan.purchaseDate)}
                </p>
              </div>
              {activePlan.expiryDate && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-var(--text-muted)">Expires at:</p>
                  <div className="flex items-center space-x-2">
                    <p className="text-sm font-medium text-var(--text-primary)">
                      {formatUTCDateOnly(activePlan.expiryDate)} 
                    </p>
                    {!isDateExpired(activePlan.expiryDate) ? (
                      <span className="text-xs text-var(--success) font-medium">Active</span>
                    ) : (
                      <span className="text-xs text-var(--error) font-medium">Expired</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {!activePlan && (
          <div className="glass-card p-3 border-l-4 border-var(--warning)">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-var(--warning) mr-2" />
              <p className="text-sm text-var(--text-primary)">
                User has no active subscription plan.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
