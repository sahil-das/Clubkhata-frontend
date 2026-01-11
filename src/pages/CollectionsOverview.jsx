import { useEffect, useState, useMemo } from "react";
import { 
  IndianRupee, Calendar, Filter, Search, ArrowUpRight, 
  TrendingUp, ChevronDown, ChevronRight 
} from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import api from "../api/axios";
import { clsx } from "clsx";

// Design System
import { Card } from "../components/ui/Card";

// 🛠 HELPER
const parseAmount = (val) => {
    if (!val) return 0;
    if (typeof val === 'number') {
        return val / 100;
    }
    return Number(val) || 0;
};

export default function CollectionsOverview() {
  const { weeklyTotal, pujaTotal, donationTotal, openingBalance, loading: financeLoading } = useFinance();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDates, setOpenDates] = useState({});
  const [frequency, setFrequency] = useState(null); // 👈 Added state for frequency

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [donationsRes, yearRes] = await Promise.all([
            api.get("/donations"),
            api.get("/years/active")
        ]);
        
        setDonations(donationsRes.data.data || []);
        
        if (yearRes.data.data) {
            setFrequency(yearRes.data.data.subscriptionFrequency);
        }

      } catch (err) {
        console.error("Data load error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const parsedOpening = parseAmount(openingBalance);
  const parsedWeekly = parseAmount(weeklyTotal);
  const parsedPuja = parseAmount(pujaTotal);
  const parsedDonation = parseAmount(donationTotal);
  
  const totalCollection = parsedOpening + parsedWeekly + parsedPuja + parsedDonation;

  const filteredDonations = useMemo(() => {
    return donations.filter(d => 
      (d.donorName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.amount.toString()).includes(searchTerm)
    );
  }, [donations, searchTerm]);

  const groupedData = useMemo(() => {
    const sorted = [...filteredDonations].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    
    return sorted.reduce((acc, d) => {
      const date = new Date(d.date || d.createdAt).toLocaleDateString("en-IN", { 
        day: 'numeric', month: 'short', year: 'numeric' 
      });
      if (!acc[date]) acc[date] = [];
      acc[date].push(d);
      return acc;
    }, {});
  }, [filteredDonations]);

  const toggleDate = (date) => {
    setOpenDates(prev => ({ ...prev, [date]: !prev[date] }));
  };

  useEffect(() => {
    const dates = Object.keys(groupedData);
    if (dates.length > 0 && Object.keys(openDates).length === 0) {
        setOpenDates({ [dates[0]]: true });
    }
  }, [groupedData]);

  // Dynamic Label Logic
  let subLabel = "Subscriptions";
  if (frequency === 'weekly') subLabel = "Weekly Collection";
  if (frequency === 'monthly') subLabel = "Monthly Collection";

  return (
    <div className="space-y-8 pb-10 animate-fade-in">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
             <IndianRupee className="text-primary-600 dark:text-primary-400" /> Financial Overview
           </h1>
           <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Real-time breakdown of all club funds.</p>
        </div>
      </div>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <SummaryCard 
          label="Opening Balance" 
          value={parsedOpening}
          loading={financeLoading}
          color="green"
          icon={Calendar}
        />
        {frequency !== 'none' && (
            <SummaryCard 
            label={subLabel} 
            value={parsedWeekly}
            loading={financeLoading}
            color="blue"
            icon={Calendar}
            />
        )}
        <SummaryCard 
          label="Festival collection" 
          value={parsedPuja}
          loading={financeLoading}
          color="pink"
          icon={IndianRupee}
        />
        <SummaryCard 
          label="Donations" 
          value={parsedDonation}
          loading={financeLoading}
          color="amber"
          icon={TrendingUp}
        />
        <SummaryCard
          label="Grand Total"
          value={totalCollection}
          loading={financeLoading}
          highlight
          icon={ArrowUpRight}
        />
      </div>

      {/* 3. TIMELINE LEDGER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Timeline */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">Donations History</h3>
                
                {/* Search Pill */}
                <div className="relative group">
                    <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400 transition-colors" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search records..." 
                        className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-sm focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30 outline-none w-32 focus:w-64 transition-all shadow-sm text-slate-700 dark:text-slate-200"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Empty State */}
            {!loading && Object.keys(groupedData).length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl border-dashed">
                    <Filter className="text-slate-200 dark:text-slate-700 mb-2" size={48} />
                    <p className="text-slate-400 dark:text-slate-500 font-medium">No transactions found</p>
                </div>
            )}

            {/* Timeline Stream */}
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-2 md:ml-4 space-y-6 pb-4">
                {Object.entries(groupedData).map(([date, items], index) => {
                    const isOpen = openDates[date];
                    
                    return (
                        <div key={date} className="relative pl-6 md:pl-8 animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                            
                            {/* Interactive Timeline Dot */}
                            <button 
                                onClick={() => toggleDate(date)}
                                className={clsx(
                                    "absolute -left-[9px] top-1 w-5 h-5 rounded-full border-4 flex items-center justify-center transition-all z-10",
                                    isOpen 
                                        ? "bg-white dark:bg-slate-900 border-primary-500 dark:border-primary-400 ring-2 ring-primary-100 dark:ring-primary-900/30 scale-110" 
                                        : "bg-slate-200 dark:bg-slate-700 border-slate-50 dark:border-slate-800 hover:bg-primary-200 dark:hover:bg-primary-900 hover:border-primary-300 dark:hover:border-primary-700"
                                )}
                            >
                                <div className={clsx("w-1.5 h-1.5 rounded-full", isOpen ? "bg-primary-500 dark:bg-primary-400" : "hidden")} />
                            </button>
                            
                            {/* Date Header */}
                            <button 
                                onClick={() => toggleDate(date)}
                                className="w-full flex items-center justify-between group mb-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 rounded-lg -ml-2 transition-colors"
                            >
                                <div className="flex items-baseline gap-3">
                                    <h4 className="font-bold text-slate-700 dark:text-slate-200 text-lg">{date.split(" ")[0]} <span className="text-sm font-normal text-slate-500 dark:text-slate-400">{date.split(" ").slice(1).join(" ")}</span></h4>
                                    <span className="text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">
                                        {items.length} txn
                                    </span>
                                </div>
                                <div className="text-slate-400 dark:text-slate-500 group-hover:text-primary-500 dark:group-hover:text-primary-400 transition-colors">
                                    {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </div>
                            </button>

                            {/* Cards */}
                            {isOpen && (
                                <div className="space-y-3 animate-fade-in">
                                    {items.map((d) => (
                                        <div key={d._id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex justify-between items-center group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                                                    {d.donorName ? d.donorName.charAt(0) : "?"}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm group-hover:text-primary-700 dark:group-hover:text-primary-400 transition-colors truncate">
                                                        {d.donorName || "Anonymous"}
                                                    </p>
                                                    <p className="text-xs text-slate-400 dark:text-slate-500 capitalize truncate">
                                                        {d.paymentMethod || "Cash"} {d.receiptNo && `• Ref: ${d.receiptNo}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0 ml-2">
                                                <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">+ ₹{Number(d.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500">Donation</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Info Sidebar (Visible on all screens now) */}
        <div className="space-y-6">
            <Card className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white border-none shadow-xl">
                <h3 className="font-bold text-lg mb-2">Fund Distribution</h3>
                <p className="text-slate-400 text-sm mb-6">How current funds are allocated across categories.</p>
                
                <div className="space-y-4">
                    <DistributionBar label="Opening Balance" amount={parsedOpening} total={totalCollection} color="bg-green-500" />
                    {frequency !== 'none' && (
                        <DistributionBar label={subLabel} amount={parsedWeekly} total={totalCollection} color="bg-blue-500" />
                    )}
                    <DistributionBar label="Member's Contribution" amount={parsedPuja} total={totalCollection} color="bg-pink-500" />
                    <DistributionBar label="Donations" amount={parsedDonation} total={totalCollection} color="bg-amber-500" />
                </div>
            </Card>
        </div>

      </div>
    </div>
  );
}

/* ===== SUB COMPONENTS ===== */

function SummaryCard({ label, value, loading, highlight, color, icon: Icon }) {
    const colors = {
        blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
        pink: "bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 border-pink-100 dark:border-pink-900/30",
        amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
        green: "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30",
    };

    return (
      <div
        className={clsx(
            "rounded-2xl p-5 flex flex-col justify-between border min-h-[110px] transition-all hover:-translate-y-1",
            highlight 
                ? "bg-primary-600 dark:bg-primary-700 text-white border-primary-600 dark:border-primary-700 shadow-xl shadow-primary-200 dark:shadow-none" 
                : `${colors[color]} shadow-sm`
        )}
      >
        <div className="flex justify-between items-start">
            <p className={clsx("text-xs font-bold uppercase tracking-wider", highlight ? "opacity-80" : "opacity-60")}>
                {label}
            </p>
            {Icon && <Icon size={18} className={highlight ? "opacity-100" : "opacity-50"} />}
        </div>
  
        {loading ? (
           <div className="h-8 w-24 bg-current opacity-20 rounded animate-pulse" />
        ) : (
           <h3 className="text-3xl font-bold font-mono tracking-tight">
             ₹{(value || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}
           </h3>
        )}
      </div>
    );
}

function DistributionBar({ label, amount, total, color }) {
    const percentage = total > 0 ? Math.round((amount / total) * 100) : 0;
    
    return (
        <div>
            <div className="flex justify-between text-xs font-medium mb-1">
                <span className="text-slate-300">{label}</span>
                <span>{percentage}%</span>
            </div>
            <div className="h-2 w-full bg-slate-700 dark:bg-slate-950 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${percentage}%` }} />
            </div>
        </div>
    );
}