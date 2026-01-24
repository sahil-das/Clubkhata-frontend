import api from "./axios";

// ✅ Updated to accept optional query params (e.g., { category: "Food" })
export const fetchExpenses = (params = {}) => 
  api.get("/expenses", { params });

export const createExpense = (data) => 
  api.post("/expenses", data);

export const approveExpense = (id) => 
  api.put(`/expenses/${id}/status`, { status: 'approved' });

export const rejectExpense = (id) => 
  api.put(`/expenses/${id}/status`, { status: 'rejected' });

export const deleteExpense = (id) => 
  api.delete(`/expenses/${id}`);

export const getExpenseCategories = async () => {
  const response = await api.get("/expenses/categories");
  return response.data; 
};
