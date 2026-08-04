export const API_BASE_URL = process.env.NEXT_PUBLIC_API_DOMAIN;
export const API_ADDRESS = {
    HOME: {
    SERVICES: "/api/home/services",
    SALONS: "/api/home/salons",
  },
  
   AUTH: {
    SEND_OTP: "/api/auth/send-otp",
    VERIFY_OTP: "/api/auth/verify-otp",
    LOGIN_PASSWORD: "/api/auth/login-password",
    SET_PASSWORD: "/api/auth/set-password",
    SET_PASSWORD_WITH_OTP: "/api/auth/set-password-with-otp",
    FORGET_PASSWORD: "/api/auth/forget-password",
    REFRESH: "/api/auth/refresh",
    LOGOUT: "/api/auth/logout",
    ME: "/api/auth/me",
    SWITCH_CONTEXT: "/api/auth/switch-context",
  },

  SERVICE_TYPE: {
    BASE: "/api/service-type",
    BY_ID: (id: number) => `/api/service-type/${id}`,

  },

  SALON: {
    BASE: "/api/salons",
    APPROVED: "/api/salons",
    BY_ID: (id: string | number) => `/api/salons/${id}`,
    BRANCH_SERVICES: (branchId: number) =>
      `/api/salons/branches/${branchId}/services`,
    BRANCH_AVAILABLE_DATES: (branchId: number) =>
      `/api/salons/branches/${branchId}/available-dates`,
    BRANCH_STAFF_AVAILABILITY: (branchId: number) =>
      `/api/salons/branches/${branchId}/staff-availability`,
    BRANCH_CALCULATE_PRICE: (branchId: number) =>
      `/api/salons/branches/${branchId}/calculate-price`,
    AVAILABLE_SLOTS: "/api/salons/available-slots",
    SAVE_BASIC_INFO: "/api/salons/save-basic-info",
    SAVE_BRANCHES: (salonPublicId: string) =>
      `/api/salons/${salonPublicId}/save-branches`,
    SAVE_SERVICES: (salonPublicId: string) =>
      `/api/salons/${salonPublicId}/save-services`,
    SAVE_STAFF: (salonPublicId: string) =>
      `/api/salons/${salonPublicId}/save-staff`,
    SAVE_MEDIAS: (salonPublicId: string) =>
      `/api/salons/${salonPublicId}/save-medias`,
    SAVE_MY_SCHEDULE: (salonPublicId: string) =>
      `/api/salons/${salonPublicId}/save-my-schedule`,
    SUBMIT_FOR_REVIEW: (salonPublicId: string) =>
      `/api/salons/${salonPublicId}/submit-for-review`,
  },

  FAVORITES: {
    BASE: "/api/favorites",
    BY_SALON: (salonId: number) => `/api/favorites/${salonId}`,
  },

  SALON_OFFERING: {
    BASE: "/api/salon-offering",
    BY_SALON: (salonId: number) => `/api/salon-offering/salon/${salonId}`,
  },

  STAFF_PROFILE: {
    BY_SALON_FOR_SERVICES: (salonId: number | string) =>
      `/api/staff-profiles/by-salon/${salonId}/for-services`,
  },

  BOOKING: {
    SLOTS: "/api/booking/slots",
    CREATE: "/api/booking/create",
  },

  APPOINTMENTS: {
    ME: "/api/appointments/me",
    ME_BY_ID: (id: number) => `/api/appointments/me/${id}`,
    CANCEL: (id: number) => `/api/appointments/${id}/cancel`,
  },

  REVIEWS: {
    BASE: "/api/reviews",
    BY_ID: (id: number) => `/api/reviews/${id}`,
  },

  SALON_REPORTS: {
    BASE: "/api/salon-reports",
  },

  SUBSCRIPTIONS: {
    PLANS: "/api/subscriptions/plans",
    ME: "/api/subscriptions/me",
    ENTITLEMENT: "/api/subscriptions/me/entitlement",
    TRIAL: "/api/subscriptions/trial",
    CHECKOUT: "/api/subscriptions/checkout",
    INVOICES_ME: "/api/subscriptions/invoices/me",
  },
};

