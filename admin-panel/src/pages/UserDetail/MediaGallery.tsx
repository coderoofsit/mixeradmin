import { Camera, Play } from 'lucide-react'

interface MediaGalleryProps {
  user: {
    profileContent: {
      images: Array<{
        url: string
        isPrimary: boolean
        uploadedAt: string
      }>
    }
  }
  onOpenMedia: (type: 'image' | 'video' | 'selfie', url: string, title: string) => void
}

export default function MediaGallery({ user, onOpenMedia }: MediaGalleryProps) {
  const hasMedia = user.profileContent.images && user.profileContent.images.length > 0

  return (
    <div className="glass-card p-4">
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-6 flex items-center">
        <Camera className="h-5 w-5 mr-2 text-var(--accent)" />
        Media Gallery
      </h3>
      
      {!hasMedia ? (
        <div className="text-center py-8">
          <Camera className="h-12 w-12 text-var(--text-muted) mx-auto mb-4" />
          <p className="text-var(--text-muted)">No media uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Images Section */}
          {user.profileContent.images && user.profileContent.images.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-var(--text-primary) mb-3">Profile Photos ({user.profileContent.images.length})</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {user.profileContent.images.map((image, index) => (
                  <div 
                    key={index}
                    className="relative group cursor-pointer rounded-lg overflow-hidden bg-var(--bg-tertiary) aspect-square"
                    onClick={() => onOpenMedia('image', image.url, `Profile Photo ${index + 1}`)}
                  >
                    <img
                      src={image.url}
                      alt={`Profile ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {image.isPrimary && (
                      <div className="absolute top-2 left-2">
                        <span className="badge badge-primary text-xs">Primary</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <div className="bg-white bg-opacity-90 rounded-full p-2">
                          <Camera className="h-4 w-4 text-var(--text-primary)" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
