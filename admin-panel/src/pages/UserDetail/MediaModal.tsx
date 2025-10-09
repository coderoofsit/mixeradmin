import { X, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface MediaModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'image' | 'video' | 'selfie'
  url: string
  title: string
}

export default function MediaModal({ isOpen, onClose, type, url, title }: MediaModalProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (isOpen && type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [isOpen, type])

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleMuteToggle = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-75 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 max-w-4xl max-h-[90vh] w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
          >
            <X className="h-5 w-5 text-white" />
          </button>
        </div>

        {/* Media Content */}
        <div className="relative bg-black rounded-lg overflow-hidden">
          {type === 'image' || type === 'selfie' ? (
            <img
              src={url}
              alt={title}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          ) : (
            <div className="relative">
              <video
                ref={videoRef}
                src={url}
                className="w-full h-auto max-h-[70vh]"
                onEnded={() => setIsPlaying(false)}
                muted={isMuted}
              />
              
              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handlePlayPause}
                    className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 text-white" />
                    ) : (
                      <Play className="h-5 w-5 text-white" />
                    )}
                  </button>
                  
                  <button
                    onClick={handleMuteToggle}
                    className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
                  >
                    {isMuted ? (
                      <VolumeX className="h-5 w-5 text-white" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
