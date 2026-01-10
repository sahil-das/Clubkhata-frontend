import api from "./axios";

export const getProfile = () => api.get("/auth/me");
export const updateProfile = (payload) => api.put("/auth/profile", payload);
export const changePassword = (oldPassword, newPassword) => api.put("/auth/update-password", { oldPassword, newPassword });
export const getMyStats = () => api.get("/members/my-stats");
