# Convex Environment Variables Setup

## Required Environment Variables for New Convex Project

You need to add these environment variables in your Convex Dashboard:

1. Go to: https://dashboard.convex.dev/d/effervescent-minnow-863/settings/environment-variables

2. Add the following variables:

### CLERK_JWT_ISSUER_DOMAIN
```
https://rational-thrush-28.clerk.accounts.dev
```

### OPENAI_API_KEY (if using AI features)
```
your_openai_api_key_here
```

## Steps:
1. Open the Convex Dashboard link above
2. Click "Add Variable"
3. Name: `CLERK_JWT_ISSUER_DOMAIN`
4. Value: `https://rational-thrush-28.clerk.accounts.dev`
5. Click "Save"

## After Setting Variables:
Run `npx convex dev` again to deploy successfully.

## Your New Convex Details:
- **Dashboard**: https://dashboard.convex.dev/d/effervescent-minnow-863
- **Convex URL**: https://effervescent-minnow-863.convex.cloud
- **Deployment**: dev:effervescent-minnow-863