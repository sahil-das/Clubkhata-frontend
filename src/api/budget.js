import api from "./axios";

export const getBudgetAnalysis = async () => {
  const response = await api.get("/budget");
  return response.data;
};

export const setBudget = async (data) => {
  const response = await api.post("/budget", data);
  return response.data;
};

// ✅ NEW: Delete API
export const deleteBudget = async (id) => {
  const response = await api.delete(`/budget/${id}`);
  return response.data;
};