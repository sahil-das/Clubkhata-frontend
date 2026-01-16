import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

// Modals
import CreateYearModal from "../components/CreateYearModal";
import AddExpenseModal from "../components/AddExpenseModal"; 
import AddDonationModal from "../components/AddDonationModal"; 
import AddMemberModal from "../components/AddMemberModal"; 
import AddPujaModal from "../components/AddPujaModal"; 
import NoticeBoard from "../components/NoticeBoard"; 
import ActivePollsWidget from "../components/ActivePollsWidget"; 

// Icons
import { 
  Loader2, Wallet, TrendingUp, TrendingDown, PiggyBank, Calendar,
  IndianRupee, Lock, PlusCircle, Sparkles, Receipt, UserPlus, Zap
} from "lucide-react";

export default function DashboardHome() {
  const { activeClub, user } = useAuth(); 
  const toast = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateYear, setShowCreateYear] = useState(false);
  const [frequency, setFrequency] = useState(null); 
  
  // Modal States
  const [showExpense, setShowExpense] = useState(false);
  const [showDonation, setShowDonation] = useState(false);
  const [showMember, setShowMember] = useState(false);
  const [showPuja, setShowPuja] = useState(false); 

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 5) return "Late night working";
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      const summaryRes = await api.get("/finance/summary");
      const summaryData = summaryRes.data.data;
      setData(summaryData);
      
      try {
        const yearRes = await api.get("/years/active");
        if (yearRes.data.data) {
          setFrequency(yearRes.data.data.subscriptionFrequency);
        }
      } catch (e) {
        console.warn("No active year config found, defaulting frequency.");
      }

      if (summaryData?.yearName === "No Active Year" && activeClub?.role === 'admin') {
         setShowCreateYear(true);
      }

    } catch (err) {
      console.error("Dashboard Error:", err);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeClub) {
      fetchSummary();
    }
  }, [activeClub]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse">Loading Financial Data...</p>
      </div>
    );
  }

  // 1. STATE: NO ACTIVE YEAR
  if (data?.yearName === "No Active Year") {
    if (activeClub?.role === 'admin') {
      return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
           {showCreateYear && (
             <CreateYearModal 
               onSuccess={() => { setShowCreateYear(false); fetchSummary(); toast.success("New Year Started!"); }} 
               onClose={() => setShowCreateYear(false)} 
             />
           )}
           <div className="max-w-xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-indigo-100 dark:border-slate-800 overflow-hidden text-center">
              <div className="bg-indigo-600 p-8 flex justify-center">
                  <div className="bg-white/20 p-6 rounded-full backdrop-blur-sm"><Sparkles className="w-12 h-12 text-white" /></div>
              </div>
              <div className="p-10">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Ready for the Next Festival?</h2>
                <p className="text-gray-500 dark:text-slate-400 mb-8 leading-relaxed">The previous financial year is closed. Initialize a new cycle to start.</p>
                <button onClick={() => setShowCreateYear(true)} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none transition-transform active:scale-95 flex items-center justify-center gap-3">
                  <PlusCircle size={24} /> Start New Financial Year
                </button>
              </div>
           </div>
        </div>
      );
    }
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
         <div className="bg-gray-100 dark:bg-slate-800 p-6 rounded-full mb-4"><Lock className="w-12 h-12 text-gray-400 dark:text-slate-500" /></div>
         <h2 className="text-2xl font-bold text-gray-700 dark:text-slate-200">Financial Year Closed</h2>
         <p className="text-gray-500 dark:text-slate-400 max-w-md mt-2">Please wait for the admin to start the new session.</p>
      </div>
    );
  }

  // 2. STATE: ACTIVE YEAR (DASHBOARD)
  return (
    <div className="space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 👋 WELCOME HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
            {greeting}, <span className="text-indigo-600 dark:text-indigo-400">{user?.name?.split(' ')[0]}</span> 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium leading-relaxed">
             Here's what's happening with <span className="font-bold text-slate-700 dark:text-slate-300">{activeClub?.clubName}</span> today.
             <span className="hidden sm:inline"> Everything looks under control.</span>
          </p>
        </div>
        
        <div className="flex items-center gap-2">
           <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50 shadow-sm">
             <Calendar size={14} className="text-indigo-500" /> 
             {data?.yearName} 
           </span>
        </div>
      </div>

      {/* MAIN STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Available Balance" 
          amount={data?.balance} 
          icon={<Wallet size={24} />} 
          variant="primary"
        />
        <StatCard 
          title="Total Income" 
          amount={data?.totalIncome} 
          icon={<TrendingUp size={24} />} 
          variant="success"
        />
        <StatCard 
          title="Total Expenses" 
          amount={data?.totalExpense} 
          icon={<TrendingDown size={24} />} 
          variant="danger"
        />
        <StatCard 
          title="Opening Balance" 
          amount={data?.openingBalance} 
          icon={<PiggyBank size={24} />} 
          variant="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* LEFT COLUMN: Actions & Breakdown (Takes 2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
           
           {/* QUICK ACTIONS */}
           <div>
             <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Zap size={14}/> Quick Actions
             </h3>
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <QuickActionBtn 
                   icon={<TrendingDown />} 
                   label="Add Expense" 
                   sub="Bill/Voucher"
                   color="rose"
                   onClick={() => setShowExpense(true)} 
                />
                <QuickActionBtn 
                   icon={<Receipt />} 
                   label="Add Donation" 
                   sub="Public Collection"
                   color="amber"
                   onClick={() => setShowDonation(true)} 
                />
                {activeClub?.role === 'admin' && (
                   <>
                     <QuickActionBtn 
                       icon={<IndianRupee />} 
                       label="Festival Fee" 
                       sub="Member Contribution"
                       color="emerald"
                       onClick={() => setShowPuja(true)} 
                     />
                     <QuickActionBtn 
                       icon={<UserPlus />} 
                       label="Add Member" 
                       sub="Registration"
                       color="indigo"
                       onClick={() => setShowMember(true)} 
                     />
                   </>
                )}
             </div>
           </div>

            {/* INCOME BREAKDOWN */}
           <div>
             <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
               Income Sources
             </h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {frequency && frequency !== 'none' && (
                  <BreakdownCard 
                    label={frequency === 'weekly' ? 'Weekly collection' : 'Monthly collection'} 
                    amount={data?.breakdown?.subscriptions} 
                    color="indigo"
                    onClick={() => navigate('/contributions')}
                  />
                )}

                <BreakdownCard 
                  label="Donations" 
                  amount={data?.breakdown?.donations} 
                  color="amber"
                  onClick={() => navigate('/donations')}
                />

                <BreakdownCard 
                  label="Member's Contribution" 
                  amount={data?.breakdown?.memberFees} 
                  color="emerald"
                  onClick={() => navigate('/members-contribution')}
                />
             </div>
           </div>
        </div>

        {/* RIGHT COLUMN: Interactive Widgets (Takes 1/3 width) */}
        {/* ✅ FIX: Added h-full and flex-col to make sure children expand */}
        <div className="lg:col-span-1 flex flex-col h-full">
           
           {/* 🗳️ LIVE POLLS WIDGET */}
           {/* Will return NULL if no poll, disappearing completely */}
           <ActivePollsWidget />
           
           {/* 📢 NOTICE BOARD */}
           {/* ✅ FIX: flex-1 ensures it fills ALL remaining vertical space */}
           <div className="flex-1 min-h-[400px]">
               <NoticeBoard />
           </div>
        </div>
      </div>

      {/* MODALS */}
      {showExpense && <AddExpenseModal onClose={() => setShowExpense(false)} refresh={fetchSummary} />}
      {showDonation && <AddDonationModal onClose={() => setShowDonation(false)} refresh={fetchSummary} />}
      {showPuja && <AddPujaModal onClose={() => setShowPuja(false)} refresh={fetchSummary} />} 
      {showMember && <AddMemberModal onClose={() => setShowMember(false)} refresh={() => {}} />} 
    </div>
  );
}

// ... (Sub-components StatCard, QuickActionBtn, BreakdownCard remain exactly the same) ...
function StatCard({ title, amount, icon, variant }) {
  const styles = {
    primary: "bg-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900",
    success: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30",
    danger: "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30",
    neutral: "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800"
  };

  const iconBg = {
    primary: "bg-white/20 text-white",
    success: "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400",
    danger: "bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400",
    neutral: "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${styles[variant]}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${variant === 'primary' ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'}`}>
            {title}
          </p>
          <h2 className="text-2xl lg:text-3xl font-bold font-mono tracking-tight">
            ₹{amount?.toLocaleString() || "0"}
          </h2>
        </div>
        <div className={`p-3 rounded-xl ${iconBg[variant]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function QuickActionBtn({ icon, label, sub, color, onClick }) {
  const colors = {
    rose: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 group-hover:bg-rose-100 dark:group-hover:bg-rose-900/30 border-rose-100 dark:border-rose-900/30 hover:border-rose-200 dark:hover:border-rose-800",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/30 border-amber-100 dark:border-amber-900/30 hover:border-amber-200 dark:hover:border-amber-800",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 border-emerald-100 dark:border-emerald-900/30 hover:border-emerald-200 dark:hover:border-emerald-800",
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 border-indigo-100 dark:border-indigo-900/30 hover:border-indigo-200 dark:hover:border-indigo-800",
  };

  return (
    <button 
      onClick={onClick}
      className={`
        flex flex-col items-start gap-3 p-4 rounded-xl border transition-all duration-200 group text-left
        bg-white dark:bg-slate-900 hover:shadow-md border-slate-200 dark:border-slate-800
        ${colors[color].replace("bg-", "hover:border-")} 
      `}
    >
       <div className={`p-2 rounded-lg transition-colors ${colors[color]}`}>
          {icon}
       </div>
       <div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">{label}</p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400">{sub}</p>
       </div>
    </button>
  );
}

function BreakdownCard({ label, amount, color, onClick }) {
  const colors = {
    indigo: "border-l-indigo-500 dark:border-l-indigo-500",
    amber: "border-l-amber-500 dark:border-l-amber-500",
    emerald: "border-l-emerald-500 dark:border-l-emerald-500"
  };

  const clickable = typeof onClick === 'function';

  return (
    <div
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={(e) => { if (clickable && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); onClick(); } }}
      className={`bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between border-l-4 ${colors[color]} ${clickable ? 'cursor-pointer hover:shadow-md hover:bg-slate-50 dark:hover:bg-slate-800 hover:-translate-y-1 transform transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-200' : 'transition'}`}
    >
      <span className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
        {label}
      </span>
      <span className="text-xl font-bold text-slate-800 dark:text-slate-100">
        ₹{amount?.toLocaleString() || "0"}
      </span>
    </div>
  );
}