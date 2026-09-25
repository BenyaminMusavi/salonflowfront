export const RouteAddress = {
  AUTH: {
    LOGIN: {
      BASE: "/auth/login",
    },
    REGISTER: {
      BASE: "/auth/register",
    },
    OTP: {
      BASE: "/auth/otp",
    },
    SET_PASSWORD: {
      BASE: "/auth/register/set-password",
    },
    RESET_PASSWORD: {
      BASE: "/auth/reset-password",
      VERIFY: "/auth/reset-password/verify",
      NEW_PASSWORD: "/auth/reset-password/new-password",
    },
    LOGOUT: {
      BASE: "/auth/logout",
    },
  },
  HOME: {
    BASE: "/",
  },
  PROFILE: {
    BASE: "/profile",
    SETTINGS: "/profile/settings",
    CHANGE_PASSWORD: "/profile/settings/change-password",
    EDIT_NAME: "/profile/settings/edit-name",
  },
  FAVORITES: {
    BASE: "/favorites",
  },
  SEARCH: {
    BASE: "/search",
  },
  RESERVATION: {
    BASE: "/reservation",
    DETAILS: (id: string | number) => `/reservation/${id}`,
  },
  SALONS: {
    DETAILS: (id: string | number) => `/salons/${id}`,
    BOOK: (id: string | number) => `/salons/${id}/book`,
    /** Public share link — only for sharing/QR; internal navigation keeps the Guid routes above. */
    BY_USERNAME: (username: string) => `/s/${encodeURIComponent(username)}`,
  },
  WALLET: {
    BASE: "/wallet",
  },
  NOTIFICATIONS: {
    BASE: "/notifications",
  },
  SUBSCRIPTIONS: {
    BASE: "/subscriptions",
  },
  ONBOARDING: {
    BASE: "/onboarding",
  },
  DASHBOARD: {
    BASE: "/dashboard",
    ANALYTICS: "/dashboard/analytics",
    REPORTS: "/dashboard/reports",
    CATALOG: "/dashboard/catalog",
    STAFF: "/dashboard/staff",
    STAFF_SERVICES: "/dashboard/staff-services",
    SCHEDULES: "/dashboard/schedules",
    FINANCE: "/dashboard/finance",
    Z_REPORT: "/dashboard/z-report",
    PAYOUTS: "/dashboard/payouts",
    NOTIFICATIONS: "/dashboard/notifications",
    SALON_INFO: "/dashboard/salon-info",
    MY_APPOINTMENTS: "/dashboard/my-appointments",
    CUSTOMERS: "/dashboard/customers",
    CUSTOMER_APPOINTMENTS: (customerPublicId: string) =>
      `/dashboard/customers/${customerPublicId}`,
    STAFF_APPOINTMENTS: (staffPublicId: string) =>
      `/dashboard/staff/${staffPublicId}/appointments`,
  },
  ADMIN: {
    BASE: "/admin",
    SALONS_PENDING: "/admin/salons-pending",
    SALONS: "/admin/salons",
    REVIEWS: "/admin/reviews",
    REPORTS: "/admin/reports",
    USERS: "/admin/users",
    SUBSCRIPTIONS: "/admin/subscriptions",
    PLATFORM_REPORTS: "/admin/platform-reports",
  },
};
