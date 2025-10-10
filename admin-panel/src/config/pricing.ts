/**
 * Pricing Configuration
 * Frontend pricing for subscription plans and one-time purchases
 */

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  type: 'subscription' | 'one-time';
  duration?: string;
  features?: string[];
}

export const PRICING_PLANS: Record<string, PricingPlan> = {
  'Basic': {
    id: 'Basic',
    name: 'Basic',
    price: 24.99,
    currency: 'USD',
    type: 'subscription',
    duration: '1 month',
    features: [
      'Unlimited likes',
      'See who liked you',
      'Advanced filters',
      'Priority support'
    ]
  },
  'Upgrade': {
    id: 'Upgrade',
    name: 'Upgrade',
    price: 49.99,
    currency: 'USD',
    type: 'subscription',
    duration: '1 month',
    features: [
      'Unlimited likes',
      'See who liked you',
      'Advanced filters',
      'Priority support'
    ]
  },
  'Quarterly': {
    id: 'Quarterly',
    name: 'Quarterly',
    price: 299.99,
    currency: 'USD',
    type: 'subscription',
    duration: '3 months',
    features: [
      'Unlimited likes',
      'See who liked you',
      'Advanced filters',
      'Priority support',
      'Rewind last swipe',
      'Super likes'
    ]
  },
  'background_check_25': {
    id: 'background_check_25',
    name: 'Background Check',
    price: 25,
    currency: 'USD',
    type: 'one-time',
    features: [
      'One-time background verification',
      'Enhanced profile verification',
      'Increased trust score'
    ]
  }
};

/**
 * Get pricing plan by ID
 */
export const getPricingPlan = (planId: string): PricingPlan | null => {
  return PRICING_PLANS[planId] || null;
};

/**
 * Get all subscription plans
 */
export const getSubscriptionPlans = (): PricingPlan[] => {
  return Object.values(PRICING_PLANS).filter(plan => plan.type === 'subscription');
};

/**
 * Get all one-time purchases
 */
export const getOneTimePurchases = (): PricingPlan[] => {
  return Object.values(PRICING_PLANS).filter(plan => plan.type === 'one-time');
};

/**
 * Calculate total revenue from purchase data
 */
export const calculateRevenue = (purchaseData: Array<{ plan: string; count: number }>): number => {
  return purchaseData.reduce((total, item) => {
    const plan = getPricingPlan(item.plan);
    return total + (plan ? plan.price * item.count : 0);
  }, 0);
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};
