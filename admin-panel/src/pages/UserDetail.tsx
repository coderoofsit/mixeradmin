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
import FetchRecordsModal from '../components/FetchRecordsModal'
import PurchaseHistoryCard from './UserDetail/PurchaseHistoryCard'
import SocialActivityCard from './UserDetail/SocialActivityCard'
import AccountStatusCard from './UserDetail/AccountStatusCard'
import BackgroundCheckHistoryCard from './UserDetail/BackgroundCheckHistoryCard'

// New clean API response structure - Updated for new API format
interface UserData {
  // Basic identification (top level)
  id: string
  firebaseUid: string
  email: string
  emailVerified: boolean
  
  // Personal information (grouped)
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
  
  // Dating preferences (grouped)
  datingPreferences: {
    datingType?: string
    intention?: string
    relationshipType: string
  }
  
  // Professional information (grouped)
  professionalInfo?: {
    work?: string
    highestQualification?: string
    jobTitle?: string
  }
  
  // Lifestyle and beliefs (grouped)
  lifestyle: {
    religion?: string
    politics: string
    drinking: string
    smoking?: string
    lifestyle?: string
  }
  
  // Profile content (grouped)
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
  
  // Location (top level)
  location: {
    type: string
    coordinates: number[]
    city: string
    state: string
  }
  
  // Permissions (grouped)
  permissions: {
    notificationPermission: boolean
    locationPermission: boolean
  }
  
  // Account status (grouped)
  accountStatus: {
    isActive: boolean
    status: 'basic' | 'complete' | 'QuizToken' | 'verified' | 'rejected' | 'suspended'
    accountStatus: 'active' | 'suspended' | 'banned'
    backgroundVerification: 'unpaid' | 'pending' | 'approved' | 'rejected'
    isVerified: boolean
    profileCompletion: number
  }
  
  // Timestamps (grouped)
  timestamps: {
    lastActive: string
    createdAt: string
    updatedAt: string
  }
  
  // Admin-specific data (grouped)
  adminData: {
    purchases: {
      total: number
      recent: Array<{
        _id: string
        userId: string
        platform: string
        planName: string
        productId: string
        purchaseToken: string
        status: string
        purchaseDate: string
        expiryDate?: string | null
        rawReceipt: string
        createdAt: string
        updatedAt: string
      }>
    }
    backgroundChecks: {
      total: number
      history: Array<{
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
      }>
    }
    moderation: {
      reports: {
        given: { total: number; recent: any[] }
        received: { total: number; recent: any[] }
      }
      blocks: {
        given: { total: number; recent: any[] }
        received: { total: number; recent: any[] }
      }
    }
    socialActivity: {
      likesGiven: number
      likesReceived: number
      totalMatches: number
    }
  }
}

function UserDetail() {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [userData, setUserData] = useState<UserData | null>(null)
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
    manualVerify?: boolean
  }>({})

  // Plan selection modal state
  const [planSelectionModal, setPlanSelectionModal] = useState<{
    isOpen: boolean
  }>({
    isOpen: false
  })

  // Fetch records modal state
  const [fetchRecordsModal, setFetchRecordsModal] = useState<{
    isOpen: boolean
    data: any
  }>({
    isOpen: false,
    data: null
  })

  useEffect(() => {
      fetchUser()
    fetchBackgroundChecks()
  }, [userId])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await adminApi.getUser(userId!)
      console.log('Full API response:', response)
      console.log('Response data:', response.data)
      
      const apiData = response.data.data
      console.log('API data:', apiData)
      
      // Check if user data exists - handle different possible response structures
      if (!apiData) {
        console.error('No data found in API response:', response.data)
        toast.error('No data found in API response')
        return
      }
      
      // Handle case where user data might be at the root level or nested
      const userData = apiData.user || apiData
      if (!userData || (!userData._id && !userData.id)) {
        console.error('User data not found in API response:', apiData)
        console.error('Expected user object with _id or id, but got:', userData)
        toast.error('User data not found in API response')
        return
      }
      
      // Check if the API response is already in the expected nested structure
      if (userData.personalInfo && userData.adminData) {
        // API response is already in the correct nested structure
        console.log('API response is already in nested structure, processing purchase data')
        
        // Ensure purchase data is properly formatted for the component
        const transformedData: UserData = {
          ...userData,
          adminData: {
            ...userData.adminData,
            purchases: {
              total: userData.adminData.purchases?.total || 0,
              recent: (userData.adminData.purchases?.recent || []).map((purchase: any) => ({
                _id: purchase._id,
                userId: purchase.userId,
                platform: purchase.platform,
                planName: purchase.planName,
                productId: purchase.productId,
                purchaseToken: purchase.purchaseToken,
                status: purchase.status || 'active', // Default to active if not provided
                purchaseDate: purchase.purchaseDate || purchase.createdAt, // Use createdAt as fallback
                expiryDate: purchase.expiryDate || null,
                rawReceipt: purchase.rawReceipt || purchase.purchaseToken, // Use purchaseToken as fallback
                createdAt: purchase.createdAt,
                updatedAt: purchase.updatedAt,
              }))
            }
          }
        }
        setUserData(transformedData)
        return
      }
      
      // Transform flat API response to nested structure expected by components
      const transformedData: UserData = {
        id: userData._id || userData.id,
        firebaseUid: userData.firebaseUid,
        email: userData.email,
        emailVerified: userData.emailVerified,
        
        personalInfo: {
          name: userData.name,
          dateOfBirth: userData.dateOfBirth,
          age: userData.age,
          gender: userData.gender,
          pronoun: userData.pronoun,
          sexuality: userData.sexuality,
          interestedIn: userData.interestedIn || [],
          height: userData.height,
          ethnicity: userData.ethnicity,
          children: userData.children,
          familyPlans: userData.familyPlans,
        },
        
        datingPreferences: {
          datingType: userData.datingType,
          intention: userData.intention,
          relationshipType: userData.relationshipType,
        },
        
        professionalInfo: {
          work: userData.work,
          highestQualification: userData.highestQualification,
          jobTitle: userData.jobTitle,
        },
        
        lifestyle: {
          religion: userData.religion,
          politics: userData.politics,
          drinking: userData.drinking,
          smoking: userData.smoking,
          lifestyle: userData.lifestyle,
        },
        
        profileContent: {
          aboutMe: userData.aboutMe,
          lookingFor: userData.lookingFor,
          thingsILike: userData.thingsILike || [],
          values: userData.values || [],
          images: userData.images || [],
          quizResult: userData.quizResult,
        },
        
        location: userData.location || { type: 'Point', coordinates: [], city: '', state: '' },
        
        permissions: {
          notificationPermission: userData.notificationPermission,
          locationPermission: userData.locationPermission,
        },
        
        accountStatus: {
          isActive: userData.isActive,
          status: userData.status,
          accountStatus: userData.accountStatus,
          backgroundVerification: userData.backgroundVerification,
          isVerified: userData.isVerified,
          profileCompletion: userData.profileCompletion,
        },
        
        timestamps: {
          lastActive: userData.lastActive,
          createdAt: userData.createdAt,
          updatedAt: userData.updatedAt,
        },
        
        adminData: {
          purchases: {
            total: apiData.purchases?.total || 0,
            recent: (apiData.purchases?.recent || []).map((purchase: any) => ({
              _id: purchase._id,
              userId: purchase.userId,
              platform: purchase.platform,
              planName: purchase.planName,
              productId: purchase.productId,
              purchaseToken: purchase.purchaseToken,
              status: purchase.status || 'active', // Default to active if not provided
              purchaseDate: purchase.purchaseDate || purchase.createdAt, // Use createdAt as fallback
              expiryDate: purchase.expiryDate || null,
              rawReceipt: purchase.rawReceipt || purchase.purchaseToken, // Use purchaseToken as fallback
              createdAt: purchase.createdAt,
              updatedAt: purchase.updatedAt,
            }))
          },
          backgroundChecks: apiData.backgroundChecks || { total: 0, history: [] },
          moderation: apiData.moderation || { 
            reports: { given: { total: 0, recent: [] }, received: { total: 0, recent: [] } },
            blocks: { given: { total: 0, recent: [] }, received: { total: 0, recent: [] } }
          },
          socialActivity: apiData.socialActivity || { likesGiven: 0, likesReceived: 0, totalMatches: 0 },
        },
      }
      
      setUserData(transformedData)
    } catch (error) {
      console.error('Error fetching user:', error)
      console.error('Error details:', error)
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
    } catch (err: any) {
      // Only log error if it's not a 404 (endpoint not implemented yet)
      if (err.response?.status !== 404) {
        console.error('Failed to load background checks:', err)
      }
      // Set empty array for background checks when endpoint is not available
      setBackgroundCheckResults([])
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
    // Only check purchase requirement for approve/reject actions, not for pending status
    if (!['unpaid', 'pending'].includes(status) && userData?.accountStatus?.backgroundVerification === 'unpaid') {
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
    if (!userData) return
    if (userData.accountStatus.backgroundVerification !== 'unpaid') {
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
    if (!userData) return
    // Check if user has any active subscription plans
    const hasActivePlan = userData.adminData.purchases.recent.some(purchase => 
      purchase.expiryDate && new Date(purchase.expiryDate) > new Date()
    )
    if (hasActivePlan) {
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

  // Manual verification handler
  const handleManualVerify = async () => {
    if (!userData?.id) return

    try {
      setActionLoading(prev => ({ ...prev, manualVerify: true }))
      const response = await adminApi.fetchPersonRecords({ userId: userData.id })
      
      if (response.data.success) {
        setFetchRecordsModal({
          isOpen: true,
          data: response.data.data
        })
        toast.success('Person records fetched successfully')
      } else {
        toast.error(response.data.message || 'Failed to fetch person records')
      }
    } catch (error: any) {
      console.error('Error fetching person records:', error)
      const errorMessage = error.response?.data?.message || 'Failed to fetch person records'
      toast.error(errorMessage)
    } finally {
      setActionLoading(prev => ({ ...prev, manualVerify: false }))
    }
  }

  // Handle person selection from fetch records
  const handleSelectPersonFromRecords = async (checkId: string, selectedPersonIndex: number) => {
    try {
      setActionLoading(prev => ({ ...prev, manualVerify: true }))
      const response = await adminApi.selectPersonFromRecords({ checkId, selectedPersonIndex })
      
      if (response.data.success) {
        toast.success('Person selected successfully')
        setFetchRecordsModal({ isOpen: false, data: null })
        // Refresh background checks to show updated data
        await fetchBackgroundChecks()
      } else {
        toast.error(response.data.message || 'Failed to select person')
      }
    } catch (error: any) {
      console.error('Error selecting person:', error)
      const errorMessage = error.response?.data?.message || 'Failed to select person'
      toast.error(errorMessage)
    } finally {
      setActionLoading(prev => ({ ...prev, manualVerify: false }))
    }
  }

  const closeBackgroundCheckModal = () => {
    setBackgroundCheckModal({ isOpen: false, type: 'search', data: null })
    setBackgroundCheckResults(null)
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!userData) {
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
        <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
            <button onClick={() => navigate('/users')} className="btn btn-ghost">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          {/* <div>
              <h1 className="text-3xl font-bold gradient-text">User Details</h1>
              <p className="text-var(--text-muted) mt-1">Manage user account and verification status</p>
          </div> */}
        </div>
        
        <div className="flex items-center space-x-3">
          {lastError && retryCount < 3 && (
              <button onClick={handleRetrySearch} disabled={backgroundCheckLoading} className="btn btn-warning btn-sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry ({retryCount}/3)
            </button>
          )}
          </div>
        </div>
        
        {/* {!backgroundCheckResults || backgroundCheckResults.length === 0 ? (
          <div className="mt-4 p-3 bg-var(--bg-tertiary) rounded-lg border border-var(--border)">
            <p className="text-sm text-var(--text-muted)">No automated background checks found for this user. Automation runs when the user updates their profile.</p>
        </div>
        ) : null} */}
      {/* </div> */}

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

        {/* Unified User Detail Card */}
        <div className="glass-card p-6">
          {/* Profile Header Section */}
          <div className="mb-6">
            <UserProfileHeader user={userData} />
          </div>
          
          {/* Main Content Grid with Separators */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Column - User Profile & Activity (8 columns) */}
            <div className="xl:col-span-8 space-y-6">
              {/* Account Status Section */}
              <div>
                <AccountStatusCard 
                  user={userData}
                  accountDetails={userData.accountStatus}
                />
              </div>
              
              {/* Profile Information Section */}
              <div className="border-t border-var(--border-light) pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border-r border-var(--border-light) pr-6">
                    <PersonalInfoCard user={userData} />
                  </div>
                  <div className="pl-6">
                    <LifestylePreferencesCard user={userData} />
                  </div>
                </div>
              </div>
              
              {/* Horizontal Separator */}
              <div className="border-t border-var(--border-light) pt-6">
                <AboutInterestsCard user={userData} />
              </div>
              
              {/* Media Gallery Section */}
              <div className="border-t border-var(--border-light) pt-6">
                <MediaGallery
                  user={userData}
                  onOpenMedia={openMediaModal}
                />
              </div>
              <div className="border-t border-var(--border-light) pt-6">
              <SocialActivityCard 
                      socialActivity={userData.adminData.socialActivity}
                      moderation={userData.adminData.moderation}
                    />
              </div>
              {/* Social Activity & Purchase History Section */}
              {/* <div className="border-t border-var(--border-light) pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="border-r border-var(--border-light) pr-6">
                   
                  </div>
                  
                </div>
              </div> */}
            </div>
                  
            {/* Right Sidebar - Account Management (4 columns) */}
            <div className="xl:col-span-4 border-l border-var(--border-light) pl-6 space-y-6">
              {/* Verification Status Section */}
              <div>
                <VerificationStatusCard
                  user={userData}
                  actionLoading={actionLoading}
                  backgroundCheckResults={backgroundCheckResults}
                  onBackgroundVerification={handleBackgroundVerification}
                  onMarkAsPaid={handleMarkAsPaid}
                  onViewBackgroundChecks={() => setBackgroundCheckModal({ isOpen: true, type: 'history', data: backgroundCheckResults })}
                  onManualVerify={handleManualVerify}
                />
              </div>
              
              {/* Subscription Plan Section */}
              <div className="border-t border-var(--border-light) pt-6">
                <SubscriptionPlanCard
                  user={userData}
                  actionLoading={actionLoading}
                  onMarkPlanAsPaid={handleMarkPlanAsPaid}
                />
              </div>
              
              {/* Notification History Section */}
              <div className="border-t border-var(--border-light) pt-6">
                <NotificationHistoryCard userId={userData.id} />
              </div>
              
              {/* Account Actions Section */}
              <div className="border-t border-var(--border-light) pt-6">
                <AccountActionsCard
                  user={userData}
                  actionLoading={actionLoading}
                  onSuspend={handleSuspendUser}
                  onReactivate={handleReactivateUser}
                  onBan={handleBanUser}
                  onDelete={handleDeleteUser}
                />
              </div>
            </div>
          </div>
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

      <FetchRecordsModal
        isOpen={fetchRecordsModal.isOpen}
        onClose={() => setFetchRecordsModal({ isOpen: false, data: null })}
        data={fetchRecordsModal.data}
        onSelectPerson={handleSelectPersonFromRecords}
        isSelecting={actionLoading.manualVerify}
      />
     </div>
   )
}

export default UserDetail