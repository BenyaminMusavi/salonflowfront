"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { getLoginHref } from "@/shared/utils/authRedirect";

/**
 * For pages opened straight from an SMS link (usually on a phone, with no session): once the
 * persisted login state has loaded, a guest is sent to login and returned to this exact page
 * afterwards. Waiting for hydration matters — `isLoggedIn` reads false for a moment on every
 * fresh load, which would otherwise bounce logged-in users to login too.
 *
 * `ready` is true only when the user is logged in; render a loading state until then.
 */
export function useRequireLogin(returnPath?: string) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoggedIn = useTokenStore((s) => s.isLoggedIn);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persist = useTokenStore.persist;
    if (!persist) {
      setHydrated(true);
      return;
    }
    const unsub = persist.onFinishHydration(() => setHydrated(true));
    if (persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);

  const target = returnPath ?? pathname;
  useEffect(() => {
    if (hydrated && !isLoggedIn) router.replace(getLoginHref(target));
  }, [hydrated, isLoggedIn, target, router]);

  return { ready: hydrated && isLoggedIn };
}
