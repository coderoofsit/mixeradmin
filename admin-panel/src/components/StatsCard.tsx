import React from 'react'
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: {
    value: number
    type: 'increase' | 'decrease'
    period: string
  }
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  loading?: boolean
  className?: string
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  color = 'primary',
  loading = false,
  className = ''
}) => {
  const colorClasses = {
    primary: {
      icon: 'text-primary-600',
      bg: 'bg-primary-50',
      change: 'text-primary-600'
    },
    success: {
      icon: 'text-success-600',
      bg: 'bg-success-50',
      change: 'text-success-600'
    },
    warning: {
      icon: 'text-warning-600',
      bg: 'bg-warning-50',
      change: 'text-warning-600'
    },
    danger: {
      icon: 'text-danger-600',
      bg: 'bg-danger-50',
      change: 'text-danger-600'
    },
    info: {
      icon: 'text-blue-600',
      bg: 'bg-blue-50',
      change: 'text-blue-600'
    }
  }

  const selectedColor = colorClasses[color]

  return (
    <div className={`stats-card ${className}`}>
      <div className="stats-card-icon">
        <Icon className={`h-12 w-12 ${selectedColor.icon}`} />
      </div>
      
      <div className="stats-card-content">
        <p className="stats-card-label">{title}</p>
        
        {loading ? (
          <div className="stats-card-value">
            <div className="h-8 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <p className="stats-card-value">{value}</p>
        )}
        
        {change && (
          <div className={`stats-card-change ${
            change.type === 'increase' ? 'stats-card-change-positive' : 'stats-card-change-negative'
          }`}>
            {change.type === 'increase' ? (
              <TrendingUp className="h-4 w-4 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 mr-1" />
            )}
            <span className="font-medium">
              {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
            </span>
            <span className="ml-1">from {change.period}</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default StatsCard 