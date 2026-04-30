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
    APPROVED: "/api/salons/approved",
    BY_ID: (id: number) => `/api/salons/${id}`,
  },

  SALON_OFFERING: {
    BY_SALON: (salonId: number) => `/api/salon-offerings/${salonId}`
  }

};

