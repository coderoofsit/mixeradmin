import { Users } from 'lucide-react'

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
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-4 flex items-center">
        <Users className="h-5 w-5 mr-2 text-var(--accent)" />
        About & Interests
      </h3>
      <div className="space-y-4">
        {user.aboutMe && (
          <div>
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">About Me</label>
            <p className="text-var(--text-primary) mt-1">{user.aboutMe}</p>
          </div>
        )}
        {user.lookingFor && (
          <div>
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Looking For</label>
            <p className="text-var(--text-primary) mt-1">{user.lookingFor}</p>
          </div>
        )}
        {user.thingsILike && user.thingsILike.length > 0 && (
          <div>
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Things I Like</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.thingsILike.map((item, index) => (
                <span key={index} className="badge badge-secondary">{item}</span>
              ))}
            </div>
          </div>
        )}
        {user.values && user.values.length > 0 && (
          <div>
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Values</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.values.map((value, index) => (
                <span key={index} className="badge badge-primary">{value}</span>
              ))}
            </div>
          </div>
        )}
        {user.interestedIn && user.interestedIn.length > 0 && (
          <div>
            <label className="text-xs font-medium text-var(--text-muted) uppercase tracking-wide">Interested In</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {user.interestedIn.map((interest, index) => (
                <span key={index} className="badge badge-success">{interest}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
