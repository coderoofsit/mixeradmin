import { useState, useEffect } from 'react'
import { adminApi } from '../services/api'
import { Contact, ContactStatistics } from '../types/contact'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Search, 
  RefreshCw, 
  Filter, 
  ChevronDown, 
  ChevronUp, 
  X,
  Trash2,
  CheckCircle,
  Clock,
  Archive,
  Eye,
  MessageSquare
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'
import DataTable from '../components/DataTable'
import ConfirmationModal from '../components/ConfirmationModal'
import StatsCard from '../components/StatsCard'
import toast from 'react-hot-toast'

interface ContactDetailModalProps {
  contact: Contact | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (contactId: string, updates: { status?: string; notes?: string }) => void;
  updating: boolean;
}

const ContactDetailModal = ({ contact, isOpen, onClose, onUpdate, updating }: ContactDetailModalProps) => {
  const [status, setStatus] = useState(contact?.status || 'pending')
  const [notes, setNotes] = useState(contact?.notes || '')

  useEffect(() => {
    if (contact) {
      setStatus(contact.status)
      setNotes(contact.notes || '')
    }
  }, [contact])

  if (!isOpen || !contact) return null

  const handleSave = () => {
    const updates: { status?: string; notes?: string } = {}
    if (status !== contact.status) updates.status = status
    if (notes !== contact.notes) updates.notes = notes
    
    if (Object.keys(updates).length > 0) {
      onUpdate(contact._id, updates)
    }
  }

  const getAge = (dob: string) => {
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-black/50 backdrop-blur-sm" aria-hidden="true"></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div 
          className="inline-block w-full max-w-3xl overflow-hidden text-left align-middle transition-all transform glass-card animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-6 border-b border-var(--border)">
            <h3 className="text-xl font-bold text-var(--text-primary)">Contact Details</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-var(--bg-secondary) transition-colors"
            >
              <X className="h-5 w-5 text-var(--text-secondary)" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Personal Information */}
            <div className="glass-card p-4">
              <h4 className="text-lg font-semibold text-var(--text-primary) mb-4">Personal Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-var(--text-secondary)">Name</label>
                  <p className="text-var(--text-primary) mt-1">{contact.firstName} {contact.lastName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-var(--text-secondary)">Email</label>
                  <p className="text-var(--text-primary) mt-1 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-var(--text-muted)" />
                    {contact.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-var(--text-secondary)">Phone</label>
                  <p className="text-var(--text-primary) mt-1 flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-var(--text-muted)" />
                    {contact.countryCode} {contact.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-var(--text-secondary)">Location</label>
                  <p className="text-var(--text-primary) mt-1 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-var(--text-muted)" />
                    {contact.location}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-var(--text-secondary)">Age / Gender</label>
                  <p className="text-var(--text-primary) mt-1">
                    {getAge(contact.dateOfBirth)} years old, {contact.gender}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-var(--text-secondary)">Submitted At</label>
                  <p className="text-var(--text-primary) mt-1 flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-var(--text-muted)" />
                    {new Date(contact.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Message */}
            {contact.message && (
              <div className="glass-card p-4">
                <h4 className="text-lg font-semibold text-var(--text-primary) mb-2 flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Message
                </h4>
                <p className="text-var(--text-primary) whitespace-pre-wrap">{contact.message}</p>
              </div>
            )}

            {/* Status Update */}
            <div className="glass-card p-4">
              <h4 className="text-lg font-semibold text-var(--text-primary) mb-4">Update Status</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-var(--text-secondary) mb-2">
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'pending' | 'contacted' | 'resolved' | 'archived')}
                    className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="resolved">Resolved</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-var(--text-secondary) mb-2">
                    Admin Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Add notes about this contact..."
                    className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) placeholder-var(--text-muted) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
                  />
                  <p className="text-xs text-var(--text-muted) mt-1">
                    {notes.length}/1000 characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 p-6 border-t border-var(--border)">
            <button
              onClick={onClose}
              className="btn btn-secondary"
              disabled={updating}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn btn-primary"
              disabled={updating || (status === contact.status && notes === contact.notes)}
            >
              {updating ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span className="ml-2">Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [stats, setStats] = useState<ContactStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [statsLoading, setStatsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [limit, setLimit] = useState(20)
  
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    type: 'delete' | null
    loading: boolean
    contactId?: string
  }>({
    isOpen: false,
    type: null,
    loading: false
  })

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
      setCurrentPage(1)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchContacts()
  }, [currentPage, debouncedSearchTerm, filterStatus, limit])

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchContacts = async () => {
    try {
      setLoading(true)
      const params = {
        page: currentPage,
        limit,
        search: debouncedSearchTerm,
        status: filterStatus !== 'all' ? filterStatus : undefined
      }
      
      const response = await adminApi.getContacts(params)
      setContacts(response.data.data.contacts)
      setTotalPages(response.data.data.pagination.pages)
    } catch (error) {
      console.error('Error fetching contacts:', error)
      toast.error('Failed to load contacts')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const response = await adminApi.getContactStats()
      setStats(response.data.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleViewContact = (contact: Contact) => {
    setSelectedContact(contact)
    setDetailModalOpen(true)
  }

  const handleUpdateContact = async (contactId: string, updates: { status?: string; notes?: string }) => {
    try {
      setUpdating(true)
      await adminApi.updateContact(contactId, updates)
      toast.success('Contact updated successfully')
      setDetailModalOpen(false)
      fetchContacts()
      fetchStats()
    } catch (error) {
      console.error('Error updating contact:', error)
      toast.error('Failed to update contact')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteContact = (contactId: string) => {
    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      loading: false,
      contactId
    })
  }

  const handleConfirmDelete = async () => {
    if (!confirmationModal.contactId) return

    try {
      setConfirmationModal(prev => ({ ...prev, loading: true }))
      await adminApi.deleteContact(confirmationModal.contactId)
      toast.success('Contact deleted successfully')
      fetchContacts()
      fetchStats()
    } catch (error) {
      console.error('Error deleting contact:', error)
      toast.error('Failed to delete contact')
    } finally {
      setConfirmationModal({ isOpen: false, type: null, loading: false })
    }
  }

  const handleClearAllFilters = () => {
    setFilterStatus('all')
    setSearchTerm('')
    setCurrentPage(1)
    setShowFilters(false)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filterStatus !== 'all') count++
    if (searchTerm.trim()) count++
    return count
  }

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'badge-warning'
      case 'contacted':
        return 'badge-info'
      case 'resolved':
        return 'badge-success'
      case 'archived':
        return 'badge-secondary'
      default:
        return 'badge-secondary'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3" />
      case 'contacted':
        return <Phone className="h-3 w-3" />
      case 'resolved':
        return <CheckCircle className="h-3 w-3" />
      case 'archived':
        return <Archive className="h-3 w-3" />
      default:
        return null
    }
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const columns = [
    { 
      key: 'name', 
      label: 'Name',
      render: (_value: any, row: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-var(--text-primary)">
            {row.firstName} {row.lastName}
          </span>
          <span className="text-xs text-var(--text-muted)">{row.email}</span>
        </div>
      )
    },
    { 
      key: 'phone', 
      label: 'Phone',
      render: (_value: any, row: any) => (
        <span className="text-sm text-var(--text-primary)">
          {row.countryCode} {row.phone}
        </span>
      )
    },
    { 
      key: 'location', 
      label: 'Location',
      render: (_value: any, row: any) => (
        <div className="flex items-center text-sm text-var(--text-primary)">
          <MapPin className="h-3 w-3 mr-1 text-var(--text-muted)" />
          {row.location}
        </div>
      )
    },
    { 
      key: 'status', 
      label: 'Status',
      render: (_value: any, row: any) => (
        <span className={`badge ${getStatusBadgeClass(row.status)} flex items-center gap-1 w-fit`}>
          {getStatusIcon(row.status)}
          {row.status}
        </span>
      )
    },
    { 
      key: 'submittedAt', 
      label: 'Submitted',
      render: (_value: any, row: any) => (
        <span className="text-sm text-var(--text-primary)">
          {formatDateTime(row.submittedAt)}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      render: (_value: any, row: any) => (
        <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleViewContact(row)
            }}
            className="p-2 rounded-lg hover:bg-var(--bg-secondary) text-var(--text-secondary) hover:text-var(--primary) transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleDeleteContact(row._id)
            }}
            className="p-2 rounded-lg hover:bg-var(--bg-secondary) text-var(--text-secondary) hover:text-var(--error) transition-colors"
            title="Delete Contact"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      )
    }
  ]

  const tableData = contacts.map(contact => ({
    ...contact,
    id: contact._id
  }))

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Contacts"
          value={stats?.total || 0}
          icon={Mail}
          loading={statsLoading}
        />
        <StatsCard
          title="Today"
          value={stats?.today || 0}
          icon={Calendar}
          loading={statsLoading}
        />
        <StatsCard
          title="Pending"
          value={stats?.byStatus.pending || 0}
          icon={Clock}
          loading={statsLoading}
        />
        <StatsCard
          title="Contacted"
          value={stats?.byStatus.contacted || 0}
          icon={Phone}
          loading={statsLoading}
        />
        <StatsCard
          title="Resolved"
          value={stats?.byStatus.resolved || 0}
          icon={CheckCircle}
          loading={statsLoading}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-end">
        <button 
          onClick={() => {
            fetchContacts()
            fetchStats()
          }} 
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
              placeholder="Search by name, email, or location..."
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
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-var(--border) rounded-lg bg-var(--bg-primary) text-var(--text-primary) focus:outline-none focus:ring-2 focus:ring-var(--primary)"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="contacted">Contacted</option>
                <option value="resolved">Resolved</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={tableData}
        loading={loading}
        searchable={false}
        onRowClick={(contact) => handleViewContact(contact as Contact)}
        pagination={{
          currentPage,
          totalPages,
          onPageChange: setCurrentPage,
          limit,
          onLimitChange: setLimit
        }}
        emptyMessage="No contacts found. Try adjusting your search or filters."
        fullHeight={true}
      />

      {/* Contact Detail Modal */}
      <ContactDetailModal
        contact={selectedContact}
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        onUpdate={handleUpdateContact}
        updating={updating}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        loading={confirmationModal.loading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmationModal({ isOpen: false, type: null, loading: false })}
        title="Delete Contact"
        message="Are you sure you want to delete this contact? This action cannot be undone."
        confirmText="Delete Contact"
        type="danger"
        showTimer={true}
      />
    </div>
  )
}

export default Contacts

