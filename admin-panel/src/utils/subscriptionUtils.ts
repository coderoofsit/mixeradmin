/**
 * Utility functions for subscription management
 */

export type SubscriptionStatus = 'active' | 'expired' | 'inactive';

/**
 * Get subscription status based on expiry date
 */
export const getSubscriptionStatus = (expiry: string | null): SubscriptionStatus => {
  if (!expiry) return 'inactive';
  
  const expiryDate = new Date(expiry);
  const now = new Date();
  
  if (expiryDate > now) {
    return 'active';
  } else {
    return 'expired';
  }
};

/**
 * Format purchase type for display
 */
export const formatPurchaseType = (productId: string): string => {
  const typeMap: { [key: string]: string } = {
    'Basic': 'Basic Plan',
    'Upgrade': 'Premium Plan',
    'Quarterly': 'Quarterly Plan',
    'background_check_25': 'Background Check',
    'com.mixerltd.mixerltd.quarterly': 'Quarterly Plan',
    'com.mixerltd.mixerltd.upgrade':"Upgrade Plan",
    'com.mixerltd.mixerltd.basic'	:"Basic Plan"
  };
  
  return typeMap[productId] || productId;
};

/**
 * Get plan badge color based on plan type
 */
export const getPlanBadgeColor = (plan: string | null): string => {
  if (!plan) return 'bg-gray-100 text-gray-800';
  
  const colorMap: { [key: string]: string } = {
    'Basic': 'bg-blue-100 text-blue-800',
    'Upgrade': 'bg-purple-100 text-purple-800',
    'Premium': 'bg-purple-100 text-purple-800',
    'Quarterly': 'bg-green-100 text-green-800',
    'background_check_25': 'bg-orange-100 text-orange-800'
  };
  
  return colorMap[plan] || 'bg-gray-100 text-gray-800';
};

/**
 * Get status badge color
 */
export const getStatusBadgeColor = (status: SubscriptionStatus): string => {
  const colorMap: { [key in SubscriptionStatus]: string } = {
    'active': 'bg-green-100 text-green-800',
    'expired': 'bg-red-100 text-red-800',
    'inactive': 'bg-gray-100 text-gray-800'
  };
  
  return colorMap[status];
};

/**
 * Get platform badge color
 */
export const getPlatformBadgeColor = (platform: string): string => {
  const colorMap: { [key: string]: string } = {
    'apple': 'bg-gray-100 text-gray-800',
    'google': 'bg-green-100 text-green-800'
  };
  
  return colorMap[platform] || 'bg-gray-100 text-gray-800';
};

/**
 * Format date for display
 */
export const formatDate = (date: string | null): string => {
  if (!date) return 'N/A';
  
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Check if date is expired
 */
export const isDateExpired = (date: string | null): boolean => {
  if (!date) return true;
  
  return new Date(date) < new Date();
};

/**
 * Get time until expiry
 */
export const getTimeUntilExpiry = (expiry: string | null): string => {
  if (!expiry) return 'No expiry';
  
  const expiryDate = new Date(expiry);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  
  if (diffMs <= 0) return 'Expired';
  
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day';
  if (diffDays < 7) return `${diffDays} days`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months`;
  
  return `${Math.ceil(diffDays / 365)} years`;
};
