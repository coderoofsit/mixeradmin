import React, { useEffect, useState } from 'react'
import { adminApi } from '../services/api'
import { Plus, RefreshCw, Edit, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmationModal from '../components/ConfirmationModal'

interface VenueItem {
  _id?: string
  name: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  capacity?: number
}

function Venue() {
  const [loading, setLoading] = useState(false)
  const [venues, setVenues] = useState<VenueItem[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<VenueItem | null>(null)
  
  // Loading states for venue actions
  const [actionLoading, setActionLoading] = useState<{
    save?: boolean
    delete?: boolean
  }>({})

  const [form, setForm] = useState<VenueItem>({ name: '', address: '', city: '', state: '', zipCode: '', capacity: 0 })

  // Confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean
    type: 'delete' | null
    loading: boolean
    venueId?: string
  }>({
    isOpen: false,
    type: null,
    loading: false
  })

  const fetchVenues = async () => {
    try {
      setLoading(true)
      const res = await adminApi.getVenues({ page: 1, limit: 50 })
      const data = res.data.data
      setVenues(data.items || data.venues || data || [])
    } catch (e) {
      console.error(e)
      toast.error('Failed to load venues')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchVenues() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm({ name: '', address: '', city: '', state: '', zipCode: '', capacity: 0 })
    setShowForm(true)
  }

  const openEdit = (v: VenueItem) => {
    setEditing(v)
    setForm({
      _id: v._id,
      name: v.name || '',
      address: v.address || '',
      city: v.city || '',
      state: v.state || '',
      zipCode: v.zipCode || '',
      capacity: v.capacity || 0,
    })
    setShowForm(true)
  }

  const save = async () => {
    try {
      if (!form.name.trim()) return toast.error('Name is required')
      setActionLoading(prev => ({ ...prev, save: true }))
      if (editing && editing._id) {
        await adminApi.updateVenue(editing._id, form)
        toast.success('Venue updated')
      } else {
        await adminApi.createVenue(form)
        toast.success('Venue created')
      }
      setShowForm(false)
      fetchVenues()
    } catch (e) {
      console.error(e)
      toast.error('Save failed')
    } finally {
      setActionLoading(prev => ({ ...prev, save: false }))
    }
  }

  const remove = (id?: string) => {
    if (!id) return
    setConfirmationModal({
      isOpen: true,
      type: 'delete',
      loading: false,
      venueId: id
    })
  }

  const handleConfirmDelete = async () => {
    if (!confirmationModal.venueId) return

    try {
      setConfirmationModal(prev => ({ ...prev, loading: true }))
      setActionLoading(prev => ({ ...prev, delete: true }))
      await adminApi.deleteVenue(confirmationModal.venueId)
      toast.success('Venue deleted')
      fetchVenues()
    } catch (e) {
      console.error('Error deleting venue:', e)
      toast.error('Delete failed')
    } finally {
      setActionLoading(prev => ({ ...prev, delete: false }))
      setConfirmationModal({ isOpen: false, type: null, loading: false })
    }
  }

  const handleConfirmationConfirm = () => {
    switch (confirmationModal.type) {
      case 'delete':
        handleConfirmDelete()
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
          title: 'Delete Venue',
          message: 'Are you sure you want to delete this venue? This action cannot be undone.',
          confirmText: 'Delete Venue',
          type: 'danger' as const,
          requireInput: false,
          showTimer: false
        }
      default:
        return {
          title: 'Confirm Action',
          message: 'Are you sure you want to proceed?',
          confirmText: 'Confirm',
          type: 'info' as const,
          requireInput: false,
          showTimer: false
        }
    }
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-end">
        <div className="space-x-2">
          <button onClick={fetchVenues} className="btn btn-secondary btn-sm"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={openCreate} className="btn btn-primary btn-sm"><Plus className="h-4 w-4 mr-1" />New Venue</button>
        </div>
      </div>

      <div className="glass-card flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '400px', maxHeight: 'calc(100vh - 150px)' }}>
        <div className="flex-1 overflow-y-auto">
          {venues.length === 0 && !loading && (
            <div className="flex items-center justify-center h-full" style={{color: 'var(--text-secondary)'}}>
              <div className="text-center">
                <div className="text-4xl mb-4">🏢</div>
                <div className="text-lg font-medium">No venues found</div>
                <div className="text-sm mt-1" style={{color: 'var(--text-muted)'}}>Create your first venue to get started</div>
              </div>
            </div>
          )}
          {venues.map(v => (
          <div key={v._id} className="p-4 flex items-center justify-between hover:bg-var(--bg-tertiary)">
            <div>
              <div className="font-medium" style={{color: 'var(--text-primary)'}}>{v.name}</div>
              <div className="text-sm" style={{color: 'var(--text-secondary)'}}>
                {[v.address, v.city, v.state, v.zipCode].filter(Boolean).join(', ')}
              </div>
              {typeof v.capacity === 'number' && (
                <div className="text-xs" style={{color: 'var(--text-muted)'}}>Capacity: {v.capacity}</div>
              )}
            </div>
            <div className="space-x-2">
              <button onClick={() => openEdit(v)} className="btn btn-secondary btn-sm"><Edit className="h-3 w-3 mr-1" />Edit</button>
              <button 
                onClick={() => remove(v._id)} 
                disabled={actionLoading.delete}
                className="btn btn-danger btn-sm"
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {actionLoading.delete ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
          ))}
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <LoadingSpinner size="md" className="mx-auto mb-4" />
                <div className="text-gray-500">Loading venues...</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={(e) => e.target === e.currentTarget && setShowForm(false)}>
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg">
            <div className="p-4 border-b font-semibold">{editing ? 'Edit Venue' : 'New Venue'}</div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Address</label>
                <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full border rounded-md px-3 py-2" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">City</label>
                  <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">State</label>
                  <input value={form.state} onChange={e => setForm({ ...form, state: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Zip</label>
                  <input value={form.zipCode} onChange={e => setForm({ ...form, zipCode: e.target.value })} className="w-full border rounded-md px-3 py-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Capacity</label>
                <input type="number" value={form.capacity || 0} onChange={e => setForm({ ...form, capacity: Number(e.target.value) })} className="w-full border rounded-md px-3 py-2" />
              </div>
            </div>
            <div className="p-4 border-t flex items-center justify-end space-x-2">
              <button onClick={() => setShowForm(false)} className="btn btn-secondary">Cancel</button>
              <button 
                onClick={save} 
                disabled={actionLoading.save}
                className="btn btn-primary"
              >
                {actionLoading.save ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

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

export default Venue


