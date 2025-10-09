import { User } from 'lucide-react'
import { formatUTCDateOnly } from '../../utils/dateUtils'

interface PersonalInfoCardProps {
  user: {
    dateOfBirth?: string
    gender?: string
    pronoun?: string
    location?: {
      city?: string
      state?: string
    }
    height?: string
    ethnicity?: string
  }
}

export default function PersonalInfoCard({ user }: PersonalInfoCardProps) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-4 flex items-center">
        <User className="h-5 w-5 mr-2 text-var(--primary)" />
        Personal Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Date of Birth</label>
            <p className="text-var(--text-primary) font-medium">
              {user.dateOfBirth ? formatUTCDateOnly(user.dateOfBirth) : 'N/A'}
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Gender</label>
            <p className="text-var(--text-primary) font-medium">{user.gender || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Pronoun</label>
            <p className="text-var(--text-primary) font-medium">{user.pronoun || 'N/A'}</p>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Location</label>
            <p className="text-var(--text-primary) font-medium">
              {user.location?.city && user.location?.state ? 
                `${user.location.city}, ${user.location.state}` : 
                user.location?.city || user.location?.state || 'N/A'
              }
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Height</label>
            <p className="text-var(--text-primary) font-medium">{user.height || 'N/A'}</p>
          </div>
          <div>
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Ethnicity</label>
            <p className="text-var(--text-primary) font-medium">{user.ethnicity || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
