import { Users } from 'lucide-react'
import { mapInterestedInForDisplay } from '../../utils/genderUtils'

interface AboutInterestsCardProps {
  user: {
    profileContent: {
      aboutMe: string
      lookingFor?: string
      thingsILike: string[]
      values: string[]
    }
    personalInfo: {
      interestedIn: string[]
    }
  }
}

export default function AboutInterestsCard({ user }: AboutInterestsCardProps) {
  const hasContent = user.profileContent.aboutMe || user.profileContent.lookingFor || 
    (user.profileContent.thingsILike && user.profileContent.thingsILike.length > 0) || 
    (user.profileContent.values && user.profileContent.values.length > 0) || 
    (user.personalInfo.interestedIn && user.personalInfo.interestedIn.length > 0)

  if (!hasContent) return null

  return (
    <div className="glass-card p-4">
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
        <Users className="h-5 w-5 mr-2 text-var(--accent)" />
        About & Interests
      </h3>
      <div className="space-y-2">
        {user.profileContent.aboutMe && (
            <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">About Me:</label>
            <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.profileContent.aboutMe || 'N/A'}</p>
          </div>
        )}
        {user.profileContent.lookingFor && (
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Looking For:</label>
            <p className="text-sm text-var(--text-primary) font-medium mt-[-2px]">{user.profileContent.lookingFor}</p>
          </div>
        )}
        {user.profileContent.thingsILike && user.profileContent.thingsILike.length > 0 && (
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Things I Like:</label>
            <div className="flex flex-wrap mt-[-2px]">
              {user.profileContent.thingsILike?.map((item, index) => (
                <span key={index} className="badge badge-secondary mx-1 mb-1">{item}</span>
              ))}
            </div>
          </div>
        )}
        {user.profileContent.values && user.profileContent.values.length > 0 && (
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Values:</label>
            <div className="flex flex-wrap mt-[-2px]">
              {user.profileContent.values?.map((value, index) => (
                <span key={index} className="badge badge-primary mx-1 mb-1">{value}</span>
              ))}
            </div>
          </div>
        )}
        {user.personalInfo.interestedIn && user.personalInfo.interestedIn.length > 0 && (
          <div className="flex gap-1">
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Interested In:</label>
            <div className="flex flex-wrap mt-[-2px]">
              {mapInterestedInForDisplay(user.personalInfo.interestedIn).map((interest, index) => (
                <span key={index} className="badge badge-success mx-1 mb-1">{interest}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
