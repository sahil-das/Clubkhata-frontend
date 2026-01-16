import api from "./axios";

export const fetchExpenses = () => 
  api.get("/expenses");

export const createExpense = (data) => 
  api.post("/expenses", data);

export const approveExpense = (id) => 
  api.put(`/expenses/${id}/status`, { status: 'approved' });

export const rejectExpense = (id) => 
  api.put(`/expenses/${id}/status`, { status: 'rejected' });

export const deleteExpense = (id) => 
  api.delete(`/expenses/${id}`);

/**
 * Get distinct expense categories used in the active year
 * @returns {Promise<string[]>} Array of category names
 */
export const getExpenseCategories = async () => {
  const response = await api.get("/expenses/categories");
  return response.data; // Returns { success: true, data: ["Food", "Travel"] }
};