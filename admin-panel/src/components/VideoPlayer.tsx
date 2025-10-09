import React, { useState, useRef, useEffect } from 'react';
import './VideoPlayer.css';

interface VideoPlayerProps {
  publicId?: string;
  fallbackUrl?: string;
  className?: string;
  onError?: (error: Error) => void;
  onLoad?: (data: any) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  publicId, 
  fallbackUrl, 
  className = '', 
  onError, 
  onLoad 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoUrl, setVideoUrl] = useState<string | undefined>(fallbackUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  useEffect(() => {
    if (publicId) {
      getOptimizedVideoUrl(publicId);
    } else if (fallbackUrl) {
      setVideoUrl(fallbackUrl);
      setIsLoading(false);
    }
  }, [publicId, fallbackUrl]);

  const getOptimizedVideoUrl = async (publicId: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/v1/upload/video/${publicId}/url`, {
        headers: {
          'Authorization': `Bearer ${getToken()}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.success) {
        setVideoUrl(result.data.url);
        if (onLoad) onLoad(result.data);
      } else {
        throw new Error(result.message || 'Failed to get video URL');
      }
    } catch (error) {
      console.error('Error getting video URL:', error);
      setError('Failed to load video');
      if (onError) onError(error as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoLoad = () => {
    setIsLoading(false);
    setError(null);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleVideoError = () => {
    setIsLoading(false);
    setError('Failed to play video');
    if (onError) onError(new Error('Video playback failed'));
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const seekTime = (clickX / width) * duration;
    
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const retryLoad = () => {
    if (publicId) {
      getOptimizedVideoUrl(publicId);
    }
  };

  if (isLoading) {
    return (
      <div className={`video-container loading ${className}`}>
        <div className="video-loading">
          <div className="spinner"></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`video-container error ${className}`}>
        <div className="video-error">
          <div className="error-icon">⚠️</div>
          <p>Error: {error}</p>
          <button onClick={retryLoad} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`video-container ${className}`}>
      <video
        ref={videoRef}
        controls
        width="100%"
        height="auto"
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
        playsInline
      >
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Custom Controls */}
      <div className="custom-controls">
        <div className="progress-bar" onClick={handleSeek}>
          <div 
            className="progress-fill" 
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
        </div>
        
        <div className="controls-bottom">
          <button onClick={handlePlayPause} className="play-pause-btn">
            {isPlaying ? '⏸️' : '▶️'}
          </button>
          
          <div className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
          
          <div className="volume-control">
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.1" 
              defaultValue="1"
              onChange={(e) => {
                if (videoRef.current) {
                  videoRef.current.volume = parseFloat(e.target.value);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to get token (implement based on your auth system)
const getToken = (): string => {
  return localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || '';
};

export default VideoPlayer;
