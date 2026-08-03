import axios, { AxiosRequestConfig } from "axios";
import { v4 as uuidv4 } from "uuid";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import { useSalonContextStore } from "@/services/salon-context-store/useSalonContextStore";
import { API_ADDRESS, API_BASE_URL } from "@/services/common/apiAddress";
import { TResponse } from "@/services/common/data-types/SharedDataTypes";
import { IAuth } from "@/services/domains/auth/types/auth.type";
import { getCookie } from "cookies-next";
import { RouteAddress } from "@/shared/data/routeAddress";

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

const forceLogout = () => {
  useTokenStore.getState().clear();
  useSalonContextStore.getState().clearAll();
  if (typeof window !== "undefined") {
    window.location.href = RouteAddress.AUTH.LOGIN.BASE;
  }
};

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
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
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
      const { salonId, branchId } = useSalonContextStore.getState();

      // Bare axios — avoids interceptor recursion / circular import with authService
      const refreshRes = await axios.post<TResponse<IAuth>>(
        API_ADDRESS.AUTH.REFRESH,
        {
          refreshToken,
          salonId: salonId ?? null,
          branchId: branchId ?? null,
        },
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
      forceLogout();
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export default axiosInstance;
