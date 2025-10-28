/**
 * Platform Fees and Costs Configuration
 * Define all platform fees and operational costs
 * 
 * USAGE:
 * - Update these values to reflect actual costs and fees
 * - Apple/Google fees are percentages (0-1, e.g., 0.30 = 30%)
 * - SearchBug cost is a fixed amount per API call in USD
 * 
 * NOTES:
 * - The dashboard assumes a 50/50 split between Apple and Google purchases
 * - To track actual platform distribution, add platform field to purchase data
 */

export interface PlatformFees {
  apple: number; // Percentage (0-1)
  google: number; // Percentage (0-1)
  searchBugPerCall: number; // Fixed cost per API call in USD
}

export const PLATFORM_FEES: PlatformFees = {
  apple: 0.30, // 30% Apple App Store fee (industry standard)
  google: 0.30, // 30% Google Play Store fee (industry standard)
  searchBugPerCall: 2.50, // $2.50 per SearchBug API call (update with actual cost)
};

/**
 * Calculate platform fee for a purchase
 */
export const calculatePlatformFee = (amount: number, platform: string): number => {
  const platformLower = platform.toLowerCase();
  
  if (platformLower === 'apple' || platformLower === 'ios') {
    return amount * PLATFORM_FEES.apple;
  } else if (platformLower === 'google' || platformLower === 'android') {
    return amount * PLATFORM_FEES.google;
  }
  
  return 0; // No fee for other platforms
};

/**
 * Calculate SearchBug API costs
 */
export const calculateSearchBugCosts = (apiCallCount: number): number => {
  return apiCallCount * PLATFORM_FEES.searchBugPerCall;
};

/**
 * Calculate net revenue from gross revenue
 */
export const calculateNetRevenue = (
  grossRevenue: number,
  appleFees: number,
  googleFees: number,
  searchBugCosts: number
): number => {
  return grossRevenue - appleFees - googleFees - searchBugCosts;
};

