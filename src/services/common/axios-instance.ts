import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const axiosInstance = axios.create({
  baseURL: "https://localhost:5001",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ REQUEST INTERCEPTOR
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  config.headers["X-Request-ID"] = uuidv4();

  return config;
});

// ✅ RESPONSE INTERCEPTOR
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken =
          typeof window !== "undefined"
            ? localStorage.getItem("refreshToken")
            : null;

        if (!refreshToken) {
          window.location.href = "/login";
          return Promise.reject(error);
        }

        // ⚠️ اینجا بهتره از axiosInstance استفاده نکنی
        const res = await axios.post(
          "https://localhost:5001/api/auth/refresh",
          {
            token: refreshToken,
          }
        );

        const newAccessToken = res.data.data.accessToken;

        localStorage.setItem("accessToken", newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return axiosInstance(originalRequest);
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;