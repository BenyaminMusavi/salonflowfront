import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import applyCaseMiddleware from "axios-case-converter";


const axiosInstance = applyCaseMiddleware(
    axios.create({
        baseURL: process.env.NEXT_PUBLIC_API_DOMAIN,
        headers: {
            Accept: "application/json",
        },
    }),
);

axiosInstance.interceptors.request.use((config) => {
    // Get token from cookie or store
    const token = ""

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    config.headers["X-Request-ID"] = uuidv4();
    return config;
});


export default axiosInstance;
