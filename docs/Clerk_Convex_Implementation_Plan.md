# QuantiPackAI - Clerk + Convex Implementation Plan

## Tech Stack Decision

### 🔐 **Clerk** - Authentication
- **Why Clerk:**
  - Pre-built UI components for sign-up/sign-in
  - Multi-factor authentication support
  - Social login providers (Google, GitHub, etc.)
  - User management dashboard
  - JWT tokens with React hooks
  - Perfect for B2B SaaS applications

### ⚡ **Convex** - Backend & Database
- **Why Convex:**
  - Real-time database with TypeScript
  - Built-in file storage
  - Serverless functions
  - Real-time subscriptions
  - Excellent developer experience
  - Perfect for data-intensive applications like QuantiPackAI

---

## Implementation Steps

### Phase 1: Setup & Configuration (Week 1)

#### Step 1.1: Install Dependencies
```bash
# Clerk
npm install @clerk/nextjs @clerk/react

# Convex
npm install convex
npx convex dev

# Additional utilities
npm install @clerk/clerk-sdk-node
```

#### Step 1.2: Clerk Configuration
- [ ] Create Clerk application at https://clerk.com
- [ ] Configure authentication providers
- [ ] Set up environment variables
- [ ] Configure Clerk middleware
- [ ] Create sign-in/sign-up pages

#### Step 1.3: Convex Setup
- [ ] Initialize Convex project
- [ ] Configure Convex schema
- [ ] Set up development environment
- [ ] Configure file storage
- [ ] Set up real-time subscriptions

#### Step 1.4: Integration
- [ ] Connect Clerk with Convex for user management
- [ ] Set up JWT validation in Convex
- [ ] Configure user context throughout app

---

## Database Schema Design

### Tables Needed

#### 1. **Users** (Managed by Clerk + Extended in Convex)
```typescript
// Convex users table (extends Clerk data)
export const users = defineTable({
  clerkId: v.string(),
  email: v.string(),
  name: v.string(),
  organizationId: v.optional(v.id("organizations")),
  role: v.union(v.literal("admin"), v.literal("user")),
  createdAt: v.number(),
  lastLoginAt: v.number(),
}).index("by_clerk_id", ["clerkId"]);
```

#### 2. **Organizations**
```typescript
export const organizations = defineTable({
  name: v.string(),
  slug: v.string(),
  planType: v.union(v.literal("individual"), v.literal("corporate"), v.literal("enterprise")),
  createdAt: v.number(),
  settings: v.object({
    allowedFileTypes: v.array(v.string()),
    maxFileSize: v.number(),
    retentionDays: v.number(),
  }),
}).index("by_slug", ["slug"]);
```

#### 3. **Analyses**
```typescript
export const analyses = defineTable({
  userId: v.id("users"),
  organizationId: v.optional(v.id("organizations")),
  type: v.union(
    v.literal("suite_analyzer"),
    v.literal("spec_generator"), 
    v.literal("demand_planner"),
    v.literal("pdp_analyzer")
  ),
  name: v.string(),
  status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  inputFiles: v.array(v.id("files")),
  results: v.optional(v.any()),
  createdAt: v.number(),
  completedAt: v.optional(v.number()),
}).index("by_user", ["userId"]).index("by_organization", ["organizationId"]);
```

#### 4. **Files**
```typescript
export const files = defineTable({
  userId: v.id("users"),
  organizationId: v.optional(v.id("organizations")),
  name: v.string(),
  type: v.string(), // CSV, Excel, Image, etc.
  purpose: v.union(
    v.literal("order_history"),
    v.literal("packaging_suite"),
    v.literal("usage_log"),
    v.literal("manual_mix"),
    v.literal("pdp_image"),
    v.literal("competitor_image")
  ),
  storageId: v.string(), // Convex file storage ID
  size: v.number(),
  uploadedAt: v.number(),
}).index("by_user", ["userId"]);
```

#### 5. **Reports**
```typescript
export const reports = defineTable({
  analysisId: v.id("analyses"),
  userId: v.id("users"),
  type: v.union(v.literal("pdf"), v.literal("csv")),
  storageId: v.string(),
  generatedAt: v.number(),
}).index("by_analysis", ["analysisId"]);
```

#### 6. **Usage Logs** (for Demand Planner)
```typescript
export const usageLogs = defineTable({
  userId: v.id("users"),
  organizationId: v.optional(v.id("organizations")),
  date: v.string(), // YYYY-MM-DD
  packageType: v.string(),
  quantityUsed: v.number(),
  createdAt: v.number(),
}).index("by_user_date", ["userId", "date"]);
```

---

## API Functions (Convex)

### Authentication Functions

#### `users.ts`
```typescript
// Create or update user from Clerk
export const createOrUpdateUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Implementation
  },
});

// Get user by Clerk ID
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

### File Management Functions

#### `files.ts`
```typescript
// Upload file
export const uploadFile = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    purpose: v.string(),
    storageId: v.string(),
    size: v.number(),
  },
  handler: async (ctx, args) => {
    // Implementation
  },
});

// Get files by user
export const getFilesByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

### Analysis Functions

#### `suiteAnalyzer.ts`
```typescript
// Create suite analysis
export const createSuiteAnalysis = mutation({
  args: {
    name: v.string(),
    orderHistoryFileId: v.id("files"),
    packagingSuiteFileId: v.id("files"),
    baselineMixFileId: v.optional(v.id("files")),
    fallbackDimensions: v.optional(v.object({
      smallest: v.object({ l: v.number(), w: v.number(), h: v.number() }),
      average: v.object({ l: v.number(), w: v.number(), h: v.number() }),
      largest: v.object({ l: v.number(), w: v.number(), h: v.number() }),
    })),
  },
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

#### `demandPlanner.ts`
```typescript
// Create demand plan
export const createDemandPlan = mutation({
  args: {
    name: v.string(),
    totalOrders: v.number(),
    forecastPeriod: v.string(),
    mixSource: v.union(v.literal("usage-log"), v.literal("manual")),
    mixFileId: v.id("files"),
    packagingSuiteFileId: v.id("files"),
    safetyStock: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Implementation
  },
});
```

---

## Frontend Integration

### App Structure Updates

#### `src/providers/ConvexClerkProvider.tsx`
```typescript
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
```

#### Update `src/App.tsx`
```typescript
import { ConvexClerkProvider } from "@/providers/ConvexClerkProvider";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";

const App = () => (
  <ConvexClerkProvider>
    <SignedIn>
      {/* Existing app content */}
    </SignedIn>
    <SignedOut>
      <RedirectToSignIn />
    </SignedOut>
  </ConvexClerkProvider>
);
```

### Authentication Pages

#### `src/pages/SignIn.tsx`
```typescript
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <SignIn 
        appearance={{
          elements: {
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
          },
        }}
        redirectUrl="/dashboard"
      />
    </div>
  );
}
```

### Protected Routes

#### `src/components/ProtectedRoute.tsx`
```typescript
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />;
  }

  return <>{children}</>;
}
```

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Set up Clerk authentication
- [ ] Initialize Convex backend
- [ ] Create database schema
- [ ] Implement user management

### Week 2: File Management
- [ ] Set up Convex file storage
- [ ] Create file upload components
- [ ] Implement file processing pipelines
- [ ] Add file validation

### Week 3-4: Core Features
- [ ] Implement Suite Analyzer backend
- [ ] Implement Demand Planner backend (updated version)
- [ ] Implement Spec Generator backend
- [ ] Create calculation engines

### Week 5: Advanced Features
- [ ] Implement PDP Analyzer
- [ ] Add report generation
- [ ] Create dashboard analytics
- [ ] Implement real-time updates

### Week 6: Polish & Deploy
- [ ] Testing and optimization
- [ ] Error handling
- [ ] Performance tuning
- [ ] Production deployment

---

## Environment Variables

### `.env.local`
```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Convex
NEXT_PUBLIC_CONVEX_URL=https://...convex.cloud
CONVEX_DEPLOY_KEY=...

# OpenAI (for Spec Generator)
OPENAI_API_KEY=sk-...
```

---

## Benefits of This Stack

### 🚀 **Developer Experience**
- Type-safe throughout the stack
- Real-time updates without websockets
- Built-in authentication flows
- Excellent debugging tools

### 🔒 **Security**
- Enterprise-grade authentication
- Automatic GDPR compliance
- Secure file storage
- JWT-based API protection

### ⚡ **Performance**
- Edge-optimized authentication
- Real-time database updates
- Serverless scaling
- CDN-distributed file storage

### 🛠 **Maintenance**
- Managed infrastructure
- Automatic backups
- Built-in monitoring
- Zero DevOps overhead

---

## Next Steps

1. **Start with Clerk setup** - Get authentication working first
2. **Initialize Convex** - Set up the backend foundation
3. **Create schemas** - Define the data structure
4. **Build incrementally** - One feature at a time
5. **Test thoroughly** - Ensure reliability and performance

This stack will give us a production-ready, scalable foundation for QuantiPackAI that can handle the complex data processing requirements while providing an excellent user experience.