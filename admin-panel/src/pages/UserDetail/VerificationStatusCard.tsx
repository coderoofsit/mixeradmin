// import { Shield, CheckCircle, CreditCard, Clock, XCircle, FileSearch, AlertCircle } from 'lucide-react'
// import { formatUTCDateOnly } from '../../utils/dateUtils'

// interface VerificationStatusCardProps {
//   user: {
//     backgroundVerification: 'unpaid' | 'pending' | 'approved' | 'rejected'
//     backgroundCheckPurchased?: boolean
//     backgroundCheckPurchaseDate?: string
//     backgroundCheckPurchaseId?: string
//     backgroundVerificationNotes?: string
//   }
//   actionLoading: {
//     backgroundVerification?: boolean
//     markAsPaid?: boolean
//   }
//   backgroundCheckResults: any
//   onBackgroundVerification: (status: 'unpaid' | 'pending' | 'approved' | 'rejected') => void
//   onMarkAsPaid: () => void
//   onViewBackgroundChecks: () => void
// }

// export default function VerificationStatusCard({
//   user,
//   actionLoading,
//   backgroundCheckResults,
//   onBackgroundVerification,
//   onMarkAsPaid,
//   onViewBackgroundChecks
// }: VerificationStatusCardProps) {
//   const getVerificationBadgeClass = (status: string) => {
//     switch (status) {
//       case 'approved':
//         return 'badge-success'
//       case 'rejected':
//         return 'badge-danger'
//       case 'pending':
//         return 'badge-warning'
//       default:
//         return 'badge-secondary'
//     }
//   }

//   return (
//     <div className="glass-card p-4">
//       <h3 className="text-lg font-semibold text-var(--text-primary) mb-4 flex items-center">
//         <Shield className="h-5 w-5 mr-2 text-var(--primary)" />
//         Verification Status
//       </h3>
//       <div className="space-y-3">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <CheckCircle className="h-5 w-5 text-var(--text-muted)" />
//             <div>
//               <p className="text-sm font-medium text-var(--text-primary)">Background Check</p>
//               <span className={`badge ${getVerificationBadgeClass(user.backgroundVerification)}`}>
//                 {user.backgroundVerification}
//               </span>
//             </div>
//           </div>
//           {/* Background Check Action Buttons */}
//           <div className="flex items-center space-x-2">
//             {user.backgroundVerification === 'pending' && (
//               <>
//                 <button
//                   onClick={() => onBackgroundVerification('approved')}
//                   className="btn btn-success btn-sm"
//                   disabled={!user.backgroundCheckPurchased || actionLoading.backgroundVerification}
//                   title="Approve background check"
//                 >
//                   <CheckCircle className="h-4 w-4 mr-1" />
//                   Approve
//                 </button>
//                 <button
//                   onClick={() => onBackgroundVerification('rejected')}
//                   className="btn btn-danger btn-sm"
//                   disabled={!user.backgroundCheckPurchased || actionLoading.backgroundVerification}
//                   title="Reject background check"
//                 >
//                   <XCircle className="h-4 w-4 mr-1" />
//                   Reject
//                 </button>
//               </>
//             )}
//             {(user.backgroundVerification === 'approved' || user.backgroundVerification === 'rejected') && (
//               <button
//                 onClick={() => onBackgroundVerification('pending')}
//                 className="btn btn-warning btn-sm"
//                 disabled={actionLoading.backgroundVerification}
//                 title="Reset to pending"
//               >
//                 <Clock className="h-4 w-4 mr-1" />
//                 Reset
//               </button>
//             )}
//           </div>
//         </div>

//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <CreditCard className="h-5 w-5 text-var(--text-muted)" />
//             <div>
//               <p className="text-sm font-medium text-var(--text-primary)">Purchase Status</p>
//               <span className={`badge ${user.backgroundCheckPurchased ? 'badge-success' : 'badge-danger'}`}>
//                 {user.backgroundCheckPurchased ? 'Purchased' : 'Not Purchased'}
//               </span>
//             </div>
//           </div>
//           {/* Purchase Action Button */}
//           {user.backgroundVerification === 'unpaid' && (
//             <button
//               onClick={onMarkAsPaid}
//               className="btn btn-success btn-sm"
//               disabled={user.backgroundCheckPurchased || actionLoading.markAsPaid}
//               title="Admin can mark this user's background verification as paid without requiring user payment"
//             >
//               <CreditCard className="h-4 w-4 mr-2" />
//               Mark as Paid
//             </button>
//           )}
//         </div>

//         {user.backgroundCheckPurchased && user.backgroundCheckPurchaseDate && (
//           <div className="bg-var(--bg-tertiary) p-3 rounded-lg">
//             <p className="text-xs text-var(--text-muted)">Purchased: {formatUTCDateOnly(user.backgroundCheckPurchaseDate)}</p>
//             {user.backgroundCheckPurchaseId && user.backgroundCheckPurchaseId.includes('admin_') && (
//               <p className="text-xs text-var(--primary) font-medium mt-1">💳 Paid by Admin</p>
//             )}
//           </div>
//         )}

//         {user.backgroundVerificationNotes && (
//           <div className="bg-var(--bg-tertiary) p-3 rounded-lg">
//             <p className="text-sm text-var(--text-primary)">{user.backgroundVerificationNotes}</p>
//             <p className="text-xs text-var(--text-muted) mt-1">Verification Notes</p>
//           </div>
//         )}

//         {!user.backgroundCheckPurchased && user.backgroundVerification !== 'unpaid' && (
//           <div className="glass-card p-3 border-l-4 border-var(--warning)">
//             <div className="flex items-center">
//               <AlertCircle className="h-4 w-4 text-var(--warning) mr-2" />
//               <p className="text-sm text-var(--text-primary)">
//                 User has not purchased background check. Verification is blocked.
//               </p>
//             </div>
//           </div>
//         )}

//         {/* View Background Checks Button */}
//         <div className="flex justify-center">
//           <button
//             onClick={onViewBackgroundChecks}
//             className="btn btn-primary btn-sm"
//             disabled={!backgroundCheckResults || backgroundCheckResults.length === 0}
//           >
//             <FileSearch className="h-4 w-4 mr-2" />
//             View Background Checks
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

import { Shield, CheckCircle, CreditCard, Clock, XCircle, FileSearch, AlertCircle, Search } from 'lucide-react'
import { formatUTCDateOnly } from '../../utils/dateUtils'

interface VerificationStatusCardProps {
  user: {
    id: string
    accountStatus: {
      backgroundVerification: 'unpaid' | 'pending' | 'approved' | 'rejected'
    }
    adminData: {
      purchases: {
        total: number
        recent: Array<{
          _id: string
          planName: string
          purchaseDate: string
          status: string
        }>
      }
    }
  }
  actionLoading: {
    backgroundVerification?: boolean
    markAsPaid?: boolean
    manualVerify?: boolean
  }
  backgroundCheckResults: any
  onBackgroundVerification: (status: 'unpaid' | 'pending' | 'approved' | 'rejected') => void
  onMarkAsPaid: () => void
  onViewBackgroundChecks: () => void
  onManualVerify: () => void
}

export default function VerificationStatusCard({
  user,
  actionLoading,
  backgroundCheckResults,
  onBackgroundVerification,
  onMarkAsPaid,
  onViewBackgroundChecks,
  onManualVerify
}: VerificationStatusCardProps) {
  const getVerificationBadgeClass = (status: string) => {
    switch (status) {
      case 'approved':
        return 'badge-success'
      case 'rejected':
        return 'badge-danger'
      case 'pending':
        return 'badge-warning'
      default:
        return 'badge-secondary'
    }
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-4 flex items-center">
        <Shield className="h-5 w-5 mr-2 text-var(--primary)" />
        Verification Status
      </h3>
      <div className="space-y-4">
        {/* Background Check Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-var(--text-muted)" />
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-var(--text-primary)">Background Check:</p>
              <span className={`badge ${getVerificationBadgeClass(user.accountStatus.backgroundVerification)}`}>
                {user.accountStatus.backgroundVerification}
              </span>
            </div>
          </div>
          {/* Background Check Action Buttons */}
          <div className="flex items-center space-x-2">
            {user.accountStatus.backgroundVerification === 'pending' && (
              <>
                <button
                  onClick={() => onBackgroundVerification('approved')}
                  className="btn btn-success btn-sm w-20"
                  disabled={actionLoading.backgroundVerification}
                  title="Approve background check"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => onBackgroundVerification('rejected')}
                  className="btn btn-danger btn-sm w-20"
                  disabled={actionLoading.backgroundVerification}
                  title="Reject background check"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </button>
              </>
            )}
            {(user.accountStatus.backgroundVerification === 'approved' || user.accountStatus.backgroundVerification === 'rejected') && (
              <button
                onClick={() => onBackgroundVerification('pending')}
                className="btn btn-warning btn-sm w-20 hover-lift"
                disabled={actionLoading.backgroundVerification}
                title="Reset to pending"
              >
                <Clock className="h-4 w-4 mr-1" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Purchase Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CreditCard className="h-5 w-5 text-var(--text-muted)" />
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-var(--text-primary)">Purchase Status:</p>
              <span className={`badge ${user.accountStatus.backgroundVerification !== 'unpaid' ? 'badge-success' : 'badge-danger'}`}>
                {user.accountStatus.backgroundVerification !== 'unpaid' ? 'Paid' : 'Not Purchased'}
              </span>
            </div>
          </div>
          {/* Purchase Action Button */}
          {user.accountStatus.backgroundVerification === 'unpaid' && (
            <button
              onClick={onMarkAsPaid}
              className="btn btn-success btn-sm w-28 whitespace-nowrap"
              disabled={user.adminData.purchases.total > 0 || actionLoading.markAsPaid}
              title="Admin can mark this user's background verification as paid without requiring user payment"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Mark as Paid
            </button>
          )}
        </div>

        {/* Purchase Details */}
        {/* {user.accountStatus.backgroundVerification !== 'unpaid' && (
          <div className="bg-var(--bg-tertiary) p-3 rounded-lg">
            {user.adminData.purchases.total > 0 && user.adminData.purchases.recent.length > 0 ? (
              <>
                <p className="text-xs text-var(--text-muted)">Purchased: {formatUTCDateOnly(user.adminData.purchases.recent[0].purchaseDate)}</p>
                {user.adminData.purchases.recent[0]._id.includes('admin_') && (
                  <p className="text-xs text-var(--primary) font-medium mt-1">💳 Paid by Admin</p>
                )}
              </>
            ) : (
              <p className="text-xs text-var(--text-muted)">Background check has been paid for</p>
            )}
          </div>
        )} */}

        {/* Warning: Purchase Required */}
        {/* {user.accountStatus.backgroundVerification === 'unpaid' && user.adminData.purchases.total === 0 && (
          <div className="glass-card p-3 border-l-4 border-var(--warning)">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-var(--warning) mr-2" />
              <p className="text-sm text-var(--text-primary)">
                User has not purchased background check. Verification is blocked.
              </p>
            </div>
          </div>
        )} */}

        {/* Manual Verify */}
        {/* <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Search className="h-5 w-5 text-var(--text-muted)" />
            <p className="text-sm font-medium text-var(--text-primary)">Manual Verification:</p>
          </div>
          <button
            onClick={onManualVerify}
            className="btn btn-secondary btn-sm w-24"
            disabled={actionLoading.manualVerify}
          >
            <Search className="h-4 w-4 mr-2" />
            {actionLoading.manualVerify ? 'Fetching...' : 'Verify'}
          </button>
        </div> */}
      </div>
    </div>
  )
}