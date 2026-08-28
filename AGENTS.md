<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SalonFlow Frontend

Salon management SPA (Farsi/RTL, Toman currency, Jalali dates). Next.js 16.2.4 + React 19.2.4 + Tailwind v4.

## Commands

| Command | What |
|---|---|
| `npm run dev` | Dev server (`next dev --webpack`) |
| `npm run build` | Production build (`next build --webpack`) |
| `npm run start` | Start production server |
| `npm run lint` | ESLint — **currently disabled** (configs commented in `eslint.config.mjs`) |
| `npx tsc --noEmit` | Type-check (no `typecheck` script exists) |

## Key quirks & gotchas

- **No `tailwind.config.js`** — Tailwind v4 config is CSS-based, all theme tokens in `src/shared/styles/globals.css` within `@theme inline { ... }`. Tokens are referenced as e.g. `bg-surface-tertiary`, `text-content-primary`.
- **`@/*`** maps to `src/*`.
- **`axios-case-converter`** is imported but **commented out** — no automatic snake_case↔camelCase conversion currently.
- **Icon library: `@phosphor-icons/react` only** — the sole icon dependency; `lucide-react` and `@radix-ui/react-icons` were both removed/never installed (an earlier `Select.tsx` import from the latter, and other stray `lucide-react` imports, have been fixed — don't reintroduce either package).
- **`useMediaQuery`** — `src/shared/hooks/useMediaQuery.ts`, exported from the `shared/hooks` barrel.
- **ESLint: effectively disabled** — `eslint.config.mjs` has `nextVitals` and `nextTs` configs commented out.
- **No Storybook `.storybook/` config** — packages installed but not wired up.

## Architecture

```
app/(pages)/layout.tsx          ← Root layout (RTL, Ravi font, Providers)
app/(pages)/(main-pages)/       ← All main pages wrapped in <Header> + <BottomNavigation>
  (home)/                       ← Public landing page
  (private-routes)/dashboard/   ← Auth-required pages
  profile/ reservation/ search/ ← Top-level nav pages
```

- Route groups: `(pages)`, `(main-pages)`, `(home)`, `(private-routes)`
- Providers composited via `composeProvider()` in `app/common/providers/Providers.tsx`
- Domain services: singleton class pattern in `services/domains/<domain>/` with React Query hooks in `hooks/` subdir
- Auth: Zustand `useTokenStore`, Axios interceptor injects Bearer token, 401 triggers logout
- `RouteAddress` in `shared/data/routeAddress.ts` — has HOME, AUTH, PROFILE, SEARCH, RESERVATION
- Theme: dark background (`#060e02`), green primary (`#9be955`), defined in `globals.css`

## Strict Workflow Rule

After completing any requested task or step, you MUST stop and explicitly ask for my confirmation/approval.
Do NOT start the next task until I approve.
Once I approve (e.g., I say 'approved', 'ok', or 'continue'), you MUST automatically run Git commands to stage, commit (with a descriptive conventional commit message based on the work done), and push the changes to the remote repository.

## Workflow Trigger: 'Sync Backend'

Whenever the user types exactly `Sync Backend`, you MUST perform the following steps:

1. Read the file `docs/FRONTEND_INTEGRATION_GUIDE.md` to check for any recent backend API contract changes, new endpoints, or DTO updates.
2. Scan the current frontend codebase (`src/services/domains/`, `src/app/`, types, and hooks) to find any mismatches between the guide and the implemented code.
3. Provide a brief summary of what changed in the backend and exactly what needs to be updated in the frontend.
4. STOP and explicitly ask for my permission: `Do you want me to apply these frontend updates?`.
5. Do NOT write or modify any code until I approve.
