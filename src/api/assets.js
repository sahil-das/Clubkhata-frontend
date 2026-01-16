import api from "./axios";

/**
 * Get all assets for the active club
 */
export const getAssets = async () => {
  const response = await api.get("/assets");
  return response.data; // 👈 FIX: Return the response body, not the whole object
};

/**
 * Add a new asset to the registry
 */
export const addAsset = async (data) => {
  const response = await api.post("/assets", data);
  return response.data;
};

/**
 * Update an existing asset (e.g., move location, change qty)
 */
export const updateAsset = async (id, data) => {
  const response = await api.put(`/assets/${id}`, data);
  return response.data;
};

/**
 * Delete an asset permanently
 */
export const deleteAsset = async (id) => {
  const response = await api.delete(`/assets/${id}`);
  return response.data;
};