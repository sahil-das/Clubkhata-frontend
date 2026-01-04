import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";
import { 
  TrendingUp, TrendingDown, Wallet, IndianRupee, PieChart as PieIcon, Download, Loader2, AlertCircle 
} from "lucide-react";

// ✅ FIX 1: Import the Correct Function from the Correct File
import { exportFinancialReportPDF } from "../utils/exportFinancialReportPDF"; 

export default function Reports() {
  const { activeClub } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cycle, setCycle] = useState(null);
  
  // Data States
  const [summary, setSummary] = useState({ opening: 0, collected: 0, expenses: 0, closing: 0 });
  const [expenses, setExpenses] = useState([]);
  
  // ✅ FIX 2: Store Raw Data Lists for the Detailed PDF
  const [pujaList, setPujaList] = useState([]);
  const [donationList, setDonationList] = useState([]);

  const [contributions, setContributions] = useState([]);
  const [dailyCollection, setDailyCollection] = useState([]);

  // Colors for Charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560"];

  useEffect(() => {
    fetchReportData();
  }, [activeClub]);

  const fetchReportData = async () => {
    try {
      const yearRes = await api.get("/years/active");
      const activeYear = yearRes.data.data;
      
      if (!activeYear) {
        setLoading(false);
        return;
      }
      setCycle(activeYear);

      // 1. Fetch All Financial Data
      const [expRes, subRes, pujaRes, donateRes] = await Promise.all([
        api.get("/expenses"),
        api.get("/subscriptions/payments"), 
        api.get("/member-fees"),            
        api.get("/donations")               
      ]);

      const expenseData = expRes.data.data || [];
      const pujaData = pujaRes.data.data || [];
      const donationData = donateRes.data.data || [];

      // ✅ FIX 3: Set Raw Lists
      setPujaList(pujaData);
      setDonationList(donationData);

      // --- CALCULATIONS ---

      // A. Expenses
      const totalExpenses = expenseData
        .filter(e => e.status === "approved")
        .reduce((sum, e) => sum + e.amount, 0);

      // B. Collections
      const totalPuja = pujaData.reduce((sum, p) => sum + p.amount, 0);
      const totalDonations = donationData.reduce((sum, d) => sum + d.amount, 0);
      
      // Approximate Total Collection
      const totalCollected = totalPuja + totalDonations; 

      // C. Summary Object
      setSummary({
        opening: activeYear.openingBalance || 0,
        collected: totalCollected,
        expenses: totalExpenses,
        closing: (activeYear.openingBalance + totalCollected) - totalExpenses
      });

      setExpenses(expenseData);
      setContributions([
        { name: "Puja Chanda", value: totalPuja },
        { name: "Donations", value: totalDonations },
      ]);

      // D. Prepare Daily Trend Data
      const dateMap = {};
      [...pujaData, ...donationData].forEach(item => {
         const date = new Date(item.date || item.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
         dateMap[date] = (dateMap[date] || 0) + item.amount;
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

  // ✅ FIX 4: Updated Export Handler to match exportFinancialReportPDF.js
  const handleExport = () => {
    // Calculate values specifically for the report structure
    const totalPuja = contributions.find(c => c.name === "Puja Chanda")?.value || 0;
    const totalDonations = contributions.find(c => c.name === "Donations")?.value || 0;

    exportFinancialReportPDF({
      clubName: activeClub?.clubName || "Club Committee",
      year: cycle?.name || new Date().getFullYear(),
      openingBalance: summary.opening,
      totalIncome: summary.collected,
      totalExpense: summary.expenses,
      netBalance: summary.closing,
      
      // Detailed breakdown for the summary table
      incomeSources: {
        weekly: 0, // Placeholder if you add subscriptions later
        puja: totalPuja,
        donation: totalDonations
      },
      
      // Full lists for the detailed pages
      details: {
        expenses: expenses.filter(e => e.status === "approved"),
        donations: donationList,
        puja: pujaList
      }
    });
  };

  if (loading) return <div className="h-64 flex justify-center items-center text-indigo-600"><Loader2 className="animate-spin w-10 h-10" /></div>;

  if (!cycle) return (
    <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-200 mt-10">
      <AlertCircle className="mx-auto mb-3 text-gray-400" size={40} />
      <h3 className="text-xl font-bold text-gray-600">No Active Financial Year</h3>
      <p className="text-gray-500">Reports will appear here once a year is started.</p>
    </div>
  );

  // Prepare Expense Breakdown Data for Pie Chart
  const expenseCategories = {};
  expenses.filter(e => e.status === "approved").forEach(e => {
    expenseCategories[e.category] = (expenseCategories[e.category] || 0) + e.amount;
  });
  const pieData = Object.keys(expenseCategories).map(cat => ({
    name: cat,
    value: expenseCategories[cat]
  }));

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Financial Reports</h1>
          <p className="text-gray-500">Overview of {cycle.name}</p>
        </div>
        <button 
          onClick={handleExport}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95"
        >
          <Download size={20} /> Download Report
        </button>
      </div>

      {/* 2. SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Opening Balance" 
          amount={summary.opening} 
          icon={Wallet} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Total Collected" 
          amount={summary.collected} 
          icon={TrendingUp} 
          color="bg-emerald-500" 
        />
        <StatCard 
          label="Total Expenses" 
          amount={summary.expenses} 
          icon={TrendingDown} 
          color="bg-rose-500" 
        />
        <StatCard 
          label="Net Balance" 
          amount={summary.closing} 
          icon={IndianRupee} 
          color="bg-indigo-600" 
          isDark 
        />
      </div>

      {/* 3. CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* A. INCOME VS EXPENSE */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600"/> Income vs Expense
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: '#f3f4f6' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={60}>
                  {
                    [{ name: 'Income', amount: summary.collected }, { name: 'Expense', amount: summary.expenses }].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* B. EXPENSE BREAKDOWN (PIE) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-700 mb-6 flex items-center gap-2">
            <PieIcon size={18} className="text-indigo-600"/> Expense Breakdown
          </h3>
          {pieData.length > 0 ? (
            <div className="h-[300px] flex flex-col md:flex-row items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val) => `₹${val}`} />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400">
              No expenses recorded yet.
            </div>
          )}
        </div>

      </div>

      {/* 4. CHART ROW 2: TRENDS */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-700 mb-6">Daily Collection Trend (Last 14 Days)</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyCollection} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="date" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
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
      </div>

    </div>
  );
}

// ----------------------
// SUB-COMPONENTS
// ----------------------

function StatCard({ label, amount, icon: Icon, color, isDark }) {
  return (
    <div className={`p-6 rounded-2xl shadow-sm border transition-all hover:translate-y-[-2px] ${isDark ? 'bg-gray-900 text-white border-gray-800' : 'bg-white text-gray-800 border-gray-100'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
          <h3 className="text-2xl font-bold font-mono mt-1">₹{amount.toLocaleString()}</h3>
        </div>
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white flex items-center justify-center shadow-md`} style={{ backgroundColor: isDark ? '#4f46e5' : undefined }}>
           <Icon size={24} className={isDark ? 'text-white' : 'text-white'} /> 
        </div>
      </div>
    </div>
  );
}