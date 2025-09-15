// Convex HTTP endpoints
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

// HTTP router
const http = httpRouter();

// Stripe webhook endpoint
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.text();
      const signature = request.headers.get("stripe-signature");

      if (!signature) {
        console.error("No Stripe signature found");
        return new Response("No signature", { status: 400 });
      }

      // Process the webhook
      const result = await ctx.runAction(internal.webhooks.processStripeWebhook, {
        body,
        signature,
      });

      if (result.success) {
        return new Response("OK", { status: 200 });
      } else {
        return new Response(result.error || "Webhook processing failed", { 
          status: 400 
        });
      }
    } catch (error) {
      console.error("Webhook error:", error);
      return new Response("Internal server error", { status: 500 });
    }
  }),
});

export default http;