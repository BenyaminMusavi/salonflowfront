import axios, { AxiosRequestConfig } from "axios";
import { v4 as uuidv4 } from "uuid";
import { useTokenStore } from "@/services/authentication-store/useTokenStore";
import applyCaseMiddleware from "axios-case-converter";
import { getCookie } from "cookies-next";

let isRefreshing = false;
let queue: Array<(token: string) => void> = [];

const resolveQueue = (token: string) => {
    queue.forEach((cb) => cb(token));
    queue = [];
};

const axiosInstance = applyCaseMiddleware(
    axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_DOMAIN,
        headers: {
            Accept: "application/json",
        },
    }),
);

/* ---------- REQUEST ---------- */
axiosInstance.interceptors.request.use((config) => {
    const token =
        useTokenStore.getState().accessToken || getCookie("accessToken");

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

        if (isRefreshing) {
            return new Promise((resolve) => {
                queue.push((token) => {
                    original.headers!.Authorization = `Bearer ${token}`;
                    resolve(axiosInstance(original));
                });
            });
        }

        original._retry = true;
        isRefreshing = true;

        try {
            original.headers!.Authorization = `Bearer`;
            return axiosInstance(original);
        } catch (e) {
            useTokenStore.getState().clear();
            window.location.href = "/(auth)";
            return Promise.reject(e);
        } finally {
            isRefreshing = false;
        }
    },
);

export default axiosInstance;
