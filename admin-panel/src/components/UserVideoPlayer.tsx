import React, { useState, useRef, useEffect } from 'react';
import './VideoPlayer.css';

interface UserVideoPlayerProps {
  videoUrl: string;
  className?: string;
  onError?: (error: Error) => void;
  onLoad?: (data: any) => void;
}

const UserVideoPlayer: React.FC<UserVideoPlayerProps> = ({ 
  videoUrl, 
  className = '', 
  onError, 
  onLoad 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (videoUrl) {
      setIsLoading(true);
      setError(null);
      
      // Always try to get optimized URL from backend first
      if (videoUrl.includes('cloudinary.com')) {
        getOptimizedVideoUrl();
      } else {
        setIsLoading(false);
      }
    }
  }, [videoUrl]);

  // Fallback to use original URL directly if backend fails
  useEffect(() => {
    if (videoRef.current && videoUrl && !isLoading && !error) {
      // Set the video source directly if we haven't loaded an optimized URL
      if (videoRef.current.src !== videoUrl) {
        videoRef.current.src = videoUrl;
        videoRef.current.load();
      }
    }
  }, [videoUrl, isLoading, error]);

  const getOptimizedVideoUrl = async () => {
    try {
      const publicId = extractPublicIdFromUrl(videoUrl);
      if (publicId) {
        console.log('Getting optimized video URL for public ID:', publicId);
        
        // Add timeout to prevent long waits
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(`/api/v1/upload/video/${publicId}/url`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || ''}`,
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data.url) {
            console.log('Got optimized video URL:', result.data.url);
            // Update the video source with the optimized URL
            if (videoRef.current) {
              videoRef.current.src = result.data.url;
              videoRef.current.load();
            }
          } else {
            console.log('Using fallback URL:', videoUrl);
            setIsLoading(false);
          }
        } else {
          console.log('Using fallback URL:', videoUrl);
          setIsLoading(false);
        }
      } else {
        console.log('Using fallback URL:', videoUrl);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to get optimized video URL:', error);
      console.log('Using fallback URL:', videoUrl);
      setIsLoading(false);
    }
  };

  // Helper function to extract public ID from Cloudinary URL
  const extractPublicIdFromUrl = (url: string): string | undefined => {
    if (!url || !url.includes('cloudinary.com')) return undefined;
    
    try {
      // Extract public ID from Cloudinary URL
      // Example: https://res.cloudinary.com/cloud-name/video/upload/v1234567890/event-dating/abc123def456.mp4
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      if (uploadIndex !== -1 && uploadIndex + 2 < urlParts.length) {
        // Skip version number and get the public ID
        const publicIdWithExtension = urlParts.slice(uploadIndex + 2).join('/');
        // Remove file extension
        return publicIdWithExtension.replace(/\.[^/.]+$/, '');
      }
    } catch (error) {
      console.error('Error extracting public ID:', error);
    }
    return undefined;
  };

  const handleVideoLoad = () => {
    console.log('Video loaded successfully:', videoUrl);
    setIsLoading(false);
    setError(null);
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
    if (onLoad) onLoad({ url: videoUrl });
  };

  const handleVideoError = async (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    console.error('Video error:', e);
    console.error('Video URL that failed:', videoUrl);
    
    // Try to get optimized URL from backend if it's a Cloudinary URL
    if (videoUrl.includes('cloudinary.com')) {
      const publicId = extractPublicIdFromUrl(videoUrl);
      if (publicId) {
        try {
          console.log('Trying to get optimized video URL for public ID:', publicId);
          const response = await fetch(`/api/v1/upload/video/${publicId}/url`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken') || sessionStorage.getItem('authToken') || ''}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data.url) {
              console.log('Got optimized video URL:', result.data.url);
              // Update the video source with the optimized URL
              if (videoRef.current) {
                videoRef.current.src = result.data.url;
                videoRef.current.load();
                return; // Don't show error, let it try again
              }
            }
          }
        } catch (error) {
          console.error('Failed to get optimized video URL:', error);
        }
      }
    }
    
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

  const retryLoad = () => {
    if (videoUrl) {
      setIsLoading(true);
      setError(null);
      if (videoRef.current) {
        videoRef.current.load();
      }
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
    <div 
      className={`video-container ${isPlaying ? 'playing' : ''} ${className}`}
      onClick={handlePlayPause}
    >
      <video
        ref={videoRef}
        onLoadedData={handleVideoLoad}
        onError={handleVideoError}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
        playsInline
        crossOrigin="anonymous"
        style={{ 
          width: '50vw', 
          height: '50vh',
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain'
        }}
      >
        <source src={videoUrl} type="video/mp4" />
        <source src={videoUrl} type="video/webm" />
        <source src={videoUrl} type="video/ogg" />
        Your browser does not support the video tag.
      </video>
      
      {/* Custom Play Button - Only show when paused */}
      {!isPlaying && (
        <div className="play-button-overlay">
          <div className="play-button">
            ▶️
          </div>
        </div>
      )}
      
      {/* Progress Bar */}
      <div className="progress-container" onClick={(e) => e.stopPropagation()}>
        <div className="progress-bar" onClick={handleSeek}>
          <div 
            className="progress-fill" 
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default UserVideoPlayer;
