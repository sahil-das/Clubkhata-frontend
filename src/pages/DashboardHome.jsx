import { useState, useEffect } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext"; 
import CreateYearModal from "../components/CreateYearModal";
import { 
  Loader2, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Calendar,
  IndianRupee,
  Lock,
  PlusCircle, // ✅ Added Icon
  Sparkles
} from "lucide-react";

export default function DashboardHome() {
  const { activeClub } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateYear, setShowCreateYear] = useState(false);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const res = await api.get("/finance/summary");
      setData(res.data.data);
      // 🚫 REMOVED: No more auto-popup
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSummary();
  }, [activeClub]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-indigo-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse">Loading Financial Data...</p>
      </div>
    );
  }

  // ==========================================
  // 1. STATE: NO ACTIVE YEAR (CLOSED SEASON)
  // ==========================================
  if (data?.yearName === "No Active Year") {
    
    // A. ADMIN VIEW: Show "Start New Year" Call to Action
    if (activeClub?.role === 'admin') {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
           
           {/* Modal */}
           {showCreateYear && (
              <CreateYearModal 
                onSuccess={() => {
                  setShowCreateYear(false);
                  fetchSummary();
                }}
                onClose={() => setShowCreateYear(false)}
              />
           )}

           <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-indigo-100 overflow-hidden text-center">
              <div className="bg-indigo-600 p-8 flex justify-center">
                  <div className="bg-white/20 p-6 rounded-full backdrop-blur-sm">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
              </div>
              
              <div className="p-10">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Ready for the Next Festival?</h2>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  The previous financial year is closed. Initialize a new cycle to start collecting subscriptions, managing expenses, and tracking donations for the upcoming event.
                </p>

                <button 
                  onClick={() => setShowCreateYear(true)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-transform active:scale-95 flex items-center justify-center gap-3"
                >
                  <PlusCircle size={24} />
                  Start New Financial Year
                </button>
                
                <p className="text-xs text-gray-400 mt-6">
                  This will unlock all financial features for your club members.
                </p>
              </div>
           </div>
        </div>
      );
    }

    // B. MEMBER VIEW: Show "Season Closed"
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
         <div className="bg-gray-100 p-6 rounded-full mb-4">
            <Lock className="w-12 h-12 text-gray-400" />
         </div>
         <h2 className="text-2xl font-bold text-gray-700">Financial Year Closed</h2>
         <p className="text-gray-500 max-w-md mt-2">
           The committee has closed the accounts for the previous year. 
           Please wait for the admin to start the new session.
         </p>
      </div>
    );
  }

  // ==========================================
  // 2. STATE: ACTIVE YEAR (NORMAL DASHBOARD)
  // ==========================================
  return (
    <div className="space-y-8 pb-10">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 tracking-tight">
            Financial Overview
          </h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
            <Calendar size={16} />
            Current Cycle: 
            <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full text-xs uppercase tracking-wide">
              {data?.yearName}
            </span>
          </p>
        </div>
      </div>

      {/* MAIN STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        <StatCard 
          title="Total Income" 
          amount={data?.totalIncome} 
          icon={<TrendingUp size={24} />} 
          color="bg-emerald-50 text-emerald-600 border-emerald-100"
        />

        <StatCard 
          title="Total Expenses" 
          amount={data?.totalExpense} 
          icon={<TrendingDown size={24} />} 
          color="bg-rose-50 text-rose-600 border-rose-100"
        />

        <StatCard 
          title="Available Balance" 
          amount={data?.balance} 
          icon={<Wallet size={24} />} 
          color="bg-indigo-600 text-white shadow-indigo-200 shadow-xl ring-2 ring-indigo-600 ring-offset-2"
          isPrimary
        />

        <StatCard 
          title="Opening Balance" 
          amount={data?.openingBalance} 
          icon={<PiggyBank size={24} />} 
          color="bg-gray-50 text-gray-600 border-gray-200"
        />
      </div>

      {/* BREAKDOWN SECTION */}
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

// 🎨 SUB-COMPONENTS
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