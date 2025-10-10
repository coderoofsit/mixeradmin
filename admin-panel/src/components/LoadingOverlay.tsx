import React from 'react'
import LoadingSpinner from './LoadingSpinner'

interface LoadingOverlayProps {
  isVisible: boolean
  text?: string
  className?: string
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  text = 'Loading...', 
  className = '' 
}) => {
  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] ${className}`}>
      <div className="bg-var(--bg-primary) rounded-lg p-6 shadow-xl border border-var(--border)">
        <div className="flex flex-col items-center space-y-3">
          <LoadingSpinner size="md" />
          {text && (
            <p className="text-sm text-var(--text-secondary) font-medium">{text}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoadingOverlay
