import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const FinanceContext = createContext();

export const FinanceProvider = ({ children }) => {
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [pujaTotal, setPujaTotal] = useState(0);
  const [donationTotal, setDonationTotal] = useState(0);
  const [approvedExpenses, setApprovedExpenses] = useState(0);
  const [openingBalance, setOpeningBalance] = useState(0); // ✅ NEW STATE

  // ✅ UPDATED FORMULA: Includes Opening Balance
  const centralFund = 
    openingBalance + weeklyTotal + pujaTotal + donationTotal - approvedExpenses;

  /* ===== FETCH ALL TOTALS ===== */
  const fetchCentralFund = async () => {
    try {
      // Run all API calls in parallel for speed
      const [
        weeklyRes,
        pujaRes,
        donationRes,
        expenseRes,
        cycleRes // ✅ Fetch Active Cycle
      ] = await Promise.all([
        api.get("/finance/weekly-total"),
        api.get("/finance/puja-total"),
        api.get("/finance/donations-total"),
        api.get("/finance/expenses-total"),
        api.get("/cycles/active").catch(() => ({ data: { data: { openingBalance: 0 } } })) // Handle error if no cycle
      ]);

      setWeeklyTotal(weeklyRes.data.total || 0);
      setPujaTotal(pujaRes.data.total || 0);
      setDonationTotal(donationRes.data.total || 0);
      setApprovedExpenses(expenseRes.data.total || 0);
      
      // ✅ Set Opening Balance
      setOpeningBalance(cycleRes.data?.data?.openingBalance || 0);

    } catch (err) {
      console.error("Finance fetch error", err);
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
        openingBalance, // ✅ Exported for UI use
        centralFund,
        fetchCentralFund,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
};

export const useFinance = () => useContext(FinanceContext);