import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { adminApi } from '../services/api'
import { formatUTCDateTime, isDateExpired } from '../utils/dateUtils'
import { 
  Users as UsersIcon, 
  Download, 
  CheckCircle, 
  UserPlus,
  Trash2,
  Search,
  RefreshCw,
  Filter,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import DataTable from '../components/DataTable'
import ConfirmationModal from '../components/ConfirmationModal'
import { mapGenderForDisplay, getGenderFilterOptions, mapFilterToDatabaseGender } from '../utils/genderUtils'
import toast from 'react-hot-toast'

interface User {
  _id: string;
  name: string;
  email: string;
  accountStatus: 'active' | 'suspended' | 'banned';
  backgroundVerification: 'pending' | 'approved' | 'rejected';
  backgroundVerificationStatus?: {
    status: string;
    verificationMethod: string;
    verificationMethodDisplay: string;
    requiresManualVerification: boolean;
    lastChecked?: string | null;
    notes?: string;
    details: any;
  };
  createdAt: string;
  lastActive: string;
  currentPlan?: string | null;
  planExpiry?: string | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  location?: {
    city?: string | null;
    state?: string | null;
    coordinates?: number[] | null;
  }
  selfie?: {
    url?: string | null;
    uploadedAt?: string | null;
  }
  images?: Array<{ url?: string; isPrimary?: boolean }>
}

function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [bulkInProgress, setBulkInProgress] = useState(false)
  const [bulkTotal, setBulkTotal] = useState(0)
  const [bulkCompleted, setBulkCompleted] = useState(0)
  const [bulkFailed, setBulkFailed] = useState(0)
  const abortBulkRef = useRef(false)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterAccountStatus, setFilterAccountStatus] = useState<string>('all')
  
  
  const [filterGender, setFilterGender] = useState<string>('all')
  const [filterVerification, setFilterVerification] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  
  // Dynamic pagination limit
  const [limit, setLimit] = useState(20) // Default limit

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    type: 'delete' | 'suspend' | 'ban' | 'bulkDelete' | null
    loading: boolean
    userId?: string
    bulkCount?: number
  }>({
    isOpen: false,
    type: null,
    loading: false
  })

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1) // Reset to first page when search changes
    }, 500) // 500ms delay

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchUsers()
  }, [currentPage, debouncedSearchTerm, filterStatus, filterAccountStatus, filterGender, filterVerification, limit])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit,
        search: debouncedSearchTerm,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        accountStatus: filterAccountStatus !== 'all' ? filterAccountStatus : undefined,
        gender: filterGender !== 'all' ? mapFilterToDatabaseGender(filterGender) : undefined,
        backgroundVerification: filterVerification !== 'all' ? filterVerification : undefined
      }
      
      console.log('🔍 Fetching users with params:', params)
      
      const response = await adminApi.getUsers(params)
      console.log('📊 Users API response:', response.data)
      
      setUsers(response.data.data.users)
      setTotalPages(response.data.data.pagination.pages)
    } catch (error) {
      console.error('Error fetching users:', error)
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyUser = async (userId: string, status: 'verified' | 'complete') => {
    try {
      await adminApi.verifyUser(userId, { status })
      toast.success(`User ${status === 'verified' ? 'verified' : 'marked as complete'} successfully`)
      fetchUsers()
    } catch (error) {
      console.error('Error verifying user:', error)
      toast.error('Failed to update user status')
    }
  }

  const handleDeleteUser = (userId: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      loading: false,
      userId
    })
  }

  const handleConfirmDelete = async () => {
    if (!confirmationModal.userId) return

    try {
      setConfirmationModal(prev => ({ ...prev, loading: true }))
      await adminApi.deleteUser(confirmationModal.userId)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    } finally {
      setConfirmationModal({ isOpen: false, type: null, loading: false })
    }
  }

  const handleSuspendUser = (userId: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'suspend',
      loading: false,
      userId
    })
  }

  const handleConfirmSuspend = async (reason: string) => {
    if (!confirmationModal.userId) return

    try {
      setConfirmationModal(prev => ({ ...prev, loading: true }))
      await adminApi.suspendUser(confirmationModal.userId, { reason })
      toast.success('User suspended successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error suspending user:', error)
      toast.error('Failed to suspend user')
    } finally {
      setConfirmationModal({ isOpen: false, type: null, loading: false })
    }
  }

  const handleReactivateUser = async (userId: string) => {
    try {
      await adminApi.reactivateUser(userId)
      toast.success('User reactivated successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error reactivating user:', error)
      toast.error('Failed to reactivate user')
    }
  }

  const handleBanUser = (userId: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'ban',
      loading: false,
      userId
    })
  }

  const handleConfirmBan = async (reason: string) => {
    if (!confirmationModal.userId) return

    try {
      setConfirmationModal(prev => ({ ...prev, loading: true }))
      await adminApi.banUser(confirmationModal.userId, { reason })
      toast.success('User banned successfully')
      fetchUsers()
    } catch (error) {
      console.error('Error banning user:', error)
      toast.error('Failed to ban user')
    } finally {
      setConfirmationModal({ isOpen: false, type: null, loading: false })
    }
  }

  const handleConfirmBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      toast.error('Please select users first')
      return
    }

    try {
      setConfirmationModal(prev => ({ ...prev, loading: true }))
      setBulkInProgress(true)
      setBulkTotal(selectedUsers.length)
      setBulkCompleted(0)
      setBulkFailed(0)

      let completedCount = 0
      let failedCount = 0

      for (const userId of selectedUsers) {
        try {
          await adminApi.deleteUser(userId)
          completedCount++
          setBulkCompleted(prev => prev + 1)
        } catch (err) {
          console.error(`Error deleting user ${userId}:`, err)
          failedCount++
          setBulkFailed(prev => prev + 1)
        }
        await new Promise(res => setTimeout(res, 150))
      }

      const totalDone = completedCount + failedCount

      toast.success(`${totalDone} users processed (${completedCount} success, ${failedCount} failed)`)
      setSelectedUsers([])
      fetchUsers()
    } catch (error) {
      console.error('Error performing bulk delete:', error)
      toast.error('Failed to delete users')
    } finally {
      setBulkInProgress(false)
      setConfirmationModal({ isOpen: false, type: null, loading: false })
    }
  }

  const handleViewUser = (userId: string) => {
    navigate(`/users/${userId}`)
  }

  const toggleSelect = (userId: string) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId])
  }

  const toggleSelectAll = () => {
    if (users.length === 0) return
    const allSelected = users.every(u => selectedUsers.includes(u._id))
    setSelectedUsers(allSelected ? [] : users.map(u => u._id))
  }

  const handleClearAllFilters = () => {
    setFilterStatus('all')
    setFilterAccountStatus('all')
    setFilterVerification('all')
    setFilterGender('all')
    setSearchTerm('')
    setCurrentPage(1)
    setShowFilters(false) // Close filter panel after clearing
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filterStatus !== 'all') count++
    if (filterAccountStatus !== 'all') count++
    if (filterVerification !== 'all') count++
    if (filterGender !== 'all') count++
    if (searchTerm.trim()) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  // Handle confirmation modal actions
  const handleConfirmationConfirm = (inputValue?: string) => {
    if (!confirmationModal.type) return

    switch (confirmationModal.type) {
      case 'delete':
        handleConfirmDelete()
        break
      case 'suspend':
        if (inputValue) handleConfirmSuspend(inputValue)
        break
      case 'ban':
        if (inputValue) handleConfirmBan(inputValue)
        break
      case 'bulkDelete':
        handleConfirmBulkDelete()
        break
    }
  }

  const handleConfirmationCancel = () => {
    setConfirmationModal({ isOpen: false, type: null, loading: false })
  }

  // Get modal configuration based on type
  const getModalConfig = () => {
    switch (confirmationModal.type) {
      case 'delete':
        return {
          title: 'Delete User',
          message: 'Are you sure you want to delete this user? This action cannot be undone.',
          confirmText: 'Delete User',
          type: 'danger' as const,
          requireInput: false,
          showTimer: true
        }
      case 'suspend':
        return {
          title: 'Suspend User',
          message: 'Are you sure you want to suspend this user? Please provide a reason for the suspension.',
          confirmText: 'Suspend User',
          type: 'warning' as const,
          requireInput: true,
          inputLabel: 'Reason for suspension',
          inputPlaceholder: 'Enter the reason for suspending this user...'
        }
      case 'ban':
        return {
          title: 'Ban User',
          message: 'Banned account can not be recovered. Are you sure you want to ban this account?',
          confirmText: 'Ban User',
          type: 'danger' as const,
          requireInput: true,
          inputLabel: 'Reason for ban',
          inputPlaceholder: 'Enter the reason for banning this user...',
          showTimer: true
        }
      case 'bulkDelete':
        return {
          title: 'Delete Users',
          message: `Are you sure you want to delete ${confirmationModal.bulkCount} users? This action cannot be undone.`,
          confirmText: 'Delete Users',
          type: 'danger' as const,
          requireInput: false,
          showTimer: true
        }
      default:
        return {
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          confirmText: 'Confirm',
          type: 'info' as const,
          requireInput: false
        }
    }
  }



  // const handleBulkAction = async (action: 'verify' | 'delete') => {
  //   if (selectedUsers.length === 0) {
  //     toast.error('Please select users first')
  //     return
  //   }

  //   if (action === 'delete' && !window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
  //     return
  //   }

  //   try {
  //     // initialize progress
  //     abortBulkRef.current = false
  //     setBulkInProgress(true)
  //     setBulkTotal(selectedUsers.length)
  //     setBulkCompleted(0)
  //     setBulkFailed(0)

  //     for (const userId of selectedUsers) {
  //       if (abortBulkRef.current) break
  //       try {
  //         if (action === 'verify') {
  //           await adminApi.verifyUser(userId, { status: 'verified' })
  //         } else {
  //           await adminApi.deleteUser(userId)
  //         }
  //         setBulkCompleted(prev => prev + 1)
  //       } catch (err) {
  //         console.error(`Error ${action} user ${userId}:`, err)
  //         setBulkFailed(prev => prev + 1)
  //       }
  //       // small delay to avoid hammering API
  //       await new Promise(res => setTimeout(res, 150))
  //     }

  //     const finalCompleted = abortBulkRef.current ? bulkCompleted : bulkCompleted
  //     const totalDone = (abortBulkRef.current ? bulkCompleted + bulkFailed : bulkCompleted + bulkFailed)
  //     console.log(`Bulk operation completed: ${totalDone} users processed (${finalCompleted} success, ${bulkFailed} failed)`)

  //     if (!abortBulkRef.current) {
  //       toast.success(`${totalDone} users processed (${finalCompleted} success, ${bulkFailed} failed)`) 
  //       setSelectedUsers([])
  //       fetchUsers()
  //     } else {
  //       toast('Bulk operation cancelled')
  //     }
  //     setBulkInProgress(false)
  //   } catch (error) {
  //     console.error(`Error performing bulk ${action}:`, error)
  //     toast.error(`Failed to ${action} users`)
  //   }
  // }


const handleBulkAction = async (action: 'verify' | 'delete') => {
  if (selectedUsers.length === 0) {
    toast.error('Please select users first')
    return
  }

  if (action === 'delete') {
    setConfirmationModal({
      isOpen: true,
      type: 'bulkDelete',
      loading: false,
      bulkCount: selectedUsers.length
    })
    return
  }

  try {
    abortBulkRef.current = false
    setBulkInProgress(true)
    setBulkTotal(selectedUsers.length)
    setBulkCompleted(0)
    setBulkFailed(0)

    let completedCount = 0
    let failedCount = 0

    for (const userId of selectedUsers) {
      if (abortBulkRef.current) break
      try {
        if (action === 'verify') {
          await adminApi.verifyUser(userId, { status: 'verified' })
        } else {
          await adminApi.deleteUser(userId)
        }
        completedCount++
        setBulkCompleted(prev => prev + 1)
      } catch (err) {
        console.error(`Error ${action} user ${userId}:`, err)
        failedCount++
        setBulkFailed(prev => prev + 1)
      }
      await new Promise(res => setTimeout(res, 150))
    }

    const totalDone = completedCount + failedCount

    if (!abortBulkRef.current) {
      toast.success(`${totalDone} users processed (${completedCount} success, ${failedCount} failed)`)
      setSelectedUsers([])
      fetchUsers()
    } else {
      toast('Bulk operation cancelled')
    }
  } catch (error) {
    console.error(`Error performing bulk ${action}:`, error)
    toast.error(`Failed to ${action} users`)
  } finally {
    setBulkInProgress(false)
  }
}

  

  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={users.length > 0 && users.every(u => selectedUsers.includes(u._id))}
          onChange={toggleSelectAll}
          aria-label="Select all users"
        />
      ),
      width: '48px',
      render: (_value: any, row: any) => (
        <input
          type="checkbox"
          checked={selectedUsers.includes(row.id || row._id)}
          onChange={(e) => { e.stopPropagation(); toggleSelect(row.id || row._id) }}
          onClick={(e) => e.stopPropagation()}
          aria-label={`Select ${row.name || row.id}`}
        />
      )
    },
  { key: 'name', label: 'Name' },
  { key: 'ageGender', label: 'Age / Gender' },
  { key: 'location', label: 'Location' },
  { key: 'accountStatus', label: 'Status' },
  { key: 'verification', label: 'Verification' },
  { key: 'createdAt', label: 'Joined', render: (_value: any, row: any) => formatMMDDYYYY(row.createdAt) }
  ]

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'active':
        return 'badge-success'
      case 'suspended':
        return 'badge-warning'
      case 'banned':
        return 'badge-danger'
      default:
        return 'badge-secondary'
    }
  }

  const getVerificationBadgeClass = (user: User) => {
    const status = user.backgroundVerificationStatus?.status
    const methodDisplay = user.backgroundVerificationStatus?.verificationMethodDisplay
    
    // Priority: Check status first, then fallback to verificationMethodDisplay
    if (status === 'rejected') {
      return 'badge-danger'
    } else if (status === 'approved') {
      return 'badge-success'
    } else if (status === 'pending') {
      return 'badge-manually-required'
    }
    
    // Fallback to verificationMethodDisplay if status is not available
    if (!methodDisplay) return 'badge-secondary'
    
    const display = methodDisplay.toLowerCase()
    if (display.includes('approved') || display.includes('verified')) {
      return 'badge-success'
    } else if (display.includes('rejected') || display.includes('failed')) {
      return 'badge-danger'
    } else if (display.includes('pending') || display.includes('manual')) {
      return 'badge-manually-required'
    } else if (display.includes('unpaid')) {
      return 'badge-secondary'
    }
    return 'badge-secondary'
  }

  const getVerificationDisplayText = (user: User) => {
    const status = user.backgroundVerificationStatus?.status
    const methodDisplay = user.backgroundVerificationStatus?.verificationMethodDisplay
    
    // If status is rejected, always show "Rejected" regardless of verificationMethodDisplay
    if (status === 'rejected') {
      return 'Rejected'
    }
    
    // For other cases, use the verificationMethodDisplay
    let displayText = methodDisplay || 'Unknown'
    
    // Replace "Approved Manually" with just "Approved"
    if (displayText === 'Approved Manually') {
      displayText = 'Approved'
    }
    
    return displayText
  }

  const tableData = users.map(user => ({
    ...user,
    id: user._id,
    name: (
      <div className="flex items-center space-x-3">
        {(() => {
          const primaryImage = (user.selfie && (user.selfie.url || null)) || (user.images && user.images.find((img: any) => img.isPrimary)?.url) || null
          if (primaryImage) {
            return (
              <img
                src={primaryImage}
                alt={user.name || user.email}
                className="h-9 w-9 rounded-full object-cover"
              />
            )
          }

          // fallback to initials
          return (
            <div className="h-9 w-9 rounded-full bg-var(--bg-tertiary) flex items-center justify-center text-sm font-medium text-var(--text-secondary)">
              {user.name ? user.name.split(' ').map((n: string) => n[0]).join('').slice(0,2).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : '?')}
            </div>
          )
        })()}

        <div className="flex flex-col">
          <span className="font-medium text-sm text-var(--text-primary)">{user.name || 'N/A'}</span>
          <span className="text-xs text-var(--text-muted)">{user.email}</span>
        </div>
      </div>
    ),
    location: `${user.location?.city || ''}${user.location?.city && user.location?.state ? ', ' : ''}${user.location?.state || ''}` || '—',
    ageGender: (
      <div>
        <div className="text-sm text-var(--text-primary)">{getAgeFromDOB(user.dateOfBirth) || '—'}</div>
        <div className="text-xs text-var(--text-muted)">{mapGenderForDisplay(user.gender)}</div>
      </div>
    ),

    accountStatus: (
      <span className={`badge ${getStatusBadgeClass(user.accountStatus)}`}>
        {user.accountStatus || 'Unknown'}
      </span>
    ),
    verification: (
      <span className={`badge ${getVerificationBadgeClass(user)}`}>
        {getVerificationDisplayText(user)}
      </span>
    )
    ,createdAt: user.createdAt
  }))

  // Compute age from dateOfBirth (years)
  function getAgeFromDOB(dateStr?: string | null) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return ''
    const diff = Date.now() - d.getTime()
    const ageDt = new Date(diff)
    return Math.abs(ageDt.getUTCFullYear() - 1970)
  }

  // Format date as MM-DD-YYYY
  function formatMMDDYYYY(dateStr?: string | null) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (Number.isNaN(d.getTime())) return ''
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const yyyy = d.getFullYear()
    return `${mm}-${dd}-${yyyy}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-end">
        <button 
          onClick={fetchUsers} 
          className="btn btn-primary"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </button>
      </div>

      

      {/* Search and Filters */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-var(--text-secondary)" />
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) placeholder-var(--text-muted) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
            />
          </div>
          
          <button
            onClick={() => {
              const activeFiltersCount = getActiveFiltersCount()
              if (activeFiltersCount > 0) {
                handleClearAllFilters()
              } else {
                setShowFilters(!showFilters)
              }
            }}
            className={`flex items-center px-4 py-2 text-sm font-medium border rounded-lg transition-colors ${
              getActiveFiltersCount() > 0
                ? 'text-var(--error) bg-var(--bg-primary) border-var(--error) hover:bg-var(--error)/10'
                : 'text-var(--text-primary) bg-var(--bg-primary) border-var(--border) hover:bg-var(--bg-secondary)'
            }`}
          >
            {getActiveFiltersCount() > 0 ? (
              <>
                <X className="h-4 w-4 mr-2" />
                Clear Filter
              </>
            ) : (
              <>
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
              </>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div>
              <label className="block text-sm font-medium text-var(--text-secondary) mb-2">
                Account Status
              </label>
              <select
                value={filterAccountStatus}
                onChange={(e) => setFilterAccountStatus(e.target.value)}
                className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-var(--text-secondary) mb-2">
                Verification Status
              </label>
              <select
                value={filterVerification}
                onChange={(e) => setFilterVerification(e.target.value)}
                className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
              >
                <option value="all">All Verification</option>
                <option value="pending">Required Manually</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-var(--text-secondary) mb-2">
                Gender
              </label>
              <select
                value={filterGender}
                onChange={(e) => setFilterGender(e.target.value)}
                className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
              >
                <option value="all">All Genders</option>
                {getGenderFilterOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
     
     {/* Bulk Actions */}
     {selectedUsers.length > 0 && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-var(--text-primary)">
                {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
              </span>
              {bulkInProgress && (
                <div className="flex items-center space-x-2 text-sm text-var(--text-secondary)">
                  <LoadingSpinner size="sm" />
                  <span>Processing... {bulkCompleted}/{bulkTotal}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {/* <button
                onClick={() => handleBulkAction('verify')}
                disabled={bulkInProgress}
                className="btn btn-success btn-sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Verify Selected
              </button> */}
              
              <button
                onClick={() => handleBulkAction('delete')}
                disabled={bulkInProgress}
                className="btn btn-danger btn-sm"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </button>
              
              <button
                onClick={() => setSelectedUsers([])}
                disabled={bulkInProgress}
                className="btn btn-secondary btn-sm"
              >
                Clear Selection
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Data Table */}
      <DataTable
        columns={columns}
        data={tableData}
        loading={loading}
        searchable={false}
        onRowClick={(user) => navigate(`/users/${user._id}`)}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
          limit,
          onLimitChange: setLimit
        }}
        emptyMessage="No users found. Try adjusting your search or filters."
        fullHeight={true}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        loading={confirmationModal.loading}
        onConfirm={handleConfirmationConfirm}
        onCancel={handleConfirmationCancel}
        {...getModalConfig()}
      />
    </div>
  )
}

export default Users 