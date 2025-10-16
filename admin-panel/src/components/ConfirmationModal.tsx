import React, { useState, useEffect } from 'react'
import { X, AlertTriangle } from 'lucide-react'

interface ConfirmationModalProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  requireInput?: boolean
  inputPlaceholder?: string
  inputLabel?: string
  onConfirm: (inputValue?: string) => void
  onCancel: () => void
  loading?: boolean
  showTimer?: boolean
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'info',
  requireInput = false,
  inputPlaceholder = '',
  inputLabel = '',
  onConfirm,
  onCancel,
  loading = false,
  showTimer = false
}) => {
  const [inputValue, setInputValue] = useState('')
  const [timer, setTimer] = useState(5)
  const [timerActive, setTimerActive] = useState(false)

  // Reset input and timer when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setInputValue('')
      setTimer(showTimer ? 5 : 0)
      setTimerActive(showTimer)
    } else {
      setTimerActive(false)
    }
  }, [isOpen, showTimer])

  // Timer countdown effect
  useEffect(() => {
    let interval: number | null = null
    
    if (timerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1)
      }, 1000)
    } else if (timer === 0) {
      setTimerActive(false)
    }
    
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timer])

  const handleConfirm = () => {
    if (requireInput && !inputValue.trim()) {
      return // Don't allow confirmation without input
    }
    onConfirm(requireInput ? inputValue : undefined)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && canConfirm) {
      handleConfirm()
    }
  }

  if (!isOpen) return null

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: 'text-var(--error)',
          confirmButton: 'btn btn-danger',
          border: 'border-var(--error)'
        }
      case 'warning':
        return {
          icon: 'text-var(--warning)',
          confirmButton: 'btn btn-warning',
          border: 'border-var(--warning)'
        }
      default:
        return {
          icon: 'text-var(--primary)',
          confirmButton: 'btn btn-primary',
          border: 'border-var(--primary)'
        }
    }
  }

  const styles = getTypeStyles()
  const canConfirm = (!requireInput || inputValue.trim().length > 0) && (showTimer ? timer === 0 : true) && !loading

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className={`glass-card max-w-md w-full mx-4 border ${styles.border}`} style={{ boxShadow: 'var(--shadow-lg)' }}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-var(--border)">
          <div className="flex items-center space-x-2">
            <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />
            <h3 className="text-lg font-semibold text-var(--text-primary)">
              {title}
            </h3>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="text-var(--text-muted) hover:text-var(--text-primary) transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4">
          <p className="text-var(--text-secondary) mb-3">
            {message}
          </p>

          {requireInput && (
            <div className="space-y-1">
              {inputLabel && (
                <label className="block text-sm font-medium text-var(--text-secondary)">
                  {inputLabel}
                </label>
              )}
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={inputPlaceholder}
                className="w-full px-3 py-2 border border-var(--border) rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-var(--primary) focus:border-var(--primary) bg-var(--bg-primary) text-var(--text-primary) resize-none"
                style={{ borderRadius: 'var(--border-radius)' }}
                rows={3}
                disabled={loading}
                autoFocus
              />
              {!inputValue.trim() && (
                <p className="text-xs text-var(--text-muted)">
                  Please provide a reason to continue
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 p-4 border-t border-var(--border)">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn btn-secondary"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className={`${styles.confirmButton} ${!canConfirm ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : (showTimer && timer > 0) ? `${confirmText} (${timer}s)` : confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
