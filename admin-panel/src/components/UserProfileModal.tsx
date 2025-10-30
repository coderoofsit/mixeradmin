import { useState, useEffect } from 'react'
import { X, RefreshCw } from 'lucide-react'
import { adminApi } from '../services/api'
import LoadingSpinner from './LoadingSpinner'
import toast from 'react-hot-toast'
import UserProfileHeader from '../pages/UserDetail/UserProfileHeader'
import PersonalInfoCard from '../pages/UserDetail/PersonalInfoCard'
import LifestylePreferencesCard from '../pages/UserDetail/LifestylePreferencesCard'
import AboutInterestsCard from '../pages/UserDetail/AboutInterestsCard'
import MediaGallery from '../pages/UserDetail/MediaGallery'
import AccountStatusCard from '../pages/UserDetail/AccountStatusCard'
import MediaModal from '../pages/UserDetail/MediaModal'

interface UserProfileModalProps {
  userId: string
  isOpen: boolean
  onClose: () => void
}

// UserData interface matching the one from UserDetail.tsx
interface UserData {
  id: string
  firebaseUid: string
  email: string
  emailVerified: boolean
  personalInfo: {
    name: string
    dateOfBirth: string
    age: number
    gender: string
    pronoun?: string
    sexuality: string
    interestedIn: string[]
    height: string
    ethnicity: string
    children?: string
    familyPlans?: string
  }
  datingPreferences: {
    datingType?: string
    intention?: string
    relationshipType: string
  }
  professionalInfo?: {
    work?: string
    highestQualification?: string
    jobTitle?: string
  }
  lifestyle: {
    religion?: string
    politics: string
    drinking: string
    smoking?: string
    lifestyle?: string
  }
  profileContent: {
    aboutMe: string
    lookingFor?: string
    thingsILike: string[]
    values: string[]
    images: Array<{
      url: string
      isPrimary: boolean
      uploadedAt: string
    }>
    quizResult?: any
  }
  location: {
    type: string
    coordinates: number[]
    city: string
    state: string
  }
  permissions: {
    notificationPermission: boolean
    locationPermission: boolean
  }
  accountStatus: {
    isActive: boolean
    status: 'basic' | 'complete' | 'QuizToken' | 'verified' | 'rejected' | 'suspended'
    accountStatus: 'active' | 'suspended' | 'banned'
    backgroundVerification: 'unpaid' | 'pending' | 'approved' | 'rejected'
    isVerified: boolean
    profileCompletion: number
  }
  timestamps: {
    lastActive: string
    createdAt: string
    updatedAt: string
  }
  adminData?: {
    verification?: any
    subscription?: any
    moderation?: any
    socialActivity?: any
    backgroundCheck?: any
    purchaseHistory?: any
    deviceInfo?: any
  }
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ userId, isOpen, onClose }) => {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [mediaModal, setMediaModal] = useState<{
    isOpen: boolean
    type: 'image' | 'video' | 'selfie'
    url: string
    title: string
  }>({
    isOpen: false,
    type: 'image',
    url: '',
    title: ''
  })

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData()
    }
  }, [isOpen, userId])

  const fetchUserData = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getUser(userId)
      
      if (response.data.success && response.data.data) {
        setUserData(response.data.data)
      } else {
        throw new Error('Failed to fetch user data')
      }
    } catch (error) {
      console.error('Error fetching user data:', error)
      toast.error('Failed to load user profile')
      onClose()
    } finally {
      setLoading(false)
    }
  }

  const openMediaModal = (type: 'image' | 'video' | 'selfie', url: string, title: string) => {
    setMediaModal({ isOpen: true, type, url, title })
  }

  const closeMediaModal = () => {
    setMediaModal({ isOpen: false, type: 'image', url: '', title: '' })
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className="relative bg-var(--bg-primary) rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-var(--bg-primary) border-b border-var(--border) px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-var(--text-primary)">
                User Profile
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchUserData}
                  disabled={loading}
                  className="p-2 hover:bg-var(--bg-secondary) rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`h-5 w-5 text-var(--text-secondary) ${loading ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-var(--bg-secondary) rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-var(--text-secondary)" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <LoadingSpinner size="md" />
                </div>
              ) : userData ? (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <UserProfileHeader user={userData} />
                  
                  {/* Main Content Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Left Column */}
                    <div className="xl:col-span-7 space-y-6">
                      {/* Account Status */}
                      <AccountStatusCard 
                        user={userData}
                        accountDetails={userData.accountStatus}
                      />
                      
                      {/* Personal Info */}
                      <div className="border-t border-var(--border-light) pt-6">
                        <PersonalInfoCard user={userData} />
                      </div>
                      
                      {/* Lifestyle Preferences */}
                      <div>
                        <LifestylePreferencesCard user={userData} />
                      </div>
                      
                      {/* About & Interests */}
                      <div className="border-t border-var(--border-light) pt-6">
                        <AboutInterestsCard user={userData} />
                      </div>
                      
                      {/* Media Gallery */}
                      <div className="border-t border-var(--border-light) pt-6">
                        <MediaGallery
                          user={userData}
                          onOpenMedia={openMediaModal}
                        />
                      </div>
                    </div>
                    
                    {/* Right Column - Additional Info (if needed) */}
                    <div className="xl:col-span-5">
                      {/* You can add additional cards here if needed */}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <p className="text-lg text-var(--text-muted)">No user data available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media Modal */}
      {mediaModal.isOpen && (
        <MediaModal
          isOpen={mediaModal.isOpen}
          type={mediaModal.type}
          url={mediaModal.url}
          title={mediaModal.title}
          onClose={closeMediaModal}
        />
      )}
    </>
  )
}

export default UserProfileModal

