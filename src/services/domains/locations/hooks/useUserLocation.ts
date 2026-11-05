import { useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useUserLocationStore } from "../store/useUserLocationStore";
import { locationLabel, locationSearchParams, requestDevicePosition } from "../utils/userLocation";

/** The active location for salon lists plus the user's actions on it. GPS is read only inside `useCurrentPosition`. */
export function useUserLocation() {
  const state = useUserLocationStore(useShallow((s) => ({ mode: s.mode, manual: s.manual, gps: s.gps })));
  return {
    ...state,
    label: locationLabel(state),
    params: locationSearchParams(state),
    hasLocation: state.mode != null,
  };
}

/** «موقعیت فعلی من»: one browser request per tap; errors are shown, never retried behind the user's back. */
export function useCurrentPosition() {
  const setGps = useUserLocationStore((s) => s.setGps);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setGps(await requestDevicePosition());
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setLoading(false);
    }
  }, [setGps]);

  return { request, loading, error, clearError: () => setError(null) };
}
