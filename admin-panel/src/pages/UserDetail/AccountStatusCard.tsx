import { Shield, CheckCircle, Clock, User, Calendar, MapPin } from 'lucide-react'
import { formatUTCDateTime } from '../../utils/dateUtils'

interface AccountStatusCardProps {
  user: {
    email: string
    emailVerified: boolean
    location: {
      city: string
      state: string
    }
    timestamps: {
      lastActive: string
      createdAt: string
    }
  }
  accountDetails: {
    accountStatus: 'active' | 'suspended' | 'banned'
    isActive: boolean
    isVerified: boolean
    profileCompletion: number
  }
}

export default function AccountStatusCard({ user, accountDetails }: AccountStatusCardProps) {
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'badge-success'
      case 'suspended':
        return 'badge-warning'
      case 'banned':
        return 'badge-danger'
      default:
        return 'badge-secondary'
    }
  }


  return (
    <div>
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
        <Shield className="h-5 w-5 mr-2 text-var(--primary)" />
        Account Status
      </h3>
      
      <div className="space-y-4">
        {/* Two Column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* Left Column */}
          <div className="flex flex-col flex-1 justify-evenly">
            {/* Profile Completion */}
            <div className="p-3 bg-var(--bg-tertiary) rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-var(--text-primary)">Profile Completion</span>
                <span className="text-sm font-bold text-blue-600">{accountDetails.profileCompletion}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ 
                    width: `${Math.max(accountDetails.profileCompletion || 0, 0)}%`,
                    minWidth: accountDetails.profileCompletion > 0 ? '4px' : '0px'
                  }}
                ></div>
              </div>
            </div>

            {/* Account Status */}
            <div className="flex items-center justify-between p-3 bg-var(--bg-tertiary) rounded-lg">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-var(--text-muted)" />
                <span className="text-sm font-medium text-var(--text-primary)">Account Status</span>
              </div>
              <span className={`badge ${getStatusBadge(accountDetails.accountStatus)}`}>
                {accountDetails.accountStatus}
              </span>
            </div>

            {/* Location */}
            <div className="flex items-center space-x-2 p-3 bg-var(--bg-tertiary) rounded-lg">
              <MapPin className="h-4 w-4 text-var(--text-muted)" />
              <span className="text-sm font-medium text-var(--text-primary)">Location:</span>
              <span className="text-sm text-var(--text-muted)">{user.location.city}, {user.location.state}</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col flex-1 justify-evenly">
            {/* Email Verification */}
            <div className="flex items-center justify-between p-3 bg-var(--bg-tertiary) rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-var(--text-muted)" />
                <span className="text-sm font-medium text-var(--text-primary)">Email Verified</span>
              </div>
              <span className={`badge ${user.emailVerified ? 'badge-success' : 'badge-warning'}`}>
                {user.emailVerified ? 'Verified' : 'Pending'}
              </span>
            </div>

            {/* Last Active */}
            <div className="flex items-center justify-between p-3 bg-var(--bg-tertiary) rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-var(--text-muted)" />
                <span className="text-sm font-medium text-var(--text-primary)">Last Active</span>
              </div>
              <span className="text-sm text-var(--text-primary) font-medium">
                {formatUTCDateTime(user.timestamps.lastActive)}
              </span>
            </div>

            {/* Member Since */}
            <div className="flex items-center justify-between p-3 bg-var(--bg-tertiary) rounded-lg">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-var(--text-muted)" />
                <span className="text-sm font-medium text-var(--text-primary)">Member Since</span>
              </div>
              <span className="text-sm text-var(--text-primary) font-medium">
                {formatUTCDateTime(user.timestamps.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
