import { Smartphone, Wifi, WifiOff, Clock, MapPin } from 'lucide-react'
import { formatUTCDateTime } from '../../utils/dateUtils'

interface FCMToken {
  token: string
  deviceId: string
  platform: string
  appName: string
  isActive: boolean
  lastUsed: string
  _id: string
  id: string
}

interface DeviceInfoCardProps {
  fcmTokens: FCMToken[]
  location?: {
    type: string
    coordinates: number[]
    city?: string
    state?: string
  }
  lastActive: string
}

export default function DeviceInfoCard({ fcmTokens, location, lastActive }: DeviceInfoCardProps) {
  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'ios':
        return <Smartphone className="h-4 w-4 text-blue-500" />
      case 'android':
        return <Smartphone className="h-4 w-4 text-green-500" />
      default:
        return <Smartphone className="h-4 w-4 text-gray-500" />
    }
  }

  const getConnectionStatus = (isActive: boolean) => {
    return isActive ? (
      <div className="flex items-center space-x-1 text-green-600">
        <Wifi className="h-3 w-3" />
        <span className="text-xs">Active</span>
      </div>
    ) : (
      <div className="flex items-center space-x-1 text-gray-500">
        <WifiOff className="h-3 w-3" />
        <span className="text-xs">Inactive</span>
      </div>
    )
  }

  const formatCoordinates = (coordinates: number[]) => {
    if (!coordinates || coordinates.length < 2) return ''
    return `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`
  }

  return (
    <div className="glass-card p-4">
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
        <Smartphone className="h-5 w-5 mr-2 text-var(--primary)" />
        Device & Location Info
      </h3>
      
      {/* Last Active */}
      <div className="mb-4 p-3 bg-var(--bg-tertiary) rounded-lg">
        <div className="flex items-center space-x-2 mb-1">
          <Clock className="h-4 w-4 text-var(--text-muted)" />
          <span className="text-sm font-medium text-var(--text-primary)">Last Active</span>
        </div>
        <p className="text-sm text-var(--text-muted)">
          {formatUTCDateTime(lastActive)}
        </p>
      </div>

      {/* Location Information */}
      {location && (
        <div className="mb-4 p-3 bg-var(--bg-tertiary) rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-4 w-4 text-var(--text-muted)" />
            <span className="text-sm font-medium text-var(--text-primary)">Location</span>
          </div>
          <div className="space-y-1 text-sm">
            {location.city && location.state && (
              <p className="text-var(--text-primary)">
                {location.city}, {location.state}
              </p>
            )}
            <p className="text-var(--text-muted)">
              Coordinates: {formatCoordinates(location.coordinates)}
            </p>
            <p className="text-var(--text-muted)">
              Type: {location.type}
            </p>
          </div>
        </div>
      )}

      {/* Device Tokens */}
      <div>
        <h4 className="text-sm font-medium text-var(--text-primary) mb-2">
          Registered Devices ({fcmTokens.length})
        </h4>
        
        {fcmTokens.length === 0 ? (
          <div className="text-center py-4">
            <Smartphone className="h-8 w-8 text-var(--text-muted) mx-auto mb-2" />
            <p className="text-sm text-var(--text-muted)">No devices registered</p>
          </div>
        ) : (
          <div className="space-y-2">
            {fcmTokens.map((token, index) => (
              <div key={token._id} className="border border-var(--border) rounded-lg p-3 hover:bg-var(--bg-tertiary) transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getPlatformIcon(token.platform)}
                    <div>
                      <p className="text-sm font-medium text-var(--text-primary)">
                        {token.platform.toUpperCase()} Device
                      </p>
                      <p className="text-xs text-var(--text-muted)">
                        {token.appName}
                      </p>
                    </div>
                  </div>
                  {getConnectionStatus(token.isActive)}
                </div>
                
                <div className="space-y-1 text-xs text-var(--text-muted)">
                  <div className="flex items-center justify-between">
                    <span>Device ID:</span>
                    <span className="font-mono">{token.deviceId.slice(-8)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last Used:</span>
                    <span>{formatUTCDateTime(token.lastUsed)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Token ID:</span>
                    <span className="font-mono">{token._id.slice(-8)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
