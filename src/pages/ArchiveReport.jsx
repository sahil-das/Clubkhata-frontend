import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area 
} from "recharts";
import { 
  TrendingUp, TrendingDown, Wallet, IndianRupee, PieChart as PieIcon, 
  ArrowLeft, Loader2, Calendar, FileText, Gift, Truck 
} from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { clsx } from "clsx";

export default function ArchiveReport() {
  const { yearId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  
  // Tab State for Detailed Records
  const [activeTab, setActiveTab] = useState("expenses");

  const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#3b82f6", "#14b8a6"];

  useEffect(() => {
    fetchArchiveData();
  }, [yearId]);

  const fetchArchiveData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/archives/${yearId}`);
      setData(res.data.data);
    } catch (err) {
      console.error("Failed to load archive report", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Prepare Daily Trend Data
  const dailyCollection = useMemo(() => {
    if (!data) return [];
    const dateMap = {};
    const records = [...(data.records.fees || []), ...(data.records.donations || [])];
    
    records.forEach(item => {
       const date = new Date(item.date || item.createdAt).toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
       dateMap[date] = (dateMap[date] || 0) + Number(item.amount);
    });

    return Object.keys(dateMap).map(date => ({
      date,
      amount: dateMap[date]
    })).slice(-14); // Last 14 active days
  }, [data]);

  // 2. Prepare Expense Breakdown
  const expenseBreakdown = useMemo(() => {
    if (!data) return [];
    const breakdown = (data.records.expenses || []).reduce((acc, curr) => {
      acc[curr.category] = (acc[curr.category] || 0) + Number(curr.amount);
      return acc;
    }, {});

    return Object.entries(breakdown)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  if (loading) return <div className="h-screen flex justify-center items-center text-indigo-600"><Loader2 className="animate-spin w-10 h-10" /></div>;
  if (!data) return <div className="text-center p-10">Archive not found</div>;

  const { summary, info, records } = data;
  const hasRentals = records.rentals && records.rentals.length > 0;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate("/archives")} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
               {info.name} <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-900/50">Archived</span>
            </h1>
            <p className="text-slate-500 text-sm flex items-center gap-2">
               <Calendar size={14}/> {new Date(info.startDate).getFullYear()} Cycle Report
            </p>
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Opening Balance" amount={summary.openingBalance} icon={Wallet} color="blue" />
        <StatCard label="Total Collected" amount={summary.income.total} icon={TrendingUp} color="emerald" />
        <StatCard label="Total Expenses" amount={summary.expense} icon={TrendingDown} color="rose" />
        <StatCard label="Closing Balance" amount={summary.netBalance} icon={IndianRupee} color="indigo" highlight />
      </div>

      {/* CHARTS ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expense */}
        <Card className="min-h-[400px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-600"/> Income vs Expense
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Income', amount: summary.income.total },
                  { name: 'Expense', amount: summary.expense }
                ]}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${Number(val)/1000}k`} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]} barSize={50}>
                  <Cell fill="#10b981" />
                  <Cell fill="#f43f5e" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Expense Breakdown */}
        <Card className="min-h-[400px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-6 flex items-center gap-2">
            <PieIcon size={18} className="text-indigo-600"/> Expense Breakdown
          </h3>
          {expenseBreakdown.length > 0 ? (
            <div className="h-[300px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val) => `₹${Number(val).toLocaleString()}`} contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#1e293b', color: '#fff' }} />
                  </PieChart>
                </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-400">No expenses</div>
          )}
        </Card>
      </div>

      {/* DETAILED RECORDS SECTION */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Detailed Records</h3>
        
        {/* TABS */}
        <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 mb-4">
            <TabButton active={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} icon={FileText}>Expenses</TabButton>
            <TabButton active={activeTab === 'donations'} onClick={() => setActiveTab('donations')} icon={Gift}>Donations</TabButton>
            {hasRentals && <TabButton active={activeTab === 'rentals'} onClick={() => setActiveTab('rentals')} icon={Truck}>Rentals</TabButton>}
        </div>

        {/* TAB CONTENT */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 min-h-[300px]">
            {activeTab === 'expenses' && (
                <DataTable 
                    data={records.expenses} 
                    columns={[
                        { header: "Date", accessor: (item) => new Date(item.date).toLocaleDateString() },
                        { header: "Title", accessor: "title" },
                        { header: "Category", accessor: "category", className: "hidden md:table-cell" },
                        { header: "Amount", accessor: (item) => `₹${item.amount.toLocaleString()}`, className: "text-right font-mono font-bold" }
                    ]}
                    emptyMessage="No expenses recorded."
                />
            )}
            
            {activeTab === 'donations' && (
                <DataTable 
                    data={records.donations} 
                    columns={[
                        { header: "Date", accessor: (item) => new Date(item.date).toLocaleDateString() },
                        { header: "Donor", accessor: "donorName" },
                        { header: "Type", accessor: "type", className: "capitalize text-slate-500" },
                        { header: "Amount", accessor: (item) => `₹${item.amount.toLocaleString()}`, className: "text-right font-mono font-bold text-emerald-600" }
                    ]}
                    emptyMessage="No donations recorded."
                />
            )}

            {activeTab === 'rentals' && (
                <DataTable 
                    data={records.rentals || []} 
                    columns={[
                        { header: "Vendor", accessor: (item) => item.vendor?.name || "Unknown" },
                        { header: "Status", accessor: (item) => (
                            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                                item.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>{item.status}</span>
                        )},
                        { header: "Items", accessor: (item) => item.items.length + " items" },
                        { header: "Total", accessor: (item) => `₹${item.totalEstimatedAmount?.toLocaleString()}`, className: "text-right font-mono font-bold" }
                    ]}
                    emptyMessage="No rentals recorded."
                />
            )}
        </Card>
      </div>

    </div>
  );
}

// --- SUB COMPONENTS ---

function StatCard({ label, amount, icon: Icon, color, highlight }) {
  const colors = {
      blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
      rose: "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400",
      indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400",
  };
  return (
    <Card className={clsx("transition-all hover:-translate-y-1 bg-white dark:bg-slate-900", highlight && "bg-slate-900 dark:bg-black text-white")}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className={clsx("text-xs font-bold uppercase tracking-wider", highlight ? "text-slate-400" : "text-slate-500")}>{label}</p>
          <h3 className={clsx("text-2xl font-bold font-mono mt-1", highlight ? "text-white" : "text-slate-800 dark:text-slate-100")}>₹{Number(amount).toLocaleString()}</h3>
        </div>
        <div className={clsx("p-3 rounded-xl flex items-center justify-center", !highlight && colors[color], highlight && "bg-slate-800 text-indigo-400")}>
           <Icon size={20} /> 
        </div>
      </div>
    </Card>
  );
}

function TabButton({ children, active, onClick, icon: Icon }) {
    return (
        <button 
            onClick={onClick}
            className={clsx(
                "flex items-center gap-2 px-4 py-2 text-sm font-bold border-b-2 transition-colors",
                active 
                    ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400" 
                    : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            )}
        >
            {Icon && <Icon size={16} />}
            {children}
        </button>
    )
}

function DataTable({ data, columns, emptyMessage }) {
    if (!data || data.length === 0) {
        return (
            <div className="h-40 flex flex-col items-center justify-center text-slate-400">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase text-xs font-bold">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className={clsx("px-4 py-3", col.className || "")}>{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            {columns.map((col, cIdx) => (
                                <td key={cIdx} className={clsx("px-4 py-3 text-slate-700 dark:text-slate-300", col.className || "")}>
                                    {typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor]}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
