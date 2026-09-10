<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Saffa Frontend

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
- Theme: light/dark switching (Figma-sourced palette). Dark is default — background `#00182f`, primary teal `#4fa39a`; light overrides — background `#ffffff`, primary `#185851`. All tokens in `globals.css` (`@theme` = dark values, `:root[data-theme="light"]` = light overrides, plus a plain `:root { }` block for tokens with no Tailwind-utility usage yet — Tailwind v4 tree-shakes unused `@theme` vars). State: Zustand `useThemeStore` (`services/theme-store/`, persisted to localStorage) + an inline blocking script in `app/layout.tsx` that sets `<html data-theme>` before paint (no FOUC). Toggle lives in Profile → Settings (`ThemeToggleRow` in `SettingsList.tsx`).

## Service Type Icons

Every `ServiceType` (seeded on the backend — `SalonFlowDbContext.SeedData`) gets a matching icon shown as a themed circular badge (category rows, etc.). The mapping lives in `src/shared/data/serviceTypeIcons.ts`:

```ts
export const SERVICE_TYPE_ICONS: Record<string, Icon> = {
  "کوتاهی مو": ScissorsIcon,
  // ...
};
export function getServiceTypeIcon(name: string): Icon { ... }
```

- **Keyed by the exact Persian `Name` string**, not by id — the API (`ServiceTypeResponseDto.Id`) returns a `Guid` (the row's `PublicId`), not a stable small integer, so the name is the only convenient stable key. Must match the backend seed string byte-for-byte (including any ZWNJ/half-space characters).
- **Icons come from `@phosphor-icons/react`** (the only icon lib in this repo — see the quirks list above). Always import the `...Icon`-suffixed named export (e.g. `ScissorsIcon`), never the deprecated bare name (`Scissors`) — check `node_modules/@phosphor-icons/react/dist/csr/<Name>.d.ts` if unsure whether an icon exists before importing it.
- **Unmapped service types** (e.g. a salon's own custom one) fall back to `DEFAULT_SERVICE_TYPE_ICON` (currently `SparkleIcon`) via `getServiceTypeIcon()` — never index the record directly.
- **Rendering pattern** — a circular badge sized `h-[68px] w-[68px]` (adjust to context) with `bg-surface-brand text-content-brand`, icon at roughly 40% of the badge size with `weight="duotone"`. These two classes are derived from `--color-primary`, so the badge recolors automatically between light/dark — never hardcode a color here. See `SearchCategories.tsx` for the reference implementation.

**To add a new service type's icon:** add one entry to `SERVICE_TYPE_ICONS` with the exact seeded Persian name and a semantically fitting Phosphor icon (verify the `...Icon` export exists first), following the same `bg-surface-brand`/`text-content-brand` badge pattern anywhere it's rendered.

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
