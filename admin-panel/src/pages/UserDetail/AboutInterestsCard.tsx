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
    <div>
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
        <Users className="h-5 w-5 mr-2 text-var(--accent)" />
        About & Interests
      </h3>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Text Content */}
        <div className="space-y-4">
          {user.profileContent.aboutMe && (
            <div>
              <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide block mb-2">About Me</label>
              <p className="text-sm text-var(--text-primary) leading-relaxed">{user.profileContent.aboutMe}</p>
            </div>
          )}
          {user.profileContent.lookingFor && (
            <div>
              <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide block mb-2">Looking For</label>
              <p className="text-sm text-var(--text-primary) leading-relaxed">{user.profileContent.lookingFor}</p>
            </div>
          )}
        </div>
        
        {/* Right Column - Tags and Interests */}
        <div className="space-y-4">
          {user.profileContent.thingsILike && user.profileContent.thingsILike.length > 0 && (
            <div>
              <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide block mb-2">Things I Like</label>
              <div className="flex flex-wrap gap-2">
                {user.profileContent.thingsILike?.map((item, index) => (
                  <span key={index} className="badge badge-secondary">{item}</span>
                ))}
              </div>
            </div>
          )}
          {user.profileContent.values && user.profileContent.values.length > 0 && (
            <div>
              <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide block mb-2">Values</label>
              <div className="flex flex-wrap gap-2">
                {user.profileContent.values?.map((value, index) => (
                  <span key={index} className="badge badge-primary">{value}</span>
                ))}
              </div>
            </div>
          )}
          {user.personalInfo.interestedIn && user.personalInfo.interestedIn.length > 0 && (
            <div>
              <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide block mb-2">Interested In</label>
              <div className="flex flex-wrap gap-2">
                {mapInterestedInForDisplay(user.personalInfo.interestedIn).map((interest, index) => (
                  <span key={index} className="badge badge-success">{interest}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
