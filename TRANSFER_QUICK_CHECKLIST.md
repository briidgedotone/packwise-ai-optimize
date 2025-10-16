# Transfer Quick Action Checklist

**Use this checklist to track your progress through the transfer process.**

---

## 🚨 CRITICAL - Do These FIRST (Before Sharing Code)

- [ ] **SECURITY: Delete `.env.local` file with exposed API keys**
  ```bash
  rm .env.local
  ```

- [ ] **SECURITY: Remove testing account hardcode**
  - File: `convex/users.ts`
  - Search for: `admin@briidge.one`
  - Remove special token allocation logic

- [ ] **Clean up console.logs** (402 found - optional but recommended)
  ```bash
  # Search for them:
  grep -r "console.log" src/ convex/
  ```

- [ ] **Update README.md**
  - Remove Lovable.dev references
  - Add client-specific information
  - Update setup instructions

---

## 📋 Pre-Transfer Preparation (2 days before)

### Codebase Cleanup
- [ ] Run linter: `npm run lint`
- [ ] Test production build: `npm run build && npm run preview`
- [ ] Remove TODO comments and debug code
- [ ] Verify .gitignore includes .env.local

### Documentation
- [ ] Review [PROJECT_TRANSFER_GUIDE.md](./PROJECT_TRANSFER_GUIDE.md)
- [ ] Update any outdated documentation
- [ ] Create video walkthrough (optional)
- [ ] Prepare FAQ document

### Backup & Version Control
- [ ] Export Convex data (Convex Dashboard → Data → Export)
- [ ] Tag release version:
  ```bash
  git tag -a v1.0.0 -m "Production release for client transfer"
  git push origin v1.0.0
  ```
- [ ] Generate dependency report:
  ```bash
  npm list --depth=0 > dependencies.txt
  ```

---

## 📦 Transfer Day Actions

### Step 1: Repository Transfer (15 mins)
- [ ] Transfer GitHub repo to client's organization
  - OR add client as admin collaborator
- [ ] Verify client has access

### Step 2: Client Service Setup (60 mins) - Guide Client Through:
- [ ] Create Clerk account → Get API keys
- [ ] Create Convex project → Run `npx convex dev --once --configure=new`
- [ ] Create Stripe account → Set up products & webhooks
- [ ] Get OpenAI API key → Set usage limits

### Step 3: Environment Configuration (15 mins)
- [ ] Client creates `.env.local` from template
- [ ] Client fills in all API keys
- [ ] Verify no values are missing

### Step 4: Deploy Backend (30 mins)
- [ ] Client runs: `npm install`
- [ ] Client runs: `npx convex deploy`
- [ ] Configure Clerk in Convex dashboard
- [ ] Verify deployment successful

### Step 5: Deploy Frontend (30 mins)
- [ ] Client deploys to Vercel (or chosen platform)
- [ ] Add environment variables
- [ ] Deploy to production
- [ ] Verify site loads

### Step 6: Configure Webhooks (15 mins)
- [ ] Add Stripe webhook endpoint
- [ ] Test webhook delivery
- [ ] Update webhook secret in environment

### Step 7: Domain Setup (30 mins)
- [ ] Add custom domain (if applicable)
- [ ] Update DNS records
- [ ] Verify SSL certificate

---

## ✅ Testing & Validation (1-2 hours)

### Authentication
- [ ] Sign up new user
- [ ] Email verification
- [ ] Sign in
- [ ] OAuth (Google)
- [ ] Password reset

### Subscription Flow
- [ ] View pricing page
- [ ] Select plan → Stripe checkout
- [ ] Complete test payment
- [ ] Verify webhook received
- [ ] Check token balance

### Core Features
- [ ] **Suite Analyzer:** Upload CSV, run analysis, export PDF
- [ ] **Spec Generator:** Generate specs, verify AI works
- [ ] **Demand Planner:** Configure, forecast, export
- [ ] **PDP Analyzer:** Upload image, analyze, view results

### Token System
- [ ] Token consumption works
- [ ] Refund on failure works
- [ ] Low token warning shows
- [ ] Upgrade prompt displays

### Billing
- [ ] View billing page
- [ ] Upgrade plan
- [ ] Cancel subscription
- [ ] Webhook handles changes

---

## 🔧 Post-Transfer (Within 24 hours)

### Developer Actions
- [ ] Revoke your access to client services
- [ ] Delete local `.env.local`
- [ ] Archive development database
- [ ] Close development API accounts

### Client Actions
- [ ] Change all temporary passwords
- [ ] Enable 2FA on all accounts
- [ ] Set up monitoring/alerts:
  - [ ] Convex usage alerts
  - [ ] Stripe notifications
  - [ ] OpenAI usage alerts
  - [ ] Uptime monitoring (UptimeRobot)
- [ ] Configure error tracking (Sentry)
- [ ] Create admin accounts for team
- [ ] Schedule weekly database backups

---

## 📊 Validation Timeline

### Day 1
- [ ] Application loads at production URL
- [ ] Authentication works
- [ ] Database connected (check Convex dashboard)
- [ ] All 4 features tested

### Week 1
- [ ] Monitor error rates (<1%)
- [ ] Check API usage and costs
- [ ] Verify webhook deliveries
- [ ] Test on multiple browsers/devices

### Month 1
- [ ] Review usage analytics
- [ ] Optimize costs
- [ ] Gather user feedback
- [ ] Schedule security audit

---

## 🆘 Emergency Contacts

**Developer:**
- Name: Punit Singh
- Email: [YOUR_EMAIL]
- Availability: [30 days post-transfer]

**Service Support:**
- Clerk: support@clerk.com
- Convex: support@convex.dev
- Stripe: support@stripe.com
- OpenAI: help.openai.com

---

## 💰 Expected Monthly Costs

| Service | Estimated Cost |
|---------|---------------|
| Clerk | $0-25/month |
| Convex | $25-50/month |
| Stripe | 2.9% + $0.30 per transaction |
| OpenAI | $20-100/month |
| Vercel | $0-20/month |
| **Total** | **$65-195/month** (+ transaction fees) |

---

## ✨ Success Criteria

Transfer is complete when:
- ✅ Client has admin access to all services
- ✅ Application deployed at production URL
- ✅ All 4 features tested and working
- ✅ Subscription flow working end-to-end
- ✅ Webhooks receiving events
- ✅ Token system functioning
- ✅ No secrets in codebase
- ✅ Monitoring configured
- ✅ Client team trained

---

## 📚 Key Documents

1. [PROJECT_TRANSFER_GUIDE.md](./PROJECT_TRANSFER_GUIDE.md) - Complete detailed guide
2. [CLAUDE.md](./CLAUDE.md) - Development guidelines
3. [README.md](./README.md) - Quick start
4. [/docs/algorithms/](./docs/algorithms/) - Technical documentation
5. [/testing-files/](./testing-files/) - Sample CSV files

---

**Print this checklist and check off items as you complete them!**
