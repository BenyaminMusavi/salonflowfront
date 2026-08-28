import axios, { AxiosRequestConfig } from "axios";
import { v4 as uuidv4 } from "uuid";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { API_ADDRESS, API_BASE_URL } from "@/services/common/apiAddress";
import { TResponse } from "@/services/common/data-types/SharedDataTypes";
import { IAuth } from "@/services/domains/auth/types/auth.type";
import { getCookie } from "cookies-next";
import { RouteAddress } from "@/shared/data/routeAddress";
import { setAuthLogoutReason } from "@/shared/utils/authRedirect";
import { useFavoriteIdsStore } from "@/services/domains/favorites/store/useFavoriteIdsStore";

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
  const token =
    useTokenStore.getState().token?.accessToken || getCookie("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers["X-Request-ID"] = uuidv4();
  return config;
});

/* ---------- RESPONSE ---------- */
axiosInstance.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    const original = error.config as AxiosRequestConfig;

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
      // Bare axios — avoids interceptor recursion / circular import with authService.
      // Context lives on the server refresh-token session; body is refreshToken only.
      const refreshRes = await axios.post<TResponse<IAuth>>(
        API_ADDRESS.AUTH.REFRESH,
        { refreshToken },
        {
          baseURL: API_BASE_URL ?? process.env.NEXT_PUBLIC_API_DOMAIN,
          headers: { Accept: "application/json" },
        }
      );

      const auth = refreshRes.data.data;
      useTokenStore.getState().setToken(auth, true);

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

export default axiosInstance;
