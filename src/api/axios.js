import axios from "axios";

const api = axios.create({
  baseURL: "http://10.155.91.46:5000/api",
  //baseURL: import.meta.env.VITE_API_BASE_URL || "",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
