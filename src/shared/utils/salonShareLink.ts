import { useSyncExternalStore } from "react";
import { RouteAddress } from "@/shared/data/routeAddress";

const noopSubscribe = () => () => {};

/** Current site origin (e.g. `https://saffa.ir`); "" during SSR so hydration never mismatches. */
function useSiteOrigin(): string {
  return useSyncExternalStore(
    noopSubscribe,
    () => window.location.origin,
    () => ""
  );
}

/**
 * Public share link of a salon: always `/s/{username}`, never the Guid (backend contract).
 * `display` is the host-relative form shown under the username field, e.g. `saffa.ir/s/nazanin`.
 */
export function useSalonShareLink(username: string | null | undefined) {
  const origin = useSiteOrigin();
  if (!username) return { url: "", display: "" };
  const path = RouteAddress.SALONS.BY_USERNAME(username);
  return {
    url: origin ? `${origin}${path}` : "",
    display: `${origin.replace(/^https?:\/\//, "")}${path}`,
  };
}

export type ShareOutcome = "shared" | "copied" | "cancelled";

/** Native share sheet on devices that have one (Telegram/WhatsApp/SMS…), otherwise copy to clipboard. */
export async function shareOrCopyLink(data: {
  url: string;
  title: string;
  text?: string;
}): Promise<ShareOutcome> {
  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(data);
      return "shared";
    } catch (e) {
      // User closed the share sheet — not an error, and don't silently copy instead.
      if ((e as { name?: string })?.name === "AbortError") return "cancelled";
    }
  }
  await navigator.clipboard.writeText(data.url);
  return "copied";
}
