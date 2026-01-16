import api from "./axios";

// --- Member Notice Board ---
export const fetchNotices = async () => {
  const response = await api.get("/notices");
  return response.data;
};

export const createNotice = async (data) => {
  const response = await api.post("/notices", data);
  return response.data;
};

export const deleteNotice = async (id) => {
  const response = await api.delete(`/notices/${id}`);
  return response.data;
};

// --- Global Public Broadcasts ---
export const getActiveBroadcasts = async () => {
  const response = await api.get("/notices/global");
  return response.data;
};