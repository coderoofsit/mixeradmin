import { Settings, Ban, CheckCircle, Trash2 } from 'lucide-react'

interface AccountActionsCardProps {
  user: {
    accountStatus: {
      accountStatus: 'active' | 'suspended' | 'banned'
    }
  }
  actionLoading: {
    suspend?: boolean
    reactivate?: boolean
    ban?: boolean
    delete?: boolean
  }
  onSuspend: () => void
  onReactivate: () => void
  onBan: () => void
  onDelete: () => void
}

export default function AccountActionsCard({
  user,
  actionLoading,
  onSuspend,
  onReactivate,
  onBan,
  onDelete
}: AccountActionsCardProps) {
  return (
    <div className="relative z-10">
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-4 flex items-center">
        <Settings className="h-5 w-5 mr-2 text-var(--accent)" />
        Account Actions
      </h3>
      <div className="space-y-4">
        {/* Account Status Management */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Settings className="h-5 w-5 text-var(--text-muted)" />
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-var(--text-primary)">Account Status:</p>
              <span className={`badge ${user.accountStatus.accountStatus === 'active' ? 'badge-success' : 'badge-warning'}`}>
                {user.accountStatus.accountStatus}
              </span>
            </div>
          </div>
          
          {/* Account Status Action Buttons */}
          <div className="flex items-center space-x-2">
            {user.accountStatus.accountStatus === 'active' ? (
              <button
                onClick={() => {
                  console.log('🔘 Suspend button clicked in AccountActionsCard')
                  onSuspend()
                }}
                disabled={actionLoading.suspend}
                className="btn btn-warning btn-sm w-24"
              >
                <Ban className="h-4 w-4 mr-2" />
                {actionLoading.suspend ? 'Suspending...' : 'Suspend'}
              </button>
            ) : user.accountStatus.accountStatus === 'suspended' ? (
              <button
                onClick={() => {
                  console.log('🔘 Reactivate button clicked in AccountActionsCard')
                  onReactivate()
                }}
                disabled={actionLoading.reactivate}
                className="btn btn-success btn-sm w-24"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {actionLoading.reactivate ? 'Reactivating...' : 'Reactivate'}
              </button>
            ) : null}
            
            {/* Only show Ban button if user is not already banned */}
            {user.accountStatus.accountStatus !== 'banned' && (
              <button
                onClick={() => {
                  console.log('🔘 Ban button clicked in AccountActionsCard')
                  onBan()
                }}
                disabled={actionLoading.ban}
                className="btn btn-danger btn-sm w-20"
              >
                <Ban className="h-4 w-4 mr-2" />
                {actionLoading.ban ? 'Banning...' : 'Ban'}
              </button>
            )}
            
            <button
              onClick={onDelete}
              disabled={actionLoading.delete}
              className="btn btn-danger btn-sm w-20"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {actionLoading.delete ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
