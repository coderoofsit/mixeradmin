import { Users } from 'lucide-react'
import { mapInterestedInForDisplay } from '../../utils/genderUtils'

interface AboutInterestsCardProps {
  user: {
    aboutMe?: string
    lookingFor?: string
    thingsILike?: string[]
    values?: string[]
    interestedIn?: string[]
  }
}

export default function AboutInterestsCard({ user }: AboutInterestsCardProps) {
  const hasContent = user.aboutMe || user.lookingFor || 
    (user.thingsILike && user.thingsILike.length > 0) || 
    (user.values && user.values.length > 0) || 
    (user.interestedIn && user.interestedIn.length > 0)

  if (!hasContent) return null

  return (
    <div className="glass-card p-4">
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
        <Users className="h-5 w-5 mr-2 text-var(--accent)" />
        About & Interests
      </h3>
      <div className="space-y-2">
        {user.aboutMe && (
            <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">About Me:</label>
            <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.aboutMe || 'N/A'}</p>
          </div>
        )}
        {user.lookingFor && (
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Looking For:</label>
            <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.lookingFor}</p>
          </div>
        )}
        {user.thingsILike && user.thingsILike.length > 0 && (
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Things I Like:</label>
            <div className="flex flex-wrap mt-[-2px]">
              {user.thingsILike?.map((item, index) => (
                <span key={index} className="badge badge-secondary">{item}</span>
              ))}
            </div>
          </div>
        )}
        {user.values && user.values.length > 0 && (
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Values:</label>
            <div className="flex flex-wrap mt-[-2px]">
              {user?.values?.map((value, index) => (
                <span key={index} className="badge badge-primary">{value}</span>
              ))}
            </div>
          </div>
        )}
        {user.interestedIn && user.interestedIn.length > 0 && (
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Interested In:</label>
            <div className="flex flex-wrap mt-[-2px]">
              {mapInterestedInForDisplay(user?.interestedIn).map((interest, index) => (
                <span key={index} className="badge badge-success">{interest}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
