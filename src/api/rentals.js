import axios from "./axios";

// ✅ Helper: Always get the current Club ID from storage
const getHeaders = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const clubId = user?.clubId || localStorage.getItem("activeClubId");
  
  // Return headers object (merges with axios defaults)
  return clubId ? { headers: { "x-club-id": clubId } } : {};
};

// ================= VENDOR APIs =================

export const getVendors = async () => 
  (await axios.get("/rentals/vendors", getHeaders())).data;

export const createVendor = async (data) => 
  (await axios.post("/rentals/vendors", data, getHeaders())).data;

// ✅ FIXED: Added getHeaders()
export const updateVendor = async (id, data) => 
  (await axios.patch(`/rentals/vendors/${id}`, data, getHeaders())).data;

// ✅ FIXED: Added getHeaders()
export const deleteVendor = async (id) => 
  (await axios.delete(`/rentals/vendors/${id}`, getHeaders())).data;


// ================= ORDER APIs =================

export const getOrders = async (yearId) => 
  (await axios.get(`/rentals/orders?yearId=${yearId}`, getHeaders())).data;

export const createOrder = async (data) => 
  (await axios.post("/rentals/orders", data, getHeaders())).data;

export const updateOrder = async (id, data) => 
  (await axios.put(`/rentals/orders/${id}`, data, getHeaders())).data; 

export const deleteOrder = async (id) => 
  (await axios.delete(`/rentals/orders/${id}`, getHeaders())).data; 

export const updateOrderStatus = async (id, status) => 
  (await axios.patch(`/rentals/orders/${id}/status`, { status }, getHeaders())).data;

export const recordRentalPayment = async (id, data) => 
  (await axios.post(`/rentals/orders/${id}/pay`, data, getHeaders())).data;


// ================= CHECKLIST APIs =================

export const receiveOrder = async (id, receivedItems) => 
  (await axios.post(`/rentals/orders/${id}/receive`, { receivedItems }, getHeaders())).data;

export const returnItems = async (id, returnedItems) => {
  const response = await axios.post(`/rentals/orders/${id}/return`, { returnedItems }, getHeaders());
  return response.data;
};