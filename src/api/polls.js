import api from "./axios";

// This is required for the widget to list polls
export const getPolls = async () => {
  const response = await api.get("/polls");
  return response.data;
};

export const createPoll = async (pollData) => {
  const response = await api.post("/polls", pollData);
  return response.data;
};

export const castVote = async (voteData) => {
  const response = await api.post("/polls/vote", voteData);
  return response.data;
};

export const getPollResults = async (pollId) => {
  const response = await api.get(`/polls/${pollId}`);
  return response.data;
};

// Update src/api/polls.js
export const deletePoll = async (pollId) => {
  const response = await api.delete(`/polls/${pollId}`);
  return response.data;
};