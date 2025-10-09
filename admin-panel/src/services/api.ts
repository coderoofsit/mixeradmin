import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL ? `${import.meta.env.VITE_BACKEND_URL}/api/v1` : 'http://localhost:3000/api/v1'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only auto-logout on 401 for non-login/profile endpoints to avoid redirect loops
    if (error.response?.status === 401 && 
        !error.config?.url?.includes('/admin/auth/profile') &&
        !error.config?.url?.includes('/admin/auth/login')) {
      localStorage.removeItem('adminToken')
      // Don't force redirect - let React handle the navigation
      // The useAuth hook will detect missing token and show login page
    }
    return Promise.reject(error)
  }
)

// Admin API
export const adminApi = {
  // Authentication
  login: (email: string, password: string) =>
    api.post('/admin/auth/login', { email, password }),
  
  getProfile: () => api.get('/admin/auth/profile'),
  
  updateProfile: (data: any) => api.put('/admin/auth/profile', data),
  
  // Dashboard
  getDashboardStats: () => api.get('/admin/auth/dashboard/stats'),
  
  getServerActivity: () => api.get('/admin/auth/server/activity'),
  
  // Analytics
  getAnalytics: (params?: any) => api.get('/admin/auth/analytics/detailed', { params }),
  getRevenueAnalytics: (params?: any) => api.get('/admin/analytics/revenue', { params }),
  getPurchaseTrends: (params?: any) => api.get('/admin/analytics/purchase-trends', { params }),
  
  // Growth Data
  getGrowthData: (type: string, params?: any) => api.get(`/admin/auth/dashboard/growth/${type}`, { params }),
  
  // Users
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  
  getUserStats: () => api.get('/admin/users/stats'),
  
  getUser: (userId: string) => api.get(`/admin/users/${userId}`),
  

  

  
  deleteUser: (userId: string) => api.delete(`/admin/users/${userId}`),
  
  verifyUser: (userId: string, data: any) => api.post(`/admin/users/${userId}/verify`, data),
  
  // New User Management Endpoints
  suspendUser: (userId: string, data: any) => 
    api.post(`/admin/users/${userId}/suspend`, data),
  
  reactivateUser: (userId: string) => 
    api.post(`/admin/users/${userId}/reactivate`),
  
  banUser: (userId: string, data: any) => 
    api.post(`/admin/users/${userId}/ban`, data),
  
  // New User Verification Endpoints

  
  updateUserBackgroundVerification: (userId: string, data: any) =>
    api.post(`/admin/users/${userId}/background-verification`, data),

  markBackgroundVerificationAsPaid: (userId: string, data?: any) =>
    api.post(`/admin/users/${userId}/background-verification/mark-paid`, data || {}),

  markPlanAsPaid: (userId: string, data?: any) =>
    api.post(`/admin/users/${userId}/plan/mark-paid`, data || {}),

  // Super Admin Configuration API
  getSuperAdminConfig: () =>
    api.get('/admin/auth/super-admin/config'),

  updateSuperAdminConfig: (data: any) =>
    api.put('/admin/auth/super-admin/config', data),

  updateSuperAdminPassword: (data: any) =>
    api.put('/admin/auth/super-admin/password', data),

  // Admin Management API
  getAllAdmins: () =>
    api.get('/admin/auth/admins'),

  createAdmin: (data: any) =>
    api.post('/admin/auth/admins', data),

  updateAdminStatus: (adminId: string, updates: any) =>
    api.put(`/admin/auth/admins/${adminId}/status`, updates),

  // Background Check API
  searchPersonDetails: (data: any) => 
    api.post('/admin/background-check/search-person', data),
  
  selectPersonFromSearchResults: (data: any) => 
    api.post('/admin/background-check/select-person', data),
  
  checkBackgroundReport: (data: any) => 
    api.post('/admin/background-check/check-background', data),
  
  getBackgroundCheckHistory: (params?: any) => 
    api.get('/admin/background-check/history', { params }),

  // New Organizers - Enhanced with all new endpoints
  getOrganizers: (params?: any) => api.get('/admin/organizers', { params }),
  
  getOrganizerStats: () => api.get('/admin/organizers/stats'),
  
  getOrganizer: (organizerId: string) => api.get(`/admin/organizers/${organizerId}`),
  
  createOrganizer: (data: any) => api.post('/admin/organizers', data),
  
  updateOrganizer: (organizerId: string, data: any) => api.put(`/admin/organizers/${organizerId}`, data),
  
  deleteOrganizer: (organizerId: string) => api.delete(`/admin/organizers/${organizerId}`),
  
  verifyOrganizer: (organizerId: string, data: any) => api.post(`/admin/organizers/${organizerId}/verify`, data),
  
  // New Organizer Verification Endpoints

  
  updateOrganizerBackgroundVerification: (organizerId: string, data: any) =>
    api.post(`/admin/organizers/${organizerId}/background-verification`, data),

  

  // Feedback
  getFeedback: (params?: any) => api.get('/admin/feedback', { params }),
  getFeedbackById: (feedbackId: string) => api.get(`/admin/feedback/${feedbackId}`),
  deleteFeedback: (feedbackId: string) => api.delete(`/admin/feedback/${feedbackId}`),
  processFeedback: (
    feedbackId: string,
    data: { action: 'approve' | 'reject'; processedFeedback?: string; adminNotes?: string }
  ) => api.put(`/admin/feedback/${feedbackId}/process`, data),
  sendFeedback: (feedbackId: string, data: { message?: string }) =>
    api.post(`/admin/feedback/${feedbackId}/send`, data),
  bulkProcessFeedback: (
    data: { feedbackIds: string[]; action: 'approve' | 'reject'; processedFeedback?: string; adminNotes?: string }
  ) => api.put('/admin/feedback/bulk-process', data),
  getFeedbackStats: () => api.get('/admin/feedback/stats'),

  // Venues
  createVenue: (data: any) => api.post('/admin/venues', data),
  getVenues: (params?: any) => api.get('/admin/venues', { params }),
  updateVenue: (venueId: string, data: any) => api.put(`/admin/venues/${venueId}`, data),
  deleteVenue: (venueId: string) => api.delete(`/admin/venues/${venueId}`),
  getVenueStats: () => api.get('/admin/venues/stats'),

  // Blind Dates (Admin)
  getBlindDates: (params?: { isActive?: boolean; from?: string; to?: string }) =>
    api.get('/blind-date/admin', { params }),
  createBlindDate: (data: { scheduledAt: string; link: string }) =>
    api.post('/blind-date/admin', data),
  updateBlindDate: (id: string, data: { scheduledAt?: string; link?: string; isActive?: boolean }) =>
    api.put(`/blind-date/admin/${id}`, data),
  deleteBlindDate: (id: string) =>
    api.delete(`/blind-date/admin/${id}`),


  // Event Management API calls (Admin)
  getEvents: (page: number = 1, limit: number = 10, search: string = '', upcoming: string = 'all', past: string = 'all') =>
    api.get(`/admin/events?page=${page}&limit=${limit}&search=${search}&upcoming=${upcoming}&past=${past}`),
  getEventById: (id: string) => api.get(`/admin/events/${id}`),
  createEvent: (eventData: any) => api.post('/admin/events', eventData),
  updateEvent: (id: string, eventData: any) => api.put(`/admin/events/${id}`, eventData),
  deleteEvent: (id: string) => api.delete(`/admin/events/${id}`),
  getEventStats: () => api.get('/admin/events/stats'),

  // Analytics API (duplicate removed - using the one above)

  // Cloudinary Upload API
  uploadToCloudinary: (formData: FormData) =>
    api.post('/upload/media', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
}

export default api 