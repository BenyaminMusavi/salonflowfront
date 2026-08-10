# راهنمای یکپارچه‌سازی فرانت‌اند (Frontend Integration Guide)

سند قرارداد API برای تیم فرانت‌اند SalonFlow. ساختار بر اساس **صفحات اپلیکیشن (UI Screens)** است تا برای هر صفحه مشخص باشد چه endpointهایی، با چه پارامترها و چه شکل JSON لازم است.

- Base URL: ریشهٔ `SalonFlow.Api` (مثلاً `https://{host}/`)
- Auth header: `Authorization: Bearer {accessToken}`
- JSON: camelCase
- موفقیت با بدنه: معمولاً داخل envelopeی `ApiResponse<T>` می‌آید — همیشه `response.data` را بخوانید
- موفقیت بدون بدنه: `204 No Content` یا `200` خالی — wrap نمی‌شود

> این سند فقط **API Contract** است؛ هیچ کد سمت سرور در آن نیست.

---

## فهرست

1. [مقدمه و احراز هویت (Auth)](#۱-مقدمه-و-احراز-هویت-auth)
2. [اپلیکیشن مشتری (Customer App)](#۲-اپلیکیشن-مشتری-customer-app)
3. [پنل سالن‌دار (Salon Dashboard)](#۳-پنل-سالن‌دار-salon-dashboard)
4. [اشتراک پلتفرم (Platform Subscription)](#۴-اشتراک-پلتفرم-platform-subscription)
5. [قراردادهای مهم (Conventions)](#۵-قراردادهای-مهم-conventions)

---

## ۱. مقدمه و احراز هویت (Auth)

### ۱.۱ مدل کانتکست: مشتری در برابر سالن‌دار

| حالت | Claimهای کلیدی JWT | معنی برای فرانت |
|------|---------------------|-----------------|
| **Customer / Global** | بدون `salon_id` | مرور سالن، رزرو آنلاین، نوبت‌های من، پروفایل |
| **Salon context** | `salon_id` (+ اختیاری `branch_id`) | پنل سالن: کاتالوگ، تخته روزانه، مالی، مشتریان |

- نقش‌های tenant از membership فعال سالن می‌آیند؛ فقط وقتی `salon_id` در توکن باشد.
- پس از Login/OTP، اگر کاربر دقیقاً **یک** membership فعال داشته باشد، سرور ممکن است خودکار کانتکست سالن را ست کند.
- برای ورود صریح به پنل سالن (یا خروج از آن) از `POST /api/auth/switch-context` استفاده کنید و **توکن جدید** را جایگزین کنید.
- اکثر APIهای داشبورد بدون `salon_id` در JWT شکست می‌خورند (403/خطای کسب‌وکار).

### ۱.۲ گرفتن توکن JWT

#### ورود با رمز

`POST /api/auth/login-password` — Anonymous

**Body**

| فیلد | نوع | توضیح |
|------|-----|--------|
| `phone` | string | موبایل |
| `password` | string | رمز |

**پاسخ (`data`)**

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "abc...",
  "hasPassword": true
}
```

#### ورود با OTP

1. `POST /api/auth/send-otp` — Anonymous — rate limit: **۵ درخواست/دقیقه/IP**
2. `POST /api/auth/verify-otp` — Anonymous — همان rate limit

**Send OTP body**

| فیلد | نوع | اعتبارسنجی |
|------|-----|------------|
| `phone` | string | الگوی `09#########` (۱۱ رقم، شروع با ۰۹) |

**Verify OTP body**

| فیلد | نوع |
|------|-----|
| `phone` | string |
| `code` | string |

**Verify پاسخ:** همان `AuthResponse` (access + refresh + `hasPassword`).

```json
{ "phone": "09121234567", "code": "123456" }
```

#### تنظیم رمز / تکمیل پروفایل پس از OTP

`POST /api/auth/set-password` — JWT

| فیلد | نوع |
|------|-----|
| `password` | string |
| `firstName` | string |
| `lastName` | string |

پاسخ: `200` خالی.

#### فراموشی رمز

`POST /api/auth/forget-password` — Anonymous — body همان `SendOtpRequest` (`phone`).

#### تمدید و خروج

| Method + Path | Auth | Body | پاسخ |
|---------------|------|------|------|
| `POST /api/auth/refresh` | Anonymous | `refreshToken`, `salonId?`, `branchId?` | `AuthResponse` |
| `POST /api/auth/logout` | JWT | `refreshToken` | `200` خالی |

در refresh، `salonId` / `branchId` را بفرستید تا کانتکست سالن بعد از تمدید حفظ شود؛ سرور membership را دوباره اعتبارسنجی می‌کند.

#### کاربر جاری

`GET /api/auth/me` — JWT

```json
{
  "userId": 42,
  "phone": "09121234567",
  "firstName": "سارا",
  "lastName": "محمدی",
  "memberships": [
    {
      "salonId": 12,
      "salonPublicId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "salonName": "سالن زیبایی آوا",
      "roleId": 2,
      "roleName": "SalonOwner",
      "branchId": null
    }
  ]
}
```

`memberships` فقط عضویت‌های **فعال** روی سالن‌های حذف‌نشده است (یک ردیف به‌ازای هر membership؛ برای Staff ممکن است چند شعبه از یک سالن بیاید). از این لیست Business Switcher را پر کنید، سپس با `salonId`/`branchId` به `switch-context` بروید تا JWT داشبورد ست شود.

> برای پروفایل مبتنی بر JWT از همین endpoint استفاده کنید. `GET /api/users/me` در وضعیت فعلی قرارداد قابل‌اعتماد برای کلاینت نیست.

### ۱.۳ Switch-Context

`POST /api/auth/switch-context` — JWT

| فیلد | نوع | معنی |
|------|-----|------|
| `salonId` | number \| null | شناسهٔ عددی سالن؛ `null` = برگشت به حالت مشتری/سراسری |
| `branchId` | number \| null | شعبهٔ فعال (اختیاری) |

**پاسخ:** `AuthResponse` جدید — `accessToken` قبلی را دور بیندازید.

```json
{ "salonId": 12, "branchId": 3 }
```

برای خروج از پنل سالن:

```json
{ "salonId": null, "branchId": null }
```

### ۱.۴ سیاست‌های Authorization (خلاصه)

| Policy / شرط | کاربرد UI |
|--------------|-----------|
| Anonymous | لیست سالن، جزئیات، اسلات‌های عمومی، OTP |
| JWT ساده | پروفایل، favorites، media |
| `CustomerOnly` | `POST /api/booking/create`، `GET /api/appointments/me*` |
| `SalonAccess` | تخته روزانه، رزرو سالن، lifecycle، Z-Report |
| `CanCancelAppointment` | لغو نوبت (مشتری یا سالن) |

---

## ۲. اپلیکیشن مشتری (Customer App)

### ۲.۱ صفحه لیست سالن‌ها / جستجو

**UI:** جستجو، فیلتر جنسیت/سرویس/قیمت/امتیاز، فاصله، کارت سالن.

`GET /api/salons` — Public

فقط سالن‌هایی که **onboarding تایید شده** (`SalonApprovalStatus=Approved`) **و** `TrustStatus=Active` هستند. سالن‌های `UnderReview` / `Suspended` در کاتالوگ عمومی دیده نمی‌شوند. `rating` از فیلد denormalized `AverageRating` (فقط نظرات Approved سالن) می‌آید.

| Query | نوع | پیش‌فرض | توضیح |
|-------|-----|---------|--------|
| `lat` | number? | — | برای `distanceKm` |
| `lng` | number? | — | |
| `page` | number | 1 | |
| `pageSize` | number | 20 | |
| `search` | string? | — | |
| `genderType` | number? | — | |
| `serviceTypeId` | number? | — | |
| `minPrice` / `maxPrice` | number? | — | |
| `minRating` | number? | — | |

**`data`:** `PagedResult<SalonCardDto>`

```json
{
  "items": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "سالن نمونه",
      "imageUrl": "https://...",
      "genderType": "بانوان",
      "services": "کوتاهی، رنگ",
      "rating": 4.6,
      "distanceKm": 1.2,
      "minPrice": 350000
    }
  ],
  "page": 1,
  "pageSize": 20,
  "totalCount": 48,
  "totalPages": 3,
  "hasNext": true,
  "hasPrevious": false
}
```

**انواع سرویس (فیلتر/چیپ):** `GET /api/service-type` — Public

```json
[
  {
    "id": "…",
    "name": "کوتاهی مو",
    "displayOrder": 1,
    "imageUrl": "https://..."
  }
]
```

**جزئیات سالن:** `GET /api/salons/{id}` — `id` = Guid عمومی سالن. همان شرط کاتالوگ: `SalonApproval=Approved` و `TrustStatus=Active`؛ وگرنه یافت نشد.

فیلدهای مهم `data`: `name`, `description`, لینک‌های اینستاگرام/واتساپ/وبسایت، `coverImageUrl`, `imageUrl`, `gallery[]`, `branches[]`, `services[]`, `workingHours[]` (`dayName`, `start`, `end`, `isOff`).

`branches[]` (فقط شعبه‌های فعال):

| فیلد | نوع | توضیح |
|------|-----|--------|
| `publicId` | Guid | شناسهٔ عمومی شعبه (برای گام‌های بعدی رزرو) |
| `name` | string | |
| `city` | string | |
| `address` / `phone` | string? | |
| `latitude` / `longitude` | number? | |
| `genderType` | number | |

`services[]` (سطح سالن — خلاصه):

| فیلد | نوع | توضیح |
|------|-----|--------|
| `offeringPublicId` | Guid | PublicId مربوط به **ServiceOffering** (نه ServiceType) |
| `name` | string | نام نوع سرویس |

**علاقه‌مندی‌ها (نیاز به JWT مشتری)**

| Method + Path | توضیح |
|---------------|--------|
| `GET /api/favorites` | لیست |
| `POST /api/favorites/{salonId}` | `salonId` = long داخلی |
| `DELETE /api/favorites/{salonId}` | 204 |

`FavoriteSalonDto`: `id`, `salonId`, `salonName`, `createdAt`.

> توجه: لیست سالن‌ها `id` از نوع **Guid** برمی‌گرداند؛ favorites با **long** کار می‌کند. برای favorite باید شناسهٔ عددی سالن را از مسیر دیگری (مثلاً membership/جزئیات داخلی) داشته باشید یا تا یکسان‌سازی قرارداد، این endpoint را با احتیاط map کنید.

---

### ۲.۲ فلوی رزرو آنلاین (از شعبه تا ثبت نوبت)

ترتیب پیشنهادی صفحات:

```
جزئیات سالن → انتخاب شعبه → انتخاب خدمات → تقویم → انتخاب پرسنل
→ پیش‌فاکتور قیمت/بیعانه → اسلات زمانی → تأیید و ثبت
```

#### گام ۱ — خدمات شعبه

`GET /api/salons/branches/{branchPublicId}/services` — Public (`branchPublicId` = Guid)

```json
[
  {
    "offeringPublicId": "…",
    "servicePublicId": "…",
    "name": "کوتاهی",
    "description": null,
    "imageUrl": null,
    "durationMinutes": 45,
    "price": 450000,
    "requiresDeposit": true,
    "depositAmount": 100000
  }
]
```

| فیلد | نوع | نکته |
|------|-----|------|
| `offeringPublicId` | Guid | PublicId مربوط به **ServiceOffering** (برای create/slots) |
| `servicePublicId` | Guid | PublicId نوع سرویس (`ServiceType`) — نمایش/فیلتر |
| `price` / `deposit*` | number | قیمت پایهٔ offering حل‌شده |

#### گام ۲ — تقویم ۳۰ روزه

`GET /api/salons/branches/{branchPublicId}/available-dates?serviceTypePublicId={guid}` — Public

```json
[
  { "date": "2026-08-01", "isAvailable": true },
  { "date": "2026-08-02", "isAvailable": false }
]
```

روزهای `isAvailable=false` را در UI خاکستری/غیرفعال کنید. از `servicePublicId` پاسخ خدمات شعبه به‌عنوان `serviceTypePublicId` استفاده کنید.

#### گام ۳ — پرسنل فعال در آن روز

`GET /api/salons/branches/{branchPublicId}/staff-availability?serviceTypePublicId={guid}&date=2026-08-01` — Public

```json
[
  {
    "staffPublicId": "…",
    "fullName": "علی رضایی",
    "profileImageUrl": null,
    "startTime": "09:00:00",
    "endTime": "18:00:00"
  }
]
```

#### گام ۴ — محاسبه قیمت و بیعانه (پیش‌فاکتور)

`GET /api/salons/branches/{branchPublicId}/calculate-price?serviceTypePublicIds={guid}&serviceTypePublicIds={guid}&staffPublicId={guid?}` — Public

اولویت قیمت: **پرسنل → شعبه → استاندارد سالن**.

```json
{
  "services": [
    {
      "serviceTypePublicId": "…",
      "serviceName": "کوتاهی",
      "price": 450000,
      "requiresDeposit": true,
      "depositAmount": 100000
    }
  ],
  "totalPrice": 450000,
  "totalDepositAmount": 100000,
  "amountDueNow": 100000,
  "remainingAfterDeposit": 350000,
  "freeCancellationWindowHours": 24
}
```

در UI نمایش دهید: مبلغ الان (`amountDueNow`)، باقی‌مانده در سالن، و پنجرهٔ لغو رایگان.

#### گام ۵ — اسلات‌های زمانی

دو قرارداد موازی وجود دارد؛ برای browse مشتری مسیر Salon توصیه می‌شود:

**الف) مسیر Salon browse (پیشنهادی برای این فلو)**

`GET /api/salons/available-slots` — Public

| Query | نوع |
|-------|-----|
| `branchPublicId` | Guid |
| `staffProfilePublicId` | Guid? — اگر null = «اولین نفر آزاد» |
| `date` | DateOnly (`yyyy-MM-dd`) |
| `serviceTypePublicIds` | Guid[] |

```json
{
  "staffProfilePublicId": "…",
  "slots": [
    { "time": "10:00", "endTime": "10:45" },
    { "time": "11:00", "endTime": "11:45" }
  ]
}
```

**ب) مسیر Booking (با offering عمومی)**

`GET /api/booking/slots` — Public

| Query | نوع |
|-------|-----|
| `salonPublicId` | Guid |
| `branchPublicId` | Guid |
| `staffPublicId` | Guid? |
| `offeringPublicIds` | Guid[] **الزامی** |
| `date` | DateTime |

```json
[
  {
    "start": "2026-08-01T10:00:00Z",
    "end": "2026-08-01T10:45:00Z",
    "staffPublicId": "…",
    "isAvailable": true
  }
]
```

**پرسنل بر اساس offeringها:**  
`GET /api/staff-profiles/by-salon/{salonPublicId}/for-services?offeringPublicIds={guid}&offeringPublicIds={guid}`

```json
[{ "staffPublicId": "…", "firstName": "علی", "avatarUrl": null }]
```

#### گام ۶ — ثبت نوبت آنلاین

`POST /api/booking/create` — Policy: **CustomerOnly**

| فیلد | نوع | توضیح |
|------|-----|--------|
| `salonPublicId` | Guid | شناسهٔ عمومی سالن |
| `branchPublicId` | Guid? | شناسهٔ عمومی شعبه |
| `startTime` | datetime | UTC/ISO |
| `notes` | string? | |
| `services` | array | حداقل یک خط |

هر خط سرویس:

| فیلد | نوع |
|------|-----|
| `offeringPublicId` | Guid | `ServiceOffering.PublicId` |
| `staffPublicId` | Guid | `StaffMember.PublicId` |

```json
{
  "salonPublicId": "…",
  "branchPublicId": "…",
  "startTime": "2026-08-01T10:00:00Z",
  "notes": null,
  "services": [
    { "offeringPublicId": "…", "staffPublicId": "…" }
  ]
}
```

**پاسخ `data`:** Guid = `Appointment.PublicId` (برای `GET /api/appointments/me/{appointmentPublicId}`).

**رفتار مهم برای UI**

- `CustomerId` و `Source=Online` از سرور/JWT می‌آید — نفرستید.
- اگر سرویس بیعانه داشته باشد، سرور از **کیف پول مشتری** بیعانه می‌گیرد؛ موجودی ناکافی → خطا.
- پنجرهٔ لغو رایگان با `freeCancellationWindowHours` (معمولاً ۲۴) هم‌خوان است.

> **نگاشت شناسه‌ها (Phase 3):** کل قیف رزرو مشتری (browse → slots → create → me) با Guid/`PublicId` است. long داخلی فقط داخل Application resolve می‌شود. APIهای سالن‌دار (`POST /api/appointments`, catalog) همچنان long می‌مانند.

---

### ۲.۳ پروفایل و نوبت‌های من

#### لیست نوبت‌های من

`GET /api/appointments/me` — CustomerOnly

```json
[
  {
    "id": "…",
    "startTime": "2026-08-01T10:00:00Z",
    "endTime": "2026-08-01T10:45:00Z",
    "status": 1,
    "salonName": "سالن نمونه",
    "staffNames": "علی رضایی"
  }
]
```

`id` = Guid عمومی نوبت (`Appointment.PublicId`).

#### جزئیات نوبت من

`GET /api/appointments/me/{appointmentPublicId}` — CustomerOnly (`appointmentPublicId` = Guid)

```json
{
  "id": "…",
  "startTime": "2026-08-01T10:00:00Z",
  "endTime": "2026-08-01T10:45:00Z",
  "status": 1,
  "salonName": "سالن نمونه",
  "branchName": "شعبه ونک",
  "branchAddress": "…",
  "services": [
    {
      "offeringPublicId": "…",
      "staffPublicId": "…",
      "name": "کوتاهی",
      "durationMinutes": 45,
      "price": 450000,
      "staffName": "علی رضایی"
    }
  ],
  "totalPrice": 450000,
  "totalDurationMinutes": 45
}
```

#### لغو توسط مشتری

`POST /api/appointments/{id}/cancel` — CanCancelAppointment → **204**

```json
{ "reason": "تغییر برنامه" }
```

| وضعیت مجاز | Scheduled |
|------------|-----------|
| لغو رایگان | معمولاً ≥ ۲۴ ساعت مانده → استرداد بیعانه به کیف پول |
| لغو دیرهنگام | بیعانه ممکن است جریمه شود |

#### وضعیت نوبت (برای badge)

| مقدار | معنی |
|------:|------|
| 1 | Scheduled |
| 2 | Completed |
| 3 | Cancelled |
| 4 | NoShow |
| 5 | CheckedIn |

#### نظرات (اختیاری پس از تکمیل)

`POST /api/reviews` — JWT مشتری (`CustomerOnly`)

| فیلد | نوع |
|------|-----|
| `appointmentId` | number |
| `targetType` | number (1=Salon, 2=Staff؛ پیش‌فرض 1) |
| `staffMemberId` | number? |
| `rating` | number (۱–۵) |
| `comment` | string? |

پاسخ `ReviewDto`: `moderationStatus` (`1=Pending`, `2=Approved`, `3=Rejected`)، `isVerified`, بدون `isApproved`/`isPublished`. نظر تازه همیشه `Pending` است تا ادمین پلتفرم تایید کند.

| Method + Path | توضیح |
|---------------|--------|
| `PUT /api/reviews/{id}` | ویرایش (`EditReviewRequest`: rating, comment) — Revision ذخیره و وضعیت → Pending |
| `DELETE /api/reviews/{id}` | حذف نرم (۲۰۴) |
| `GET /api/reviews?salonId=&page=&pageSize=` | لیست عمومی نظرات **Approved** سالن (`AllowAnonymous`)؛ `reply` فقط اگر پاسخ هم Approved باشد |
| `GET /api/reviews/{id}` | جزئیات؛ عمومی فقط Approved (+ reply فقط Approved)؛ مالک/ادمین/سالن پاسخ با هر وضعیت |

#### گزارش سوءرفتار سالن

`POST /api/salon-reports` — JWT مشتری (`CustomerOnly`). پیش‌نیاز: حداقل یک نوبت `Completed` در آن سالن. همزمان فقط یک گزارش فعال (`Pending`/`Investigating`) per `(customer, salon)`.

| فیلد | نوع |
|------|-----|
| `salonId` | number |
| `reason` | number (1=Misconduct, 2=Scam, 3=Inappropriate, 4=Other) |
| `description` | string? |
| `appointmentId` | number? (اختیاری؛ باید Completed و متعلق به همان مشتری/سالن باشد) |

---

## ۳. پنل سالن‌دار (Salon Dashboard)

پیش‌نیاز همهٔ صفحات این بخش: JWT با **`salon_id`** (از طریق login خودکار یا `switch-context`).

**پیش‌نیاز اشتراک:** قبل از `POST /api/salons/save-basic-info` برای **ایجاد** سالن جدید، مالک باید اشتراک billable داشته باشد (`Trialing` / `Active` / `Grace`) و تعداد سالن‌هایش از `maxSalons` طرح کمتر باشد. ابتدا [۴. اشتراک پلتفرم](#۴-اشتراک-پلتفرم-platform-subscription) را ببینید (مثلاً `POST /api/subscriptions/trial`).

### ۳.۱ ویزارد ثبت سالن

ترتیب صفحات onboarding:

| مرحله | Method + Path | Body / Form |
|-------|---------------|-------------|
| ۱. اطلاعات پایه | `POST /api/salons/save-basic-info` | JSON زیر |
| ۲. شعبه‌ها | `POST /api/salons/{salonPublicId}/save-branches` | `branches[]` |
| ۳. سرویس‌ها | `POST /api/salons/{salonPublicId}/save-services` | `services[]` |
| ۴. پرسنل | `POST /api/salons/{salonPublicId}/save-staff` | `staff[]` |
| ۵. رسانه | `POST /api/salons/{salonPublicId}/save-medias` | multipart |
| ۶. برنامهٔ من | `POST /api/salons/{salonPublicId}/save-my-schedule` | `days[]` |
| ۷. ارسال بررسی | `POST /api/salons/{salonPublicId}/submit-for-review` | — |

همه به‌جز browse عمومی نیاز به JWT دارند.

#### اطلاعات پایه

```json
{
  "publicId": null,
  "name": "سالن جدید",
  "description": "…",
  "instagramHandle": "mysalon",
  "whatsappNumber": "0912…",
  "websiteUrl": "https://…"
}
```

**پاسخ:** `{ "publicId": "…" }` — این Guid را برای بقیهٔ مراحل نگه دارید. برای ویرایش پیش‌نویس، همان `publicId` را دوباره بفرستید.

با ایجاد/ذخیرهٔ اطلاعات پایه، سرور به‌صورت خودکار یک پروفایل `StaffMember` برای مالک سالن می‌سازد (بدون انتساب شعبه). وجود این پروفایل دیگر وابسته به مرحلهٔ ۴ نیست.

#### شعبه‌ها

```json
{
  "branches": [
    {
      "publicId": null,
      "name": "ونک",
      "city": "تهران",
      "address": "…",
      "latitude": 35.75,
      "longitude": 51.41,
      "genderType": 1,
      "phone": "021…"
    }
  ]
}
```

**پاسخ:** آرایهٔ شعبه‌های ذخیره‌شده (همان فیلدها) با `publicId` واقعی سرور — برای شاخه‌های جدید `null` بفرستید؛ بعد از ذخیره، Guidهای برگشتی را در state محلی بگذارید (برای `save-staff` و ویرایش بعدی لازم است).

```json
[
  {
    "publicId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "ونک",
    "city": "تهران",
    "address": "…",
    "latitude": 35.75,
    "longitude": 51.41,
    "genderType": 1,
    "phone": "021…"
  }
]
```

#### سرویس‌ها (در ویزارد)

```json
{
  "services": [
    {
      "publicId": null,
      "serviceTypePublicId": "…",
      "basePrice": 450000,
      "durationMinutes": 45
    }
  ]
}
```

**پاسخ:** آرایهٔ خدمات ذخیره‌شده (همان فیلدها) با `publicId` واقعی سرور — برای خدمات جدید `null` بفرستید؛ بعد از ذخیره، Guidهای برگشتی را در state محلی بگذارید (برای ویرایش بعدی لازم است).

```json
[
  {
    "publicId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "serviceTypePublicId": "…",
    "basePrice": 450000,
    "durationMinutes": 45
  }
]
```

لیست نوع سرویس: `GET /api/service-type`.

#### پرسنل

```json
{
  "staff": [
    {
      "publicId": null,
      "branchPublicId": "…",
      "isCreator": true,
      "phoneNumber": null,
      "offeringPublicIds": ["…", "…"]
    },
    {
      "publicId": null,
      "branchPublicId": "…",
      "isCreator": false,
      "phoneNumber": "0912…",
      "offeringPublicIds": ["…"]
    }
  ]
}
```

اگر `isCreator=false` باشد `phoneNumber` الزامی است.

دقیقاً **یک** آیتم با `isCreator: true` الزامی است — مالک از JWT لینک می‌شود و این فلگ فقط برای **انتساب شعبهٔ مالک** است (هویت پرسنل مالک از مرحلهٔ ۱ وجود دارد). پروفایل `StaffMember` مالک هرگز hard-delete نمی‌شود حتی اگر از لیست حذف شود.

`offeringPublicIds` الزامی است (حداقل یک Guid برای هر پرسنل) — همان `publicId`های `ServiceOffering` برگشتی از مرحلهٔ ۳ (`save-services`)، نه `serviceTypePublicId`. سرور desired-state sync روی `StaffMemberServices` انجام می‌دهد (افزودن / فعال‌سازی / حذف انتساب‌های خارج از لیست) داخل همان تراکنش ذخیرهٔ پرسنل. قیمت/مدت سفارشی همچنان فقط از Catalog: `PUT /api/catalog/staff/{staffMemberId}/services`.

قابلیت پرسنل از طریق انتساب به `ServiceOffering` (`StaffMemberService`) تعریف می‌شود — فیلد `staffType` حذف شده است.

#### رسانه (multipart، حداکثر ۱۰MB در این endpoint)

| Form field | نوع |
|------------|-----|
| `files` | فایل‌ها |
| `keepMediaPublicIds` | string اختیاری — Guidها با ویرگول برای نگه‌داشتن رسانه‌های قبلی |

آپلود عمومی‌تر: `POST /api/Media/upload/{entityType}/{entityPublicId}` (تا ~۵۰MB) با فیلدهای `file`, `mediaType`, `usageType`, `isPrimary`, `mediaPublicId?`.

`EntityType`: 1 Salon, 2 ServiceType, 3 ServiceOffering, 4 StaffMember, 5 Customer, 6 Gallery (obsolete), 7 Appointment, 8 Payment, 9 Invoice, 10 SalonBranch, 11 Review, 12 PlatformInvoice, 13 SalonSubscription, 14 Tip, 15 Refund, 16 Wallet, 17 WalletTransaction, 18 SalonReport, 19 PromoCode, 20 Notification, 21 StaffPayout, 22 StaffEarning, 23 User.  
`MediaUsageType`: 1 Cover, 2 Banner, 3 Profile, 4 Gallery.

#### برنامهٔ کاری مالک

```json
{
  "days": [
    { "dayOfWeek": 0, "isOffDay": true, "startTime": null, "endTime": null },
    { "dayOfWeek": 1, "isOffDay": false, "startTime": "09:00:00", "endTime": "18:00:00" }
  ]
}
```

`dayOfWeek`: 0=یکشنبه … 6=شنبه (قرارداد .NET).

پروفایل پرسنل مالک در صورت نیاز توسط سرور ensure می‌شود؛ این مرحله دیگر به خاطر نبودن `StaffMember` مالک fail نمی‌شود.

#### وضعیت تأیید سالن

`SalonApprovalStatus`: 1 Pending, 2 Approved, 3 Rejected, 4 Draft — فقط سالن‌های Approved در لیست عمومی مشتری دیده می‌شوند.

---

### ۳.۲ مدیریت کاتالوگ و تخصیص پرسنل (Staff-Centric)

Base: `api/catalog` — JWT + کانتکست سالن.

#### CRUD سرویس‌های کاتالوگ (Offerings)

| Method + Path | توضیح |
|---------------|--------|
| `GET /api/catalog/offerings?includeInactive=` | لیست |
| `GET /api/catalog/offerings/{id}` | جزئیات |
| `POST /api/catalog/offerings` | ایجاد |
| `PUT /api/catalog/offerings/{id}` | ویرایش |
| `PATCH /api/catalog/offerings/{id}/active?isActive=` | 204 |
| `DELETE /api/catalog/offerings/{id}` | 204 |

**`ServiceOfferingDto`**

| فیلد | نوع |
|------|-----|
| `id`, `salonId`, `branchId?`, `serviceTypeId` | number |
| `serviceTypeName` | string |
| `durationMinutes`, `bufferBeforeMinutes`, `bufferAfterMinutes` | number |
| `basePrice`, `depositAmount?` | number |
| `isActive`, `isOnlineBookable`, `requiresDeposit` | bool |
| `color` | string? |

**Create body (نمونه)**

```json
{
  "serviceTypeId": 5,
  "branchId": 3,
  "durationMinutes": 45,
  "basePrice": 450000,
  "bufferBeforeMinutes": 0,
  "bufferAfterMinutes": 5,
  "isOnlineBookable": true,
  "requiresDeposit": true,
  "depositAmount": 100000,
  "color": "#C45C26"
}
```

#### تخصیص Offering-Centric (ویرایش نقطه‌ای)

| Method + Path | Body |
|---------------|------|
| `GET .../offerings/{offeringId}/staff` | — |
| `POST .../offerings/{offeringId}/staff` | `staffMemberId`, `customDurationMinutes?`, `customPrice?` |
| `DELETE .../offerings/{offeringId}/staff/{staffMemberId}` | — |

#### تخصیص Staff-Centric (صفحهٔ اصلی توصیه‌شده)

صفحه UI: انتخاب یک پرسنل → تیک خدمات + override قیمت/مدت → ذخیرهٔ کل مجموعه.

| Method + Path | توضیح |
|---------------|--------|
| `GET /api/catalog/staff/{staffMemberId}/services` | وضعیت فعلی |
| `PUT /api/catalog/staff/{staffMemberId}/services` | **desired-state sync** (add/update/remove) |

```json
{
  "services": [
    {
      "serviceOfferingId": 44,
      "customPrice": 500000,
      "customDurationMinutes": 50,
      "isActive": true
    },
    {
      "serviceOfferingId": 45,
      "customPrice": null,
      "customDurationMinutes": null,
      "isActive": true
    }
  ]
}
```

پاسخ: لیست نهایی `StaffServiceDto[]` (`id`, `staffMemberId`, `staffName`, `serviceOfferingId`, `customDurationMinutes?`, `customPrice?`, `isActive`).

#### قوانین قیمت‌گذاری

| Method + Path |
|---------------|
| `GET/POST /api/catalog/pricing-rules` |
| `PUT/DELETE /api/catalog/pricing-rules/{id}` |

`scopeType` (`PricingPolicyType`): 1 Standard, 2 BranchSpecific, 3 StaffSpecific.

#### برنامهٔ کاری و مرخصی پرسنل

**Working schedules** — `api/working-schedules`

| Method + Path | توضیح |
|---------------|--------|
| `GET /api/working-schedules/staff/{staffMemberId}` | لیست |
| `POST /api/working-schedules` | ایجاد (یک روز در هفته) |
| `PUT /api/working-schedules/{id}` | ویرایش |
| `DELETE /api/working-schedules/{id}` | 204 |

فیلدها: `dayOfWeek`, `startTime`, `endTime`, `breakStart?`, `breakEnd?`, `isOffDay`, `isManagedBySalon`.

**Special schedules** (مرخصی / شیفت خاص) — `api/special-schedules`

| Method + Path | Query/Body |
|---------------|------------|
| `GET .../staff/{staffMemberId}?from=&to=` | DateOnly اختیاری |
| `POST /api/special-schedules` | `staffMemberId`, `date`, `isOffDay`, `startTime?`, `endTime?`, `note?` |
| `PUT/DELETE .../{id}` | |

---

### ۳.۳ تخته روزانه (Daily Board)

#### لیست فیلترشدهٔ نوبت‌های سالن

`GET /api/appointments` — SalonAccess

| Query | نوع |
|-------|-----|
| `date` | DateOnly (`yyyy-MM-dd`) |
| `status` | number? |
| `branchId` | number? |
| `staffMemberId` | number? |
| `customerId` | number? |
| `page` / `pageSize` | pagination |

**پاسخ:** `ApiResponse<PagedResult<AppointmentDto>>`

آیتم لیست: `publicId`, `startTime`, `endTime`, `status`, `salonName`, `branchName?`, `staffNames`, `services[]` (`serviceName`, `durationMinutes`, `price`).

#### تخته روز یک پرسنل

`GET /api/appointments/staff/{staffMemberId}/day-board?date=2026-08-01` — SalonAccess

```json
[
  {
    "appointmentId": 101,
    "appointmentPublicId": "…",
    "startTime": "2026-08-01T10:00:00Z",
    "endTime": "2026-08-01T10:45:00Z",
    "status": 1,
    "customerName": "سارا محمدی",
    "serviceName": "کوتاهی",
    "appointmentServiceId": 501
  }
]
```

#### رزرو از طرف سالن

**با مشتری موجود:** `POST /api/appointments` — SalonAccess

```json
{
  "customerId": 88,
  "branchId": 3,
  "startTime": "2026-08-01T11:00:00Z",
  "notes": null,
  "source": 3,
  "services": [{ "offeringId": 44, "staffId": 7 }]
}
```

`source`: فقط `2` WalkIn یا `3` Phone (پیش‌فرض Phone). پاسخ: id نوبت.

**رزرو سریع (Find-or-Create مشتری با موبایل):** `POST /api/appointments/quick-book`

```json
{
  "phone": "0912…",
  "fullName": "میهمان",
  "branchId": 3,
  "startTime": "2026-08-01T12:00:00Z",
  "notes": null,
  "services": [{ "offeringId": 44, "staffId": 7 }]
}
```

```json
{
  "appointmentId": 102,
  "customerId": 90,
  "isNewCustomer": true
}
```

#### ویرایش ساختاری / جابجایی زمان

| Method + Path | Body | پاسخ |
|---------------|------|------|
| `PUT /api/appointments/{id}` | `startTime`, `notes?`, `services[]` | 204 — فقط Scheduled |
| `POST /api/appointments/{id}/reschedule` | `{ "newStartTime": "…" }` | 204 |

#### مشتریان سالن

`GET /api/customers?search=&page=&pageSize=`  
`GET/POST/PUT/DELETE /api/customers/{id}`

`CustomerDto`: `id`, `fullName`, `phone`, `email?`, `birthDate?`, `gender?`, `smsConsent`, `ownerStaffId?`.  
پروفایل: + `totalVisits`, `totalSpent`, `appointments[]`.

---

### ۳.۴ چرخه عمر نوبت (Lifecycle)

همه به‌جز Cancel نیاز به **SalonAccess** دارند. پاسخ موفق: **204**.

```
Scheduled ──check-in──► CheckedIn ──complete──► Completed
    │                      │
    ├──── cancel ──► Cancelled     └── no-show ──► NoShow
    │
    └── no-show (پس از StartTime) ──► NoShow
```

| Action | Path | قوانین UI |
|--------|------|-----------|
| Check-in | `POST /api/appointments/{id}/check-in` | فقط Scheduled؛ روز تقویمی نوبت نباید در آینده باشد |
| Complete | `POST /api/appointments/{id}/complete` | از CheckedIn؛ روز آینده ممنوع؛ صدور فاکتور نهایی + اعتبار بیعانه |
| No-Show | `POST /api/appointments/{id}/no-show` | از Scheduled یا CheckedIn؛ فقط وقتی `StartTime` گذشته؛ بیعانه ممکن است جریمه شود |
| Cancel | `POST /api/appointments/{id}/cancel` | فقط از Scheduled؛ body `{ "reason": "…" }` |

پس از Check-in دیگر Cancel نکنید — از Complete یا NoShow استفاده کنید.

جزئیات یک نوبت: `GET /api/appointments/{id}` (مالکیت مشتری یا کانتکست سالن در سرویس چک می‌شود).

---

### ۳.۵ ماژول مالی (پرداخت‌ها، کیف پول، فاکتور، Z-Report)

#### فاکتورها — `api/invoices`

| Method + Path | توضیح |
|---------------|--------|
| `GET /api/invoices?status=&page=&pageSize=` | لیست صفحه‌بندی‌شده |
| `GET /api/invoices/{id}` | جزئیات + `items[]` |
| `POST /api/invoices/from-appointment/{appointmentId}` | فقط نوبت Completed؛ یک فاکتور نهایی |
| `POST /api/invoices/{id}/items` | افزودن ردیف |
| `DELETE /api/invoices/{id}/items/{itemId}` | حذف ردیف |
| `POST /api/invoices/{id}/cancel` | 204 |

`InvoiceStatus`: 1 Draft, 2 Issued, 3 PartiallyPaid, 4 Paid, 5 Cancelled, 6 Refunded.

#### ثبت پرداخت — `api/payments`

`POST /api/payments`

```json
{
  "invoiceId": 10,
  "amount": 350000,
  "paymentMethod": 1,
  "paymentType": 3,
  "idempotencyKey": "ui-uuid-…",
  "gatewayName": null,
  "gatewayRef": null,
  "receiptNumber": null
}
```

| فیلد مهم | توضیح |
|----------|--------|
| `paymentMethod` | 1 Cash, 2 Card, 3 Online, 4 Transfer, 5 Wallet |
| `paymentType` | 1 Appointment, 2 Deposit, 3 Full, 4 Refund, 5 Penalty — پیش‌فرض Full |
| `idempotencyKey` | برای جلوگیری از دوباره‌پرداخت؛ در replay، `isDuplicate=true` |

پاسخ: `paymentId`, `invoiceId`, `amount`, `paymentMethod`, `invoiceStatus`, `invoiceOutstanding`, `isDuplicate`.

استرداد: `POST /api/payments/refund` — `{ "paymentId", "amount", "reason?" }`  
لیست پرداخت‌های فاکتور: `GET /api/payments/by-invoice/{invoiceId}`.

#### کیف پول — `api/wallets` (سالن روی مشتری خودش)

| Method + Path | توضیح |
|---------------|--------|
| `GET /api/wallets/{customerId}` | موجودی |
| `GET /api/wallets/{customerId}/transactions` | گردش |
| `POST /api/wallets/charge` | شارژ |
| `POST /api/wallets/debit` | برداشت |

Body عملیات: `{ "customerId", "amount", "description?" }`.

`WalletTransactionType`: 1 Credit, 2 Debit.

#### انعام — `api/tips`

`POST /api/tips` — `{ "staffMemberId", "amount", "appointmentId?", "paymentId?" }`  
`GET /api/tips/by-appointment/{appointmentId}`

#### Z-Report (بسته شدن روز)

`GET /api/reports/z-report?salonId={long}&date=2026-08-01` — SalonAccess

```json
{
  "date": "2026-08-01",
  "salonId": 12,
  "cashTotal": 1200000,
  "cardTotal": 800000,
  "onlineTotal": 0,
  "paymentsTotal": 2000000,
  "tipsTotal": 150000,
  "staffCommissionTotal": 400000,
  "staffCommissions": [
    { "staffMemberId": 7, "staffName": "علی", "commissionTotal": 250000 }
  ]
}
```

روز بر اساس تقویم تهران به بازهٔ UTC نگاشت می‌شود. فقط پرداخت‌های Paid با روش Cash/Card/Online در جمع پرداخت‌ها می‌آیند.

---

### ۳.۶ تسویه پرسنل (Payout) و کمیسیون

#### درآمدها — `api/earnings`

`GET /api/earnings?staffMemberId=&status=&page=&pageSize=`  
`POST /api/earnings/{id}/approve`

`EarningStatus`: 1 Pending, 2 Approved, 3 Paid.

`StaffEarningDto`: `id`, `appointmentServiceId`, `staffMemberId`, `commissionRuleId?`, `grossAmount`, `commissionAmount`, `status`, `payoutId?`.

#### تسویه — `api/payouts`

| Method + Path | توضیح |
|---------------|--------|
| `POST /api/payouts` | ساخت از درآمدهای Approved در بازه |
| `GET /api/payouts/{id}` | جزئیات |
| `GET /api/payouts/by-staff/{staffMemberId}` | لیست |
| `POST /api/payouts/{id}/approve` | تأیید |
| `POST /api/payouts/{id}/mark-paid` | `{ "method": 1..4 }` |

ایجاد:

```json
{
  "staffMemberId": 7,
  "periodStart": "2026-07-01",
  "periodEnd": "2026-07-31"
}
```

`PayoutStatus`: 1 Draft, 2 Approved, 3 Paid.  
`method` در mark-paid: Cash/Card/Online/Transfer (بدون Wallet).

#### پلن کمیسیون — `api/commission`

| Method + Path |
|---------------|
| `GET/POST /api/commission/plans` |
| `GET/PUT/DELETE /api/commission/plans/{id}` |
| `POST/PUT/DELETE /api/commission/plans/{planId}/rules[/{ruleId}]` |

`CommissionScope`: 1 SalonDefault, 2 Staff, 3 ServiceType.  
`CommissionCalculationType`: 1 Percentage, 2 Fixed, 3 Tiered.

---

### ۳.۷ اعلان‌ها و نظرات در پنل

**اعلان‌ها** — `api/notifications` (JWT)

| Method + Path | توضیح |
|---------------|--------|
| `GET /api/notifications?unreadOnly=&page=&pageSize=` | inbox |
| `POST /api/notifications/{id}/read` | 204 |
| `POST /api/notifications/read-all` | 204 |
| Push subscriptions / templates | CRUD جداگانه |

**نظرات** — `api/reviews`

| Method + Path | نقش | توضیح |
|---------------|-----|--------|
| `GET /api/reviews?salonId=&page=&pageSize=` | عمومی | فقط `ModerationStatus=Approved` |
| `GET /api/reviews/pending?page=&pageSize=` | AdminOnly | صف تایید |
| `POST /api/reviews/{id}/approve` | AdminOnly | تایید (عمومی می‌شود) |
| `POST /api/reviews/{id}/reject` | AdminOnly | رد |
| `POST /api/reviews/{id}/reply` — `{ "body": "…" }` | SalonAccess | پاسخ سالن → `Pending` تا تایید ادمین |
| `POST /api/reviews/{reviewId}/reply/approve` | AdminOnly | تایید پاسخ |
| `POST /api/reviews/{reviewId}/reply/reject` | AdminOnly | رد پاسخ |

`ReviewDto.moderationStatus` / `reply.moderationStatus`: Pending=1, Approved=2, Rejected=3. در لیست عمومی، `reply` فقط وقتی Approved است برمی‌گردد؛ وگرنه `null`.

**گزارش سوءرفتار / اعتماد** — جدا از Z-Report (`api/reports/z-report`)

| Method + Path | نقش | توضیح |
|---------------|-----|--------|
| `POST /api/salon-reports` | CustomerOnly | ثبت گزارش؛ `ActiveReportCount` +1 |
| `GET /api/salon-reports/pending?page=&pageSize=` | AdminOnly | صف Pending |
| `POST /api/salon-reports/{id}/investigate` | AdminOnly | → Investigating |
| `POST /api/salon-reports/{id}/resolve` | AdminOnly | → Resolved؛ body اختیاری `{ "adminNotes": "…" }`؛ `ActiveReportCount` −1 |
| `POST /api/salon-reports/{id}/dismiss` | AdminOnly | → Dismissed؛ `ActiveReportCount` −1 |
| `POST /api/salons/{id}/trust-status` | AdminOnly | `{ "trustStatus": 1\|2\|3 }` — Active / UnderReview / Suspended (جدا از onboarding approval) |

`SalonReportStatus`: Pending=1, Investigating=2, Resolved=3, Dismissed=4. Resolve/Dismiss وضعیت اعتماد را خودکار عوض نمی‌کنند — ادمین با `trust-status` تصمیم می‌گیرد. آستانه‌های خودکار (`TrustSettings` در appsettings): میانگین کمتر از 3.0 با حداقل ۵ نظر Approved، یا `ActiveReportCount` بیشتر از 3 → `TrustStatus=UnderReview` (کاتالوگ عمومی مخفی). بازیابی فقط با `POST /api/salons/{id}/trust-status`.

---

## ۴. اشتراک پلتفرم (Platform Subscription)

اشتراک **سطح مالک** است (`OwnerUserId`)، نه یک سابسکرایب جدا برای هر سالن. طرح‌ها `maxSalons` دارند؛ همهٔ سالن‌های همان مالک تا سقف طرح entitlement می‌گیرند.

وضعیت‌ها: `Trialing=1`, `Active=2`, `Grace=3`, `PastDue=4`, `Canceled=5`, `Expired=6`, `Suspended=7`  
**Billable (قفل باز):** Trialing, Active, Grace — پس از پایان دوره، ۷ روز Grace سپس Suspended (جاب روزانه Quartz).

**پول:** فعلاً درگاه واقعی نیست. مالک `checkout` می‌سازد → ادمین `mark-paid` می‌کند → اشتراک فعال می‌شود. فیلد `externalPaymentRef` برای ارتقای بعدی به PSP آماده است. فاکتور پلتفرم جدا از `Invoice`/`Payment` رزرو سالن است.

### ۴.۱ کاتالوگ و وضعیت من

| Method + Path | Auth | توضیح |
|---------------|------|--------|
| `GET /api/subscriptions/plans` | Anonymous | طرح‌های فعال؛ در صورت کمپین سراسری، `campaignPrice` / `campaignName` هم برمی‌گردد |
| `GET /api/subscriptions/me` | JWT | اشتراک جاری یا `204` |
| `GET /api/subscriptions/me/entitlement` | JWT | `isEntitled`, `maxSalons`, `ownedSalonCount`, `status`, تاریخ‌ها |
| `GET /api/subscriptions/entitlement/salon/{salonId}` | SalonAccess | entitlement بر اساس مالک همان سالن |

**نمونه plan**

```json
{
  "id": 2,
  "publicId": "…",
  "name": "حرفه‌ای",
  "durationMonths": 12,
  "price": 9900000,
  "currency": "IRR",
  "maxSalons": 3,
  "trialDays": 30,
  "campaignPrice": 7920000,
  "campaignName": "حراج هفته"
}
```

### ۴.۲ دوره آزمایشی و خرید دستی

| Method + Path | Body | توضیح |
|---------------|------|--------|
| `POST /api/subscriptions/trial` | `{ "planId": 1 }` | یک‌بار به ازای هر `OwnerUserId` |
| `POST /api/subscriptions/checkout` | `{ "planId": 2, "promoCode": "SAVE20" }` | فاکتور Pending؛ کمپین فعال + کد پلتفرم اعمال می‌شود |
| `GET /api/subscriptions/invoices/me` | — | فاکتورهای پلتفرم مالک |
| `POST /api/subscriptions/invoices/{invoiceId}/mark-paid` | `{ "paymentMethodNote": "کارت به کارت", "externalPaymentRef": null }` | **فقط Admin** — فعال‌سازی اشتراک |

کدهای تخفیف پلتفرم (`scope=PlatformSubscription`) با کدهای رزرو سالن (`SalonBooking`) جدا هستند؛ سقف استفادهٔ سراسری با `maxRedemptions` / `usedCount`.

### ۴.۳ کمپین و پرومو (Admin)

| Method + Path | توضیح |
|---------------|--------|
| `POST /api/subscriptions/campaigns` | تخفیف زمانی روی یک طرح (`discountType`: Percentage=1 / FixedAmount=2) |
| `GET /api/subscriptions/campaigns?planId=` | لیست |
| `POST /api/subscriptions/campaigns/{id}/deactivate` | 204 |
| `POST /api/subscriptions/promos` | ساخت کد پلتفرم با `maxRedemptions` اختیاری |
| `POST /api/subscriptions/promos/{id}/deactivate` | 204 |

همه با policy `AdminOnly`.

### ۴.۴ معرف (Referral)

| Method + Path | توضیح |
|---------------|--------|
| `GET /api/subscriptions/referral/me` | کد معرف مالک (اگر نبود ساخته می‌شود) |
| `POST /api/subscriptions/referral/attach` | `{ "referralCode": "REF…" }` — دعوت‌شونده خودش را به معرف وصل می‌کند |

پاداش: بعد از **اولین** `mark-paid` دعوت‌شونده، به اشتراک billable معرف **+۳۰ روز** اضافه می‌شود.

---

## ۵. قراردادهای مهم (Conventions)

### ۵.۱ ساختار `ApiResponse<T>`

پاسخ‌های موفق با بدنهٔ Object معمولاً این شکل را دارند:

```json
{
  "data": { },
  "serverTime": "2026-07-31T16:00:00.000Z"
}
```

| فیلد | نوع | توضیح |
|------|-----|--------|
| `data` | `T` | payload واقعی صفحه |
| `serverTime` | datetime UTC | زمان سرور در لحظهٔ wrap |

**Wrap نمی‌شود:**

- `204 No Content`
- `200` بدون بدنه
- خطاهای ≥ ۴۰۰
- بدنهٔ از قبل از نوع `ApiResponse`
- `null` / NotFound خام

همیشه در کلاینت: اگر status=204 → موفقیت بدون `data`؛ اگر 2xx با JSON → `response.data`.

### ۵.۲ مدیریت خطاها

خطاها از middleware سراسری می‌آیند. شکل قرارداد فعلی **custom JSON** است (نه الزاماً RFC 7807 ProblemDetails)، هرچند فیلتر پاسخ، در صورت وجود `ProblemDetails`، آن را دست‌نخورده می‌گذارد.

```json
{
  "statusCode": 400,
  "type": "validation_error",
  "message": "",
  "errors": [
    { "field": "amount", "message": "مبلغ باید بزرگ‌تر از صفر باشد" }
  ]
}
```

| `type` | HTTP | معنی برای UI |
|--------|------|--------------|
| `validation_error` | 400 | پیام کنار فیلد / toast |
| `authentication_error` | 401 | هدایت به لاگین / refresh |
| `authorization_error` | 403 | دسترسی ندارید (اغلب کانتکست سالن اشتباه) |
| `not_found` | 404 | منبع نیست |
| `rate_limit_exceeded` | 429 | OTP زیاد فرستاده شده — صبر |
| `server_error` | 500 | خطای عمومی |

هدر همبستگی (در صورت وجود): `X-Correlation-ID` را برای پشتیبانی لاگ کنید.

### ۵.۳ Query: Pagination و DateOnly

#### Pagination

| پارامتر | نوع | پیش‌فرض |
|---------|-----|---------|
| `page` | number | 1 |
| `pageSize` | number | 20 |

پاسخ صفحه‌بندی‌شده:

| فیلد | نوع |
|------|-----|
| `items` | T[] |
| `page`, `pageSize`, `totalCount`, `totalPages` | number |
| `hasNext`, `hasPrevious` | bool |

#### DateOnly

پارامترهای تاریخ مثل `date`, `from`, `to`, `periodStart` را به صورت **`yyyy-MM-dd`** بفرستید:

```
GET /api/appointments/staff/7/day-board?date=2026-08-01
GET /api/reports/z-report?salonId=12&date=2026-08-01
```

TimeOnly در JSON معمولاً `"09:00:00"` است.

آرایه‌های query را تکرار کنید:

```
?serviceTypePublicIds={guid}&serviceTypePublicIds={guid}
?offeringPublicIds={guid}&offeringPublicIds={guid}
```

### ۵.۴ Enumهای پرکاربرد (عدد در JSON)

| Enum | مقادیر |
|------|--------|
| AppointmentStatus | 1 Scheduled, 2 Completed, 3 Cancelled, 4 NoShow, 5 CheckedIn |
| AppointmentSource | 1 Online, 2 WalkIn, 3 Phone, 4 Quick |
| GenderType | 1 Male, 2 Female, 3 Mixed (branch / service audience) |
| PersonGender | 1 Male, 2 Female, 3 Other (user / customer) |
| PaymentMethod | 1 Cash, 2 Card, 3 Online, 4 Transfer, 5 Wallet |
| PaymentType | 1 Appointment, 2 Deposit, 3 Full, 4 Refund, 5 Penalty |
| PaymentStatus | 1 Pending, 2 Paid, 3 Failed, 4 Refunded, 5 Cancelled |
| InvoiceStatus | 1 Draft … 6 Refunded |
| SMSStatus | 1 Pending, 2 Sent, 3 Failed |
| AuditAction | 1 Insert, 2 Update, 3 Delete |
| SalonApprovalStatus | 1 Pending, 2 Approved, 3 Rejected, 4 Draft |
| SubscriptionStatus | 1 Trialing, 2 Active, 3 Grace, 4 PastDue, 5 Canceled, 6 Expired, 7 Suspended |
| PlatformInvoiceStatus | 1 Pending, 2 Paid, 3 Cancelled, 4 Expired |
| PromoCodeScope | 1 PlatformSubscription, 2 SalonBooking |
| EntityType | see Media section (1–23; Gallery=6 obsolete) |

### ۵.۵ چک‌لیست سریع کلاینت

1. همهٔ درخواست‌های محافظت‌شده: `Authorization: Bearer …`
2. قبل از داشبورد: `switch-context` با `salonId` عددی → ذخیرهٔ توکن جدید
3. قبل از رزرو آنلاین: نقش/کانتکست مشتری (بدون اتکا به `salon_id` پنل)
4. موفقیت را از روی status بخوانید؛ `data` را فقط وقتی بدنه دارید
5. برای پرداخت، همیشه `idempotencyKey` یکتا بفرستید
6. قیف رزرو مشتری Guid-first است (`salonPublicId`/`branchPublicId`/`offeringPublicId`/`staffPublicId`/appointment PublicId)؛ long داخلی فقط در Application. API سالن‌دار می‌تواند long بماند.
7. قبل از ایجاد سالن جدید: اشتراک trial/active بگیرید (`POST /api/subscriptions/trial` یا checkout + mark-paid)

---

*آخرین هم‌ترازی با کدبیس: مطابق کنترلرها و DTOهای `SalonFlow.Api` / `SalonFlow.Application`. با هر تغییر API این فایل باید به‌روز شود (قانون Keep Docs & Rules in Sync).*
