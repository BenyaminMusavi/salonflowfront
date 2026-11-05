import { useEffect, useRef } from "react";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import locationsService from "../locations.service";
import { IManualLocation, useUserLocationStore } from "../store/useUserLocationStore";

const keyOf = (m: IManualLocation | null) => (m ? `${m.city.publicId}|${m.district?.publicId ?? ""}` : "");

/**
 * Logged-in users get their manual city/district on every device (`api/users/me/location-preference`; never GPS).
 * On login: server only → adopt it; device only → upload it; both and different → the newer choice wins.
 * Afterwards every manual change (or «پاک کردن») is mirrored. Best effort: a failed call never blocks the local choice.
 * Guests keep the choice in this browser only.
 */
export function useLocationPreferenceSync(enabled: boolean) {
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const syncedKey = useRef<string | null>(null);

  // Initial reconciliation, once per login.
  useEffect(() => {
    if (!enabled || !isLoggedIn) {
      syncedKey.current = null;
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const server = await locationsService.getPreference();
        if (cancelled) return;
        const local = useUserLocationStore.getState().manual;
        const serverManual: IManualLocation | null = server
          ? { city: server.city, district: server.district ?? null, updatedAt: server.updatedAt }
          : null;

        if (serverManual && (!local || Date.parse(serverManual.updatedAt) >= Date.parse(local.updatedAt))) {
          syncedKey.current = keyOf(serverManual);
          if (keyOf(local) !== keyOf(serverManual)) useUserLocationStore.getState().adoptServerManual(serverManual);
          return;
        }
        if (local) {
          syncedKey.current = keyOf(local);
          await locationsService.savePreference({
            cityPublicId: local.city.publicId,
            districtPublicId: local.district?.publicId ?? undefined,
          });
          return;
        }
        syncedKey.current = "";
      } catch {
        // Offline / server error: keep the local choice; the next login tries again.
        if (!cancelled) syncedKey.current = keyOf(useUserLocationStore.getState().manual);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, isLoggedIn]);

  // Mirror later changes made on this device.
  useEffect(() => {
    if (!enabled || !isLoggedIn) return;
    return useUserLocationStore.subscribe((state) => {
      if (syncedKey.current === null) return; // initial reconciliation still running
      const key = keyOf(state.manual);
      if (key === syncedKey.current) return;
      syncedKey.current = key;
      const request = state.manual
        ? locationsService.savePreference({
            cityPublicId: state.manual.city.publicId,
            districtPublicId: state.manual.district?.publicId ?? undefined,
          })
        : locationsService.deletePreference();
      request.catch(() => undefined);
    });
  }, [enabled, isLoggedIn]);
}
