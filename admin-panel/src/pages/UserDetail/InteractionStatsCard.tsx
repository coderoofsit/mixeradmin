import { Heart, ThumbsDown, Users, Shield, Flag, TrendingUp } from 'lucide-react'

interface InteractionStats {
  likes: {
    given: { total: number; recent: any[] }
    received: { total: number; recent: any[] }
  }
  dislikes: {
    given: { total: number; recent: any[] }
    received: { total: number; recent: any[] }
  }
  matches: {
    total: number
    recent: any[]
  }
  blocks: {
    given: { total: number; recent: any[] }
    received: { total: number; recent: any[] }
  }
  reports: {
    given: { total: number; recent: any[] }
    received: { total: number; recent: any[] }
  }
}

interface InteractionStatsCardProps {
  interactions: InteractionStats
}

export default function InteractionStatsCard({ interactions }: InteractionStatsCardProps) {
  const totalInteractions = 
    interactions.likes.given.total + 
    interactions.likes.received.total +
    interactions.dislikes.given.total + 
    interactions.dislikes.received.total +
    interactions.matches.total +
    interactions.blocks.given.total + 
    interactions.blocks.received.total +
    interactions.reports.given.total + 
    interactions.reports.received.total

  const stats = [
    {
      label: 'Likes Given',
      value: interactions.likes.given.total,
      icon: Heart,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    },
    {
      label: 'Likes Received',
      value: interactions.likes.received.total,
      icon: Heart,
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    {
      label: 'Matches',
      value: interactions.matches.total,
      icon: Users,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    {
      label: 'Dislikes Given',
      value: interactions.dislikes.given.total,
      icon: ThumbsDown,
      color: 'text-gray-500',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200'
    },
    {
      label: 'Blocks Given',
      value: interactions.blocks.given.total,
      icon: Shield,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
    {
      label: 'Reports Given',
      value: interactions.reports.given.total,
      icon: Flag,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200'
    }
  ]

  if (totalInteractions === 0) {
    return (
      <div className="glass-card p-4">
        <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-var(--primary)" />
          Interaction Statistics
        </h3>
        <div className="text-center py-6">
          <TrendingUp className="h-12 w-12 text-var(--text-muted) mx-auto mb-2" />
          <p className="text-var(--text-muted)">No interactions yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-4">
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
        <TrendingUp className="h-5 w-5 mr-2 text-var(--primary)" />
        Interaction Statistics
        <span className="ml-2 badge badge-secondary">{totalInteractions}</span>
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {stats.map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${stat.borderColor} ${stat.bgColor} hover:shadow-sm transition-shadow`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <IconComponent className={`h-4 w-4 ${stat.color}`} />
                <span className="text-sm font-medium text-var(--text-primary)">
                  {stat.value}
                </span>
              </div>
              <p className="text-xs text-var(--text-muted) leading-tight">
                {stat.label}
              </p>
            </div>
          )
        })}
      </div>
      
      {/* Additional Stats */}
      <div className="mt-4 pt-3 border-t border-var(--border)">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-var(--text-muted)">Blocks Received:</span>
            <span className="ml-2 font-medium text-var(--text-primary)">
              {interactions.blocks.received.total}
            </span>
          </div>
          <div>
            <span className="text-var(--text-muted)">Reports Received:</span>
            <span className="ml-2 font-medium text-var(--text-primary)">
              {interactions.reports.received.total}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
