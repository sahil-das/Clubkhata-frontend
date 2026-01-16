import api from "./axios";

export const getDonations = async () => {
  const response = await api.get("/donations");
  return response.data;
};
export const fetchDonations = () => 
  api.get("/donations");

// Updated to support Item Details
export const createDonation = async (donationData) => {
  const response = await api.post("/donations", donationData);
  return response.data;
};

export const deleteDonation = async (id) => {
  const response = await api.delete(`/donations/${id}`);
  return response.data;
};