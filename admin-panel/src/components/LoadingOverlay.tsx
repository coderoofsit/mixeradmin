import React from 'react'
import LoadingSpinner from './LoadingSpinner'

interface LoadingOverlayProps {
  isVisible: boolean
  className?: string
  message?: string
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  className = '',
  message
}) => {
  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] ${className}`}>
      <div className="flex flex-col items-center space-y-4">
        <LoadingSpinner size="md" />
        {message && (
          <p className="text-white text-lg font-medium text-center max-w-sm">
            {message}
          </p>
        )}
      </div>
    </div>
  )
}

export default LoadingOverlay
