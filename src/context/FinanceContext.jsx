import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [pujaTotal, setPujaTotal] = useState(0);
  const [donationTotal, setDonationTotal] = useState(0);
  const [approvedExpenses, setApprovedExpenses] = useState(0);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Calculated strictly from frontend state to ensure UI consistency
  const centralFund = 
    openingBalance + weeklyTotal + pujaTotal + donationTotal - approvedExpenses;

  /* ===== FETCH FINANCIAL SUMMARY ===== */
  const fetchCentralFund = async () => {
    try {
      setLoading(true);
      // ✅ SaaS Update: Use the single aggregated endpoint
      const res = await api.get("/finance/summary");
      
      const data = res.data.data;

      // Map backend fields to context state
      setOpeningBalance(data.openingBalance || 0);
      setWeeklyTotal(data.breakdown?.subscriptions || 0); // "Subscriptions"
      setPujaTotal(data.breakdown?.memberFees || 0);      // "Member Fees" (replaces Puja)
      setDonationTotal(data.breakdown?.donations || 0);
      setApprovedExpenses(data.totalExpense || 0);

    } catch (err) {
      console.error("Finance fetch error:", err);
      // Optional: Reset to 0 on error or keep stale data
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCentralFund();
  }, []);

  return (
    <FinanceContext.Provider
      value={{
        weeklyTotal,
        pujaTotal,
        donationTotal,
        approvedExpenses,
        openingBalance,
        centralFund,
        fetchCentralFund,
        loading
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);