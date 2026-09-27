import axios, { AxiosRequestConfig } from "axios";
import { v4 as uuidv4 } from "uuid";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { API_ADDRESS, API_BASE_URL } from "@/services/common/apiAddress";
import { TResponse } from "@/services/common/data-types/SharedDataTypes";
import { IAuth } from "@/services/domains/auth/types/auth.type";
import { RouteAddress } from "@/shared/data/routeAddress";
import { setAuthLogoutReason } from "@/shared/utils/authRedirect";
import { useFavoriteIdsStore } from "@/services/domains/favorites/store/useFavoriteIdsStore";
import { TAuthMeEntity } from "@/services/domains/auth/types/auth.type";
import { mapAuthMeMembershipsToSalon } from "@/services/salon-context-store/mapAuthMeMembership";
import { isSalonPanelPath } from "@/shared/utils/salonPanelRoute";

export const SALON_HEADER = "X-Salon-Id";
export const BRANCH_HEADER = "X-Branch-Id";

declare module "axios" {
  interface AxiosRequestConfig {
    /** Internal: marks a request as already retried once after a token refresh. */
    _retry?: boolean;
    /**
     * Marks a request as never eligible for the 401 refresh-and-retry flow. Use this for
     * endpoints where a 401 always means "your input was wrong", never "your session
     * expired" — e.g. change-password's `oldPassword` check, which now returns the exact
     * same 401 shape as a real expired session (BACKEND_UPDATE_REPORT.md §2.1). Without
     * this flag, a wrong old password would burn a needless refresh-token round trip
     * before failing anyway.
     */
    skipAuthRetry?: boolean;
    /** Never attach the panel's `X-Salon-Id` / `X-Branch-Id`, even from a `/dashboard` page. */
    skipSalonContext?: boolean;
  }
}

let isRefreshing = false;
let queue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const resolveQueue = (token: string) => {
  queue.forEach(({ resolve }) => resolve(token));
  queue = [];
};

const rejectQueue = (error: unknown) => {
  queue.forEach(({ reject }) => reject(error));
  queue = [];
};

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_DOMAIN,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

const forceLogout = (reason: "membership" | "expired" = "expired") => {
  useTokenStore.getState().clear();
  useSalonContextStore.getState().clearAll();
  useFavoriteIdsStore.getState().clear();
  if (typeof window !== "undefined") {
    setAuthLogoutReason(reason);
    window.location.href = RouteAddress.AUTH.LOGIN.BASE;
  }
};

function logoutReasonFromRefreshError(error: unknown): "membership" | "expired" {
  const data = (error as { response?: { data?: Record<string, unknown> } })
    ?.response?.data;
  const message =
    typeof data?.message === "string" ? data.message : "";
  if (/membership|سالن|salon/i.test(message)) return "membership";
  return "expired";
}

/* ---------- REQUEST ---------- */
axiosInstance.interceptors.request.use((config) => {
  const token = useTokenStore.getState().token?.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // ADR-0012: salon context travels per request, only from panel pages. Customer
  // endpoints reject it (403) and admin endpoints must never see it.
  const { salonPublicId, branchPublicId } = useSalonContextStore.getState();
  if (
    salonPublicId &&
    !config.skipSalonContext &&
    typeof window !== "undefined" &&
    isSalonPanelPath(window.location.pathname)
  ) {
    config.headers[SALON_HEADER] = salonPublicId;
    if (branchPublicId) config.headers[BRANCH_HEADER] = branchPublicId;
  }

  config.headers["X-Request-ID"] = uuidv4();
  return config;
});

let salonForbiddenCheck: Promise<void> | null = null;

/**
 * A 403 on a request carrying `X-Salon-Id` is either a plain role check (e.g. Staff on an
 * owner-only endpoint) or a lost membership. Re-read `/api/auth/me` to tell them apart;
 * only when the active salon/branch is gone, drop the panel context and leave the panel.
 */
function checkSalonMembershipAfterForbidden(): Promise<void> {
  salonForbiddenCheck ??= (async () => {
    try {
      const me = await axiosInstance.get<unknown, TAuthMeEntity>(API_ADDRESS.AUTH.ME, {
        skipSalonContext: true,
      });
      const memberships = mapAuthMeMembershipsToSalon(me.data?.memberships);
      const store = useSalonContextStore.getState();
      store.setMemberships(memberships);
      const active = memberships.find((m) => m.salonPublicId === store.salonPublicId);
      const stillValid =
        !!active && (active.branchPublicId ?? null) === (store.branchPublicId ?? null);
      if (!stillValid) {
        store.clearContext();
        if (typeof window !== "undefined") {
          window.location.replace(RouteAddress.HOME.BASE);
        }
      }
    } catch {
      /* keep the context; the original 403 still surfaces */
    } finally {
      salonForbiddenCheck = null;
    }
  })();
  return salonForbiddenCheck;
}

/* ---------- RESPONSE ---------- */
axiosInstance.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const original = error.config as AxiosRequestConfig;

    if (error.response?.status === 403 && original?.headers?.[SALON_HEADER]) {
      await checkSalonMembershipAfterForbidden();
      return Promise.reject(error);
    }

    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.skipAuthRetry
    ) {
      return Promise.reject(error);
    }

    const hadToken = !!original.headers?.Authorization;
    if (!hadToken) {
      return Promise.reject(error);
    }

    const refreshToken = useTokenStore.getState().token?.refreshToken;
    if (!refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${token}`;
            resolve(axiosInstance(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const auth = await refreshTokenAcrossTabs(refreshToken);

      resolveQueue(auth.accessToken);
      original.headers = original.headers ?? {};
      original.headers.Authorization = `Bearer ${auth.accessToken}`;
      return axiosInstance(original);
    } catch (e) {
      rejectQueue(e);
      forceLogout(logoutReasonFromRefreshError(e));
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

/**
 * `isRefreshing` above only dedupes concurrent 401s within this tab. Two tabs can
 * still race to rotate the same (single-use) refresh token at once, and the loser's
 * rotation fails, force-logging out both (SF-QA-016). The Web Locks API serializes
 * the actual refresh call across every same-origin tab; a tab that loses the race
 * re-reads the token another tab just rotated (synced in by useTokenStore's `storage`
 * listener) instead of retrying with the now-dead refresh token itself.
 */
async function refreshTokenAcrossTabs(staleRefreshToken: string): Promise<IAuth> {
  const doRefresh = async (): Promise<IAuth> => {
    const latest = useTokenStore.getState().token;
    if (latest && latest.refreshToken !== staleRefreshToken) {
      // Another tab already rotated it while we were waiting for the lock/queue.
      return latest;
    }

    // Bare axios — avoids interceptor recursion / circular import with authService.
    // Tokens never carry salon context (it's the X-Salon-Id header); body is refreshToken only.
    const refreshRes = await axios.post<TResponse<IAuth>>(
      API_ADDRESS.AUTH.REFRESH,
      { refreshToken: staleRefreshToken },
      {
        baseURL: API_BASE_URL ?? process.env.NEXT_PUBLIC_API_DOMAIN,
        headers: { Accept: "application/json" },
      }
    );

    const auth = refreshRes.data.data;
    useTokenStore.getState().setToken(auth, true);
    return auth;
  };

  if (typeof navigator !== "undefined" && "locks" in navigator) {
    return navigator.locks.request("salon-flow-token-refresh", doRefresh);
  }
  return doRefresh();
}

export default axiosInstance;
