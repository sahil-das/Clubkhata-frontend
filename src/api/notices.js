import api from "./axios";
export const getActiveBroadcasts = () => api.get("/notices/global");