import { useEffect, useState } from "react";
import api from "../api/axios"; // Ensure API is imported
import { useFinance } from "../context/FinanceContext";
import { Download } from "lucide-react";
import { exportFinancialReportPDF } from "../utils/exportFinancialReportPDF";
import { useYear } from "../context/YearContext";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

export default function Reports() {
  const { 
    weeklyTotal, 
    pujaTotal, 
    donationTotal, 
    approvedExpenses, 
    openingBalance, 
    fetchCentralFund 
  } = useFinance();

  const { year } = useYear();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false); // New state for button loading

  useEffect(() => {
    fetchCentralFund().finally(() => setLoading(false));
  }, []);

  /* ================= DATA PREP ================= */
  const incomeData = [
    { name: "Weekly", value: weeklyTotal || 0, color: "#4F46E5" },
    { name: "Puja", value: pujaTotal || 0, color: "#10B981" },
    { name: "Donations", value: donationTotal || 0, color: "#F59E0B" },
  ];

  const totalIncome = weeklyTotal + pujaTotal + donationTotal;
  const netBalance = openingBalance + totalIncome - approvedExpenses;

  /* ================= HANDLER ================= */
  const handleExport = async () => {
    setExporting(true);
    try {
      // 1. Fetch DETAILED data for the report
      const [expRes, donRes, pujaRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/donations"),
        api.get("/puja-contributions")
      ]);

      // 2. Generate PDF with details
      exportFinancialReportPDF({
        year,
        openingBalance,
        incomeSources: {
          weekly: weeklyTotal,
          puja: pujaTotal,
          donation: donationTotal
        },
        totalIncome,
        totalExpense: approvedExpenses,
        netBalance,
        // Pass arrays
        details: {
            expenses: expRes.data.data || [],
            donations: donRes.data.data || [],
            puja: pujaRes.data.data || []
        }
      });
    } catch (error) {
        console.error("Export failed", error);
        alert("Failed to fetch details for report.");
    } finally {
        setExporting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading reports...</div>;

  return (
    <div className="space-y-8">
      {/* HEADER WITH EXPORT BUTTON */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Financial Reports</h2>
        
        <button 
          onClick={handleExport}
          disabled={exporting}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition disabled:bg-indigo-400"
        >
          {exporting ? "Generating..." : <><Download size={18} /> Download Full Report</>}
        </button>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-blue-500">
          <p className="text-gray-500 text-sm">Opening Balance</p>
          <h3 className="text-2xl font-bold text-gray-800">₹ {openingBalance}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-indigo-500">
          <p className="text-gray-500 text-sm">Total Income</p>
          <h3 className="text-2xl font-bold text-gray-800">₹ {totalIncome}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-red-500">
          <p className="text-gray-500 text-sm">Total Expenses</p>
          <h3 className="text-2xl font-bold text-gray-800">₹ {approvedExpenses}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-600">
          <p className="text-gray-500 text-sm">Net Balance</p>
          <h3 className="text-2xl font-bold text-green-600">₹ {netBalance}</h3>
        </div>
      </div>

      {/* ================= CHARTS SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-6 text-center">Income Sources</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={incomeData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {incomeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h3 className="font-semibold mb-6 text-center">Cash Flow</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                  { name: "Opening", amount: openingBalance },
                  { name: "Income", amount: totalIncome },
                  { name: "Expense", amount: approvedExpenses },
                  { name: "Balance", amount: netBalance },
                ]} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                <YAxis stroke="#888888" fontSize={12} />
                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}