import { Shield, Search, AlertCircle, CheckCircle, XCircle, Clock, FileText, MapPin, User } from 'lucide-react'
import { formatUTCDateTime } from '../../utils/dateUtils'

interface BackgroundCheck {
  _id: string
  userId: string
  status: string
  searchDate: string
  searchCriteria: {
    location: {
      coordinates: number[]
    }
    name: string
    email: string
    dateOfBirth: string
  }
  peopleSearchResults: {
    people: any[]
  }
  backgroundData: {
    addresses: any[]
    phones: any[]
    emails: any[]
    bankruptcies: any[]
    liens: any[]
    professionalLicenses: any[]
    huntingPermits: any[]
    pilotLicenses: any[]
    names: any[]
    relatives: any[]
    criminalRecords: any[]
    evictions: any[]
    judgments: any[]
    corporateFilings: any[]
    uccFilings: any[]
    trademarks: any[]
    concealedWeaponPermits: any[]
    watchListRecords: any[]
    employmentHistory: any[]
    businessAssociations: any[]
  }
  apiCalls: any[]
  errorMessage?: string
  createdAt: string
  updatedAt: string
}

interface BackgroundCheckHistoryCardProps {
  backgroundChecks: {
    history: BackgroundCheck[]
  }
}

export default function BackgroundCheckHistoryCard({ backgroundChecks }: BackgroundCheckHistoryCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'badge-success'
      case 'failed':
      case 'error':
        return 'badge-danger'
      case 'pending':
        return 'badge-warning'
      default:
        return 'badge-secondary'
    }
  }

  const countBackgroundData = (backgroundData: any) => {
    let total = 0
    Object.values(backgroundData).forEach((items: any) => {
      if (Array.isArray(items)) {
        total += items.length
      }
    })
    return total
  }

  // if (!backgroundChecks || !backgroundChecks.history || backgroundChecks.history.length === 0) {
  //   return (
  //     <div className="glass-card p-4">
  //       <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
  //         <Shield className="h-5 w-5 mr-2 text-var(--primary)" />
  //         Background Check History
  //       </h3>
  //       <div className="text-center py-6">
  //         <Shield className="h-12 w-12 text-var(--text-muted) mx-auto mb-2" />
  //         <p className="text-var(--text-muted)">No background checks found</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="glass-card p-4">
      <h3 className="text-lg font-semibold text-var(--text-primary) mb-3 flex items-center">
        <Shield className="h-5 w-5 mr-2 text-var(--primary)" />
        Background Check History
        <span className="ml-2 badge badge-secondary">{backgroundChecks.history.length}</span>
      </h3>
      
      <div className="space-y-4">
        {backgroundChecks.history.map((check) => (
          <div key={check._id} className="border border-var(--border) rounded-lg p-4 hover:bg-var(--bg-tertiary) transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getStatusIcon(check.status)}
                <div>
                  <h4 className="font-medium text-var(--text-primary)">
                    Background Check #{check._id.slice(-8)}
                  </h4>
                  <p className="text-sm text-var(--text-muted)">
                    {formatUTCDateTime(check.searchDate)}
                  </p>
                </div>
              </div>
              <span className={`badge ${getStatusBadge(check.status)}`}>
                {check.status}
              </span>
            </div>

            {/* Search Criteria */}
            <div className="mb-3 p-3 bg-var(--bg-tertiary) rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Search className="h-4 w-4 text-var(--text-muted)" />
                <span className="text-sm font-medium text-var(--text-primary)">Search Criteria</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div className="flex items-center space-x-2">
                  <User className="h-3 w-3 text-var(--text-muted)" />
                  <span className="text-var(--text-muted)">Name:</span>
                  <span className="text-var(--text-primary) font-medium">{check.searchCriteria.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-var(--text-muted)">Email:</span>
                  <span className="text-var(--text-primary) font-medium">{check.searchCriteria.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-var(--text-muted)">DOB:</span>
                  <span className="text-var(--text-primary) font-medium">
                    {new Date(check.searchCriteria.dateOfBirth).toLocaleDateString()}
                  </span>
                </div>
                {check.searchCriteria.location.coordinates.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3 w-3 text-var(--text-muted)" />
                    <span className="text-var(--text-muted)">Location:</span>
                    <span className="text-var(--text-primary) font-medium">
                      {check.searchCriteria.location.coordinates[1].toFixed(4)}, {check.searchCriteria.location.coordinates[0].toFixed(4)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Results Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <div className="text-center p-2 bg-var(--bg-tertiary) rounded">
                <p className="text-lg font-bold text-var(--primary)">{check.peopleSearchResults.people.length}</p>
                <p className="text-xs text-var(--text-muted)">People Found</p>
              </div>
              <div className="text-center p-2 bg-var(--bg-tertiary) rounded">
                <p className="text-lg font-bold text-var(--secondary)">{countBackgroundData(check.backgroundData)}</p>
                <p className="text-xs text-var(--text-muted)">Data Records</p>
              </div>
              <div className="text-center p-2 bg-var(--bg-tertiary) rounded">
                <p className="text-lg font-bold text-var(--accent)">{check.apiCalls.length}</p>
                <p className="text-xs text-var(--text-muted)">API Calls</p>
              </div>
              <div className="text-center p-2 bg-var(--bg-tertiary) rounded">
                <p className="text-lg font-bold text-var(--warning)">{check.backgroundData.criminalRecords.length}</p>
                <p className="text-xs text-var(--text-muted)">Criminal Records</p>
              </div>
            </div>

            {/* Error Message */}
            {check.errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-red-700">Error</span>
                </div>
                <p className="text-sm text-red-600">{check.errorMessage}</p>
              </div>
            )}

            {/* Key Findings */}
            {check.backgroundData.criminalRecords.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700">Criminal Records Found</span>
                </div>
                <p className="text-sm text-yellow-600">
                  {check.backgroundData.criminalRecords.length} criminal record(s) found
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="mt-3 pt-2 border-t border-var(--border)">
              <div className="flex items-center justify-between text-xs text-var(--text-muted)">
                <span>Created: {formatUTCDateTime(check.createdAt)}</span>
                <span>ID: {check._id.slice(-8)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
