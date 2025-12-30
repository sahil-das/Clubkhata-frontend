import api from "./axios";


export const getMemberWeekly = (memberId) =>
  api.get(`/weekly/member/${memberId}`);

export const markWeekPaid = (memberId, weekNumber) => {
  return api.post("/weekly/mark-paid", {
    memberId,
    weekNumber,
  });
};

export const undoWeekPaid = (memberId, weekNumber) => {
  return api.post("/weekly/undo-paid", {
    memberId,
    weekNumber,
  });
};
