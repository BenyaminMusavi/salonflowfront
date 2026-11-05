"use client";

import { useLocationPreferenceSync } from "@/services/domains/locations/hooks/useLocationPreferenceSync";
import { isLocationFeatureEnabled } from "@/services/domains/locations/utils/userLocation";

/** Mounted once in the customer layout: keeps a logged-in user's manual location in sync with the server. Renders nothing. */
export default function LocationPreferenceSync() {
  useLocationPreferenceSync(isLocationFeatureEnabled);
  return null;
}
