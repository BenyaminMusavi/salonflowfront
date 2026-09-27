import { RouteAddress } from "@/shared/data/routeAddress";

/**
 * True for salon-panel routes (`/dashboard/...`). Only requests made from these pages
 * carry the `X-Salon-Id` header (ADR-0012); customer, onboarding and admin pages never do.
 */
export function isSalonPanelPath(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const base = RouteAddress.DASHBOARD.BASE;
  return pathname === base || pathname.startsWith(`${base}/`);
}
