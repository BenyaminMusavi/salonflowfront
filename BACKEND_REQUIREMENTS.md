# Backend Requirements Document — Staff & Scheduling API Gaps

**From:** Frontend Engineering Lead
**To:** Backend Team
**Scope:** Four API gaps identified during Sprints 1–4 that currently force frontend workarounds. Each item includes the observed problem (with exact code references), the risk it creates, and the concrete API contract requested.
**Status:** Awaiting backend implementation. No frontend code should assume any of this exists until confirmed shipped and documented in `docs/FRONTEND_INTEGRATION_GUIDE.md`.

---

## 1. GET Staff Roster Endpoint (Critical)

### Problem

There is no read endpoint for a salon's staff roster. The only staff-related write endpoint is:

```
POST /api/salons/{salonPublicId}/save-staff
```

(`API_ADDRESS.SALONS.SAVE_STAFF`, `src/services/common/apiAddress.ts:45-46`)

Because no corresponding `GET` exists, the frontend currently sources "the current roster" from a Zustand store (`useOnboardingDraftStore`, `src/services/domains/salons/store/useOnboardingDraftStore.ts`) that is persisted to **browser `localStorage`** under the key `salon_flow_onboarding_draft` (line 88-89). The staff editor screen (`StaffView.tsx`) seeds its form from this local draft on mount (`src/app/(pages)/(private-routes)/dashboard/staff/StaffView.tsx:79-88`) and ships a visible warning banner acknowledging the gap:

> "این لیست بر اساس آخرین ذخیره‌سازی در همین دستگاه است، نه لزوماً آخرین وضعیت سرور..." (*"This list reflects the last save on this device, not necessarily the server's current state..."*) — `StaffView.tsx:177-183`

### Risk

`save-staff` **overwrites the entire staff array** on the server (it is not a diff/patch). If an owner adds or edits staff from a second device or browser, then later opens the staff page on the *first* device — where `localStorage` still holds the older roster — and hits Save, the stale local list silently **wipes out** the staff added elsewhere. There is currently no way for the frontend to detect or prevent this, because it has no authoritative source to reconcile against before saving.

### Requirement

Add:

```
GET /api/salons/{salonPublicId}/staff
```

Response should return the full current roster, per staff member including:

- `publicId` (Guid)
- `phoneNumber`
- `isCreator`
- `branchPublicId` (branch assignment)
- `offeringPublicIds` (assigned services, as Guids — see §3)
- A **`hasLoggedIn`** (or equivalently named) boolean flag, so the frontend can render a "در انتظار ورود اولیه" ("pending first login") state — this label already exists in the UI today as a fallback guess (`StaffView.tsx:113`) and should be driven by real backend data instead of inference.

This endpoint should be called to hydrate the staff editor on load, replacing the `localStorage`-sourced draft as the source of truth. The `useOnboardingDraftStore` local cache can then be limited to genuinely transient, unsaved form edits within a single session, rather than standing in for server state across sessions/devices.

---

## 2. Staff Two-Step Approval Flow (Security/UX)

### Problem

`save-staff` lets an owner attach **any phone number** to their roster (`toOnboardingStaff` in `StaffView.tsx:47-56` sends `phoneNumber` directly for non-creator rows) and that person becomes staff immediately, with no consent step. The phone number's actual owner has no opportunity to accept or decline being listed as an employee of that salon before the association is live.

### Risk

An owner can register someone else's real phone number as staff without their knowledge or agreement — a consent/privacy problem, and a vector for confusing or malicious registrations (e.g., a competitor's number, an ex-employee, a wrong number). There is also no recovery path if the number is added in error.

### Requirement

Introduce a status field on the staff record (e.g., `status: Pending | Active`) with the following flow:

1. **On `save-staff`**, any newly-added phone number (one not already `Active` on this salon) is created with `status = Pending`. It should **not** appear as a bookable/schedulable staff member in customer-facing or scheduling surfaces (e.g., excluded from `staff-availability`, day-board, quick-book staff pickers) while `Pending`.
2. **On OTP login/verification** (`POST /api/auth/verify-otp`) for a phone number that has one or more `Pending` salon-staff invitations, the response (or a follow-up "me"/context call) should surface those pending invitations so the frontend can prompt: *"You've been invited to join [Salon Name] as staff — accept or decline?"*
3. Add endpoints to act on an invitation, e.g.:
   ```
   POST /api/salons/{salonPublicId}/staff/{staffPublicId}/accept-invitation
   POST /api/salons/{salonPublicId}/staff/{staffPublicId}/reject-invitation
   ```
   Accepting sets `status = Active`. Rejecting either removes the record or sets `status = Rejected` (backend's choice) but must not leave the invitee bookable as staff.
4. The `GET` roster endpoint from §1 should expose this `status` so the owner-facing staff list can show "در انتظار پذیرش دعوت" (pending acceptance) distinctly from "در انتظار ورود اولیه" (pending first login) — these are two different waiting states today conflated into one guess (`StaffView.tsx:100-114`).

---

## 3. ID Standardization — GUID vs Numeric (Consistency)

### Problem

`save-staff` requires **Guid** service identifiers: `IOnboardingStaff.offeringPublicIds: string[]` (`src/services/domains/salons/types/onboarding.type.ts:41`, documented as *"ServiceOffering publicIds from save-services; required (≥1) on save-staff"*).

However, the salon's own catalog-read endpoint returns **numeric** IDs only:

```ts
// src/services/domains/salon-offering/types/salon-offering-type.ts
export interface ISalonOffering {
  id: number;          // numeric only — no GUID field
  serviceTypeId: number;
  serviceName: string;
  ...
}
```
fetched via `GET /api/salon-offering/salon/{salonId}` (`salon-offering-service.ts:8-12`, `salonId: number`).

The only place a matching **Guid** (`offeringPublicId`) is available is on the unrelated `GET /api/salons/{id}` (SalonById) response (`src/services/domains/salons/types/salon.type.ts:10-16`):

```ts
export interface ISalonServiceSummary {
  name: string;
  offeringPublicId?: string | null; // ServiceOffering.PublicId from GET /api/salons/{id}
  id?: string | null;               // @deprecated
}
```

To build the staff-editor's service picker, the frontend has to fetch `SalonById` **solely to obtain GUIDs**, then correlate its services by name/index against whatever numeric-ID catalog data is used elsewhere (`allOfferingIds` derivation in `StaffView.tsx:90-92`). This cross-fetching is fragile — it silently breaks if service names aren't unique, or if the two endpoints ever diverge in what they consider "active" services. The same numeric/Guid split shows up again in `useQueryStaffForOfferings` (`src/services/domains/staff-profile/hooks/useQueryStaffForOfferings.ts:6-9`), which explicitly notes: *"Customer booking passes Guid offeringPublicIds. Salon dashboard may still pass numeric catalog offering ids until that surface is Guid-migrated."*

### Requirement

Standardize on `offeringPublicId` (Guid) as the identifier for a service offering across **every** endpoint that returns or accepts one, specifically:

- `GET /api/salon-offering/salon/{salonId}` — add `offeringPublicId` to `ISalonOffering` (or migrate the route to accept/return the salon's Guid and the offering's Guid instead of numeric IDs).
- `GET /api/catalog/staff/{staffMemberId}/services` — same addition.
- `GET /api/staff-profiles/by-salon/{salonId}/for-services` — same addition (currently accepts `offeringPublicIds` as a query param already, per `staff-profile.service.ts:6-16`, but the *salon id* and any *staff id* on this route are still numeric).

The numeric `id` fields can remain for backward compatibility during migration, but every catalog/service/staff surface should carry the Guid so the frontend never needs to cross-reference a second endpoint just to resolve an ID it already has in a different shape.

---

## 4. Batch Day-Board Endpoint (Performance)

### Problem

The dashboard's calendar grid (`src/app/(pages)/(private-routes)/dashboard/DashboardCalendarGrid.tsx`) needs the day's appointments for every staff member in a branch simultaneously, to render one column per staff member side by side. There is only a per-staff-member endpoint:

```
GET /api/appointments/staff/{staffMemberId}/day-board
```

(`API_ADDRESS.APPOINTMENTS.STAFF_DAY_BOARD`, `apiAddress.ts:97-98`). The component fans this out via `useQueries`, issuing **one HTTP request per staff member** on every date change (`DashboardCalendarGrid.tsx:85-91`):

```ts
const dayBoardQueries = useQueries({
  queries: staff.map((member) => ({
    queryKey: [STAFF_DAY_BOARD_QUERY_KEY, member.id, date],
    queryFn: () => appointmentsService.getStaffDayBoard(member.id!, date),
    enabled: member.id != null && !!date,
  })),
});
```

### Risk

Request count scales linearly with staff headcount (N requests for N staff, repeated on every date navigation), increasing load time, waterfalling connection usage, and backend request volume for what is functionally a single "give me today's board for this branch" read.

### Requirement

Add a batch endpoint:

```
GET /api/appointments/day-board?date={date}&branchId={branchId}
```

Response should return the union of all staff day-boards for that branch/date in one payload, keyed by staff member, e.g.:

```json
{
  "statusCode": 200,
  "data": [
    {
      "staffMemberId": 12,
      "items": [
        {
          "appointmentId": 501,
          "appointmentPublicId": "6f1e...",
          "startTime": "2026-08-28T09:00:00",
          "endTime": "2026-08-28T09:45:00",
          "status": 1,
          "customerName": "...",
          "serviceName": "...",
          "appointmentServiceId": 9001
        }
      ]
    }
  ]
}
```

using the same per-item shape as the existing `IStaffDayBoardItem` (`src/services/domains/appointments/types/appointments.type.ts:106-115`), so the frontend's existing rendering logic (`DashboardCalendarGrid.tsx:150-201`) can be reused with minimal changes. The existing per-staff endpoint can remain for single-staff views (e.g., a personal schedule screen) — this is additive, not a replacement.

---

## Summary for Planning

| # | Endpoint(s) Needed | Priority | Frontend Hack Removed |
|---|---|---|---|
| 1 | `GET /api/salons/{salonPublicId}/staff` | Critical | `localStorage`-backed roster in `useOnboardingDraftStore` |
| 2 | Staff `status` (Pending/Active) + accept/reject invitation endpoints | High (security/consent) | Owner can silently conscript any phone number as staff |
| 3 | `offeringPublicId` added to catalog/staff-services endpoints | Medium | Cross-fetching `SalonById` just to resolve GUIDs |
| 4 | `GET /api/appointments/day-board?date=&branchId=` | Medium (perf) | N-request fan-out per staff member per date change |

Happy to walk through any of these live with the backend team if useful. Once endpoints are available in a dev/staging environment, frontend can migrate off each workaround independently — none of the four are interdependent.
