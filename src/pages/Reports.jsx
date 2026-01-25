import { useEffect, useState, useMemo } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
// 1. ✅ Import useTheme
import { useTheme } from "../context/ThemeContext"; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";
import { 
  TrendingUp, TrendingDown, Wallet, IndianRupee, PieChart as PieIcon, Download, Loader2, AlertCircle 
} from "lucide-react";
import { exportFinancePDF } from "../utils/pdfExport";
import { clsx } from "clsx"; 

// Design System
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

const parseAmount = (val) => {
  if (!val) return 0;
  if (typeof val === 'number') return val; 
  return Number(val) || 0;
};

export default function Reports() {
  const { activeClub } = useAuth();
  
  // 2. ✅ Get Theme State
  const { isDark } = useTheme(); 

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [cycle, setCycle] = useState(null);
  
  const [summary, setSummary] = useState({ opening: 0, collected: 0, expenses: 0, closing: 0 });
  const [expenses, setExpenses] = useState([]);
  const [contributions, setContributions] = useState([]); 
  const [dailyCollection, setDailyCollection] = useState([]);

  const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#3b82f6", "#14b8a6"];

  // 3. ✅ Define Dynamic Chart Styles
  const chartStyles = {
    gridStroke: isDark ? "#334155" : "#e2e8f0", // Darker grid in dark mode
    text: isDark ? "#94a3b8" : "#64748b",
    tooltip: {
        backgroundColor: isDark ? "#1e293b" : "#ffffff",
        color: isDark ? "#f8fafc" : "#0f172a",
        border: isDark ? "1px solid #334155" : "1px solid #e2e8f0",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [activeClub]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const yearRes = await api.get("/years/active");
      const activeYear = yearRes.data.data;
      
      if (!activeYear) {
        setLoading(false);
        return;
      }
      setCycle(activeYear);

      const [expRes, pujaRes, donateRes, membersRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/member-fees"),            
        api.get("/donations"),
        api.get("/members") 
      ]);

      const expenseData = expRes.data.data || [];
      const pujaData = pujaRes.data.data || [];
      const donationData = donateRes.data.data || [];
      const membersList = membersRes.data.data || [];

      const totalExpenses = expenseData
        .filter(e => e.status === "approved")
        .reduce((sum, e) => sum + parseAmount(e.amount), 0);

      const totalPuja = pujaData.reduce((sum, p) => sum + parseAmount(p.amount), 0);
      const totalDonations = donationData.reduce((sum, d) => sum + parseAmount(d.amount), 0);
      
      const subPromises = membersList.map(m => 
          api.get(`/subscriptions/member/${m.membershipId || m._id}`).catch(() => ({ data: { data: { subscription: null } } }))
      );
      const subResponses = await Promise.all(subPromises);
      
      const totalSubscriptions = subResponses.reduce((sum, res) => {
          const sub = res?.data?.data?.subscription;
          return sum + parseAmount(sub?.totalPaid);
      }, 0);

      const totalCollected = totalPuja + totalDonations + totalSubscriptions; 
      const openingBal = parseAmount(activeYear.openingBalance);

      setSummary({
        opening: openingBal,
        collected: totalCollected,
        expenses: totalExpenses,
        closing: (openingBal + totalCollected) - totalExpenses
      });

      setExpenses(expenseData);
      
      setContributions([
        { name: activeYear.subscriptionFrequency === 'monthly' ? "Monthly Collection" : "Weekly Collection", value: totalSubscriptions },
        { name: "Members Contribution", value: totalPuja },
        { name: "Donations", value: totalDonations },
      ].filter(c => c.value > 0)); 

      const dateMap = {};
      [...pujaData, ...donationData].forEach(item => {
         const date = new Date(item.date || item.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
         dateMap[date] = (dateMap[date] || 0) + parseAmount(item.amount);
      });

      const trendData = Object.keys(dateMap).map(date => ({
        date,
        amount: dateMap[date]
      })).slice(-14); 

      setDailyCollection(trendData);

    } catch (err) {
      console.error("Report Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const expenseBreakdown = useMemo(() => {
    const breakdown = expenses.reduce((acc, curr) => {
      const amt = parseAmount(curr.amount);
      if (curr.status === 'approved') {
        acc[curr.category] = (acc[curr.category] || 0) + amt;
      }
      return acc;
    }, {});

    return Object.entries(breakdown)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [expenses]);

  const handleExport = () => {
    if (!cycle) return;
    setExporting(true);

    try {
        exportFinancePDF({
            clubName: activeClub?.clubName || "Club Committee",
            summary: [
                { label: "Opening Balance", value: summary.opening },
                { label: "Total Collected", value: summary.collected },
                { label: "Total Expenses", value: summary.expenses },
                { label: "Net Balance", value: summary.closing },
            ],
            contributions: contributions.map(c => ({
                type: c.name,
                amount: c.value
            })),
            expenses: expenses.filter(e => e.status === "approved")
        });
    } catch (error) {
        console.error("Export failed", error);
    } finally {
        setExporting(false);
    }
  };

  if (loading) return <div className="h-64 flex justify-center items-center text-primary-600 dark:text-primary-400"><Loader2 className="animate-spin w-10 h-10" /></div>;

  if (!cycle) return (
    <div className="p-10 text-center bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 mt-10">
      <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
        <AlertCircle className="text-slate-400 dark:text-slate-500" size={32} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Active Financial Year</h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-2">Reports will appear here once you start a new festival cycle in Settings.</p>
    </div>
  );

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Financial Reports</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Overview of <span className="font-bold text-slate-700 dark:text-slate-300">{cycle.name}</span></p>
        </div>
        <Button 
          onClick={handleExport}
          disabled={exporting}
          leftIcon={exporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
        >
          {exporting ? "Generating..." : "Download Snapshot"}
        </Button>
      </div>

      {/* 2. SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Opening Balance" amount={summary.opening} icon={Wallet} color="blue" />
        <StatCard label="Total Collected" amount={summary.collected} icon={TrendingUp} color="emerald" />
        <StatCard label="Total Expenses" amount={summary.expenses} icon={TrendingDown} color="rose" />
        <StatCard label="Net Balance" amount={summary.closing} icon={IndianRupee} color="indigo" />
      </div>

      {/* 3. CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* A. INCOME VS EXPENSE */}
        <Card className="min-h-[400px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-600 dark:text-primary-400"/> Income vs Expense
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Income', amount: summary.collected },
                  { name: 'Expense', amount: summary.expenses }
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                {/* 4. ✅ Use Dynamic Styles for Grid, Axis, and Tooltip */}
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.gridStroke} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: chartStyles.text, fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${Number(val)/1000}k`} tick={{fill: chartStyles.text, fontSize: 12}} />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  contentStyle={chartStyles.tooltip}
                  itemStyle={{ color: chartStyles.tooltip.color }} // Ensures list text is visible
                  labelStyle={{ color: chartStyles.tooltip.color, fontWeight: 'bold' }} // Ensures title is visible
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={50}>
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* B. EXPENSE BREAKDOWN (PIE) */}
        <Card className="min-h-[400px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 h-full flex flex-col">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <PieIcon size={18} className="text-primary-600 dark:text-primary-400"/> Expense Breakdown
          </h3>
          {expenses.length > 0 ? (
            <>
              <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                        formatter={(val) => `₹${Number(val).toFixed(2)}`} 
                        contentStyle={chartStyles.tooltip}
                        itemStyle={{ color: chartStyles.tooltip.color }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="grid grid-cols-2 gap-3">
                  {expenseBreakdown.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 truncate pr-2">
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-slate-600 dark:text-slate-300 font-medium truncate" title={item.name}>{item.name}</span>
                        </div>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-100 shrink-0">₹{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
               <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
                  <PieIcon size={24} className="opacity-20"/>
               </div>
               <p className="text-sm font-medium">No expenses recorded yet.</p>
            </div>
          )}
        </Card>
      </div>

      {/* 4. CHART ROW 2: TRENDS */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6">Daily Collection Trend (Last 14 Days)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyCollection} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: chartStyles.text, fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: chartStyles.text, fontSize: 12}} />
              <Tooltip 
                contentStyle={chartStyles.tooltip}
                itemStyle={{ color: chartStyles.tooltip.color }}
                labelStyle={{ color: chartStyles.tooltip.color, fontWeight: 'bold' }}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartStyles.gridStroke} />
              <Area 
                type="monotone" 
                dataKey="amount" 
                stroke="#6366f1" 
                fillOpacity={1} 
                fill="url(#colorAmt)" 
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function StatCard({ label, amount, icon: Icon, color, highlight }) {
  const colors = {
      blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
      emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
      rose: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
      indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
  };

  return (
    <Card className={clsx("transition-all hover:-translate-y-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800", highlight && "bg-slate-900 dark:bg-black text-white border-slate-900 dark:border-slate-800")}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className={clsx("text-xs font-bold uppercase tracking-wider", highlight ? "text-slate-400" : "text-slate-500 dark:text-slate-400")}>
            {label}
          </p>
          <h3 className={clsx("text-2xl font-bold font-mono mt-1", highlight ? "text-white" : "text-slate-800 dark:text-slate-100")}>₹{Number(amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</h3>
        </div>
        <div className={clsx("p-3 rounded-xl flex items-center justify-center", !highlight && colors[color], highlight && "bg-slate-800 dark:bg-slate-900 text-indigo-400")}>
           <Icon size={20} /> 
        </div>
      </div>
    </Card>
  );
}
