/**
 * Directions links for a salon page. The destination is the branch's real coordinates; with no valid
 * coordinates the address text is the only (approximate) fallback and the caller must say so.
 * Neshan / Balad have no verified public deep link yet — on Android the `geo:` link lets the phone's
 * own chooser offer whichever map app is installed. Never invent coordinates or a route.
 */
export interface IDirectionsTarget {
  latitude?: number | null;
  longitude?: number | null;
  /** Place name shown as the pin label (salon name). */
  label: string;
  /** Text address, used for the fallback search and the copy button. */
  address?: string | null;
}

export interface IDirectionOption {
  id: "google" | "apple" | "device";
  label: string;
  href: string;
}

export function hasValidCoordinates(
  latitude: number | null | undefined,
  longitude: number | null | undefined
): latitude is number {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    Math.abs(latitude) <= 90 &&
    Math.abs(longitude) <= 180
  );
}

export function googleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat}%2C${lng}`;
}

export function googleMapsSearchUrl(query: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function appleMapsDirectionsUrl(lat: number, lng: number, label: string): string {
  return `https://maps.apple.com/?daddr=${lat},${lng}&q=${encodeURIComponent(label)}`;
}

export function geoUri(lat: number, lng: number, label: string): string {
  return `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`;
}

export function isAppleDevice(userAgent: string): boolean {
  return /iPhone|iPad|iPod|Macintosh/i.test(userAgent);
}

export function isAndroidDevice(userAgent: string): boolean {
  return /Android/i.test(userAgent);
}

/** Options for the directions sheet; `[]` when there is neither a coordinate nor an address. */
export function buildDirectionOptions(
  target: IDirectionsTarget,
  userAgent: string
): IDirectionOption[] {
  const { latitude, longitude, label, address } = target;

  if (hasValidCoordinates(latitude, longitude)) {
    const options: IDirectionOption[] = [
      { id: "google", label: "Google Maps", href: googleMapsDirectionsUrl(latitude, longitude!) },
    ];
    if (isAppleDevice(userAgent)) {
      options.push({
        id: "apple",
        label: "Apple Maps",
        href: appleMapsDirectionsUrl(latitude, longitude!, label),
      });
    }
    if (isAndroidDevice(userAgent)) {
      options.push({
        id: "device",
        label: "برنامه‌ی نقشه‌ی گوشی",
        href: geoUri(latitude, longitude!, label),
      });
    }
    return options;
  }

  const text = address?.trim();
  return text
    ? [{ id: "google", label: "جست‌وجوی آدرس در Google Maps", href: googleMapsSearchUrl(text) }]
    : [];
}
