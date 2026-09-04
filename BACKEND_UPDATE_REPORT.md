# SalonFlow Backend Update Report — Frontend Integration Guide

**Audience:** Frontend team
**Scope:** A full backend audit and 21-ticket hardening pass (4 sprints: critical hotfixes, high-priority hardening, core improvements/compliance, tech debt/docs), plus a follow-up round of business/infrastructure adjustments. This report covers only the changes that affect frontend behavior or the API contract. Everything else (internal refactors, test coverage, CI, documentation cleanup) is backend-only and not listed here.
**Backend commit state:** all 21 tickets implemented, 89/89 backend tests passing.
**Revision note:** this replaces the previous version of this report. Changes since the last version: finalized the unified 401 behavior (§2.1, now covers a second, previously-undocumented gap), and added an Infrastructure Notes section (§5). Nothing about emails/uniqueness was ever part of this report — that was a backend-only detail (SF-012) that never surfaced here, so there's nothing to remove on that front.

---

## 1. Authentication & Signup Changes

### 1.1 Change Password (`POST /api/auth/set-password`) — `oldPassword` is now conditionally required

**Why:** Previously, anyone holding a valid access token could silently change the account password with zero verification of the current one — meaning a stolen or leaked token (even a short-lived one) could be used to permanently lock the real owner out. This is now fixed.

**The rule:**
- If the account **already has a password set**, `oldPassword` is now **required** and must match the current password. Omitting it or sending the wrong value returns an error (see below).
- If the account **has no password yet** (a brand-new account, right after OTP verification, before the user has ever set one), `oldPassword` is **not required** — this is the first-time-setup case and is unchanged.

The frontend cannot know in advance which case applies from the client alone — the safest UI pattern is: **always show the "Current Password" field on any "change password" screen** (a settings/profile page), and only omit it on the one-time "set your password" screen that immediately follows first signup (right after `verify-otp`, before the user has ever had a password).

**Request body (`SetPasswordRequest`):**
```json
{
  "password": "NewStr0ng!Pass1",
  "oldPassword": "CurrentStr0ng!Pass1",
  "firstName": "علی",
  "lastName": "رضایی"
}
```
- `password` — required. Must be 8+ characters, with at least one uppercase letter, one lowercase letter, one digit, and one special character (unchanged validation).
- `oldPassword` — **new field**, string, required only when the account already has a password.
- `firstName` / `lastName` — unchanged, both still optional; only updates the name if sent.

**Error behavior — updated:** when `oldPassword` is missing or wrong, the backend now returns:
```
HTTP 401
{
  "statusCode": 401,
  "type": "authentication_error",
  "message": "نشست شما نامعتبر است، لطفاً دوباره وارد شوید",
  "errors": []
}
```
This message text was finalized after this report's first version — see §2.1 for the full picture of what a 401 now means across the API, since this same message is now used consistently everywhere. **Don't rely on message-string matching** to detect "wrong old password" specifically; treat any 401 from this endpoint as "current password was missing or incorrect" and prompt the user to re-enter it.

### 1.2 Signup Consent (`POST /api/auth/verify-otp`) — `acceptedTerms` is now required for new accounts

**Why:** The backend previously had no Terms of Service / Privacy Policy acceptance recorded anywhere for self-registered users. This is now enforced at the point a new account is actually created.

**The rule:** `acceptedTerms` (boolean) must be `true` **only when this OTP verification results in a brand-new account** (a phone number that has never signed up before). For a returning user simply logging back in via OTP, this field is ignored entirely — you can always send it, but it only matters for first-time signups.

**Frontend action required:** before calling `verify-otp` for what might be a new signup, the UI must show a **Terms of Service and Privacy Policy acceptance checkbox** (not pre-checked) and block submission until it's checked. The policy documents themselves are hosted on the frontend/marketing site (the backend does not serve them) — coordinate with product/legal on the actual policy text and URLs to link. (First-pass legal drafts exist in the backend repo under `docs/legal/`, still pending real counsel sign-off — not yet ready to publish as-is.)

**Request body (`VerifyOtpRequest`):**
```json
{
  "phone": "09121234567",
  "code": "123456",
  "acceptedTerms": true
}
```

**Error behavior when omitted on a new signup:**
```
HTTP 400
{
  "statusCode": 400,
  "type": "validation_error",
  "message": "",
  "errors": [
    { "field": "acceptedterms", "message": "برای ایجاد حساب کاربری باید قوانین و مقررات و حریم خصوصی را بپذیرید." }
  ]
}
```
Note the field name in the response is lowercase `"acceptedterms"` (no camelCase) — match on this exact string if you're branching UI logic on the error field.

**Practical UI flow suggestion:** since the frontend can't know ahead of time whether a given phone number is new or returning, the simplest safe approach is to always show the consent checkbox on the OTP-entry screen for the signup/login flow, and always send `acceptedTerms` with its current value. If the number turns out to be a returning user, the field is silently ignored; if it's new, the checkbox has already done its job.

---

## 2. API Resilience & Error Handling

### 2.1 Unified 401 behavior — now consistent everywhere, including the case that matters most

**This section is new/updated since the first version of this report — it closes a real gap, not just a wording tweak.**

There are actually **two different sources** of a 401 response in this API, and until now only one of them returned a proper JSON body:

1. **Application-level auth failures** (wrong password on login, wrong `oldPassword` on change-password, an invalid/expired refresh token on `refresh`/`logout`/`switch-context`). These already went through the standard error envelope, just with the wrong message text — now fixed to say:
   ```json
   {
     "statusCode": 401,
     "type": "authentication_error",
     "message": "نشست شما نامعتبر است، لطفاً دوباره وارد شوید",
     "errors": []
   }
   ```
2. **An expired, invalid, or missing access token on any protected endpoint** — i.e. the single most common real-world "session expired" scenario for a user who's been sitting on a page for a while. **This previously did not go through the error envelope at all** — it was a bare 401 with no body, produced directly by the JWT authentication layer before the request ever reached application code. This is now fixed to return the exact same JSON shape and message as case 1 above. There's an equivalent fix for 403 (authenticated but not permitted): now returns `{"statusCode":403,"type":"authorization_error","message":"شما اجازه دسترسی به این عملیات را ندارید","errors":[]}` instead of a bare 403.

**What this means for the frontend:** every 401 you receive from an authenticated route — regardless of which of the two cases above produced it — now has a parseable JSON body with the same shape and the same message. Your existing axios interceptor logic that clears tokens and redirects to login on a 401 (`forceLogout()` in `axios-instance.ts`) already does the right thing structurally; the practical improvement here is that you can now reliably read `error.response.data.message` for display instead of guessing, and you no longer need to special-case "empty body" for this specific status code. Login-endpoint 401s (wrong password) and mid-session 401s (expired token) now look identical on the wire — if you want to show different copy for "wrong password" (on the login form) vs. "please log in again" (redirect from elsewhere in the app), key off of **which endpoint the request was for**, not the response body, since the message text is shared.

### 2.2 Rate Limiting — now partitioned per authenticated user, two different 429 response shapes

**What changed:** the global rate limiter (10 requests/minute) now keys on the authenticated user's ID when a valid token is present, instead of only the client IP. This mainly benefits users behind shared/carrier-grade NAT IPs — it does not raise the limit itself, just fixes who it's counted against. The `send-otp`/`verify-otp` endpoints keep their own separate, stricter limit: **5 requests/minute per IP** (these are pre-authentication, so they're still IP-based).

**Important: there are two different mechanisms that both produce HTTP 429, with different response bodies. The frontend must handle both.**

1. **Global/OTP rate limiter (infrastructure-level).** When *this* limiter rejects a request, the response is a **bare 429 with no JSON body** (and no `Retry-After` header — the backend does not currently send one). Do not attempt to `JSON.parse()` this response body; check the status code first and fall back to a generic message if parsing fails or the body is empty.
2. **Application-level lockout/cooldown** (e.g., login lockout after 5 failed password attempts, OTP resend cooldown, OTP max verify attempts). These *do* return the standard envelope:
   ```json
   {
     "statusCode": 429,
     "type": "rate_limit_exceeded",
     "message": "لطفاً کمی صبر کنید و دوباره تلاش کنید.",
     "errors": []
   }
   ```
   (The exact `message` text varies by which limit was hit — login lockout, OTP cooldown, or OTP max-attempts all have their own wording.)

**Recommended handling:** on any 429, try to parse the body as JSON; if it parses and has `type: "rate_limit_exceeded"`, show `message` directly to the user. If parsing fails (empty/non-JSON body), show a generic "Too many requests — please wait a minute and try again" message. **Since no `Retry-After` header is provided today, the frontend cannot show an exact countdown** — the safest UX is a generic cooldown message, or a client-side disable-and-re-enable-after-~60s pattern (the global window is a fixed 1-minute window) rather than promising an exact retry time you can't actually know.

*(Unlike the 401/403 case in §2.1, this bare-429 gap has not been fixed — it's a separate, known, currently-accepted limitation. Flag it to backend if it becomes a real problem for your UX.)*

### 2.3 SMS/OTP Gateway Resilience — timeouts and retries on `send-otp`

**What changed:** the OTP SMS gateway call now has an explicit 10-second timeout per attempt, plus automatic retry-with-backoff and a circuit breaker (so a degraded gateway doesn't hang every request indefinitely, and stops hammering a gateway that's already failing). Previously there was no timeout at all.

**Frontend impact:** because of the automatic retries, a `send-otp` call can legitimately take **longer than 10 seconds** in the worst case (a single attempt times out at 10s, but a transient failure triggers a retry before the request finally succeeds or fails). Design for this:
- Show a loading spinner on the "Send OTP" button immediately on click.
- **Disable the button while the request is in flight** — do not rely on the previous assumption that a slow response means the request failed; a double-click could trigger a second SMS/OTP code before the first request has even returned.
- Consider a generous client-side timeout of your own (e.g., 20–30s) before showing a "having trouble sending — please try again" message, rather than assuming the request is dead at 10s.

### 2.4 Expanded Validation — Payments, Wallets, and Appointments now return field-level validation errors

**What changed:** server-side FluentValidation now runs on the request DTOs below (previously only the Auth endpoints had this). Sending invalid data to these endpoints now returns a structured `400` instead of failing deeper in business logic with a less specific error.

**Standard error envelope (unchanged shape, now hit far more often on these endpoints):**
```json
{
  "statusCode": 400,
  "type": "validation_error",
  "message": "",
  "errors": [
    { "field": "amount", "message": "مبلغ پرداخت باید بزرگ‌تر از صفر باشد" },
    { "field": "invoiceid", "message": "شناسه فاکتور نامعتبر است" }
  ]
}
```
`errors` can contain more than one entry — show all of them, mapped to the corresponding form fields via `field` (always lowercase, matching the DTO property name lowercased — e.g. `invoiceId` → `"invoiceid"`, `newStartTime` → `"newstarttime"`).

**Endpoints/fields now validated:**

| Endpoint | DTO | Key rules |
|---|---|---|
| `POST /api/payments` | `RecordPaymentRequest` | `invoiceId` > 0; `amount` > 0; `paymentMethod` and `paymentType` in range 1–5; `idempotencyKey` ≤ 100 chars |
| `POST /api/payments/refund` | `RefundPaymentRequest` | `paymentId` > 0; `amount` > 0; `reason` ≤ 500 chars |
| `POST /api/wallets/charge`, `POST /api/wallets/debit` | `WalletOperationRequest` | `customerId` > 0; `amount` > 0; `description` ≤ 500 chars |
| `POST /api/appointments` | `CreateSalonAppointmentRequest` | `customerId` > 0; `services` non-empty, each line's `offeringId`/`staffId` > 0 |
| `POST /api/appointments/quick-book` | `QuickBookRequest` | `phone` matches `09#########`; `services` non-empty (same line validation) |
| `POST /api/appointments/{id}/cancel` | `CancelAppointmentRequest` | `reason` ≤ 500 chars (optional field, body itself can be empty) |
| `POST /api/appointments/{id}/reschedule` | `RescheduleAppointmentRequest` | `newStartTime` must be in the future |
| `PUT /api/appointments/{id}` | `ModifyAppointmentRequest` | `startTime` must be in the future; `services` non-empty; `notes` ≤ 1000 chars |

These are **additive** — the underlying business-rule errors you may already handle (e.g. "time slot not available", "insufficient wallet balance") are unchanged and still come through the same envelope with their own `field`/`message`; this is a new, earlier layer of shape/range validation on top.

### 2.5 New Security Headers — iframe embedding of the API is now blocked

**What changed:** every API response now includes `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and a `Content-Security-Policy: default-src 'none'` (the last one is skipped for `/swagger` routes, which still need to render their own UI in dev).

**Frontend impact:** if any part of the frontend ever embeds a backend URL directly in an `<iframe>` (e.g., to preview an uploaded media file's raw URL, or to render a docs/help page served by the API), **that will now be blocked by the browser**. This does **not** affect normal `fetch`/`axios` API calls from your app — those are unaffected by `X-Frame-Options`/CSP, which only govern how a page can be framed or what it can load in a `<script>`/`<style>`/etc. context. If you do have an iframe embedding pattern anywhere, flag it to backend — the fix there would be serving that specific content differently, not reverting this header.

---

## 3. API Contract & Documentation

- **Live Swagger UI:** `https://<api-host>/swagger` (Development environment only) — always reflects the exact current contract; use this for day-to-day endpoint reference while building.
- **Checked-in OpenAPI snapshot:** `docs/openapi/v1.json` in the backend repo — a point-in-time export of the full API surface (139 paths as of this report), used internally by the backend team as a contract-drift check in their test suite. Useful if you want to generate a typed API client (e.g., via `openapi-typescript` or similar) from a stable file rather than a live server.
- **`docs/FRONTEND_INTEGRATION_GUIDE.md`** (backend repo) — the primary hand-written reference for endpoint list, request/response shapes, auth flow, and pagination conventions. It has already been updated for both changes in section 1 above (the new `oldPassword` and `acceptedTerms` fields are documented there with the same detail as this report). Treat it as the source of truth for anything not covered here.
- **No breaking route/verb changes** in this update — every change above is either a new optional-turned-conditionally-required field, a new response possibility (429/400/401 shapes you may not have hit before), or a non-functional header. No existing endpoint was removed, renamed, or had its success-response shape changed.

---

## 4. Next Steps — Action Items for Frontend

1. **Add the "Current Password" field** to the change-password UI, sent as `oldPassword`; keep the first-time password-setup screen as-is (no old password needed there).
2. **Add a Terms of Service / Privacy Policy consent checkbox** to the signup/OTP-verification flow, wired to `acceptedTerms` in the `verify-otp` call. Coordinate with product/legal on the actual policy page URLs and copy (legal drafts exist backend-side but are not yet finalized by real counsel — don't treat them as publish-ready text).
3. **Simplify/verify your global 401 handler**: given §2.1, you can now trust that every 401 on an authenticated route carries the same parseable message — you no longer need special-case handling for "empty body" 401s from expired tokens specifically.
4. **Add a global 429 handler** in your API client layer that: (a) tries to parse a JSON body and shows `message` if `type: "rate_limit_exceeded"`, (b) falls back to a generic "too many requests, try again in a minute" message if the body doesn't parse (this one — unlike 401 — still has a bare-body case, see §2.2). Don't attempt to show an exact countdown — no `Retry-After` header is available yet.
5. **Update the "Send OTP" button** to disable itself and show a spinner for the duration of the request, and don't assume failure before ~20–30 seconds given the new retry behavior.
6. **Add inline field-error rendering** for the Payments/Wallets/Appointments forms listed in §2.4, parsing the `errors[]` array by lowercase `field` name.
7. **Audit for any iframe usage** pointing at backend URLs; flag any you find to the backend team before this ships, since they'll now be blocked by the browser.
8. Treat `docs/FRONTEND_INTEGRATION_GUIDE.md` and the live `/swagger` UI as your two primary references going forward; this report is a change summary, not a full contract reference.

---

## 5. Infrastructure Notes (informational — no frontend action required)

These are backend/DevOps-side facts worth knowing as context, not things the frontend needs to build around:

- **No production server exists yet.** Everything described in this report has been verified against the backend's own test suite (89/89 passing, including a full API-layer integration suite), not against a live deployed environment. Treat any timing/behavior numbers (e.g. the SMS gateway's 10s timeout) as accurate to the code, not yet battle-tested under real production load.
- **At-rest database encryption (TDE or equivalent) is not currently active** — there's no production database to enable it on yet. This has been formally documented as a **mandatory pre-production infrastructure requirement** on the backend side (not something the frontend needs to account for, but worth knowing that user data in early environments isn't encrypted at rest beyond standard transport security).
- **Production server setup, hosting region, and TDE activation are all pending future DevOps tasks**, tracked separately from this application-level work.
