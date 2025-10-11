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
    <div className="glass-card p-4 relative z-10">
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-4 flex items-center">
        <Settings className="h-5 w-5 mr-2 text-var(--accent)" />
        Account Actions
      </h3>
      <div className="space-y-3">
        {user.accountStatus.accountStatus === 'active' ? (
          <button
            onClick={onSuspend}
            disabled={actionLoading.suspend}
            className="btn btn-warning w-full"
          >
            <Ban className="h-4 w-4 mr-2" />
            {actionLoading.suspend ? 'Suspending...' : 'Suspend User'}
          </button>
        ) : (
          <button
            onClick={onReactivate}
            disabled={actionLoading.reactivate}
            className="btn btn-success w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {actionLoading.reactivate ? 'Reactivating...' : 'Reactivate User'}
          </button>
        )}

        <button
          onClick={onBan}
          disabled={actionLoading.ban}
          className="btn btn-danger w-full"
        >
          <Ban className="h-4 w-4 mr-2" />
          {actionLoading.ban ? 'Banning...' : 'Ban User'}
        </button>

        <button
          onClick={onDelete}
          disabled={actionLoading.delete}
          className="btn btn-danger w-full"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          {actionLoading.delete ? 'Deleting...' : 'Delete User'}
        </button>
      </div>
    </div>
  )
}
