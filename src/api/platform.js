import api from "./axios";

export const getPlatformStats = () => api.get("/platform/stats");
export const getAllClubs = () => api.get("/platform/clubs");
export const toggleClubStatus = (id) => api.patch(`/platform/clubs/${id}/toggle`);
export const getSystemHealth = () => api.get("/platform/health-metrics");
export const impersonateUser = (userId) => api.post(`/platform/impersonate/${userId}`);
export const getPlatformLogs = (params) => api.get("/platform/logs", { params });

// ... existing
export const createGlobalNotice = (data) => api.post("/platform/announcements", data);
export const getGlobalNotices = () => api.get("/platform/announcements");
export const deleteGlobalNotice = (id) => api.delete(`/platform/announcements/${id}`);