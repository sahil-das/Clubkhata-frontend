import { useEffect, useState } from "react";
import api from "../api/axios";
import { useFinance } from "../context/FinanceContext";
import { Download, Loader2 } from "lucide-react";
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
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchCentralFund().finally(() => setLoading(false));
  }, []);

  /* ================= DATA PREP ================= */
  const incomeData = [
    { name: "Subscriptions", value: weeklyTotal || 0, color: "#4F46E5" },
    { name: "Festival Chanda", value: pujaTotal || 0, color: "#10B981" },
    { name: "Donations", value: donationTotal || 0, color: "#F59E0B" },
  ];

  const totalIncome = weeklyTotal + pujaTotal + donationTotal;
  const netBalance = openingBalance + totalIncome - approvedExpenses;

  /* ================= HANDLER ================= */
  const handleExport = async () => {
    setExporting(true);
    try {
      // 1. Fetch DETAILED data for the report
      // ✅ FIX: Changed '/puja-contributions' to '/member-fees'
      const [expRes, donRes, feeRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/donations"),
        api.get("/member-fees") 
      ]);

      // 2. Generate PDF with details
      exportFinancialReportPDF({
        year,
        openingBalance,
        incomeSources: {
          weekly: weeklyTotal,
          puja: pujaTotal, // Mapping 'Member Fees' total here
          donation: donationTotal
        },
        totalIncome,
        totalExpense: approvedExpenses,
        netBalance,
        details: {
            expenses: expRes.data.data || [],
            donations: donRes.data.data || [],
            // ✅ FIX: Pass fee data correctly
            puja: feeRes.data.data || [] 
        }
      });
    } catch (error) {
        console.error("Export failed", error);
        alert("Failed to fetch details for report.");
    } finally {
        setExporting(false);
    }
  };

  if (loading) return (
    <div className="flex h-64 items-center justify-center text-indigo-600">
      <Loader2 className="animate-spin w-10 h-10" />
    </div>
  );

  return (
    <div className="space-y-8 pb-10">
      {/* HEADER WITH EXPORT BUTTON */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Financial Reports</h2>
          <p className="text-gray-500 text-sm">Detailed breakdown for {year}</p>
        </div>
        
        <button 
          onClick={handleExport}
          disabled={exporting}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:bg-gray-300 disabled:shadow-none"
        >
          {exporting ? (
             <><Loader2 size={18} className="animate-spin"/> Generating PDF...</>
          ) : (
             <><Download size={18} /> Download Full Report</>
          )}
        </button>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox label="Opening Balance" amount={openingBalance} color="border-l-blue-500 text-blue-600" />
        <StatBox label="Total Income" amount={totalIncome} color="border-l-indigo-500 text-indigo-600" />
        <StatBox label="Total Expenses" amount={approvedExpenses} color="border-l-rose-500 text-rose-600" />
        <StatBox label="Net Balance" amount={netBalance} color="border-l-emerald-500 text-emerald-600" />
      </div>

      {/* ================= CHARTS SECTION ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold mb-6 text-gray-700 text-center">Income Sources</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={incomeData} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                  {incomeData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`}/>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold mb-6 text-gray-700 text-center">Cash Flow</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                  { name: "Opening", amount: openingBalance },
                  { name: "Income", amount: totalIncome },
                  { name: "Expense", amount: approvedExpenses },
                  { name: "Balance", amount: netBalance },
                ]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                   cursor={{ fill: '#F3F4F6' }} 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, amount, color }) {
    return (
        <div className={`bg-white p-6 rounded-2xl shadow-sm border-l-4 ${color}`}>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">{label}</p>
          <h3 className="text-2xl font-bold mt-1">₹ {amount.toLocaleString()}</h3>
        </div>
    )
}