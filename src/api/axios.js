import axios from "axios";

// Create axios instance
const api = axios.create({
  baseURL: "http://localhost:5000/api/v1", // Updated to v1
  withCredentials: true,
});

// 🔒 Request Interceptor
api.interceptors.request.use(
  (config) => {
    // 1. Attach Token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Attach Active Club ID (Critical for SaaS)
    const activeClubId = localStorage.getItem("activeClubId");
    if (activeClubId) {
      config.headers["x-club-id"] = activeClubId;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;