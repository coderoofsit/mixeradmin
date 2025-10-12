/**
 * Utility functions for consistent date formatting across the admin panel
 */

/**
 * Formats a date string to display in UTC timezone to preserve original server time
 * @param dateString - ISO date string from API
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string
 */
export const formatUTCDate = (
  dateString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    const formatted = date.toLocaleDateString('en-US', options)
    // Convert from MM/DD/YYYY to MM-DD-YYYY format
    return formatted.replace(/\//g, '-')
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

/**
 * Formats a date for display without time (date only)
 * @param dateString - ISO date string from API
 * @returns Formatted date string without time
 */
export const formatUTCDateOnly = (dateString: string | null | undefined): string => {
  return formatUTCDate(dateString, {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

/**
 * Formats a date for display with full date and time
 * @param dateString - ISO date string from API
 * @returns Formatted date string with time
 */
export const formatUTCDateTime = (dateString: string | null | undefined): string => {
  return formatUTCDate(dateString, {
    timeZone: 'UTC',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

/**
 * Checks if a date is in the past (expired)
 * @param dateString - ISO date string from API
 * @returns boolean indicating if date is in the past
 */
export const isDateExpired = (dateString: string | null | undefined): boolean => {
  if (!dateString) return false
  
  try {
    return new Date(dateString) <= new Date()
  } catch (error) {
    console.error('Error checking date expiry:', error)
    return false
  }
}
