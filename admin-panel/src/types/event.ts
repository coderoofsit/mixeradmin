// Event interface for the new event system
export interface Event {
  _id: string
  title: string
  description: string
  date: string
  time: string
  location: string
  tags: string[]
  imageUrl: string
  organizer: string
  link: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Event creation/update form data
export interface EventFormData {
  title: string
  description: string
  date: string
  time: string
  location: string
  tags: string[]
  imageUrl: string
  organizer: string
  link: string
}

// Event statistics
export interface EventStats {
  totalEvents: number
  upcomingEvents: number
  pastEvents: number
}

// Event list response
export interface EventListResponse {
  success: boolean
  data: {
    events: Event[]
    pagination: {
      current: number
      pages: number
      total: number
    }
  }
}

// Event response
export interface EventResponse {
  success: boolean
  data: Event
}

// Event stats response
export interface EventStatsResponse {
  success: boolean
  data: EventStats
}
