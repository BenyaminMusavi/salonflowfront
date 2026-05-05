export const API_BASE_URL = process.env.NEXT_PUBLIC_API_DOMAIN;
export const API_ADDRESS = {
    HOME: {
    SERVICES: "/api/home/services",
    SALONS: "/api/home/salons",
  },
  
  SERVICE_TYPE: {
    BASE: "/api/service-type",
    BY_ID: (id: number) => `/api/service-type/${id}`,

  },

  SALON: {
    BASE: "/api/salons",
    APPROVED: "/api/salons",
    BY_ID: (id: number) => `/api/salons/${id}`,
  },

  SALON_OFFERING: {
    BASE: "/api/salon-offering",
    BY_SALON: (salonId: number) => `/api/salon-offering/salon/${salonId}`
  },
  
  STAFF_PROFILE: {
    BY_SALON_FOR_SERVICES: (salonId: number) =>
      `/api/staff-profiles/by-salon/${salonId}/for-services`,
  },

BOOKING: {
  SLOTS: "/api/booking/slots",
  CREATE: "/api/booking/create",
},

};

