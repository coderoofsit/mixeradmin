import { Heart, Users, Shield, Flag } from 'lucide-react'

interface SocialActivityCardProps {
  socialActivity: {
    likesGiven: number
    likesReceived: number
    totalMatches: number
  }
  moderation: {
    reports: {
      given: { total: number; recent: any[] }
      received: { total: number; recent: any[] }
    }
    blocks: {
      given: { total: number; recent: any[] }
      received: { total: number; recent: any[] }
    }
  }
}

export default function SocialActivityCard({ socialActivity, moderation }: SocialActivityCardProps) {
  const totalActivity = socialActivity.likesGiven + socialActivity.likesReceived + socialActivity.totalMatches

  if (totalActivity === 0 && moderation.reports.given.total === 0 && moderation.blocks.given.total === 0) {
    return (
      <div>
        <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
          <Heart className="h-5 w-5 mr-2 text-var(--primary)" />
          Social Activity
        </h3>
        <div className="text-center py-6">
          <Heart className="h-12 w-12 text-var(--text-muted) mx-auto mb-2" />
          <p className="text-var(--text-muted)">No social activity yet</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
        <Heart className="h-5 w-5 mr-2 text-var(--primary)" />
        Social Activity
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <Heart className="h-6 w-6 text-red-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-red-600">{socialActivity.likesGiven}</p>
          <p className="text-xs text-red-600">Likes Given</p>
        </div>
        
        <div className="text-center p-3 bg-pink-50 border border-pink-200 rounded-lg">
          <Heart className="h-6 w-6 text-pink-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-pink-600">{socialActivity.likesReceived}</p>
          <p className="text-xs text-pink-600">Likes Received</p>
        </div>
        
        <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <Users className="h-6 w-6 text-green-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-green-600">{socialActivity.totalMatches}</p>
          <p className="text-xs text-green-600">Matches</p>
        </div>
        
        <div className="text-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <Shield className="h-6 w-6 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-orange-600">{moderation.blocks.given.total}</p>
          <p className="text-xs text-orange-600">Blocks Given</p>
        </div>
      </div>
      
      {/* Moderation Summary */}
      {(moderation.reports.given.total > 0 || moderation.reports.received.total > 0 || moderation.blocks.received.total > 0) && (
        <div className="mt-4 pt-3 border-t border-var(--border)">
          <h4 className="text-sm font-medium text-var(--text-primary) mb-2">Moderation</h4>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="text-center">
              <p className="font-medium text-var(--text-primary)">{moderation.reports.given.total}</p>
              <p className="text-xs text-var(--text-muted)">Reports Given</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-var(--text-primary)">{moderation.reports.received.total}</p>
              <p className="text-xs text-var(--text-muted)">Reports Received</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-var(--text-primary)">{moderation.blocks.received.total}</p>
              <p className="text-xs text-var(--text-muted)">Blocks Received</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
