// Backend Stripe configuration
import { v } from "convex/values";
import { action } from "./_generated/server";

// Initialize Stripe
let stripe: any = null;
try {
  const Stripe = require('stripe');
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (stripeSecretKey) {
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia'
    });
  }
} catch (error) {
  console.log("Stripe not available in this environment");
}

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

// Create Stripe checkout session
export const createCheckoutSession = action({
  args: {
    priceId: v.string(),
    userId: v.string(),
    userEmail: v.string(),
    successUrl: v.string(),
    cancelUrl: v.string(),
  },
  handler: async (ctx, args) => {
    if (!stripe) {
      throw new Error("Stripe is not configured");
    }

    try {
      // Get or create Stripe customer
      let customer;
      
      // Search for existing customer by email
      const customers = await stripe.customers.list({
        email: args.userEmail,
        limit: 1
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        // Create new customer
        customer = await stripe.customers.create({
          email: args.userEmail,
          metadata: {
            clerk_user_id: args.userId
          }
        });
      }

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customer.id,
        payment_method_types: ['card'],
        line_items: [
          {
            price: args.priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: args.successUrl,
        cancel_url: args.cancelUrl,
        metadata: {
          userId: args.userId,
        },
        subscription_data: {
          metadata: {
            userId: args.userId,
          }
        },
        allow_promotion_codes: true,
      });

      return {
        sessionId: session.id,
        url: session.url
      };
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
  },
});

// Create Stripe billing portal session
export const createBillingPortalSession = action({
  args: {
    customerId: v.string(),
    returnUrl: v.string(),
  },
  handler: async (ctx, args) => {
    if (!stripe) {
      throw new Error("Stripe is not configured");
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: args.customerId,
        return_url: args.returnUrl,
      });

      return {
        url: session.url
      };
    } catch (error: any) {
      console.error("Error creating billing portal session:", error);
      throw new Error(`Failed to create billing portal session: ${error.message}`);
    }
  },
});