export const API_BASE_URL = process.env.NEXT_PUBLIC_API_DOMAIN;
export const API_ADDRESS = {
  SERVICE_TYPE: {
    BASE: "/api/service-type",
   BY_ID: (id: number) => `/api/service-type/${id}`,

},
  SALON: {
    BASE: "/api/salons",
    APPROVED: "/api/salons/approved",
    BY_ID: (id: number) => `/api/salons/${id}`,
      BY_SALON: (salonId: number) => `/api/staff-profiles/${salonId}/staff`,
  },
};

