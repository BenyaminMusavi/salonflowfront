<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SalonFlow Frontend - Agent Guide

## Project Overview

SalonFlow is a salon management system web application built with Next.js 16.2.4 (App Router) and React 19. It's a Persian/Farsi application (RTL) for the Iranian market, featuring Toman currency support and Jalali (Persian) date handling.

**Current Status**: Early development (v0.1.0) - Core architecture established, some implementations incomplete.

## Tech Stack

### Core
- **Framework**: Next.js 16.2.4 with App Router
- **React**: 19.2.4
- **TypeScript**: ^5
- **Runtime**: Node ^20

### Styling
- **Tailwind CSS**: v4 (beta) - uses `@tailwindcss/postcss`
- **CSS Pattern**: CSS custom properties with `@theme inline` block
- **Utility**: `cn()` function combining `clsx` + `tailwind-merge`
- **CVA**: `class-variance-authority` for component variants

### State Management
- **Zustand**: ^5.0.12 (global state - auth tokens, business context)
- **TanStack React Query**: ^5.99.2 (server state)

### Form Handling
- **React Hook Form**: ^7.73.1
- Custom wrappers: `InputReactHookForm`, `SelectReactHookForm`

### UI Components
- **Radix UI**: Unstyled primitives (`@radix-ui/react-dialog`, `select`, `switch`, `avatar`, `label`, `slot`)
- **Motion**: ^12.38.0 (Framer Motion for animations)
- **Icons**: `@phosphor-icons/react`, `lucide-react`

### HTTP & API
- **Axios**: ^1.15.1 with `axios-case-converter` (automatic snake_case ↔ camelCase)
- **Cookies Next**: ^6.1.1 for cookie management
- **UUID**: ^14.0.0 for request ID generation

### Localization
- **jalaali-js**: ^1.2.8 (Jalali calendar)
- **moment-jalaali**: ^0.10.4 (Jalali date formatting)

## Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout (RTL, providers, fonts)
│   ├── page.tsx                 # Home page
│   ├── (home)/                  # Public pages route group
│   │   ├── page.tsx
│   │   └── components/          # Home-specific components
│   ├── (private-routes)/        # Authenticated pages route group
│   │   ├── layout.tsx
│   │   └── dashboard/
│   └── common/
│       └── providers/
│           └── Providers.tsx    # Context providers composition
├── services/                    # Business logic & API layer
│   ├── authentication-store/
│   │   └── useTokenStore.ts     # Zustand auth store
│   ├── common/
│   │   ├── apiAddress.ts        # API endpoint constants
│   │   ├── data-types/
│   │   │   └── SharedDataTypes.ts
│   │   └── http/
│   │       └── axios-instance.ts    # Configured Axios with interceptors
│   └── domains/                 # Domain-specific services
│       └── service-type/
│           ├── services-type.service.ts
│           ├── hooks/
│           └── types/
├── shared/                      # Shared across entire app
│   ├── assets/
│   │   └── fonts/              # Ravi font files
│   ├── components/
│   │   ├── primitives/         # Base UI (Radix-based)
│   │   │   ├── button/        # CVA variants
│   │   │   ├── input/         # With RHF wrappers
│   │   │   ├── select/        # Mobile drawer adaptation
│   │   │   ├── dialog/
│   │   │   ├── switch/
│   │   │   ├── avatar/
│   │   │   └── ...
│   │   └── composites/         # Complex components
│   │       ├── currency/       # Toman formatting
│   │       ├── date-picker/    # Jalali date picker
│   │       ├── layout/         # Navigation components
│   │       └── upload-file/
│   ├── data/
│   │   └── routeAddress.ts      # Route constants
│   ├── hooks/                   # Custom hooks (currently empty)
│   ├── styles/
│   │   └── globals.css          # Global styles + Tailwind v4 import
│   └── utils/
│       ├── className.ts         # cn() utility
│       ├── currency/            # Currency system (Facade pattern)
│       ├── date-handler/        # Date system (Builder + Strategy patterns)
│       └── handleFormError.ts   # RHF error handler
```

## Code Patterns & Conventions

### Naming Conventions
- **Components**: PascalCase (`HomeHeader.tsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Types/Interfaces**: PascalCase with `I` prefix (`IServiceType`)
- **Hooks**: `use` prefix (`useQueryServiceTypes`)
- **Stores**: `useXStore` pattern (`useTokenStore`)
- **Constants**: UPPER_SNAKE_CASE (`SERVICE_TYPE_QUERY_KEY`)

### Import Aliases
- `@/*` maps to `src/*`
- `@/shared/*`: shared components, utils, styles
- `@/services/*`: business logic layer
- `@/app/*`: Next.js app directory

### Component Patterns
- **Server Components**: Default (no "use client")
- **Client Components**: Explicit `"use client"` directive
- **Provider Composition**: `composeProvider` pattern in Providers.tsx
- **ForwardRef**: Used for interactive primitives
- **Display Name**: Set for all forwarded components

### Styling Patterns
- Tailwind utility classes as primary styling method
- `cn()` for conditional classes: `cn("base-class", condition && "conditional-class")`
- CVA for variant-based components (button, badge)
- Theme tokens via CSS custom properties (defined in `@theme inline` block)

### Data Fetching
- Service classes with static methods (e.g., `ServicesTypeService`)
- Custom hooks wrapping React Query (`useQueryServiceTypes`)
- Query keys as constants in service files
- Axios instance handles auth, headers, case conversion

### API Layer
- Centralized Axios instance with interceptors
- Request: Adds auth token from Zustand/cookies, X-Request-ID header
- Response: Unwraps `.data`, handles 401 with refresh logic
- Base URL from `NEXT_PUBLIC_API_DOMAIN` env variable

## Critical Issues to Fix

### 1. Tailwind CSS Import (FIXED)
- **File**: `src/shared/styles/globals.css`
- **Status**: Added `@import "tailwindcss";` at top
- **Impact**: Tailwind utilities now work

### 2. Broken CSS Import in Private Routes (FIXED)
- **File**: `src/app/(private-routes)/layout.tsx`
- **Status**: Changed `import "./globals.css"` to `import "@/shared/styles/globals.css"`
- **Impact**: Build no longer fails

### 3. Missing `useMediaQuery` Hook
- **File**: `src/shared/components/primitives/select/Select.tsx`
- **Issue**: Imports from `@/shared/hooks/useMediaQuery` which doesn't exist
- **Fix Needed**: Implement hook or use `window.matchMedia` directly

### 4. Missing `useCurrentBusinessStore`
- **File**: `src/shared/components/composites/layout/bottom-navigation/BottomNavigation.tsx`
- **Issue**: Imports non-existent store from `@/services/business/useCurrentBusinessStore`
- **Fix Needed**: Create store or remove dependency

### 5. Incomplete RouteAddress
- **File**: `src/shared/data/routeAddress.ts`
- **Issue**: Only defines `home: "/"`, missing FINANCE, INVENTORY, REPORTS, CREATE routes
- **Fix Needed**: Define all required route constants

### 6. Undefined Tailwind Theme Tokens
- **Issue**: Components use `bg-surface-tertiary`, `text-content-primary`, etc.
- **Status**: These tokens NOT defined in `@theme inline` block
- **Fix Needed**: Define all theme tokens in `globals.css`

### 7. Missing `@radix-ui/react-icons` Package
- **Issue**: Components reference `@radix-ui/react-icons` (CheckIcon, etc.)
- **Status**: Not in package.json dependencies
- **Fix Needed**: Install or replace with existing icon libraries (Phosphor, Lucide)

## Configuration Files

### postcss.config.mjs
```javascript
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};
export default config;
```

### tsconfig.json
- Path alias: `"@/*": ["./src/*"]`
- Strict mode enabled
- JSX: `react-jsx`

### .env
- `NEXT_PUBLIC_API_DOMAIN=http://localhost:5001`

## Development Workflow

### Component Development
1. Create in `src/shared/components/primitives/` or `composites/`
2. Use Radix UI primitives as base
3. Style with Tailwind + CVA variants
4. Export from index.ts

### Feature Development
1. Create route group in `src/app/` (e.g., `(features)/`)
2. Add page.tsx with metadata
3. Use shared components
4. Create domain service in `src/services/domains/`
5. Create custom React Query hook

### API Integration
1. Add endpoints to `src/services/common/apiAddress.ts`
2. Create service class in `src/services/domains/[domain]/`
3. Create hooks in `[domain]/hooks/`
4. Define types in `[domain]/types/`

### Styling
1. Use Tailwind utility classes
2. Use `cn()` for conditional classes
3. Define theme tokens in `globals.css` `@theme inline` block
4. Use CVA for reusable variant patterns

## Important Notes

### Tailwind v4 Differences
- Uses CSS-based configuration (`@theme inline`) instead of `tailwind.config.js`
- Requires `@import "tailwindcss";` in global CSS (NOT in config file)
- PostCSS plugin is `@tailwindcss/postcss`

### RTL Support
- App uses Persian/Farsi language
- Root layout sets `dir="rtl"` and `lang="fa"`
- Private-routes layout also sets RTL
- All components should support RTL

### Authentication Flow
- Token stored in Zustand store (`useTokenStore`)
- Axios interceptor adds Bearer token to requests
- 401 responses trigger token cleanup and redirect
- Refresh token logic incomplete (currently logs out on expiry)

### Font Loading
- Ravi font loaded via `next/font/local` in root layout
- Vazirmatn font loaded via `next/font/google` in private-routes
- CSS file `ravi.css` is unused (safe to delete)

## Lint & Typecheck Commands

Run before committing:
```bash
npm run lint
npm run typecheck
```

## Storybook

Storybook packages installed (^10.3.5) but not configured. Button has `.stories.tsx` files. Configuration needed in `.storybook/` directory.
