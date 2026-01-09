import axios from "axios";
import NProgress from "nprogress";
import "nprogress/nprogress.css"; // Ensure CSS is imported

// Configure NProgress (no spinner, just the bar)
NProgress.configure({ showSpinner: false, minimum: 0.1 });

// 🚨 SAFETY FIX: Do not default to localhost in production.
const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.error("🚨 CRITICAL: VITE_API_URL is not defined!");
}

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const refreshApi = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let isRefreshing = false;
let failedQueue = [];

// Track active requests for NProgress
let activeRequests = 0;

const startLoading = () => {
  if (activeRequests === 0) NProgress.start();
  activeRequests++;
};

const stopLoading = () => {
  activeRequests--;
  if (activeRequests <= 0) {
    activeRequests = 0;
    NProgress.done();
  }
};

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  failedQueue = [];
};

// ================= REQUEST =================
api.interceptors.request.use(
  (config) => {
    // Only show NProgress if NOT skipped
    if (!config.skipGlobalLoading) {
        startLoading();
    }

    const accessToken = localStorage.getItem("accessToken");
    const activeClubId = localStorage.getItem("activeClubId");

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    if (activeClubId) {
      config.headers["x-club-id"] = activeClubId;
    }
    return config;
  },
  (error) => {
    if (!error.config?.skipGlobalLoading) stopLoading();
    return Promise.reject(error);
  }
);

// ================= RESPONSE =================
api.interceptors.response.use(
  (response) => {
    if (!response.config?.skipGlobalLoading) {
        stopLoading();
    }
    return response;
  },
  async (error) => {
    if (!error.config?.skipGlobalLoading) {
        stopLoading();
    }

    const originalRequest = error.config;

    // ✅ FIX 1: Ignore 401s specifically from the login endpoint.
    if (originalRequest.url && originalRequest.url.includes("/login")) {
        return Promise.reject(error);
    }

    // Handle 401 Unauthorized (Token Expired)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      isRefreshing = true;
      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        logoutAndRedirect();
        return Promise.reject(error);
      }

      try {
        const res = await refreshApi.post("/auth/refresh-token", {
          token: refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = res.data;

        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem("refreshToken", newRefreshToken);
        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        logoutAndRedirect();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ✅ FIX 2: ROBUST REDIRECT
function logoutAndRedirect() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("activeClubId");

  const currentPath = window.location.pathname.replace(/\/+$/, "").toLowerCase();

  if (currentPath !== "/login") {
    window.location.href = "/login";
  }
}

export default api;