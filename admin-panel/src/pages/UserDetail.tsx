import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { adminApi } from '../services/api'
import { formatUTCDateOnly, formatUTCDateTime, isDateExpired } from '../utils/dateUtils'
import { ArrowLeft, RefreshCw, X, AlertCircle } from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

// Import sub-components
import UserProfileHeader from './UserDetail/UserProfileHeader'
import PersonalInfoCard from './UserDetail/PersonalInfoCard'
import LifestylePreferencesCard from './UserDetail/LifestylePreferencesCard'
import QuizResultsCard from './UserDetail/QuizResultsCard'
import AboutInterestsCard from './UserDetail/AboutInterestsCard'
import VerificationStatusCard from './UserDetail/VerificationStatusCard'
import SubscriptionPlanCard from './UserDetail/SubscriptionPlanCard'
import NotificationHistoryCard from './UserDetail/NotificationHistoryCard'
import AccountActionsCard from './UserDetail/AccountActionsCard'
import MediaGallery from './UserDetail/MediaGallery'
import MediaModal from './UserDetail/MediaModal'
import BackgroundCheckModals from './UserDetail/BackgroundCheckModals'
import PersonSelectionModal from '../components/PersonSelectionModal'
import PlanSelectionModal from '../components/PlanSelectionModal'

interface User {
  _id: string
  firebaseUid: string
  email: string
  emailVerified: boolean
  accountStatus: 'active' | 'suspended' | 'banned'
  status: 'basic' | 'complete' | 'QuizToken' | 'verified' | 'rejected' | 'suspended' 
  dateOfBirth?: string
  name?: string
  gender?: string
  pronoun?: string
  sexuality?: string
  datingType?: string
  relationshipType?: string
  height?: string
  ethnicity?: string
  familyPlans?: string
  work?: string
  highestQualification?: string
  jobTitle?: string
  religion?: string
  politics?: string
  drinking?: string
  smoking?: string
  lifestyle?: string
  aboutMe?: string
  lookingFor?: string
  thingsILike?: string[]
  values?: string[]
  interestedIn?: string[]
  quizResult?: {
    title?: string
    subTitle?: string
  }
  profileCompletion?: number
  age?: number
  images?: Array<{
    url: string
    isPrimary: boolean
    uploadedAt: string
  }>
  videos?: Array<{
    url: string
    thumbnail: string
    duration: number
    isPrimary: boolean
    uploadedAt: string
  }>
  selfie?: {
    url: string
    uploadedAt: string
  }
  notificationPermission: boolean
  locationPermission: boolean
  location: {
    type: string
    coordinates: number[]
    city?: string
    state?: string
  }
  lastActive: string
  createdAt: string
  updatedAt: string
  backgroundVerification: 'unpaid' | 'pending' | 'approved' | 'rejected'
  backgroundVerificationNotes?: string
  backgroundVerifiedBy?: string
  backgroundVerifiedAt?: string
  backgroundCheckPurchased?: boolean
  backgroundCheckPurchaseDate?: string
  backgroundCheckPurchaseId?: string
  currentPlan?: string | null
  planExpiry?: string | null
  planPurchaseDate?: string | null
}

function UserDetail() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Media modal state
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

  // Background check states
  const [backgroundCheckLoading, setBackgroundCheckLoading] = useState(false)
  const [backgroundCheckResults, setBackgroundCheckResults] = useState<any>(null)
  const [backgroundCheckModal, setBackgroundCheckModal] = useState<{
    isOpen: boolean
    type: 'search' | 'report' | 'selection' | 'history'
    data: any
  }>({
    isOpen: false,
    type: 'search',
    data: null
  })
  const [retryCount, setRetryCount] = useState(0)
  const [lastError, setLastError] = useState<string | null>(null)
  
  // Loading states for user actions
  const [actionLoading, setActionLoading] = useState<{
    verify?: boolean
    suspend?: boolean
    reactivate?: boolean
    ban?: boolean
    delete?: boolean
    backgroundVerification?: boolean
    markAsPaid?: boolean
    markPlanAsPaid?: boolean
  }>({})

  // Plan selection modal state
  const [planSelectionModal, setPlanSelectionModal] = useState<{
    isOpen: boolean
  }>({
    isOpen: false
  })

  useEffect(() => {
      fetchUser()
    fetchBackgroundChecks()
  }, [userId])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getUser(userId!)
      setUser(response.data.data)
    } catch (error) {
      console.error('Error fetching user:', error)
      toast.error('Failed to load user details')
    } finally {
      setLoading(false)
    }
  }

  const fetchBackgroundChecks = async () => {
    if (!userId) return
    try {
      const res = await adminApi.getBackgroundCheckHistory({ userId })
      if (res.data.success) {
        setBackgroundCheckResults(res.data.data.backgroundChecks || [])
      }
    } catch (err) {
      console.error('Failed to load background checks:', err)
    }
  }

  // User action handlers
  const handleVerifyUser = async (status: 'verified' | 'complete') => {
    try {
      setActionLoading(prev => ({ ...prev, verify: true }))
      await adminApi.verifyUser(userId!, { status })
      toast.success(`User ${status === 'verified' ? 'verified' : 'marked as complete'} successfully`)
      fetchUser()
    } catch (error) {
      console.error('Error verifying user:', error)
      toast.error('Failed to update user status')
    } finally {
      setActionLoading(prev => ({ ...prev, verify: false }))
    }
  }

  const handleDeleteUser = async () => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        setActionLoading(prev => ({ ...prev, delete: true }))
        await adminApi.deleteUser(userId!)
        toast.success('User deleted successfully')
        navigate('/users')
      } catch (error) {
        console.error('Error deleting user:', error)
        toast.error('Failed to delete user')
      } finally {
        setActionLoading(prev => ({ ...prev, delete: false }))
      }
    }
  }

  const handleSuspendUser = async () => {
    const reason = prompt('Please enter a reason for suspension:')
    if (!reason) return

    try {
      setActionLoading(prev => ({ ...prev, suspend: true }))
      await adminApi.suspendUser(userId!, { reason })
      toast.success('User suspended successfully')
      fetchUser()
    } catch (error) {
      console.error('Error suspending user:', error)
      toast.error('Failed to suspend user')
    } finally {
      setActionLoading(prev => ({ ...prev, suspend: false }))
    }
  }

  const handleReactivateUser = async () => {
    try {
      setActionLoading(prev => ({ ...prev, reactivate: true }))
      await adminApi.reactivateUser(userId!)
      toast.success('User reactivated successfully')
      fetchUser()
    } catch (error) {
      console.error('Error reactivating user:', error)
      toast.error('Failed to reactivate user')
    } finally {
      setActionLoading(prev => ({ ...prev, reactivate: false }))
    }
  }

  const handleBanUser = async () => {
    const reason = prompt('Please enter a reason for banning:')
    if (!reason) return

    try {
      setActionLoading(prev => ({ ...prev, ban: true }))
      await adminApi.banUser(userId!, { reason })
      toast.success('User banned successfully')
      fetchUser()
    } catch (error) {
      console.error('Error banning user:', error)
      toast.error('Failed to ban user')
    } finally {
      setActionLoading(prev => ({ ...prev, ban: false }))
    }
  }

  const handleBackgroundVerification = async (status: 'unpaid' | 'pending' | 'approved' | 'rejected') => {
    if (!['unpaid', 'pending'].includes(status) && !user?.backgroundCheckPurchased) {
      toast.error('User has not purchased background check. Cannot proceed with verification.')
      return
    }

    const notes = prompt(`Please enter notes for background verification (${status}):`)
    if (notes === null) return

    try {
      setActionLoading(prev => ({ ...prev, backgroundVerification: true }))
      await adminApi.updateUserBackgroundVerification(userId!, { status, notes })
      toast.success(`User background verification ${status} successfully`)
      fetchUser()
    } catch (error: any) {
      console.error('Error updating user background verification:', error)
      if (error.response?.data?.error === 'BACKGROUND_CHECK_NOT_PURCHASED') {
        toast.error('User has not purchased background check. Cannot proceed with verification.')
      } else {
        toast.error('Failed to update user background verification')
      }
    } finally {
      setActionLoading(prev => ({ ...prev, backgroundVerification: false }))
    }
  }

  const handleMarkAsPaid = async () => {
    if (!user) return
    if (user.backgroundCheckPurchased) {
      toast.error('User has already paid for background verification')
      return
    }

    const notes = prompt('Please enter notes for marking background verification as paid (optional):')
    if (notes === null) return

    try {
      setActionLoading(prev => ({ ...prev, markAsPaid: true }))
      await adminApi.markBackgroundVerificationAsPaid(userId!, { notes })
      toast.success('Background verification marked as paid successfully')
      fetchUser()
    } catch (error: any) {
      console.error('Error marking background verification as paid:', error)
      toast.error(error.response?.data?.error === 'ALREADY_PAID' 
        ? 'User has already paid for background verification' 
        : 'Failed to mark background verification as paid')
    } finally {
      setActionLoading(prev => ({ ...prev, markAsPaid: false }))
    }
  }

  const handleMarkPlanAsPaid = async () => {
    if (!user) return
    if (user.currentPlan && user.planExpiry && new Date(user.planExpiry) > new Date()) {
      toast.error('User already has an active subscription plan')
      return
    }
    setPlanSelectionModal({ isOpen: true })
  }

  const handlePlanSelectionConfirm = async (planName: string, notes: string) => {
    try {
      setActionLoading(prev => ({ ...prev, markPlanAsPaid: true }))
      await adminApi.markPlanAsPaid(userId!, { notes, planName })
      toast.success(`${planName} subscription plan marked as paid successfully`)
      setPlanSelectionModal({ isOpen: false })
      fetchUser()
    } catch (error: any) {
      console.error('Error marking subscription plan as paid:', error)
      const errorMsg = error.response?.data?.error
      toast.error(
        errorMsg === 'ALREADY_HAS_PLAN' ? 'User already has an active subscription plan' :
        errorMsg === 'INVALID_PLAN_NAME' ? 'Invalid plan name selected' :
        'Failed to mark subscription plan as paid'
      )
    } finally {
      setActionLoading(prev => ({ ...prev, markPlanAsPaid: false }))
    }
  }

  // Media handlers
  const openMediaModal = (type: 'image' | 'video' | 'selfie', url: string, title: string) => {
    setMediaModal({ isOpen: true, type, url, title })
  }

  const closeMediaModal = () => {
    setMediaModal({ isOpen: false, type: 'image', url: '', title: '' })
  }

  // Background check handlers
  const handleSearchUser = async () => {
    toast('Background check searches are automated and cannot be run manually. Update the user profile to trigger automation.', { icon: 'ℹ️' })
  }

  const handleRetrySearch = async () => {
    if (retryCount >= 3) {
      toast.error('Maximum retry attempts reached. Please try again later.')
      return
    }
    setRetryCount(prev => prev + 1)
    setLastError(null)
    await handleSearchUser()
  }

  const handleSelectPersonFromCheck = async (checkId: string, personIndex: number) => {
    try {
      setBackgroundCheckLoading(true)
      const response = await adminApi.selectPersonFromSearchResults({ checkId, selectedPersonIndex: personIndex })
      if (response.data.success) {
        toast.success('Person selected and saved to database successfully')
        await fetchBackgroundChecks()
      } else {
        toast.error('Failed to select person')
      }
    } catch (error) {
      console.error('Error selecting person:', error)
      toast.error('Failed to select person')
    } finally {
      setBackgroundCheckLoading(false)
    }
  }

  const handleCheckBackground = async (reportToken: string, checkId: string) => {
    try {
      setBackgroundCheckLoading(true)
      const response = await adminApi.checkBackgroundReport({ reportToken, checkId })
      if (response.data.success) {
        setBackgroundCheckModal({ isOpen: true, type: 'report', data: response.data.data })
        toast.success('Background report generated successfully')
      } else {
        toast.error('Failed to generate background report')
      }
    } catch (error) {
      console.error('Error checking background:', error)
      toast.error('Failed to check background')
    } finally {
      setBackgroundCheckLoading(false)
    }
  }

  const closeBackgroundCheckModal = () => {
    setBackgroundCheckModal({ isOpen: false, type: 'search', data: null })
    setBackgroundCheckResults(null)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">User not found</h3>
        <p className="mt-1 text-sm text-gray-500">The user you're looking for doesn't exist.</p>
        <div className="mt-6">
          <button onClick={() => navigate('/users')} className="btn btn-primary">
          Back to Users
        </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-var(--bg-secondary) animate-fade-in">
      {/* Header */}
      <div className="glass-card p-4 mb-4 h-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/users')} className="btn btn-ghost hover-lift">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </button>
          <div>
              <h1 className="text-3xl font-bold gradient-text">User Details</h1>
              <p className="text-var(--text-muted) mt-1">Manage user account and verification status</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {lastError && retryCount < 3 && (
              <button onClick={handleRetrySearch} disabled={backgroundCheckLoading} className="btn btn-warning btn-sm hover-lift">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry ({retryCount}/3)
            </button>
          )}
          </div>
        </div>
        
        {!backgroundCheckResults || backgroundCheckResults.length === 0 ? (
          <div className="mt-4 p-3 bg-var(--bg-tertiary) rounded-lg border border-var(--border)">
            <p className="text-sm text-var(--text-muted)">No automated background checks found for this user. Automation runs when the user updates their profile.</p>
        </div>
        ) : null}
      </div>

      {/* Error display */}
      {lastError && (
        <div className="mb-6 glass-card p-4 border-l-4 border-var(--error)">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-var(--error) mr-3 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-var(--error) font-medium">Background Check Failed</p>
              <p className="text-sm text-var(--text-primary) mt-1">{lastError}</p>
              {retryCount < 3 ? (
                <p className="text-xs text-var(--text-muted) mt-2">You can retry the search or contact support if the issue persists.</p>
              ) : (
                <p className="text-xs text-var(--text-muted) mt-2">Maximum retry attempts reached. Please contact support for assistance.</p>
              )}
            </div>
            <button onClick={() => setLastError(null)} className="text-var(--text-muted) hover:text-var(--error) ml-2 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Left Column - User Profile */}
        <div className="xl:col-span-2 space-y-4">
          <UserProfileHeader user={user} />
          <PersonalInfoCard user={user} />
          <LifestylePreferencesCard user={user} />
          <QuizResultsCard user={user} />
          <AboutInterestsCard user={user} />
          <MediaGallery
            user={user}
            onOpenMedia={openMediaModal}
          />
        </div>
              
        {/* Right Sidebar */}
        <div className="space-y-4">
          <VerificationStatusCard
            user={user}
            actionLoading={actionLoading}
            backgroundCheckResults={backgroundCheckResults}
            onBackgroundVerification={handleBackgroundVerification}
            onMarkAsPaid={handleMarkAsPaid}
            onViewBackgroundChecks={() => setBackgroundCheckModal({ isOpen: true, type: 'history', data: backgroundCheckResults })}
          />
          
          <SubscriptionPlanCard
            user={user}
            actionLoading={actionLoading}
            onMarkPlanAsPaid={handleMarkPlanAsPaid}
          />
          
          <NotificationHistoryCard userId={user._id} />
          
          <AccountActionsCard
            user={user}
            actionLoading={actionLoading}
            onSuspend={handleSuspendUser}
            onReactivate={handleReactivateUser}
            onBan={handleBanUser}
            onDelete={handleDeleteUser}
          />
                       </div>
                     </div>

      {/* Modals */}
      <MediaModal
        isOpen={mediaModal.isOpen}
        type={mediaModal.type}
        url={mediaModal.url}
        title={mediaModal.title}
        onClose={closeMediaModal}
      />

      <BackgroundCheckModals
        modal={backgroundCheckModal}
        backgroundCheckLoading={backgroundCheckLoading}
          onClose={closeBackgroundCheckModal}
        onSelectPerson={handleSelectPersonFromCheck}
          onCheckBackground={handleCheckBackground}
      />

      <PlanSelectionModal
        isOpen={planSelectionModal.isOpen}
        onClose={() => setPlanSelectionModal({ isOpen: false })}
        onConfirm={handlePlanSelectionConfirm}
        loading={actionLoading.markPlanAsPaid}
      />
     </div>
   )
}

export default UserDetail