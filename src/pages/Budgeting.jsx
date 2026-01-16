import { useState, useEffect } from "react";
import { getBudgetAnalysis, deleteBudget } from "../api/budget"; 
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { 
  PieChart, Plus, AlertTriangle, CheckCircle, Download, Edit2, Trash2, TrendingUp, AlertCircle, ArrowRight
} from "lucide-react";
import { exportBudgetPDF } from "../utils/pdfExport";
import SetBudgetModal from "../components/SetBudgetModal";
import ConfirmModal from "../components/ui/ConfirmModal"; 

export default function Budgeting() {
  const { activeClub } = useAuth();
  const toast = useToast();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null); 
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null }); 

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getBudgetAnalysis();
      setData(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeClub) fetchData();
  }, [activeClub]);

  const handleEdit = (item) => {
    setEditingItem({ category: item.category, amount: item.allocated || "" });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteBudget(confirmDelete.id);
      fetchData(); 
      toast.success("Budget removed");
    } catch (err) {
      toast.error("Failed to delete budget");
    } finally {
      setConfirmDelete({ isOpen: false, id: null });
    }
  };

  const totalAllocated = data.reduce((sum, item) => sum + item.allocated, 0);
  const totalSpent = data.reduce((sum, item) => sum + item.spent, 0);
  const percentage = totalAllocated > 0 ? Math.round((totalSpent / totalAllocated) * 100) : 0;

  // 🔹 SEPARATE LISTS
  const plannedBudgets = data.filter(item => !item.isUnplanned);
  const unplannedExpenses = data.filter(item => item.isUnplanned);

  return (
    <div className="space-y-8 pb-20 animate-in fade-in">
        
        {/* HEADER */}
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <PieChart className="text-indigo-600" /> Budget Planner
                </h1>
                <p className="text-slate-500 text-sm">Financial goals vs Reality</p>
            </div>
            <div className="flex gap-2">
                 <button 
                    onClick={() => exportBudgetPDF({ 
                        clubName: activeClub?.clubName, 
                        budgetData: data 
                    })}
                    className="p-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                 >
                    <Download size={20} />
                 </button>
                 {activeClub?.role === 'admin' && (
                    <button 
                        onClick={() => { setEditingItem(null); setShowModal(true); }}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
                    >
                        <Plus size={18} /> Set Budget
                    </button>
                 )}
            </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Allocated</p>
                <p className="text-2xl font-mono font-bold text-indigo-600 mt-1">₹{totalAllocated.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Spent</p>
                <p className="text-2xl font-mono font-bold text-slate-700 dark:text-slate-200 mt-1">₹{totalSpent.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Utilization</p>
                <div className="flex items-center gap-3 mt-1">
                    <p className={`text-2xl font-mono font-bold ${percentage > 100 ? "text-red-500" : "text-emerald-500"}`}>
                        {percentage}%
                    </p>
                    <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-1000 ${percentage > 100 ? "bg-red-500" : "bg-emerald-500"}`} 
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* 1. PLANNED BUDGETS GRID */}
        <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Active Budgets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {plannedBudgets.map((item, idx) => (
                    <BudgetCard 
                        key={idx} 
                        item={item} 
                        isAdmin={activeClub?.role === 'admin'} 
                        onEdit={handleEdit} 
                        onDelete={setConfirmDelete} 
                    />
                ))}
                
                {plannedBudgets.length === 0 && !loading && (
                    <div className="col-span-2 py-10 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        <p>No active budgets. Start planning!</p>
                    </div>
                )}
            </div>
        </div>

        {/* 2. UNPLANNED EXPENSES SECTION (Only shows if exists) */}
        {unplannedExpenses.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-4 text-amber-600 dark:text-amber-500">
                    <AlertTriangle size={20} />
                    <h3 className="text-lg font-bold">Unplanned Spending</h3>
                </div>
                
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl overflow-hidden">
                    <div className="divide-y divide-amber-100 dark:divide-amber-900/30">
                        {unplannedExpenses.map((item, idx) => (
                            <div key={idx} className="p-4 flex items-center justify-between group hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-amber-600 dark:text-amber-500 shadow-sm">
                                        <AlertCircle size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 dark:text-slate-100">{item.category}</h4>
                                        <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                                            Spent: ₹{item.spent.toLocaleString()} (No Budget Set)
                                        </p>
                                    </div>
                                </div>

                                {activeClub?.role === 'admin' && (
                                    <button 
                                        onClick={() => handleEdit(item)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 rounded-lg text-xs font-bold text-amber-700 dark:text-amber-400 hover:bg-amber-600 hover:text-white dark:hover:bg-amber-600 dark:hover:text-white transition-all shadow-sm"
                                    >
                                        Set Limit <ArrowRight size={12} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )}

        {/* MODALS */}
        {showModal && (
            <SetBudgetModal 
                existingCategory={editingItem?.category} 
                prefillAmount={editingItem?.amount}     
                onClose={() => { setShowModal(false); setEditingItem(null); }} 
                refresh={fetchData} 
            />
        )}

        <ConfirmModal 
            isOpen={confirmDelete.isOpen}
            onClose={() => setConfirmDelete({ isOpen: false, id: null })}
            onConfirm={handleDelete}
            title="Delete Budget Plan?"
            message="This will remove the limit for this category. Past expenses will remain."
            isDangerous={true}
        />
    </div>
  );
}

// 🔹 SUB-COMPONENT: Standard Budget Card
function BudgetCard({ item, isAdmin, onEdit, onDelete }) {
    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm group relative hover:shadow-md transition-all">
            
            {/* ACTIONS */}
            {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                        onClick={() => onEdit(item)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button 
                        onClick={() => onDelete({ isOpen: true, id: item._id })}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )}

            <div className="flex justify-between items-start mb-3 pr-16">
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200">{item.category}</h3>
                    <p className="text-xs text-slate-400">Allocated: ₹{item.allocated.toLocaleString()}</p>
                </div>
                <StatusBadge status={item.status} />
            </div>

            <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800">
                        Spent: ₹{item.spent.toLocaleString()}
                    </span>
                    <span className="text-xs font-semibold inline-block text-slate-500">
                        {item.percentageUsed}%
                    </span>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-slate-100 dark:bg-slate-800">
                    <div 
                        style={{ width: `${Math.min(item.percentageUsed, 100)}%` }} 
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${
                            item.status === 'overbudget' ? 'bg-red-500' : 
                            item.status === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                    ></div>
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    if (status === 'overbudget') return <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold uppercase rounded flex items-center gap-1"><AlertTriangle size={12}/> Over</span>;
    if (status === 'warning') return <span className="px-2 py-1 bg-amber-100 text-amber-600 text-[10px] font-bold uppercase rounded flex items-center gap-1"><TrendingUp size={12}/> Warning</span>;
    return <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-[10px] font-bold uppercase rounded flex items-center gap-1"><CheckCircle size={12}/> Good</span>;
}