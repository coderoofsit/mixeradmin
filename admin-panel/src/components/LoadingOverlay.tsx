import React from 'react'
import LoadingSpinner from './LoadingSpinner'

interface LoadingOverlayProps {
  isVisible: boolean
  className?: string
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  className = '' 
}) => {
  if (!isVisible) return null

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] ${className}`}>
      <LoadingSpinner size="md" />
    </div>
  )
}

export default LoadingOverlay
