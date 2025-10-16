import { useEffect, useMemo, useState } from 'react'
import { adminApi } from '../services/api'
import toast from 'react-hot-toast'
import CustomDatePicker from '../components/CustomDatePicker'
import ConfirmationModal from '../components/ConfirmationModal'

type BlindDate = {
	_id: string
	scheduledAt: string
	link: string
	isActive: boolean
	createdAt: string
	updatedAt: string
}

const initialForm = { scheduledAt: '', link: '', isActive: true as boolean | undefined }

const BlindDates = () => {
	const [items, setItems] = useState<BlindDate[]>([])
	const [loading, setLoading] = useState(false)
	const [creating, setCreating] = useState(false)
	const [editingId, setEditingId] = useState<string | null>(null)
	const [form, setForm] = useState<typeof initialForm>(initialForm)
	const [filters, setFilters] = useState<{ isActive?: string; from?: string; to?: string }>({ isActive: 'true' })
	const [scheduledAt, setScheduledAt] = useState("");

	// Confirmation modal state
	const [confirmationModal, setConfirmationModal] = useState<{
		isOpen: boolean
		type: 'delete' | null
		loading: boolean
		blindDateId?: string
	}>({
		isOpen: false,
		type: null,
		loading: false
	})

	const load = async () => {
		setLoading(true)
		try {
			const params: any = {}
			if (filters.isActive) params.isActive = filters.isActive
			if (filters.from) params.from = new Date(filters.from).toISOString()
			if (filters.to) params.to = new Date(filters.to).toISOString()
			const { data } = await adminApi.getBlindDates(params)
			setItems(data.data || [])
		} catch (e: any) {
			toast.error(e?.response?.data?.message || 'Failed to load blind dates')
		} finally {
			setLoading(false)
		}
	}

	useEffect(() => { load() // eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const resetForm = () => {
		setForm(initialForm)
		setEditingId(null)
	}

	const onCreate = async () => {
		if (!form.scheduledAt || !form.link) {
			toast.error('scheduledAt and link are required')
			return
		}
		setCreating(true)
		try {
			const payload = {
				scheduledAt: new Date(form.scheduledAt).toISOString(),
				link: form.link.trim()
			}
			await adminApi.createBlindDate(payload)
			toast.success('Created')
			resetForm()
			load()
		} catch (e: any) {
			toast.error(e?.response?.data?.message || 'Failed to create')
		} finally {
			setCreating(false)
		}
	}

	const onUpdate = async () => {
		if (!editingId) return
		try {
			const payload: any = {}
			if (form.scheduledAt) payload.scheduledAt = new Date(form.scheduledAt).toISOString()
			if (form.link) payload.link = form.link.trim()
			if (typeof form.isActive === 'boolean') payload.isActive = form.isActive
			await adminApi.updateBlindDate(editingId, payload)
			toast.success('Updated')
			resetForm()
			load()
		} catch (e: any) {
			toast.error(e?.response?.data?.message || 'Failed to update')
		}
	}

	const onDelete = (id: string) => {
		setConfirmationModal({
			isOpen: true,
			type: 'delete',
			loading: false,
			blindDateId: id
		})
	}

	const handleConfirmDelete = async () => {
		if (!confirmationModal.blindDateId) return

		try {
			setConfirmationModal(prev => ({ ...prev, loading: true }))
			await adminApi.deleteBlindDate(confirmationModal.blindDateId)
			toast.success('Deleted')
			load()
		} catch (e: any) {
			console.error('Error deleting blind date:', e)
			toast.error(e?.response?.data?.message || 'Failed to delete')
		} finally {
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
					title: 'Delete Blind Date',
					message: 'Are you sure you want to delete this blind date? This action cannot be undone.',
					confirmText: 'Delete Blind Date',
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

	const startEdit = (item: BlindDate) => {
		setEditingId(item._id)
		
		// Convert UTC time to local time for the datetime-local input
		const date = new Date(item.scheduledAt)
		const year = date.getFullYear()
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		const hours = String(date.getHours()).padStart(2, '0')
		const minutes = String(date.getMinutes()).padStart(2, '0')
		const localDateTime = `${year}-${month}-${day}T${hours}:${minutes}`
		
		setForm({
			scheduledAt: localDateTime,
			link: item.link,
			isActive: item.isActive
		})
	}

	const formatScheduledDate = (dateString: string) => {
		const date = new Date(dateString)
		const month = String(date.getMonth() + 1).padStart(2, '0')
		const day = String(date.getDate()).padStart(2, '0')
		const year = date.getFullYear()
		
		let hours = date.getHours()
		const minutes = String(date.getMinutes()).padStart(2, '0')
		const ampm = hours >= 12 ? 'PM' : 'AM'
		hours = hours % 12 || 12
		
		return `${month}-${day}-${year} at ${hours}:${minutes} ${ampm}`
	}

	const rows = useMemo(() => items, [items])

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				<div className="flex gap-2">
					<select
						className="form-select"
						value={filters.isActive}
						onChange={(e) => setFilters((f) => ({ ...f, isActive: e.target.value }))}
					>
						<option value="">All</option>
						<option value="true">Active</option>
						<option value="false">Inactive</option>
					</select>
							{/* <CustomDatePicker
								value={filters.from || ''}
								onChange={(date) => setFilters((f) => ({ ...f, from: date }))}
								placeholder="From Date"
								className="form-input rounded-lg"
							/>
							<CustomDatePicker
								value={filters.to || ''}
								onChange={(date) => setFilters((f) => ({ ...f, to: date }))}
								placeholder="To Date"
								className="form-input"
							/> */}
					<button className="btn btn-primary btn-sm" onClick={load}>Filter</button>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 card flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '400px', maxHeight: 'calc(100vh - 150px)' }}>
					<div className="flex items-center justify-between mb-4">
						<h2 className="text-lg font-semibold" style={{color: 'var(--text-primary)'}}>Scheduled</h2>
						{loading && <span className="text-sm" style={{color: 'var(--text-secondary)'}}>Loading...</span>}
					</div>
					<div className="flex-1 overflow-y-auto">
						<table className="table">
							<thead className="table-header">
								<tr>
									<th className="table-header-cell">Date & Time</th>
									<th className="table-header-cell">Link</th>
									<th className="table-header-cell">Active</th>
									<th className="table-header-cell" style={{textAlign: 'center'}}>Actions</th>
								</tr>
							</thead>
							<tbody className="table-body">
								{rows.map((r) => (
									<tr key={r._id} className="table-row">
										<td className="table-cell whitespace-nowrap">{formatScheduledDate(r.scheduledAt)}</td>
										<td className="table-cell max-w-[300px] truncate"><a href={r.link} target="_blank" rel="noreferrer" className="text-var(--text-secondary) underline hover:text-var(--text-primary)">{r.link}</a></td>
										<td className="table-cell">{r.isActive ? 'Yes' : 'No'}</td>
										<td className="table-cell space-x-2 items-center justify-center" style={{textAlign: 'center'}}>
											<button className="btn btn-primary btn-sm" onClick={() => startEdit(r)}>Edit</button>
											<button className="btn btn-danger btn-sm" onClick={() => onDelete(r._id)}>Delete</button>
										</td>
									</tr>
								))}
								{rows.length === 0 && !loading && (
									<tr>
										<td colSpan={4} className="py-6 text-center text-var(--text-muted)">No records</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				<div className="card">
					<h2 className="text-lg font-semibold mb-4" style={{color: 'var(--text-primary)'}}>{editingId ? 'Edit Blind Date' : 'Create Blind Date'}</h2>
					<div className="space-y-3">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
							<label className="block">
								<span className="text-sm" style={{color: 'var(--text-secondary)'}}>Date</span>
								<CustomDatePicker
									value={form.scheduledAt ? form.scheduledAt.split('T')[0] : ''}
									onChange={(date) => {
										const time = form.scheduledAt ? form.scheduledAt.split('T')[1] || '12:00' : '12:00';
										setForm((f) => ({ ...f, scheduledAt: `${date}T${time}` }));
									}}
									placeholder="MM-DD-YYYY"
									className="input"
								/>
							</label>
							<label className="block">
								<span className="text-sm" style={{color: 'var(--text-secondary)'}}>Time</span>
								<input
									type="time"
									className="input"
									value={form.scheduledAt ? form.scheduledAt.split('T')[1] || '12:00' : '12:00'}
									onChange={(e) => {
										const date = form.scheduledAt ? form.scheduledAt.split('T')[0] : new Date().toISOString().split('T')[0];
										setForm((f) => ({ ...f, scheduledAt: `${date}T${e.target.value}` }));
									}}
								/>
							</label>
						</div>
						<label className="block">
							<span className="text-sm" style={{color: 'var(--text-secondary)'}}>Link</span>
							<input
								type="url"
								placeholder="https://meet.example.com/room"
								className="input"
								value={form.link}
								onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))}
							/>
						</label>
						{editingId && (
							<label className="inline-flex items-center gap-2">
								<input type="checkbox" checked={!!form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} />
								<span>Active</span>
							</label>
						)}
						<div className="flex gap-2">
							{editingId ? (
								<>
																<button className="btn btn-primary" onClick={onUpdate}>Update</button>
							<button className="btn btn-outline" onClick={resetForm}>Cancel</button>
								</>
							) : (
								<button className="btn btn-primary" onClick={onCreate} disabled={creating}>
									{creating ? 'Creating...' : 'Create'}
								</button>
							)}
						</div>
					</div>
				</div>
			</div>

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

export default BlindDates


