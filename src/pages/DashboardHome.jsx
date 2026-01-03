import { useState, useEffect } from "react";
import api from "../api/axios";
import CreateYearModal from "../components/CreateYearModal";
import { 
  Loader2, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Calendar,
  IndianRupee 
} from "lucide-react";

export default function DashboardHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateYear, setShowCreateYear] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get("/finance/summary");
      
      // Auto-trigger modal only if absolutely needed
      if (res.data.data.yearName === "No Active Year") {
        setShowCreateYear(true);
      }
      
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-indigo-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse">Loading Financial Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      
      {/* 🚀 Auto-Popup for First Time Setup */}
      {showCreateYear && (
        <CreateYearModal onSuccess={() => {
          setShowCreateYear(false);
          fetchSummary();
        }} />
      )}

      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
            Financial Overview
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
            <Calendar size={16} />
            Current Cycle: 
            <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs uppercase tracking-wide">
              {data?.yearName || "Loading..."}
            </span>
          </p>
        </div>
      </div>

      {/* 2. MAIN STATS GRID (Responsive) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Total Income */}
        <StatCard 
          title="Total Income" 
          amount={data?.totalIncome} 
          icon={<TrendingUp size={24} />} 
          color="bg-emerald-50 text-emerald-600 border-emerald-100"
        />

        {/* Total Expenses */}
        <StatCard 
          title="Total Expenses" 
          amount={data?.totalExpense} 
          icon={<TrendingDown size={24} />} 
          color="bg-rose-50 text-rose-600 border-rose-100"
        />

        {/* Current Balance (Highlighted) */}
        <StatCard 
          title="Available Balance" 
          amount={data?.balance} 
          icon={<Wallet size={24} />} 
          color="bg-indigo-600 text-white shadow-indigo-200 shadow-xl ring-2 ring-indigo-600 ring-offset-2"
          isPrimary
        />

        {/* Opening Balance */}
        <StatCard 
          title="Opening Balance" 
          amount={data?.openingBalance} 
          icon={<PiggyBank size={24} />} 
          color="bg-gray-50 text-gray-600 border-gray-200"
        />
      </div>

      {/* 3. BREAKDOWN SECTION */}
      <div>
        <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          <IndianRupee size={20} className="text-indigo-500"/> Income Breakdown
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           <BreakdownCard label="Subscriptions" amount={data?.breakdown?.subscriptions} />
           <BreakdownCard label="Donations" amount={data?.breakdown?.donations} />
           <BreakdownCard label="Member Fees" amount={data?.breakdown?.memberFees} />
        </div>
      </div>
    </div>
  );
}

// 🎨 SUB-COMPONENT: Modern Stat Card
function StatCard({ title, amount, icon, color, isPrimary }) {
  return (
    <div className={`
      relative overflow-hidden rounded-2xl p-6 transition-all duration-300
      ${isPrimary ? color : `${color} bg-opacity-50 border`}
      hover:-translate-y-1
    `}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isPrimary ? 'text-indigo-100' : 'text-gray-500'}`}>
            {title}
          </p>
          <h2 className="text-3xl font-bold font-mono tracking-tight">
            ₹{amount?.toLocaleString() || "0"}
          </h2>
        </div>
        <div className={`p-3 rounded-xl ${isPrimary ? 'bg-white/20 text-white' : 'bg-white shadow-sm'}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// 🎨 SUB-COMPONENT: Simple Breakdown Card
function BreakdownCard({ label, amount }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:border-indigo-200 transition-colors">
      <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
        {label}
      </span>
      <span className="text-2xl font-bold text-gray-800">
        ₹{amount?.toLocaleString() || "0"}
      </span>
    </div>
  );
}