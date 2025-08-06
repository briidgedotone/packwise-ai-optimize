# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

QuantiPackAI is an AI-powered packaging optimization platform built with React, TypeScript, and Convex. The application provides four core tools for businesses to reduce packaging costs and improve efficiency.

## Essential Commands

### Development
```bash
npm run dev           # Start frontend (Vite) and backend (Convex) concurrently
npm run dev:frontend  # Start Vite dev server only
npm run dev:backend   # Start Convex backend only
```

### Build & Deploy
```bash
npm run build         # Production build
npm run build:dev     # Development build
npm run preview       # Preview production build locally
```

### Code Quality
```bash
npm run lint          # Run ESLint on the codebase
```

## Architecture Overview

### Tech Stack
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui components
- **Backend**: Convex (BaaS), Clerk authentication
- **Routing**: React Router DOM with protected routes
- **State**: React Query, Convex real-time subscriptions

### Directory Structure
```
src/
├── pages/              # Route pages (Dashboard, Index, SignIn, etc.)
├── components/         # Feature components and UI
│   ├── ui/            # shadcn/ui components (40+ components)
│   └── charts/        # Data visualization components
├── lib/               # Core business logic
│   ├── algorithms/    # Optimization algorithms
│   ├── calculations/  # CUIN, cost, and packaging calculations
│   ├── data/         # CSV parsing and data processing
│   └── suiteAnalyzer/# Suite analysis engine
└── providers/        # Context providers (Convex + Clerk)

convex/               # Backend functions and schema
├── schema.ts        # Database schema definitions
├── auth.config.ts   # Clerk authentication setup
└── *.ts            # Convex functions (mutations, queries, actions)
```

### Core Features

1. **Packaging Suite Analyzer** (`PackagingSuiteAnalyzer.tsx`, `PackagingSuiteAnalyzerBackend.tsx`)
   - CSV upload and analysis
   - Cost optimization algorithms
   - Multi-step analysis flow with loading states

2. **Spec Generator** (`SpecGenerator.tsx`)
   - AI-powered specification generation
   - Template-based outputs

3. **Packaging Demand Planner** (`PackagingDemandPlanner.tsx`)
   - Forecasting and demand analysis
   - Usage tracking in database

4. **PDP Analyzer** (`PDPAnalyzer.tsx`)
   - Principal Display Panel optimization
   - Compliance checking

### Key Patterns

#### Authentication Flow
- Clerk handles authentication via `ConvexClerkProvider`
- Protected routes use `ProtectedRoute` component
- User data synced to Convex database on sign-in

#### Data Processing
- CSV files parsed client-side using custom parser (`lib/data/csvParser.ts`)
- CUIN calculations have comprehensive validation (`lib/calculations/cuin.ts`)
- Backend analysis runs as Convex actions for long-running operations

#### Error Handling
- `ErrorBoundary` component wraps the app
- Form validation using Zod schemas
- Toast notifications via Sonner

### Database Schema (Convex)

Key tables:
- `users`: Extended user profiles with organization links
- `organizations`: Multi-tenant support with plan types
- `analyses`: Stores results from all analysis tools
- `files`: Uploaded file management
- `demandPlannerUsage`: Usage tracking for rate limiting

### Testing

Custom test implementation in `src/lib/calculations/__tests__/cuin.test.ts` for CUIN calculations. No Jest/Vitest setup - tests are self-contained TypeScript files.

Sample test data available in `/testing-files/` directory with CSV examples.

### Development Notes

- Path aliases configured: `@/*` maps to `./src/*`
- Concurrent dev mode runs both Vite and Convex
- Environment variables needed for Clerk and Convex (see `.env.local`)
- UI components from shadcn/ui - use their CLI for adding new components
- All new features should follow existing patterns for consistency