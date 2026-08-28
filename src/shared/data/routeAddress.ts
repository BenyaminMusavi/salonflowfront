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
  },
};
