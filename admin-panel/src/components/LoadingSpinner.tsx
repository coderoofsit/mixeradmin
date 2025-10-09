import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  variant?: 'spinner' | 'dots' | 'pulse'
  text?: string
  className?: string
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  variant = 'spinner', 
  text,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="loading-dots">
            <div className={`loading-dot ${sizeClasses[size]}`}></div>
            <div className={`loading-dot ${sizeClasses[size]}`}></div>
            <div className={`loading-dot ${sizeClasses[size]}`}></div>
          </div>
        )
      case 'pulse':
        return (
          <div className={`animate-pulse-slow bg-primary-600 rounded-full ${sizeClasses[size]}`}></div>
        )
      default:
        return (
          <div className={`loading-spinner ${sizeClasses[size]}`}></div>
        )
    }
  }

  return (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {renderSpinner()}
      {text && (
        <p className="text-sm text-gray-500 animate-pulse">{text}</p>
      )}
    </div>
  )
}

export default LoadingSpinner 