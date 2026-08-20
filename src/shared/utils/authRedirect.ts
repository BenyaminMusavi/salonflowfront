import { RouteAddress } from "@/shared/data/routeAddress";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";

export const AUTH_CALLBACK_KEY = "auth_callback";

export const saveAuthCallback = (callback: string) => {
  sessionStorage.setItem(AUTH_CALLBACK_KEY, callback);
};

export const getAuthCallback = () => {
  return sessionStorage.getItem(AUTH_CALLBACK_KEY);
};

export const clearAuthCallback = () => {
  sessionStorage.removeItem(AUTH_CALLBACK_KEY);
};

/** Only same-origin relative paths; blocks open redirects. */
export function isSafeInternalPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.includes("://")) return false;
  if (path.startsWith("/auth")) return false;
  return true;
}

/**
 * Builds `/auth/login?callback=...` (and optional register) so AuthCallbackHandler
 * can persist the return path across OTP / multi-step auth.
 */
export function buildAuthHref(
  authPath: string,
  callback?: string | null
): string {
  if (!callback || !isSafeInternalPath(callback)) return authPath;
  const params = new URLSearchParams({ callback });
  return `${authPath}?${params.toString()}`;
}

/**
 * Prefer Zustand `redirectUrl`, then session `auth_callback`, then home.
 * Clears both so a later login does not reuse a stale destination.
 */
export function resolvePostLoginRedirect(
  fallback: string = RouteAddress.HOME.BASE
): string {
  const fromStore = useTokenStore.getState().redirectUrl;
  const fromSession =
    typeof window !== "undefined" ? getAuthCallback() : null;

  useTokenStore.setState({ redirectUrl: undefined });
  if (typeof window !== "undefined") {
    clearAuthCallback();
  }

  const candidate = fromStore || fromSession || fallback;
  if (!isSafeInternalPath(candidate)) return fallback;
  return candidate;
}

/**
 * Remember return path (Zustand + session) and open login with `?callback=`.
 */
export function rememberAuthReturnPath(path: string) {
  if (!isSafeInternalPath(path)) return;
  useTokenStore.getState().setRedirectUrl(path);
  if (typeof window !== "undefined") {
    saveAuthCallback(path);
  }
}

export function getLoginHref(returnPath?: string | null): string {
  if (returnPath && isSafeInternalPath(returnPath)) {
    rememberAuthReturnPath(returnPath);
    return buildAuthHref(RouteAddress.AUTH.LOGIN.BASE, returnPath);
  }
  return RouteAddress.AUTH.LOGIN.BASE;
}
