import { useEffect, useMemo, useState } from 'react'
import { adminApi } from '../services/api'
import toast from 'react-hot-toast'

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

	const onDelete = async (id: string) => {
		if (!confirm('Delete this blind date?')) return
		try {
			await adminApi.deleteBlindDate(id)
			toast.success('Deleted')
			load()
		} catch (e: any) {
			toast.error(e?.response?.data?.message || 'Failed to delete')
		}
	}

	const startEdit = (item: BlindDate) => {
		setEditingId(item._id)
		setForm({
			scheduledAt: new Date(item.scheduledAt).toISOString().slice(0, 16),
			link: item.link,
			isActive: item.isActive
		})
	}

	const rows = useMemo(() => items, [items])

	return (
		<div>
			<div className="flex items-center justify-between mb-6">
				{/* <div className="flex gap-2">
					<select
						className="form-select"
						value={filters.isActive}
						onChange={(e) => setFilters((f) => ({ ...f, isActive: e.target.value }))}
					>
						<option value="">All</option>
						<option value="true">Active</option>
						<option value="false">Inactive</option>
					</select>
					<input type="date" className="form-input" value={filters.from || ''} onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))} />
					<input type="date" className="form-input" value={filters.to || ''} onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))} />
					<button className="btn btn-primary btn-sm" onClick={load}>Filter</button>
				</div> */}
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
									<th className="table-header-cell text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="table-body">
								{rows.map((r) => (
									<tr key={r._id} className="table-row">
										<td className="table-cell whitespace-nowrap">{new Date(r.scheduledAt).toLocaleString()}</td>
										<td className="table-cell max-w-[300px] truncate"><a href={r.link} target="_blank" rel="noreferrer" className="text-var(--text-secondary) underline hover:text-var(--text-primary)">{r.link}</a></td>
										<td className="table-cell">{r.isActive ? 'Yes' : 'No'}</td>
										<td className="table-cell text-right space-x-2">
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
						<label className="block">
							<span className="text-sm" style={{color: 'var(--text-secondary)'}}>Scheduled At</span>
							<input
								type="datetime-local"
								className="input"
								value={form.scheduledAt}
								onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
							/>
						</label>
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
		</div>
	)
}

export default BlindDates


