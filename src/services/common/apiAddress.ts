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
    BRANCH_SERVICES: (branchPublicId: string) =>
      `/api/salons/branches/${branchPublicId}/services`,
    BRANCH_AVAILABLE_DATES: (branchPublicId: string) =>
      `/api/salons/branches/${branchPublicId}/available-dates`,
    BRANCH_STAFF_AVAILABILITY: (branchPublicId: string) =>
      `/api/salons/branches/${branchPublicId}/staff-availability`,
    BRANCH_CALCULATE_PRICE: (branchPublicId: string) =>
      `/api/salons/branches/${branchPublicId}/calculate-price`,
    AVAILABLE_SLOTS: "/api/salons/available-slots",
    SAVE_BASIC_INFO: "/api/salons/save-basic-info",
    SAVE_BRANCHES: (salonPublicId: string) =>
      `/api/salons/${salonPublicId}/save-branches`,
    SAVE_SERVICES: (salonPublicId: string) =>
      `/api/salons/${salonPublicId}/save-services`,
    SAVE_STAFF: (salonPublicId: string) =>
      `/api/salons/${salonPublicId}/save-staff`,
    STAFF_ROSTER: (salonPublicId: string) =>
      `/api/salons/${salonPublicId}/staff`,
    ACCEPT_STAFF_INVITATION: (salonPublicId: string, staffPublicId: string) =>
      `/api/salons/${salonPublicId}/staff/${staffPublicId}/accept-invitation`,
    REJECT_STAFF_INVITATION: (salonPublicId: string, staffPublicId: string) =>
      `/api/salons/${salonPublicId}/staff/${staffPublicId}/reject-invitation`,
    SAVE_MEDIAS: (salonPublicId: string) =>
      `/api/salons/${salonPublicId}/save-medias`,
    SAVE_MY_SCHEDULE: (salonPublicId: string) =>
      `/api/salons/${salonPublicId}/save-my-schedule`,
    SUBMIT_FOR_REVIEW: (salonPublicId: string) =>
      `/api/salons/${salonPublicId}/submit-for-review`,
  },

  FAVORITES: {
    BASE: "/api/favorites",
    BY_SALON: (salonPublicId: string) => `/api/favorites/${salonPublicId}`,
  },

  CATALOG: {
    OFFERINGS: "/api/catalog/offerings",
    OFFERING_BY_ID: (id: number) => `/api/catalog/offerings/${id}`,
    OFFERING_ACTIVE: (id: number) => `/api/catalog/offerings/${id}/active`,
    PRICING_RULES: "/api/catalog/pricing-rules",
    PRICING_RULE_BY_ID: (id: number) => `/api/catalog/pricing-rules/${id}`,
    STAFF_SERVICES: (staffMemberId: number) =>
      `/api/catalog/staff/${staffMemberId}/services`,
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
    ME_BY_ID: (appointmentPublicId: string) =>
      `/api/appointments/me/${appointmentPublicId}`,
    CANCEL: (id: string | number) => `/api/appointments/${id}/cancel`,
    SALON_LIST: "/api/appointments",
    CREATE: "/api/appointments",
    QUICK_BOOK: "/api/appointments/quick-book",
    CHECK_IN: (id: number) => `/api/appointments/${id}/check-in`,
    COMPLETE: (id: number) => `/api/appointments/${id}/complete`,
    NO_SHOW: (id: number) => `/api/appointments/${id}/no-show`,
    RESCHEDULE: (id: number) => `/api/appointments/${id}/reschedule`,
    STAFF_DAY_BOARD: (staffMemberId: number) =>
      `/api/appointments/staff/${staffMemberId}/day-board`,
    BRANCH_DAY_BOARD: (branchPublicId: string) =>
      `/api/appointments/branch/${branchPublicId}/day-board`,
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

  CUSTOMERS: {
    BASE: "/api/customers",
    BY_ID: (id: number) => `/api/customers/${id}`,
  },

  WORKING_SCHEDULES: {
    BASE: "/api/working-schedules",
    BY_STAFF: (staffMemberId: number) =>
      `/api/working-schedules/staff/${staffMemberId}`,
    BY_ID: (id: number) => `/api/working-schedules/${id}`,
  },

  SPECIAL_SCHEDULES: {
    BASE: "/api/special-schedules",
    BY_STAFF: (staffMemberId: number) =>
      `/api/special-schedules/staff/${staffMemberId}`,
    BY_ID: (id: number) => `/api/special-schedules/${id}`,
  },

  INVOICES: {
    BASE: "/api/invoices",
    BY_ID: (id: number) => `/api/invoices/${id}`,
    FROM_APPOINTMENT: (appointmentId: number) =>
      `/api/invoices/from-appointment/${appointmentId}`,
    ADD_ITEM: (id: number) => `/api/invoices/${id}/items`,
    DELETE_ITEM: (id: number, itemId: number) =>
      `/api/invoices/${id}/items/${itemId}`,
    CANCEL: (id: number) => `/api/invoices/${id}/cancel`,
  },

  PAYMENTS: {
    BASE: "/api/payments",
    REFUND: "/api/payments/refund",
    BY_INVOICE: (invoiceId: number) => `/api/payments/by-invoice/${invoiceId}`,
  },

  WALLETS: {
    BASE: "/api/wallets",
    ME: "/api/wallets/me",
    ME_TRANSACTIONS: "/api/wallets/me/transactions",
    BY_CUSTOMER: (customerId: number) => `/api/wallets/${customerId}`,
    TRANSACTIONS: (customerId: number) =>
      `/api/wallets/${customerId}/transactions`,
    CHARGE: "/api/wallets/charge",
    DEBIT: "/api/wallets/debit",
  },

  TIPS: {
    BASE: "/api/tips",
    BY_APPOINTMENT: (appointmentId: number) =>
      `/api/tips/by-appointment/${appointmentId}`,
  },

  REPORTS: {
    Z_REPORT: "/api/reports/z-report",
    DASHBOARD_SUMMARY: "/api/reports/dashboard-summary",
    REVENUE_BY_METHOD: "/api/reports/revenue-by-method",
    REVENUE_BY_SERVICE: "/api/reports/revenue-by-service",
    REVENUE_BY_BRANCH: "/api/reports/revenue-by-branch",
    REVENUE_BY_DAY: "/api/reports/revenue-by-day",
    OUTSTANDING: "/api/reports/outstanding",
    APPOINTMENT_FUNNEL: "/api/reports/appointment-funnel",
    STAFF_PERFORMANCE: "/api/reports/staff-performance",
    PEAK_HOURS: "/api/reports/peak-hours",
    FILL_RATE: "/api/reports/fill-rate",
    CUSTOMERS_SUMMARY: "/api/reports/customers/summary",
    CUSTOMERS_TOP: "/api/reports/customers/top",
    CUSTOMERS_AT_RISK: "/api/reports/customers/at-risk",
    EXPORT: "/api/reports/export",
    DAILY_SNAPSHOTS: "/api/reports/daily-snapshots",
  },

  EARNINGS: {
    BASE: "/api/earnings",
    APPROVE: (id: number) => `/api/earnings/${id}/approve`,
  },

  PAYOUTS: {
    BASE: "/api/payouts",
    BY_ID: (id: number) => `/api/payouts/${id}`,
    BY_STAFF: (staffMemberId: number) => `/api/payouts/by-staff/${staffMemberId}`,
    APPROVE: (id: number) => `/api/payouts/${id}/approve`,
    MARK_PAID: (id: number) => `/api/payouts/${id}/mark-paid`,
  },

  COMMISSION: {
    PLANS: "/api/commission/plans",
    PLAN_BY_ID: (id: number) => `/api/commission/plans/${id}`,
    RULES: (planId: number) => `/api/commission/plans/${planId}/rules`,
    RULE_BY_ID: (planId: number, ruleId: number) =>
      `/api/commission/plans/${planId}/rules/${ruleId}`,
  },

  NOTIFICATIONS: {
    BASE: "/api/notifications",
    READ: (id: number) => `/api/notifications/${id}/read`,
    READ_ALL: "/api/notifications/read-all",
  },

  MEDIA: {
    UPLOAD: (entityType: number, entityPublicId: string) =>
      `/api/Media/upload/${entityType}/${entityPublicId}`,
  },
};

