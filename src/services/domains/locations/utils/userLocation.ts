import type { IGpsLocation, IManualLocation, TLocationMode } from "../store/useUserLocationStore";

/**
 * «سالن‌های نزدیک من» is switched on per build (`NEXT_PUBLIC_LOCATION_FEATURE=1`) only after the location data has been
 * loaded and verified in Production (backend `deploy/data/locations/README.md`). Off = home and search look as before.
 */
export const isLocationFeatureEnabled = process.env.NEXT_PUBLIC_LOCATION_FEATURE === "1";

/** Radius of the home «نزدیک من» list around the device position (km, backend cap 50). */
export const NEARBY_RADIUS_KM = 20;

/** A device position farther than this from the saved city suggests the user is somewhere else (same 40 km as the backend). */
export const FAR_FROM_CITY_KM = 40;

/** 3 decimals ≈ 110 m: precise enough to sort nearby salons, and no exact position ever leaves the device. */
export const coarseCoordinate = (value: number) => Math.round(value * 1000) / 1000;

export interface ILocationState {
  mode: TLocationMode;
  manual: IManualLocation | null;
  gps: IGpsLocation | null;
}

export interface ILocationSearchParams {
  lat?: number;
  lng?: number;
  cityPublicId?: string;
  districtPublicId?: string;
}

/**
 * What a salon list/map sends for the active location: the (rounded) device position in GPS mode, the chosen
 * city/district in manual mode — never both, so a manual choice is never mixed with a device position.
 */
export function locationSearchParams(s: ILocationState): ILocationSearchParams {
  if (s.mode === "gps" && s.gps) return { lat: coarseCoordinate(s.gps.lat), lng: coarseCoordinate(s.gps.lng) };
  if (s.mode === "manual" && s.manual)
    return { cityPublicId: s.manual.city.publicId, districtPublicId: s.manual.district?.publicId ?? undefined };
  return {};
}

/** «سعادت‌آباد، تهران» / «تهران» / «موقعیت فعلی شما» / null when nothing is set. */
export function locationLabel(s: ILocationState): string | null {
  if (s.mode === "gps" && s.gps) return "موقعیت فعلی شما";
  if (s.mode === "manual" && s.manual)
    return s.manual.district ? `${s.manual.district.name}، ${s.manual.city.name}` : s.manual.city.name;
  return null;
}

export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(bLat - aLat);
  const dLng = rad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * The device is far from the saved city: only a SUGGESTION is shown (the saved choice is never replaced). Computed on
 * the device from the city's centre point, so the position is not sent anywhere for this.
 */
export function isFarFromSavedCity(gps: IGpsLocation | null, manual: IManualLocation | null): boolean {
  if (!gps || !manual) return false;
  return distanceKm(gps.lat, gps.lng, manual.city.latitude, manual.city.longitude) > FAR_FROM_CITY_KM;
}

export const GPS_ERRORS = {
  unsupported: "مرورگر شما موقعیت مکانی را پشتیبانی نمی‌کند. شهر و محله را دستی انتخاب کنید.",
  denied: "اجازه‌ی دسترسی به موقعیت داده نشد. می‌توانید از تنظیمات مرورگر اجازه دهید یا شهر و محله را دستی انتخاب کنید.",
  unavailable: "موقعیت دستگاه در دسترس نیست. دوباره امتحان کنید یا شهر و محله را دستی انتخاب کنید.",
  timeout: "دریافت موقعیت طول کشید. دوباره امتحان کنید یا شهر و محله را دستی انتخاب کنید.",
} as const;

/** Asks the browser once — call only from a user's tap. Resolves with the position or rejects with a Persian message. */
export function requestDevicePosition(): Promise<IGpsLocation> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error(GPS_ERRORS.unsupported));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude, at: Date.now() }),
      (err) =>
        reject(new Error(err.code === 1 ? GPS_ERRORS.denied : err.code === 3 ? GPS_ERRORS.timeout : GPS_ERRORS.unavailable)),
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 60_000 }
    );
  });
}
