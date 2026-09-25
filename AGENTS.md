<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Saffa Frontend

Salon management SPA (Farsi/RTL, Toman currency, Jalali dates). Next.js 16.3.3 + React 19.2.4 + Tailwind v4.

## Commands

| Command | What |
|---|---|
| `npm run dev` | Dev server (`next dev --webpack`) |
| `npm run build` | Production build (`next build --webpack`) |
| `npm run start` | Start production server |
| `npm test` | Unit tests (`vitest run`) |
| `npm run test:e2e` | Playwright E2E (starts `next dev` as its web server) |
| `npm run lint` | ESLint — **currently disabled** (configs commented in `eslint.config.mjs`) |
| `npx tsc --noEmit` | Type-check (no `typecheck` script exists) |

## Key quirks & gotchas

- **No `tailwind.config.js`** — Tailwind v4 config is CSS-based, all theme tokens in `src/shared/styles/globals.css` within `@theme inline { ... }`. Tokens are referenced as e.g. `bg-surface-tertiary`, `text-content-primary`.
- **`@/*`** maps to `src/*`.
- **`axios-case-converter`** is listed in `package.json` but not referenced anywhere in `src/` — no automatic snake_case↔camelCase conversion (the API already speaks camelCase).
- **Icon library: `@phosphor-icons/react` only.** Don't use `lucide-react` (not installed) or `@radix-ui/react-icons` (still listed in `package.json` but unused — an earlier `Select.tsx` import from it was a bug; don't reintroduce either).
- **`useMediaQuery`** — `src/shared/hooks/useMediaQuery.ts`, exported from the `shared/hooks` barrel.
- **ESLint: effectively disabled** — `eslint.config.mjs` has `nextVitals` and `nextTs` configs commented out.
- **No Storybook `.storybook/` config** — packages installed but not wired up.

## Architecture

The app has three separate surfaces:

```
app/(pages)/layout.tsx              ← Root layout (RTL, Ravi font, Providers)
app/(pages)/(main-pages)/           ← Customer app, wrapped in <Header> + <BottomNavigation>
  (home)/                           ← Public landing page
  profile/ reservation/ search/ favorites/ wallet/ notifications/ subscriptions/ salons/[id]/
app/(pages)/(private-routes)/       ← Salon-owner surface (auth + salon JWT required)
  onboarding/  dashboard/
app/(pages)/(admin-routes)/admin/   ← Platform-admin surface (separate from the two above)
```

- Route groups: `(pages)`, `(main-pages)`, `(home)`, `(private-routes)`, `(admin-routes)`
- Providers composited via `composeProvider()` in `app/common/providers/Providers.tsx`
- Domain services: singleton class pattern in `services/domains/<domain>/` with React Query hooks in `hooks/` subdir
- Auth: Zustand `useTokenStore`, Axios interceptor injects Bearer token, 401 triggers logout
- `RouteAddress` in `shared/data/routeAddress.ts` — route paths (AUTH, HOME, PROFILE, FAVORITES, SEARCH, RESERVATION, SALONS, WALLET, NOTIFICATIONS, SUBSCRIPTIONS, ONBOARDING, DASHBOARD, …)
- Theme: light/dark switching (Figma-sourced palette). Dark is default — background `#00182f`, primary teal `#4fa39a`; light overrides — background `#ffffff`, primary `#185851`. All tokens in `globals.css` (`@theme` = dark values, `:root[data-theme="light"]` = light overrides, plus a plain `:root { }` block for tokens with no Tailwind-utility usage yet — Tailwind v4 tree-shakes unused `@theme` vars). State: Zustand `useThemeStore` (`services/theme-store/`, persisted to localStorage) + an inline blocking script in `app/layout.tsx` that sets `<html data-theme>` before paint (no FOUC). Toggle lives in Profile → Settings (`ThemeToggleRow` in `SettingsList.tsx`).

### Surface boundaries

- **Customer** routes live under `(main-pages)/`. `BottomNavigation` stays customer-only (includes Favorites).
- **Owner** routes live under `(private-routes)/` (`onboarding` and `dashboard`). Chrome: sticky header (salon name, back to customer app, notifications) + 4-item owner bottom nav (امروز / بینش / عملیات / مالی) with in-group subtabs. Dashboard shell max width is `720px`; onboarding stays `600px`.
- **Platform admin** routes live only under `(admin-routes)/admin/` (pending-salon approval, salon suspend/restore, review moderation, reports, subscriptions/billing, users, platform reports) with services in `services/domains/admin`. Never put admin UI or AdminOnly actions in the customer or owner surfaces.

## UI conventions

- Login/OTP always lands customer/global (salon store cleared). Post-login destination: `resolvePostLoginRedirect()` (`redirectUrl` then `?callback=` / session). Use `getLoginHref(returnPath)` for auth CTAs.
- Dashboard without a salon JWT: preferred or single membership → auto `switch-context`; multiple → in-layout «انتخاب سالن». Memberships come from `GET /api/auth/me` via `AuthMeMembershipsSyncProvider`.
- Home header: guests see «ورود»; `BusinessSwitcher` only when logged in.
- Owner dashboard pages: `/dashboard/catalog`, `staff`, `staff-services`, `schedules`, `salon-info` («اطلاعات سالن» — profile edit; `/onboarding` remains create/resume-draft only), `finance`, `z-report`, `analytics` (KPI cards + sparkline), `reports` (financial/staff/CRM breakdowns + CSV export), `payouts`, `notifications`, `my-appointments` («نوبت‌های من» as staff, both roles), `customers` + `customers/[customerPublicId]` («رزروهای مشتری», both roles), `staff/[staffPublicId]/appointments` («رزروهای پرسنل», SalonOwner only — linked from each saved row on `/dashboard/staff`). Nav tabs match sub-routes by prefix (`isOwnerNavTabActive`); page-level role check via `useIsSalonStaff()`.
- Customer pages: `/wallet` must render real balance/transactions; `/notifications`; `/favorites` plus a heart toggle on catalog/search/detail cards (`salonPublicId` Guid).
- Subscription operational lock: dashboard banner + quick-book disabled when `GET /api/subscriptions/me/entitlement` has `isEntitled=false`. Online booking maps `errors.field=subscription` to a customer-facing lock message. Cancel/complete stay unlocked.
- Shared owner UI lives in `dashboard/_components/` (`DashboardPage`, `DashboardCard`, `DashboardSelect`, `DashboardDateField`, empty/skeleton/toast). Do not use the broken shared `Select.tsx` in the dashboard.
- Theme tokens: prefer `bg-surface`, `bg-input` / `border-input-border` / `text-foreground` / `text-foreground-muted` for new UI. Legacy aliases (`surface-tertiary`, `content-primary`, `border-primary`, …) are defined in `@theme` and may stay in existing primitives. Photo overlays use `text-on-media` / `bg-overlay`. Hover/highlight backgrounds (`surface-hover`, `input-hover`, `accent`) are a subtle `color-mix` of surface + primary so `text-foreground` stays readable in both themes — never set them to a strong/inverted color. Do not hardcode `bg-black`, `text-white`, or hex colors in classNames.
- Digits are English (Latin) everywhere in the UI. Every Intl / `toLocale*` call uses `APP_LOCALE` (`shared/utils/locale.ts` = `fa-IR-u-nu-latn`: Persian words + Jalali calendar, Latin digits) — never bare `"fa-IR"`; don't hardcode Persian digits (۰–۹) in UI text. The Ravi font draws Latin digits as Persian glyphs, so `globals.css` maps U+0030–0039 to a system-font `latin-digits` face placed before Ravi — keep it first in the font stack.
- Money = Toman; dates = Jalali in UI, `yyyy-MM-dd` / ISO toward the API. Every money input uses `MoneyInput` (`shared/components/primitives/input/MoneyInput.tsx`: `,` thousands separators while typing, «تومان» suffix, numeric keypad, reports a plain Toman number) — never a raw `type="number"` field; money display uses `formatToman`. Every phone input uses `PhoneInput` (`kind="mobile"` 11 digits / `"landline"`), or for react-hook-form fields `PHONE_INPUT_ATTRS` + `transformValue={normalizePhoneInput}` (`shared/utils/phoneInput.ts`): tel keypad, LTR digits, Persian/Arabic digits → Latin (backend validates `^09\d{9}$`).
- Do not ship mock identity, fake businesses, or crypto-style wallet placeholders when wiring real APIs.

## Service type icons

Every `ServiceType` (seeded on the backend — `SalonFlowDbContext.SeedData`) gets a matching icon shown as a themed circular badge (category rows, etc.). The mapping lives in `src/shared/data/serviceTypeIcons.ts`:

```ts
export const SERVICE_TYPE_ICONS: Record<string, Icon> = {
  "کوتاهی مو": ScissorsIcon,
  // ...
};
export function getServiceTypeIcon(name: string): Icon { ... }
```

- **Keyed by the exact Persian `Name` string**, not by id — the API (`ServiceTypeResponseDto.Id`) returns a `Guid` (the row's `PublicId`), not a stable small integer, so the name is the only convenient stable key. Must match the backend seed string byte-for-byte (including any ZWNJ/half-space characters).
- **Icons come from `@phosphor-icons/react`.** Always import the `...Icon`-suffixed named export (e.g. `ScissorsIcon`), never the deprecated bare name (`Scissors`) — check `node_modules/@phosphor-icons/react/dist/csr/<Name>.d.ts` if unsure whether an icon exists before importing it.
- **Unmapped service types** (e.g. a salon's own custom one) fall back to `DEFAULT_SERVICE_TYPE_ICON` (currently `SparkleIcon`) via `getServiceTypeIcon()` — never index the record directly.
- **Rendering pattern** — a circular badge sized `h-[68px] w-[68px]` (adjust to context) with `bg-surface-brand text-content-brand`, icon at roughly 40% of the badge size with `weight="duotone"`. These two classes are derived from `--color-primary`, so the badge recolors automatically between light/dark — never hardcode a color here. See `SearchCategories.tsx` for the reference implementation.

**To add a new service type's icon:** add one entry to `SERVICE_TYPE_ICONS` with the exact seeded Persian name and a semantically fitting Phosphor icon (verify the `...Icon` export exists first), following the same `bg-surface-brand`/`text-content-brand` badge pattern anywhere it's rendered.

## Services & API

- **Contract source of truth:** the backend's OpenAPI snapshot at `D:\SourceSalon\docs\openapi\v1.json`. It is large (~540KB) — to see what changed, use `git -C D:\SourceSalon log -p -- docs/openapi/v1.json` instead of reading it whole. Successful responses with a body are wrapped as `{ "data": ... }`, which the snapshot does not show.
- Singleton domain services in `src/services/domains/<domain>/`; React Query hooks in `hooks/`. Shared domain enums live in `src/services/common/enums/domain-enums.ts`.
- Paths only via `API_ADDRESS` in `src/services/common/apiAddress.ts`.
- Success with body: unwrap `TResponse<T>.data`. Success 204 / empty 200: no `data` expected.
- Auth header: Bearer access token. On 401 with a prior token, refresh via bare axios (not `axiosInstance`) then retry; body is `{ refreshToken }` only (salon context lives on the server session). Failed refresh with inactive membership → 401, force logout, login banner «عضویت سالن دیگر فعال نیست».
- Forgot password (3 steps, all `skipAuthRetry`): `POST forget-password { phone }` (always 200, show no "code sent" text) → `POST verify-reset-code { phone, code }` → `{ resetToken, expiresAt }` → `POST reset-password { resetToken, newPassword }` → `AuthResponse` (logs in). Phone + reset token live only in memory (`useResetPasswordStore`) — never in the URL or localStorage; refresh restarts from the phone step. Show the server `message` on 401; a 401 on reset-password means "get a new code".
- Salon public link (username): every salon has a unique `username`; the share link / QR is always `/s/{username}` (`RouteAddress.SALONS.BY_USERNAME`, helpers in `shared/utils/salonShareLink.ts`), never the Guid. Username is only for that URL — APIs, booking and internal routes keep `publicId`. Set via `save-basic-info` (`username`; required on create, empty on edit = keep current) with `SalonUsernameField` (lowercases, previews link, debounced `GET username-availability`, pass `salonPublicId` when editing); show server 400 `field=username` under the field. `/s/[username]` resolves via `GET by-username` (old usernames resolve too → `router.replace` to the current one) and has server `generateMetadata` for link previews. Read `username` fresh from API responses; never cache it or hardcode the reserved-word list. Owner card with copy/share/QR: `SalonLinkCard` (qrcode.react) on `/dashboard/salon-info`.
- `GET /api/auth/me` returns profile plus `memberships` (`salonId`, `salonPublicId`, `salonName`, `roleId`, `roleName`, `branchId`). Client syncs them into `useSalonContextStore` via `setMemberships` (`useSyncMembershipsFromAuthMe`); do not set active `salonId` from `/me` alone.
- `POST /api/auth/switch-context` body: `{ salonId, branchId, refreshToken }`. Replace **both** tokens on success; `salonId: null` exits to customer/global. Clear React Query cache after switch. Dashboard requires a salon JWT via `switch-context` before owner APIs.
- ID mapping: public browse Guids ≠ long IDs for salon-owner create/finance. Customer `POST /api/booking/create` body is Guid-first: `{ salonPublicId, branchPublicId?, startTime, notes?, services: [{ offeringPublicId, staffPublicId }] }`. Salon-side quick booking (`POST /api/appointments/quick-book`: phone/fullName/branch/startTime/services) keeps `offeringId` and `staffId` numeric.
- Favorites (`CustomerOnly`): `POST/DELETE /api/favorites/{salonPublicId}` with catalog Guid (`SalonCardDto.id`); match heart state via `FavoriteSalonDto.salonPublicId` and `useFavoriteIdsStore` (survives salon JWT / query clear). `GET /api/favorites` returns card fields (`imageUrl`, `city`, `averageRating`) and only Approved salons. DELETE is always 204 (idempotent). Exit salon JWT before list/toggle. Optimistic toggle; surface mutation errors on the heart.
- Online booking wizard (`/salons/[id]/book`, 5 steps): 1 services (branch picker on the same step only for multi-branch salons) → 2 staff from `GET staff-profiles/by-salon/{id}/for-services` or «اولین نوبت» (`GET /api/booking/first-available` once → prefills date/time/staff; on error/404 fall back to all staff's slots and take staff from the picked slot) → 3 dates (`available-dates` with `offeringPublicIds[]` — never `serviceTypePublicId` alone — plus `staffPublicId` when known) with that day's `GET /api/booking/slots` underneath → 4 `calculate-price` with the resolved staff → 5 confirm + `POST /api/booking/create`. first-available 404 = «نوبت آزادی پیدا نشد», user must pick staff; create failure (except subscription lock) → server message, back to step 3 with the time cleared. Dates/slots/first-available are never cached (`staleTime`/`gcTime` 0, enabled only on their own step). Slot times are Asia/Tehran, never the device zone: `shared/utils/salonTime.ts` (`utcToSalonTime`, `salonWallClockToUtcIso`, used by `toBookingStartTime`). Draft in sessionStorage (`bookDraft.ts`, bump `DRAFT_VERSION` when steps change). Exit salon JWT context before create.
- Customer appointments: `GET /api/appointments/me`, `GET .../me/{id}`, `POST .../{id}/cancel` (Scheduled only). UI under `/reservation` and `/reservation/[id]`. `me` works with any token (no switch-context needed).
- Appointment history (all paged `TPagedResult<IAppointmentHistoryItem>`, query `from`/`to` `yyyy-MM-dd` Tehran-inclusive, `status`, `page`, `pageSize` ≤ 100): `GET /api/appointments/me` (any logged-in user), `.../staff/me` (salon JWT, Staff/Owner), `.../customer/{customerPublicId}` (salon JWT, Owner/Staff; Guid from `CustomerDto.publicId`), `.../staff/{staffPublicId}` (salon JWT, Owner only). Hooks in `useQueryAppointmentHistory.ts`; shared UI `AppointmentHistoryPanel` (filters + list + paging).
- Reviews: create/edit/delete + public list by numeric `salonId`. Track customer submission via `useMyReviewsStore` + `GET /api/reviews/{id}` for pending badge. Salon reports: `POST /api/salon-reports`.
- Subscriptions: plans/me/entitlement/trial/checkout. Gate salon create with `useSubscriptionEntitlement().canCreateSalon` (entitled && under maxSalons). Gate owner appointment create / quick-book with `isEntitled`; map API `errors.field=subscription` (400) to lock copy + `/subscriptions` CTA. Checkout creates a Pending platform invoice (no PSP yet).
- Onboarding: `/onboarding` — 7-step save-* + submit-for-review; draft in `useOnboardingDraftStore` (salonPublicId). New create blocked without entitlement; resume draft allowed.
- Owner salon profile edit (`/dashboard/salon-info`): hydrate via `useQuerySalonById`; Basic+Contact via `POST save-basic-info` (`useMutateSalonBasicInfo`); Branches via `POST save-branches` (`useMutateSalonBranches`); Media via `POST /api/Media/upload/{entityType}/{entityPublicId}` then `POST save-medias` with `keepMediaPublicIds` (`useMutateSalonMedia`); invalidate `SALON_BY_ID_QUERY_KEY`. Empty/error → onboarding CTA.
- Owner daily board: salon-context JWT + `GET /api/appointments?date=yyyy-MM-dd` (optional salon/branch/staff filters), grouped by `AppointmentStatus`; lifecycle calls are `check-in`, `complete`, `no-show`, `cancel`.
- `GET /api/customers` (search + pagination, returns `TPagedResult<ICustomer>`) backs `/dashboard/customers`.
- Catalog owner module uses `api/catalog` as source of truth (replaces legacy `api/salon-offering` for dashboard operations): offerings CRUD, `PATCH .../active`, staff-centric `GET/PUT /api/catalog/staff/{staffMemberId}/services`, and pricing-rules CRUD.
- Staff schedules use `api/working-schedules` (weekly) and `api/special-schedules` (specific date overrides/off days).
- Finance: `api/invoices`, `api/payments`, `api/wallets`, `api/tips`, `api/reports/z-report` (include `transferTotal` / `walletTotal` / `collectedTotal`). Always send a unique `idempotencyKey` on payment create. Flow: issue invoice from Completed appointments (`POST /api/invoices/from-appointment/{appointmentId}`), then record the payment method (Cash/Card/Online/Transfer/Wallet). Customer wallet UI uses the real wallet endpoints (balance + transactions).
- Owner reports: `GET /api/reports/dashboard-summary` plus revenue/outstanding/funnel/staff-performance/peak-hours/fill-rate/customers/* and `GET /api/reports/export` (CSV blob, unwrap is the file). Query `from`/`to` as `yyyy-MM-dd`; optional `branchId`.
- Owner ops: payouts/earnings (`api/earnings`, `api/payouts`), commission plans (`api/commission/plans*`), notifications inbox (`api/notifications`).
