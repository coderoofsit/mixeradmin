import { X, Shield, FileSearch, AlertCircle, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import PersonSelectionModal from '../../components/PersonSelectionModal'

interface BackgroundCheckModalsProps {
  modal: {
    isOpen: boolean
    type: 'search' | 'report' | 'selection' | 'history'
    data: any
  }
  backgroundCheckLoading: boolean
  onClose: () => void
  onSelectPerson: (checkId: string, personIndex: number) => void
  onCheckBackground: (reportToken: string, checkId: string) => void
}

export default function BackgroundCheckModals({
  modal,
  backgroundCheckLoading,
  onClose,
  onSelectPerson,
  onCheckBackground
}: BackgroundCheckModalsProps) {
  if (!modal.isOpen) return null

  const renderModalContent = () => {
    switch (modal.type) {
      case 'search':
        return (
          <div className="glass-card p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-var(--text-primary) flex items-center">
                <Shield className="h-6 w-6 mr-3 text-var(--primary)" />
                Background Check Search Results
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-var(--bg-tertiary) transition-colors"
              >
                <X className="h-5 w-5 text-var(--text-muted)" />
              </button>
            </div>

            {backgroundCheckLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center space-x-3">
                  <RefreshCw className="h-6 w-6 text-var(--primary) animate-spin" />
                  <span className="text-var(--text-muted)">Searching background check data...</span>
                </div>
              </div>
            ) : modal.data ? (
              <div className="space-y-4">
                <div className="bg-var(--bg-tertiary) p-4 rounded-lg">
                  <h4 className="font-semibold text-var(--text-primary) mb-2">Search Results</h4>
                  <p className="text-var(--text-muted) text-sm">
                    Found {modal.data.length || 0} potential matches. Please review and select the correct person.
                  </p>
                </div>
                
                {modal.data.map((person: any, index: number) => (
                  <div key={index} className="border border-var(--border) rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-var(--text-primary)">{person.name}</h5>
                      <span className="badge badge-primary">Score: {person.score}%</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-var(--text-muted)">Age:</span>
                        <span className="text-var(--text-primary) ml-2">{person.age || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-var(--text-muted)">Gender:</span>
                        <span className="text-var(--text-primary) ml-2">{person.gender || 'N/A'}</span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-var(--text-muted)">Address:</span>
                        <span className="text-var(--text-primary) ml-2">{person.address || 'N/A'}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectPerson(modal.data.checkId, index)}
                      className="btn btn-primary btn-sm mt-3 hover-lift"
                      disabled={backgroundCheckLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Select This Person
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-var(--text-muted) mx-auto mb-4" />
                <p className="text-var(--text-muted)">No search results available</p>
              </div>
            )}
          </div>
        )

      case 'report':
        return (
          <div className="glass-card p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-var(--text-primary) flex items-center">
                <FileSearch className="h-6 w-6 mr-3 text-var(--primary)" />
                Background Check Report
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-var(--bg-tertiary) transition-colors"
              >
                <X className="h-5 w-5 text-var(--text-muted)" />
              </button>
            </div>

            {modal.data ? (
              <div className="space-y-6">
                <div className="bg-var(--bg-tertiary) p-4 rounded-lg">
                  <h4 className="font-semibold text-var(--text-primary) mb-2">Report Summary</h4>
                  <p className="text-var(--text-muted) text-sm">
                    Background check report has been generated successfully.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h5 className="font-medium text-var(--text-primary) mb-2">Personal Information</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-var(--text-muted)">Name:</span>
                        <span className="text-var(--text-primary) ml-2">{modal.data.name || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-var(--text-muted)">Date of Birth:</span>
                        <span className="text-var(--text-primary) ml-2">{modal.data.dateOfBirth || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {modal.data.details && (
                    <div>
                      <h5 className="font-medium text-var(--text-primary) mb-2">Detailed Information</h5>
                      <div className="space-y-3">
                        {modal.data.details.names && modal.data.details.names.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium text-var(--text-muted) mb-1">Known Names</h6>
                            <div className="space-y-1">
                              {modal.data.details.names.map((name: any, index: number) => (
                                <div key={index} className="text-sm text-var(--text-primary)">
                                  {name.fullName} ({name.firstDate} - {name.lastDate})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {modal.data.details.addresses && modal.data.details.addresses.length > 0 && (
                          <div>
                            <h6 className="text-sm font-medium text-var(--text-muted) mb-1">Known Addresses</h6>
                            <div className="space-y-1">
                              {modal.data.details.addresses.map((address: any, index: number) => (
                                <div key={index} className="text-sm text-var(--text-primary)">
                                  {address.fullAddress} ({address.firstDate} - {address.lastDate})
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-var(--text-muted) mx-auto mb-4" />
                <p className="text-var(--text-muted)">No report data available</p>
              </div>
            )}
          </div>
        )

      case 'history':
        return (
          <div className="glass-card p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-var(--text-primary) flex items-center">
                <FileSearch className="h-6 w-6 mr-3 text-var(--primary)" />
                Background Check History
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-var(--bg-tertiary) transition-colors"
              >
                <X className="h-5 w-5 text-var(--text-muted)" />
              </button>
            </div>

            {modal.data && modal.data.length > 0 ? (
              <div className="space-y-4">
                {modal.data.map((check: any, index: number) => (
                  <div key={index} className="border border-var(--border) rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-var(--text-primary)">
                        Check #{index + 1}
                      </h5>
                      <span className="text-xs text-var(--text-muted)">
                        {new Date(check.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-var(--text-muted)">Status:</span>
                        <span className={`ml-2 badge ${
                          check.status === 'completed' ? 'badge-success' : 
                          check.status === 'pending' ? 'badge-warning' : 'badge-secondary'
                        }`}>
                          {check.status}
                        </span>
                      </div>
                      
                      {check.selectedPerson && (
                        <div>
                          <span className="text-var(--text-muted)">Selected Person:</span>
                          <span className="text-var(--text-primary) ml-2">{check.selectedPerson.name}</span>
                        </div>
                      )}
                      
                      {check.reportData && (
                        <button
                          onClick={() => onCheckBackground(check.reportData.reportToken, check._id)}
                          className="btn btn-primary btn-sm mt-2 hover-lift"
                          disabled={backgroundCheckLoading}
                        >
                          <FileSearch className="h-4 w-4 mr-2" />
                          View Report
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-var(--text-muted) mx-auto mb-4" />
                <p className="text-var(--text-muted)">No background check history found</p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative z-10 flex items-center justify-center w-full h-full p-4">
        {renderModalContent()}
      </div>
    </div>
  )
}
