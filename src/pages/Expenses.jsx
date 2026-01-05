import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, Search, CheckCircle, XCircle, Clock, Loader2, 
  IndianRupee, AlertCircle, Lock, Download, Trash2, 
  FileText, Calendar, Filter, ChevronDown 
} from "lucide-react";
import { clsx } from "clsx";

// Design System
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { exportExpensesPDF } from "../utils/pdfExport"; 

const CATEGORIES = ["Pandal", "Idol", "Light & Sound", "Food/Bhog", "Priest/Puja", "Transport", "Miscellaneous"];

export default function Expenses() {
  const { activeClub } = useAuth(); 
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cycle, setCycle] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchExpenses = async () => {
    try {
      const yearRes = await api.get("/years/active");
      const activeYear = yearRes.data.data;
      
      if (!activeYear) {
        setLoading(false);
        return;
      }

      setCycle(activeYear);
      const res = await api.get("/expenses");
      setExpenses(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [activeClub]);

  const handleStatus = async (id, newStatus) => {
    if (activeClub?.role !== "admin") return;
    try {
      await api.put(`/expenses/${id}/status`, { status: newStatus });
      setExpenses(prev => prev.map(e => e._id === id ? { ...e, status: newStatus } : e));
    } catch (err) {
      console.error("Action failed");
    }
  };

  const handleDelete = async (id) => {
    if (activeClub?.role !== "admin") return;
    if (!window.confirm("Permanently delete this record?")) return;

    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(prev => prev.filter(e => e._id !== id));
    } catch (err) {
      console.error("Failed to delete");
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
        const matchesSearch = e.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || e.status === statusFilter;
        return matchesSearch && matchesStatus;
    });
  }, [expenses, searchTerm, statusFilter]);

  const totalApproved = expenses
    .filter(e => e.status === "approved")
    .reduce((sum, e) => sum + e.amount, 0);

  if (loading) return <LoadingState />;
  if (!cycle) return <NoCycleState isAdmin={activeClub?.role === "admin"} />;

  return (
    <div className="space-y-6 pb-20 animate-fade-in relative">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-3">
             <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
                <FileText size={24} />
             </div>
             <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Expenses</h1>
           </div>
           <p className="text-slate-500 text-sm mt-1 ml-1">
             Track bills for <span className="font-bold text-slate-700">{cycle.name}</span>
           </p>
        </div>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            
            {/* TOTAL BADGE (Visible on Mobile now) */}
            <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl sm:bg-transparent sm:p-0 sm:border-none sm:text-right flex justify-between sm:block items-center">
                <p className="text-xs font-bold text-rose-400 uppercase tracking-wider">Total Approved</p>
                <p className="text-xl sm:text-2xl font-bold font-mono text-rose-600">₹{totalApproved.toLocaleString()}</p>
            </div>
            
            <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-200"
                leftIcon={<Plus size={18} />}
            >
                Add Bill
            </Button>
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <Card noPadding className="sticky top-20 z-10 shadow-sm border-slate-200">
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                <input 
                    type="text" 
                    placeholder="Search expenses..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Filters & Export */}
            <div className="flex gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-40">
                    <select 
                        className="w-full bg-white border border-slate-200 text-slate-700 text-sm rounded-xl pl-3 pr-8 py-2 focus:border-rose-500 outline-none cursor-pointer appearance-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16}/>
                </div>

                <Button 
                    variant="secondary" 
                    className="shrink-0 px-3"
                    onClick={() => exportExpensesPDF({ 
                        clubName: activeClub?.clubName, 
                        cycleName: cycle?.name, 
                        expenses: filteredExpenses 
                    })}
                >
                    <Download size={18} />
                </Button>
            </div>
        </div>
      </Card>

      {/* 3. EXPENSE LIST (TABLE / CARDS) */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
         {filteredExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Filter size={48} className="mb-4 opacity-20"/>
                <p className="text-sm font-medium">No expenses found</p>
            </div>
         ) : (
            <div className="w-full">
                {/* DESKTOP HEADER */}
                <div className="hidden md:grid grid-cols-12 bg-slate-50 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <div className="col-span-4 pl-2">Details</div>
                    <div className="col-span-2">Category</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-2 text-center">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* ROWS */}
                <div className="divide-y divide-slate-100">
                    {filteredExpenses.map((e) => (
                        <div key={e._id} className="group p-4 flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-0 items-start md:items-center hover:bg-slate-50/50 transition-colors">
                            
                            {/* 1. Details */}
                            <div className="col-span-4 pl-2 w-full">
                                <div className="flex justify-between md:block">
                                    <h3 className="font-bold text-slate-800 text-sm md:text-base">{e.title}</h3>
                                    {/* Mobile Amount */}
                                    <span className="md:hidden font-mono font-bold text-slate-800">
                                        ₹{e.amount.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                                    <Calendar size={12} />
                                    {new Date(e.date).toLocaleDateString()}
                                    <span className="hidden md:inline">• By {e.recordedBy?.name || "Member"}</span>
                                </div>
                            </div>

                            {/* 2. Category (Desktop) */}
                            <div className="hidden md:block col-span-2">
                                <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">
                                    {e.category}
                                </span>
                            </div>

                            {/* 3. Amount (Desktop) */}
                            <div className="hidden md:block col-span-2">
                                <span className="font-mono font-bold text-slate-700">₹{e.amount.toLocaleString()}</span>
                            </div>

                            {/* 4. Status */}
                            <div className="col-span-2 w-full md:w-auto flex md:justify-center">
                                <StatusBadge status={e.status} />
                            </div>

                            {/* 5. Actions */}
                            <div className="col-span-2 w-full flex justify-end items-center gap-2">
                                {activeClub?.role === "admin" && (
                                    <>
                                        {e.status === "pending" && (
                                            <div className="flex bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                                                <button onClick={() => handleStatus(e._id, "approved")} className="p-2 hover:bg-emerald-50 text-emerald-600 transition" title="Approve">
                                                    <CheckCircle size={16} />
                                                </button>
                                                <div className="w-px bg-slate-200"></div>
                                                <button onClick={() => handleStatus(e._id, "rejected")} className="p-2 hover:bg-red-50 text-red-500 transition" title="Reject">
                                                    <XCircle size={16} />
                                                </button>
                                            </div>
                                        )}
                                        <button 
                                            onClick={() => handleDelete(e._id)}
                                            className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Mobile Category Footer */}
                            <div className="md:hidden w-full text-xs text-slate-400 flex justify-between items-center pt-2 border-t border-slate-50 mt-1">
                                <span>{e.category}</span>
                                <span>Recorded by {e.recordedBy?.name}</span>
                            </div>

                        </div>
                    ))}
                </div>
            </div>
         )}
      </div>

      {/* MODAL */}
      {showAddModal && (
        <AddExpenseModal 
          categories={CATEGORIES} 
          onClose={() => setShowAddModal(false)} 
          refresh={fetchExpenses} 
        />
      )}
    </div>
  );
}

/* ================= HELPERS & COMPONENTS ================= */

function StatusBadge({ status }) {
    const styles = {
        pending: "bg-amber-100 text-amber-700 border-amber-200",
        approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
        rejected: "bg-red-100 text-red-700 border-red-200"
    };

    const icons = {
        pending: Clock,
        approved: CheckCircle,
        rejected: XCircle
    };

    const Icon = icons[status] || Clock;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${styles[status]}`}>
            <Icon size={10} strokeWidth={3} />
            {status}
        </span>
    );
}

function AddExpenseModal({ categories, onClose, refresh }) {
    const { register, handleSubmit } = useForm();
    const [submitting, setSubmitting] = useState(false);

    const onSubmit = async (data) => {
        setSubmitting(true);
        try {
            await api.post("/expenses", { 
              ...data, 
              amount: Number(data.amount),
              date: new Date() 
            });
            refresh();
            onClose();
        } catch(err) {
            console.error("Failed", err);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
                <div className="bg-rose-600 px-6 py-4 flex justify-between items-center text-white">
                    <div>
                        <h2 className="text-lg font-bold">Add New Expense</h2>
                        <p className="text-rose-100 text-xs">Record a bill or payment</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-rose-700 rounded-lg transition"><XCircle size={24}/></button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Title</label>
                        <input {...register("title", { required: true })} placeholder="e.g. Electric Bill" className="w-full border border-slate-200 p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm font-medium" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Amount</label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-3 text-slate-400" size={16}/>
                                <input {...register("amount", { required: true })} type="number" placeholder="0" className="w-full border border-slate-200 pl-9 pr-3 py-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm font-medium" />
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Category</label>
                            <div className="relative">
                                <select {...register("category", { required: true })} className="w-full border border-slate-200 pl-3 pr-8 py-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm font-medium appearance-none">
                                    <option value="">Select...</option>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" size={16}/>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Description (Optional)</label>
                        <textarea {...register("description")} rows="3" className="w-full border border-slate-200 p-3 rounded-xl bg-white outline-none focus:ring-2 focus:ring-rose-500 transition-all text-sm" placeholder="Add details..."></textarea>
                    </div>

                    <div className="pt-2">
                        <Button 
                            type="submit" 
                            className="w-full bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-200"
                            isLoading={submitting}
                        >
                            Submit Bill
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function LoadingState() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center text-rose-600">
            <Loader2 className="animate-spin w-10 h-10"/>
        </div>
    );
}

function NoCycleState({ isAdmin }) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
            <div className="bg-slate-100 p-6 rounded-3xl mb-6 shadow-inner">
                {isAdmin ? <AlertCircle className="w-12 h-12 text-slate-400" /> : <Lock className="w-12 h-12 text-slate-400" />}
            </div>
            <h2 className="text-2xl font-bold text-slate-800">No Active Budget</h2>
            <p className="text-slate-500 max-w-md mt-2 leading-relaxed">
                {isAdmin 
                    ? "You haven't started a new financial cycle yet." 
                    : "Expenses are locked until the new year begins."}
            </p>
        </div>
    );
}