// Frontend Stripe configuration
import { loadStripe } from '@stripe/stripe-js';

// Get publishable key from environment
const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

// Initialize Stripe
export const stripePromise = stripePublishableKey 
  ? loadStripe(stripePublishableKey)
  : null;

// Pricing configuration
export const PRICING_CONFIG = {
  starter: {
    monthly: {
      priceId: import.meta.env.VITE_STRIPE_STARTER_MONTHLY_PRICE_ID || '',
      amount: 3999, // $39.99
      tokens: 50
    },
    yearly: {
      priceId: import.meta.env.VITE_STRIPE_STARTER_YEARLY_PRICE_ID || '',
      amount: 31900, // $319.00
      tokens: 50
    }
  },
  professional: {
    monthly: {
      priceId: import.meta.env.VITE_STRIPE_PROFESSIONAL_MONTHLY_PRICE_ID || '',
      amount: 9999, // $99.99
      tokens: 150
    },
    yearly: {
      priceId: import.meta.env.VITE_STRIPE_PROFESSIONAL_YEARLY_PRICE_ID || '',
      amount: 79900, // $799.00
      tokens: 150
    }
  }
};

// Helper function to check if Stripe is configured
export const isStripeConfigured = (): boolean => {
  return !!stripePublishableKey;
};