import { useState, useEffect } from 'react';
import {
	Plus,
	Search,
	Filter,
	Edit,
	Trash2,
	Calendar,
	MapPin,
	Clock,
	Users,
	Upload,
	X,
} from 'lucide-react';
import { adminApi } from '../services/api';
import { Event } from '../types/event';
import { toast } from 'react-hot-toast';
import TagChips from '../components/TagChips';
import LoadingOverlay from '../components/LoadingOverlay';
import LoadingSpinner from '../components/LoadingSpinner';

const Events = () => {
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterType, setFilterType] = useState('all');
	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
	const [formData, setFormData] = useState({
		title: '',
		description: '',
		date: '',
		time: '',
		location: '',
		tags: [] as string[],
		imageUrl: '',
		organizer: '',
		link: '',
	});
	const [tagsInput, setTagsInput] = useState('');
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>('');
	const [uploadingImage, setUploadingImage] = useState(false);
	const [imageInputType, setImageInputType] = useState<'upload' | 'url'>(
		'upload',
	);
	const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [editingTagIndex, setEditingTagIndex] = useState<number | null>(null);
	const [editingTagValue, setEditingTagValue] = useState('');

	const startEditingTag = (index: number, tag: string) => {
		setEditingTagIndex(index);
		setEditingTagValue(tag);
	};

	const handleEditTagSave = (index: number) => {
		const updatedTags = [...formData.tags];
		if (editingTagValue.trim().length > 0) {
			updatedTags[index] = editingTagValue.trim();
			setFormData({ ...formData, tags: updatedTags });
			setEditingTagIndex(null);
			setEditingTagValue('');
		} else {
			setFormData({
				...formData,
				tags: updatedTags.filter((_, i) => i !== index),
			});
			setEditingTagIndex(null);
			setEditingTagValue('');
		}
	};

	const fetchEvents = async () => {
		try {
			setLoading(true);
			const response = await adminApi.getEvents(
				currentPage,
				10,
				searchTerm,
				filterType === 'upcoming' ? 'true' : 'false',
				filterType === 'past' ? 'true' : 'false',
			);

			if (response.data.success) {
				setEvents(response.data.data.events);
				setTotalPages(response.data.data.pagination.pages);
			}
		} catch (error) {
			toast.error('Failed to fetch events');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchEvents();
	}, [currentPage, searchTerm, filterType]);

	const handleImageUpload = async (file: File) => {
		try {
			setUploadingImage(true);
			const formData = new FormData();
			formData.append('media', file);
			formData.append('folder', 'events');

			const response = await adminApi.uploadToCloudinary(formData);

			if (response.data.success) {
				setFormData((prev) => ({ ...prev, imageUrl: response.data.url }));
				toast.success('Image uploaded successfully');
			} else {
				throw new Error('Upload failed');
			}
		} catch (error) {
			toast.error('Failed to upload image');
		} finally {
			setUploadingImage(false);
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImageFile(file);
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleImageUploadClick = async () => {
		if (imageFile) {
			try {
				await handleImageUpload(imageFile);
				// Clear any image URL errors on successful upload
				if (formErrors.imageUrl) {
					setFormErrors((prev) => ({ ...prev, imageUrl: '' }));
				}
			} catch (error) {
				setFormErrors((prev) => ({
					...prev,
					imageUrl: 'Failed to upload image. Please try again.',
				}));
			}
		}
	};

	const removeImage = () => {
		setImageFile(null);
		setImagePreview('');
		setFormData((prev) => ({ ...prev, imageUrl: '' }));
		// Clear any image URL errors when removing image
		if (formErrors.imageUrl) {
			setFormErrors((prev) => ({ ...prev, imageUrl: '' }));
		}
	};

	const switchImageInputType = (type: 'upload' | 'url') => {
		setImageInputType(type);
		// Don't clear existing data when switching modes
		// The user should be able to switch between modes without losing their work

		// Show a helpful message if there's existing image data
		// if (hasImage()) {
		//   toast.success(`Switched to ${type === 'upload' ? 'file upload' : 'image URL'} mode. Your image is preserved.`)
		// }
	};

	// Helper function to get the current image source
	const getCurrentImageSource = () => {
		return imagePreview || formData.imageUrl;
	};

	// Helper function to check if there's an image to display
	const hasImage = () => {
		return !!(imagePreview || formData.imageUrl);
	};

	// Helper function to get field styling with error borders
	const getFieldStyle = (fieldName: string) => {
		const hasError = formErrors[fieldName];
		return `input w-full ${
			hasError ? 'border-var(--error) focus:ring-var(--error)' : ''
		}`;
	};

	// Tags helpers
	const normalizeTags = (raw: string): string[] => {
		return raw
			.split(',')
			.map((t) => t.trim())
			.filter((t) => t.length > 0);
	};

	const addTagsFromInput = (raw: string) => {
		const newOnes = normalizeTags(raw);
		if (newOnes.length === 0) return;

		const existingLower = new Set(formData.tags.map((t) => t.toLowerCase()));
		const merged = [...formData.tags];
		for (const t of newOnes) {
			if (!existingLower.has(t.toLowerCase())) merged.push(t);
		}
		setFormData((prev) => ({ ...prev, tags: merged }));
		setTagsInput('');
		// Clear any tag related errors
		if (formErrors.tags) setFormErrors((prev) => ({ ...prev, tags: '' }));
	};

	const handleTagsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (tagsInput.trim()) addTagsFromInput(tagsInput);
		} else if (e.key === ',') {
			e.preventDefault();
			if (tagsInput.trim()) addTagsFromInput(tagsInput);
		} else if (
			e.key === 'Backspace' &&
			tagsInput === '' &&
			formData.tags.length > 0
		) {
			// Remove last tag when backspace on empty input
			setFormData((prev) => ({ ...prev, tags: prev.tags.slice(0, -1) }));
		}
	};

	const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		// If user typed a comma, commit current token(s)
		if (value.includes(',')) {
			addTagsFromInput(value);
		} else {
			setTagsInput(value);
		}
	};

	const handleTagsBlur = () => {
		if (tagsInput.trim()) addTagsFromInput(tagsInput);
	};

	const removeTag = (index: number) => {
		setFormData((prev) => ({
			...prev,
			tags: prev.tags.filter((_, i) => i !== index),
		}));
	};

	const handleCreateEvent = async () => {
		if (!validateForm()) {
			return;
		}

		try {
			setIsSubmitting(true);
			if (imageFile && !formData.imageUrl) {
				await handleImageUpload(imageFile);
				// Wait a moment for upload to complete
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			await adminApi.createEvent(formData);
			toast.success('Event created successfully');
			setShowCreateModal(false);
			resetForm();
			clearFormErrors();
			fetchEvents();
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Failed to create event');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleUpdateEvent = async () => {
		if (!selectedEvent) return;

		if (!validateForm()) {
			return;
		}

		try {
			setIsSubmitting(true);
			if (imageFile && !formData.imageUrl) {
				await handleImageUpload(imageFile);
				// Wait a moment for upload to complete
				await new Promise((resolve) => setTimeout(resolve, 1000));
			}

			await adminApi.updateEvent(selectedEvent._id, formData);
			toast.success('Event updated successfully');
			setShowEditModal(false);
			resetForm();
			clearFormErrors();
			fetchEvents();
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Failed to update event');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteEvent = async (eventId: string) => {
		if (!confirm('Are you sure you want to delete this event?')) return;

		try {
			await adminApi.deleteEvent(eventId);
			toast.success('Event deleted successfully');
			setShowEditModal(false);
			resetForm();
			fetchEvents();
		} catch (error) {
			toast.error('Failed to delete event');
		}
	};

	const resetForm = () => {
		setFormData({
			title: '',
			description: '',
			date: '',
			time: '',
			location: '',
			tags: [],
			imageUrl: '',
			organizer: '',
			link: '',
		});
		setTagsInput('');
		setSelectedEvent(null);
		setImageFile(null);
		setImagePreview('');
		setImageInputType('upload');
		setFormErrors({});
		setIsSubmitting(false);
	};

	const openCreateModal = () => {
		setSelectedEvent(null);
		resetForm();
		setShowCreateModal(true);
	};

	const openEditModal = (event: Event) => {
		setSelectedEvent(event);
		setFormData({
			title: event.title,
			description: event.description,
			date: event.date.split('T')[0],
			time: event.time,
			location: event.location,
			tags: event.tags,
			imageUrl: event.imageUrl,
			organizer: event.organizer,
			link: event.link,
		});
		setTagsInput(''); // Clear tag input when opening edit modal
		setImagePreview(event.imageUrl);
		setImageFile(null);
		setImageInputType('url'); // Default to URL for existing events
		setShowEditModal(true);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	};

	const formatTime = (timeString: string) => {
		return timeString;
	};

	// Validation functions
	const validateForm = () => {
		const errors: { [key: string]: string } = {};

		// Title validation
		if (!formData.title.trim()) {
			errors.title = 'Title is required';
		} else if (formData.title.trim().length < 3) {
			errors.title = 'Title must be at least 3 characters';
		} else if (formData.title.trim().length > 100) {
			errors.title = 'Title must be less than 100 characters';
		}

		// Description validation
		if (!formData.description.trim()) {
			errors.description = 'Description is required';
		} else if (formData.description.trim().length < 10) {
			errors.description = 'Description must be at least 10 characters';
		} else if (formData.description.trim().length > 1000) {
			errors.description = 'Description must be less than 1000 characters';
		}

		// Date validation
		if (!formData.date) {
			errors.date = 'Date is required';
		} else {
			const selectedDate = new Date(formData.date);
			const today = new Date();
			today.setHours(0, 0, 0, 0);

			if (selectedDate < today) {
				errors.date = 'Event date cannot be in the past';
			}
		}

		// Time validation
		if (!formData.time) {
			errors.time = 'Time is required';
		}

		// Location validation
		if (!formData.location.trim()) {
			errors.location = 'Location is required';
		} else if (formData.location.trim().length < 5) {
			errors.location = 'Location must be at least 5 characters';
		} else if (formData.location.trim().length > 200) {
			errors.location = 'Location must be less than 200 characters';
		}

		// Organizer validation
		if (!formData.organizer.trim()) {
			errors.organizer = 'Organizer is required';
		} else if (formData.organizer.trim().length < 2) {
			errors.organizer = 'Organizer must be at least 2 characters';
		} else if (formData.organizer.trim().length > 100) {
			errors.organizer = 'Organizer must be less than 100 characters';
		}

		// Image validation
		if (!formData.imageUrl.trim()) {
			errors.imageUrl = 'Event image is required';
		} else if (imageInputType === 'url') {
			const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
			if (!urlPattern.test(formData.imageUrl)) {
				errors.imageUrl =
					'Please enter a valid image URL (jpg, jpeg, png, gif, webp)';
			}
		}

		// Tags validation
		if (formData.tags.length > 10) {
			errors.tags = 'Maximum 10 tags allowed';
		}
		formData.tags.forEach((tag, index) => {
			if (tag.length > 50) {
				errors[`tag-${index}`] = 'Each tag must be less than 50 characters';
			}
		});

		// Link validation (required)
		if (!formData.link.trim()) {
			errors.link = 'External link is required';
		} else {
			const urlPattern = /^https?:\/\/.+/i;
			if (!urlPattern.test(formData.link)) {
				errors.link = 'Please enter a valid URL starting with http:// or https://';
			}
		}

		// Set form errors for field styling
		setFormErrors(errors);

		// Show toast notifications for errors (only once)
		if (Object.keys(errors).length > 0) {
			const errorCount = Object.keys(errors).length;
			const errorFields = Object.keys(errors).join(', ');
			toast.error(
				`Please fix ${errorCount} error${
					errorCount > 1 ? 's' : ''
				}: ${errorFields}`,
			);
		}

		return Object.keys(errors).length === 0;
	};

	const clearFormErrors = () => {
		setFormErrors({});
	};

	// Validate individual field on blur
	const validateField = (fieldName: string, value: string) => {
		const errors: { [key: string]: string } = { ...formErrors };

		switch (fieldName) {
			case 'title':
				if (!value.trim()) {
					errors.title = 'Title is required';
				} else if (value.trim().length < 3) {
					errors.title = 'Title must be at least 3 characters';
				} else if (value.trim().length > 100) {
					errors.title = 'Title must be less than 100 characters';
				} else {
					delete errors.title;
				}
				break;
			case 'description':
				if (!value.trim()) {
					errors.description = 'Description is required';
				} else if (value.trim().length < 10) {
					errors.description = 'Description must be at least 10 characters';
				} else if (value.trim().length > 1000) {
					errors.description = 'Description must be less than 1000 characters';
				} else {
					delete errors.description;
				}
				break;
			case 'location':
				if (!value.trim()) {
					errors.location = 'Location is required';
				} else if (value.trim().length < 5) {
					errors.location = 'Location must be at least 5 characters';
				} else if (value.trim().length > 200) {
					errors.location = 'Location must be less than 200 characters';
				} else {
					delete errors.location;
				}
				break;
			case 'organizer':
				if (!value.trim()) {
					errors.organizer = 'Organizer is required';
				} else if (value.trim().length < 2) {
					errors.organizer = 'Organizer must be at least 2 characters';
				} else if (value.trim().length > 100) {
					errors.organizer = 'Organizer must be less than 100 characters';
				} else {
					delete errors.organizer;
				}
				break;
			case 'imageUrl':
				if (!value.trim()) {
					errors.imageUrl = 'Event image is required';
				} else if (imageInputType === 'url') {
					const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
					if (!urlPattern.test(value)) {
						errors.imageUrl =
							'Please enter a valid image URL (jpg, jpeg, png, gif, webp)';
					} else {
						delete errors.imageUrl;
					}
				} else {
					delete errors.imageUrl;
				}
				break;
			case 'link':
				if (value && value.trim()) {
					const urlPattern = /^https?:\/\/.+/i;
					if (!urlPattern.test(value)) {
						errors.link =
							'Please enter a valid URL starting with http:// or https://';
					} else {
						delete errors.link;
					}
				} else {
					delete errors.link;
				}
				break;
		}

		setFormErrors(errors);
	};

	// Helper component for form fields with validation
	const FormField = ({
		label,
		required = false,
		type = 'text',
		value,
		onChange,
		onBlur,
		placeholder,
		error,
		className = '',
		rows = undefined,
		maxLength = undefined,
		showCounter = false,
	}: {
		label: string;
		required?: boolean;
		type?: string;
		value: string;
		onChange: (
			e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
		) => void;
		onBlur?: () => void;
		placeholder?: string;
		error?: string;
		className?: string;
		rows?: number;
		maxLength?: number;
		showCounter?: boolean;
	}) => (
		<div className={className}>
			<div className='flex justify-between items-center mb-1'>
				<label className='block text-sm font-medium text-var(--text-primary)'>
					{label} {required && '*'}
				</label>
				{showCounter && maxLength && (
					<span
						className={`text-xs ${
							value.length > maxLength * 0.9 ? 'text-var(--error)' : 'text-var(--text-muted)'
						}`}
					>
						{value.length}/{maxLength}
					</span>
				)}
			</div>
			{type === 'textarea' ? (
				<textarea
					required={required}
					value={value}
					onChange={onChange}
					onBlur={onBlur}
					rows={rows}
					placeholder={placeholder}
					maxLength={maxLength}
					className={`input w-full ${
						error ? 'border-var(--error) focus:ring-var(--error)' : ''
					}`}
				/>
			) : (
				<input
					type={type}
					required={required}
					value={value}
					onChange={onChange}
					onBlur={onBlur}
					placeholder={placeholder}
					maxLength={maxLength}
					className={`input w-full ${
						error ? 'border-var(--error) focus:ring-var(--error)' : ''
					}`}
				/>
			)}
			{error && <p className='text-var(--error) text-xs mt-1'>{error}</p>}
		</div>
	);

	return (
		<div className='space-y-6 animate-fade-in'>
			<LoadingOverlay isVisible={uploadingImage || isSubmitting} />
			{/* Header */}
			<div className='flex items-center justify-end'>
				<button
					onClick={openCreateModal}
					className='btn btn-primary  flex items-center gap-2'
				>
					<Plus className='h-4 w-4' />
					Create Event
				</button>
			</div>

			{/* Filters */}
			<div className='glass-card mb-4 p-4'>
				<div className='flex flex-col sm:flex-row gap-4'>
					<div className='flex-1'>
						<div className='relative'>
							<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-var(--text-muted) h-4 w-4' />
							<input
								type='text'
								placeholder='Search events...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='input pl-10 w-full'
							/>
						</div>
					</div>
					<div className='flex gap-2'>
						<select
							value={filterType}
							onChange={(e) => setFilterType(e.target.value)}
							className='select'
						>
							<option value='all'>All Events</option>
							<option value='upcoming'>Upcoming</option>
							<option value='past'>Past</option>
						</select>
						<button
							onClick={fetchEvents}
							className='btn btn-primary  flex items-center gap-2'
						>
							<Filter className='h-4 w-4' />
							Filter
						</button>
					</div>
				</div>
			</div>

			{/* Events List */}
			<div className='glass-card p-4 h-full'>
				{loading ? (
					<div className='flex justify-center items-center h-64'>
						<LoadingSpinner size="md" />
					</div>
				) : events.length === 0 ? (
					<div className='text-center py-12'>
						<Calendar className='h-12 w-12 text-var(--text-muted) mx-auto mb-4' />
						<h3 className='text-lg font-medium text-var(--text-primary) mb-2'>
							No events found
						</h3>
						<p className='text-var(--text-muted)'>Create your first event to get started</p>
					</div>
				) : (
					<div className='grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2'>
						{events.map((event) => (
							<div
								key={event._id}
								onClick={() => openEditModal(event)}
								className='glass-card overflow-hidden  cursor-pointer flex flex-col  w-72'
							>
								{/* Image Banner */}
								<div className='relative'>
									<img
										src={event.imageUrl}
										alt={event.title}
										className='w-full h-36 object-cover'
									/>
								</div>

								{/* Event Details */}
								<div className='p-4 flex flex-col flex-grow'>
									<h3 className='text-lg font-bold text-var(--text-primary) mb-0.5'>
										{event.title}
									</h3>
									<p className='text-var(--text-secondary) text-sm mb-3 line-clamp-2'>
										{event.description}
									</p>

									<div className='space-y-1 mb-3'>
										<div className='flex items-center gap-2 text-xs text-var(--text-muted)'>
											<Calendar className='h-3 w-3' />
											<span>
												{formatDate(event.date)} at {formatTime(event.time)}
											</span>
										</div>
										<div className='flex items-center gap-2 text-xs text-var(--text-muted)'>
											<MapPin className='h-3 w-3' />
											<span className='truncate'>{event.location}</span>
										</div>
										<div className='flex items-center gap-2 text-xs text-var(--text-muted)'>
											<Users className='h-3 w-3' />
											<span>By {event.organizer}</span>
										</div>
									</div>

									{event.tags.length > 0 && (
										<div className='flex flex-wrap gap-1 mb-3'>
											{event.tags.map((tag, index) => (
												<span
													key={index}
													className='badge badge-secondary text-xs'
												>
													{tag}
												</span>
											))}
										</div>
									)}

									{/* Spacer to push button to bottom */}
									<div className='flex-grow'></div>

									{/* <div className='flex justify-end mt-auto'>
										<button
											onClick={() => openEditModal(event)}
											className='btn btn-primary btn-sm '
										>
											View Details
										</button>
									</div> */}
								</div>
							</div>
						))}
					</div>
				)}

				{/* Pagination */}
				{totalPages > 1 && (
					<div className='flex justify-center items-center gap-2 pt-4 border-t border-var(--border)'>
						<button
							onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
							disabled={currentPage === 1}
							className='btn btn-ghost btn-sm disabled:opacity-50 disabled:cursor-not-allowed'
						>
							Previous
						</button>
						<span className='px-3 py-2 text-sm text-var(--text-muted)'>
							Page {currentPage} of {totalPages}
						</span>
						<button
							onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
							disabled={currentPage === totalPages}
							className='btn btn-ghost btn-sm disabled:opacity-50 disabled:cursor-not-allowed'
						>
							Next
						</button>
					</div>
				)}
			</div>

			{/* Create Event Modal */}
			{showCreateModal && (
				<div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4'>
					<div className='glass-card w-full max-w-3xl max-h-[85vh] overflow-y-auto'>
						{/* Header */}
						<div className='bg-gradient-primary px-5 py-3 rounded-t-2xl flex justify-between items-center'>
							<h2 className='text-lg sm:text-xl font-semibold text-white'>
								Create New Event
							</h2>
							<button
								onClick={() => setShowCreateModal(false)}
								className='text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10'
							>
								<X className='h-5 w-5' />
							</button>
						</div>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleCreateEvent();
							}}
						>
							<div className='p-4 space-y-4'>
								{/* Image Section */}
								<div>
									<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
										Event Image *
									</label>
									<div className='flex gap-2 mb-2'>
										{['upload', 'url'].map((type) => (
											<button
												key={type}
												type='button'
												onClick={() => switchImageInputType(type as 'upload' | 'url')}
												className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
													imageInputType === type
														? 'btn-primary text-white'
														: 'btn btn-ghost'
												}`}
											>
												{type === 'upload' ? 'Upload Image' : 'Image URL'}
											</button>
										))}
									</div>

									{imageInputType === 'upload' ? (
										<div className='space-y-3'>
											{hasImage() && (
												<div className='relative'>
													<img
														src={getCurrentImageSource()}
														alt='Event preview'
														className='w-full h-40 object-cover rounded-lg border border-var(--border)'
													/>
													<button
														type='button'
														onClick={removeImage}
														className='absolute top-2 right-2 btn btn-danger btn-sm'
													>
														<X className='h-4 w-4 mr-1' />
														Remove
													</button>
												</div>
											)}

											<div className='flex flex-wrap gap-3'>
												<input
													type='file'
													accept='image/*'
													onChange={handleImageChange}
													className='hidden'
													id='image-upload-create'
												/>
												<label
													htmlFor='image-upload-create'
													className='btn btn-ghost cursor-pointer'
												>
													<Upload className='h-4 w-4' />
													Choose Image
												</label>
												{imageFile && (
													<button
														type='button'
														onClick={handleImageUploadClick}
														disabled={uploadingImage}
														className='btn btn-primary  disabled:opacity-50 flex items-center gap-2'
													>
														<Upload className='h-4 w-4' />
														Upload
													</button>
												)}
											</div>
										</div>
									) : (
										<div className='space-y-2'>
											{hasImage() && (
												<div className='relative'>
													<img
														src={getCurrentImageSource()}
														alt='Event preview'
														className='w-full h-40 object-cover rounded-lg border border-var(--border)'
													/>
													<button
														type='button'
														onClick={removeImage}
														className='absolute top-2 right-2 btn btn-danger btn-sm'
													>
														<X className='h-4 w-4 mr-1' />
														Remove
													</button>
												</div>
											)}
											<input
												type='url'
												required
												value={formData.imageUrl}
												onChange={(e) => {
													setFormData({
														...formData,
														imageUrl: e.target.value,
													});
													setImagePreview(e.target.value);
													if (formErrors.imageUrl)
														setFormErrors((prev) => ({
															...prev,
															imageUrl: '',
														}));
												}}
												placeholder='https://example.com/image.jpg'
												className={getFieldStyle('imageUrl')}
											/>
										</div>
									)}
								</div>

								{/* Event Details */}
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
											Title *
										</label>
										<input
											type='text'
											required
											value={formData.title}
											onChange={(e) => setFormData({ ...formData, title: e.target.value })}
											className={getFieldStyle('title')}
										/>
									</div>
									<div>
										<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
											Organizer *
										</label>
										<input
											type='text'
											required
											value={formData.organizer}
											onChange={(e) =>
												setFormData({ ...formData, organizer: e.target.value })
											}
											className={getFieldStyle('organizer')}
										/>
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
										Description *
									</label>
									<textarea
										rows={3}
										required
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										className={getFieldStyle('description')}
									/>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
											Date *
										</label>
										<input
											type='date'
											required
											value={formData.date}
											onChange={(e) => setFormData({ ...formData, date: e.target.value })}
											className={getFieldStyle('date')}
										/>
									</div>
									<div>
										<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
											Time *
										</label>
										<input
											type='time'
											required
											value={formData.time}
											onChange={(e) => setFormData({ ...formData, time: e.target.value })}
											className={getFieldStyle('time')}
										/>
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
										Location *
									</label>
									<input
										type='text'
										required
										value={formData.location}
										onChange={(e) =>
											setFormData({ ...formData, location: e.target.value })
										}
										className={getFieldStyle('location')}
									/>
								</div>
								<div>
									<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
										Tags
									</label>
									<div className='w-full border rounded-lg px-2 py-2 border-var(--border)'>
										<div className='flex flex-wrap items-center gap-2'>
											{formData.tags.map((tag, idx) => (
												<span
													key={idx}
													className='flex items-center gap-1 px-2 py-0.5 badge badge-secondary text-xs rounded-full'
												>
													{editingTagIndex === idx ? (
														<input
															key={`tag-input-${idx}`}
															type='text'
															value={editingTagValue}
															autoFocus
															onChange={(e) => setEditingTagValue(e.target.value)}
															onBlur={() => handleEditTagSave(idx)}
															onKeyDown={(e) => {
																if (e.key === 'Enter') handleEditTagSave(idx);
																else if (e.key === 'Escape') setEditingTagIndex(null);
															}}
															className='bg-transparent outline-none text-var(--text-primary) text-xs border border-var(--primary) rounded px-1'
														/>
													) : (
														<>
															<span
																onClick={() => startEditingTag(idx, tag)}
																className='cursor-text text-var(--primary) text-xs'
																role='textbox'
																tabIndex={0}
																onKeyDown={(e) =>
																	e.key === 'Enter' && startEditingTag(idx, tag)
																}
															>
																{tag}
															</span>
															<button
																type='button'
																onClick={() => removeTag(idx)}
																className='text-var(--text-muted) hover:text-var(--text-primary) text-sm leading-none'
																aria-label={`Remove ${tag}`}
															>
																×
															</button>
														</>
													)}
												</span>
											))}
											<input
												type='text'
												placeholder='Type and press Enter or ,'
												value={tagsInput}
												onChange={handleTagsChange}
												onKeyDown={handleTagsKeyDown}
												onBlur={handleTagsBlur}
												className='flex-1 min-w-[8rem] outline-none text-sm px-1 py-1'
											/>
										</div>
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
										External Link *
									</label>
									<input
										type='url'
										required
										value={formData.link}
										onChange={(e) => setFormData({ ...formData, link: e.target.value })}
										className={getFieldStyle('link')}
									/>
								</div>
							</div>

							{/* Buttons */}
							<div className='bg-var(--bg-tertiary) px-4 py-3 flex justify-end gap-2 rounded-b-2xl'>
								<button
									type='button'
									onClick={() => setShowCreateModal(false)}
									className='btn btn-ghost'
								>
									Cancel
								</button>
								<button
									type='submit'
									disabled={isSubmitting}
									className='btn btn-primary  disabled:opacity-50 flex items-center gap-2'
								>
									Create Event
								</button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit Event Modal */}
			{showEditModal && (
				<div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4'>
					<div className='glass-card w-full max-w-3xl max-h-[85vh] overflow-y-auto'>
						{/* Header */}
						<div className='bg-gradient-primary px-5 py-3 rounded-t-2xl flex justify-between items-center'>
							<h2 className='text-lg sm:text-xl font-semibold text-white'>
								Edit Event
							</h2>
							<button
								onClick={() => setShowEditModal(false)}
								className='text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10'
							>
								<X className='h-5 w-5' />
							</button>
						</div>

						<form
							onSubmit={(e) => {
								e.preventDefault();
								handleUpdateEvent();
							}}
						>
							<div className='p-4 space-y-4'>
								{/* Image Section */}
								<div>
									<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
										Event Image *
									</label>
									<div className='flex gap-2 mb-2'>
										{['upload', 'url'].map((type) => (
											<button
												key={type}
												type='button'
												onClick={() => switchImageInputType(type as 'upload' | 'url')}
												className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
													imageInputType === type
														? 'btn-primary text-white'
														: 'btn btn-ghost'
												}`}
											>
												{type === 'upload' ? 'Upload Image' : 'Image URL'}
											</button>
										))}
									</div>

									{imageInputType === 'upload' ? (
										<div className='space-y-3'>
											{hasImage() && (
												<div className='relative'>
													<img
														src={getCurrentImageSource()}
														alt='Event preview'
														className='w-full h-40 object-cover rounded-lg border border-var(--border)'
													/>
													<button
														type='button'
														onClick={removeImage}
														className='absolute top-2 right-2 btn btn-danger btn-sm'
													>
														<X className='h-4 w-4 mr-1' />
														Remove
													</button>
												</div>
											)}
											<div className='flex flex-wrap gap-3'>
												<input
													type='file'
													accept='image/*'
													onChange={handleImageChange}
													className='hidden'
													id='image-upload-edit'
												/>
												<label
													htmlFor='image-upload-edit'
													className='btn btn-ghost cursor-pointer'
												>
													<Upload className='h-4 w-4' />
													Choose Image
												</label>
												{imageFile && (
													<button
														type='button'
														onClick={handleImageUploadClick}
														disabled={uploadingImage}
														className='btn btn-primary  disabled:opacity-50 flex items-center gap-2'
													>
														<Upload className='h-4 w-4' />
														Upload
													</button>
												)}
											</div>
										</div>
									) : (
										<div className='space-y-2'>
											{hasImage() && (
												<div className='relative'>
													<img
														src={getCurrentImageSource()}
														alt='Event preview'
														className='w-full h-40 object-cover rounded-lg border border-var(--border)'
													/>
													<button
														type='button'
														onClick={removeImage}
														className='absolute top-2 right-2 btn btn-danger btn-sm'
													>
														<X className='h-4 w-4 mr-1' />
														Remove
													</button>
												</div>
											)}
											<input
												type='url'
												required
												value={formData.imageUrl}
												onChange={(e) => {
													setFormData({
														...formData,
														imageUrl: e.target.value,
													});
													setImagePreview(e.target.value);
													if (formErrors.imageUrl)
														setFormErrors((prev) => ({
															...prev,
															imageUrl: '',
														}));
												}}
												placeholder='https://example.com/image.jpg'
												className={getFieldStyle('imageUrl')}
											/>
										</div>
									)}
								</div>

								{/* Event Details */}
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
											Title *
										</label>
										<input
											type='text'
											required
											value={formData.title}
											onChange={(e) => setFormData({ ...formData, title: e.target.value })}
											className={getFieldStyle('title')}
										/>
									</div>
									<div>
										<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
											Organizer *
										</label>
										<input
											type='text'
											required
											value={formData.organizer}
											onChange={(e) =>
												setFormData({ ...formData, organizer: e.target.value })
											}
											className={getFieldStyle('organizer')}
										/>
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
										Description *
									</label>
									<textarea
										rows={3}
										required
										value={formData.description}
										onChange={(e) =>
											setFormData({ ...formData, description: e.target.value })
										}
										className={getFieldStyle('description')}
									/>
								</div>

								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									<div>
										<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
											Date *
										</label>
										<input
											type='date'
											required
											value={formData.date}
											onChange={(e) => setFormData({ ...formData, date: e.target.value })}
											className={getFieldStyle('date')}
										/>
									</div>
									<div>
										<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
											Time *
										</label>
										<input
											type='time'
											required
											value={formData.time}
											onChange={(e) => setFormData({ ...formData, time: e.target.value })}
											className={getFieldStyle('time')}
										/>
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
										Location *
									</label>
									<input
										type='text'
										required
										value={formData.location}
										onChange={(e) =>
											setFormData({ ...formData, location: e.target.value })
										}
										className={getFieldStyle('location')}
									/>
								</div>

								<div>
									<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
										Tags
									</label>
									<div
										className={`w-full border rounded-lg px-2 py-2 ${
											formErrors.tags ? 'border-var(--error)' : 'border-var(--border)'
										}`}
									>
										<div className='flex flex-wrap items-center gap-2'>
											{formData.tags.map((tag, idx) => (
												<span
													key={idx}
													className='flex items-center gap-1 px-2 py-0.5 badge badge-secondary text-xs rounded-full'
												>
													{editingTagIndex === idx ? (
														<input
															type='text'
															value={editingTagValue}
															autoFocus
															onChange={(e) => setEditingTagValue(e.target.value)}
															onBlur={() => handleEditTagSave(idx)}
															onKeyDown={(e) => {
																if (e.key === 'Enter') handleEditTagSave(idx);
																if (e.key === 'Escape') setEditingTagIndex(null);
															}}
															className='bg-transparent outline-none text-var(--text-primary) text-xs'
														/>
													) : (
														<>
															<span
																onClick={() => startEditingTag(idx, tag)}
																className='cursor-text'
															>
																{tag}
															</span>
															<button
																type='button'
																onClick={() => removeTag(idx)}
																className='text-var(--text-muted) hover:text-var(--text-primary)'
															>
																×
															</button>
														</>
													)}
												</span>
											))}
											<input
												type='text'
												placeholder='Type and press Enter or ,'
												value={tagsInput}
												onChange={handleTagsChange}
												onKeyDown={handleTagsKeyDown}
												onBlur={handleTagsBlur}
												className='flex-1 min-w-[8rem] outline-none text-sm px-1 py-1'
											/>
										</div>
									</div>
									{formErrors.tags && (
										<p className='text-var(--error) text-xs mt-1'>{formErrors.tags}</p>
									)}
								</div>

								<div>
									<label className='block text-sm font-medium text-var(--text-primary) mb-1'>
										External Link *
									</label>
									<input
										type='url'
										required
										value={formData.link}
										onChange={(e) => setFormData({ ...formData, link: e.target.value })}
										className={getFieldStyle('link')}
									/>
								</div>
							</div>

							{/* Footer Buttons */}
							<div className='bg-var(--bg-tertiary) px-4 py-3 flex flex-col sm:flex-row justify-between items-center gap-3 rounded-b-2xl'>
								<button
									type='button'
									onClick={() => selectedEvent && handleDeleteEvent(selectedEvent._id)}
									className='w-full sm:w-auto btn btn-danger '
								>
									Delete Event
								</button>

								<div className='flex w-full sm:w-auto gap-2'>
									<button
										type='button'
										onClick={() => setShowEditModal(false)}
										className='w-full sm:w-auto px-4 py-2 border border-var(--border) rounded-md text-var(--text-primary) hover:bg-var(--bg-tertiary) transition'
									>
										Cancel
									</button>
									<button
										type='submit'
										disabled={isSubmitting}
										className='w-full sm:w-auto px-4 py-2 btn-primary text-white rounded-md  disabled:opacity-50 flex items-center justify-center gap-2 transition'
									>
										Update Event
									</button>
								</div>
							</div>
						</form>
					</div>
				</div>
			)}
		</div>
	);
};

export default Events;
