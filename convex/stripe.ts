// Backend Stripe configuration
import { v } from "convex/values";
import { action } from "./_generated/server";

// Simple helper to check if Stripe is configured
export const isStripeConfigured = action({
  args: {},
  handler: async (ctx, args) => {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    return {
      configured: !!stripeSecretKey && stripeSecretKey !== '',
      environment: stripeSecretKey?.startsWith('sk_test_') ? 'test' : 
                   stripeSecretKey?.startsWith('sk_live_') ? 'live' : 'none'
    };
  },
});

// Get user's subscription status (placeholder for now)
export const getSubscriptionStatus = action({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    // For now, return a default free plan
    // This will be expanded in later steps
    return {
      planType: 'free',
      status: 'active',
      tokensRemaining: 5, // Free trial tokens
      tokensTotal: 5
    };
  },
});