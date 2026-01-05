import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext"; 
import { useFinance } from "../context/FinanceContext"; // Added missing import
import AddExpenseModal from "../components/AddExpenseModal"; 
import AddDonationModal from "../components/AddDonationModal"; 

import { 
  Loader2, Wallet, TrendingUp, TrendingDown, PiggyBank, Calendar,
  Receipt, UserPlus, Zap, ArrowRight // Added Receipt and others
} from "lucide-react";

// Sub-component for Stats
const StatCard = ({ title, amount, icon, color, isPrimary = false }) => (
  <div className={`p-6 rounded-2xl border ${color} transition-all duration-300 hover:shadow-md`}>
    <div className="flex justify-between items-start">
      <div>
        <p className={`text-sm font-medium ${isPrimary ? "text-indigo-100" : "text-gray-500"}`}>{title}</p>
        <h3 className={`text-2xl font-bold mt-1 ${isPrimary ? "text-white" : "text-gray-800"}`}>
          ₹{amount?.toLocaleString() || "0"}
        </h3>
      </div>
      <div className={`${isPrimary ? "bg-white/20" : "bg-white"} p-2 rounded-lg`}>
        {icon}
      </div>
    </div>
  </div>
);

export default function DashboardHome() {
  const { user, activeClub } = useAuth();
  const {
    weeklyTotal,
    pujaTotal,
    donationTotal,
    approvedExpenses,
    openingBalance,
    centralFund,
    loading
  } = useFinance(); // Using FinanceContext

  // State for Modals
  const [showExpense, setShowExpense] = useState(false);
  const [showDonation, setShowDonation] = useState(false);

  // Composing totals from context
  const totalIncome = weeklyTotal + pujaTotal + donationTotal;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Welcome, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
            <Calendar size={16} /> Club Overview: 
            <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs uppercase tracking-wide">
              {activeClub?.clubName}
            </span>
          </p>
        </div>
      </div>

      {/* MAIN STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard 
          title="Total Income" 
          amount={totalIncome} 
          icon={<TrendingUp size={24} />} 
          color="bg-emerald-50 text-emerald-600 border-emerald-100"
        />
        <StatCard 
          title="Total Expenses" 
          amount={approvedExpenses} 
          icon={<TrendingDown size={24} />} 
          color="bg-rose-50 text-rose-600 border-rose-100"
        />
        <StatCard 
          title="Available Balance" 
          amount={centralFund} 
          icon={<Wallet size={24} />} 
          color="bg-indigo-600 text-white shadow-indigo-200 shadow-xl" 
          isPrimary
        />
        <StatCard 
          title="Opening Balance" 
          amount={openingBalance} 
          icon={<PiggyBank size={24} />} 
          color="bg-gray-50 text-gray-600 border-gray-200"
        />
      </div>

      {/* QUICK ACTIONS BAR */}
      <div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
           <Zap size={16}/> Quick Actions
        </h3>
        <div className="flex flex-wrap gap-4">
           {/* Action 1: Record Expense */}
           <button 
             onClick={() => setShowExpense(true)}
             className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-rose-200 hover:bg-rose-50 transition-all group"
           >
              <div className="p-2 bg-rose-100 text-rose-600 rounded-lg group-hover:bg-rose-200 transition-colors">
                 <TrendingDown size={20} />
              </div>
              <div className="text-left">
                 <p className="text-sm font-bold text-gray-700 group-hover:text-rose-700">Record Expense</p>
                 <p className="text-[10px] text-gray-400">Add bill or voucher</p>
              </div>
           </button>

           {/* Action 2: Record Donation */}
           <button 
             onClick={() => setShowDonation(true)}
             className="flex items-center gap-3 px-5 py-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md hover:border-amber-200 hover:bg-amber-50 transition-all group"
           >
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg group-hover:bg-amber-200 transition-colors">
                 <Receipt size={20} />
              </div>
              <div className="text-left">
                 <p className="text-sm font-bold text-gray-700 group-hover:text-amber-700">Record Donation</p>
                 <p className="text-[10px] text-gray-400">Public collection</p>
              </div>
           </button>
        </div>
      </div>

      {/* MODALS */}
      {showExpense && <AddExpenseModal onClose={() => setShowExpense(false)} />}
      {showDonation && <AddDonationModal onClose={() => setShowDonation(false)} />}
    </div>
  );
}