import { useState, useEffect } from "react";
import { fetchExpenses } from "../api/expenses";
import { X, Calendar, User, FileText, Loader2 } from "lucide-react";
import Modal from "./ui/Modal"; // Assuming you have a base Modal or using standard fixed div

export default function CategoryBreakdownModal({ category, onClose }) {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Fetch only expenses for this specific category
        const res = await fetchExpenses({ category });
        setExpenses(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (category) loadData();
  }, [category]);

  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
              {category} <span className="text-slate-400 font-normal text-sm">Expenses</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Total Spent: <span className="font-mono font-bold text-indigo-600">₹{totalSpent.toLocaleString()}</span>
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
             <div className="h-40 flex items-center justify-center text-indigo-500">
               <Loader2 className="animate-spin w-8 h-8" />
             </div>
          ) : expenses.length === 0 ? (
             <div className="h-40 flex flex-col items-center justify-center text-slate-400">
               <FileText size={32} className="mb-2 opacity-50"/>
               <p>No expenses recorded yet.</p>
             </div>
          ) : (
            <div className="space-y-2 p-2">
              {expenses.map((expense) => (
                <div key={expense._id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center group hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-700 dark:text-slate-200">{expense.title}</h4>
                    <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} /> {new Date(expense.date).toLocaleDateString()}
                      </span>
                      {expense.recordedBy && (
                        <span className="flex items-center gap-1">
                          <User size={12} /> {expense.recordedBy.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-slate-700 dark:text-slate-300">
                      ₹{expense.amount.toLocaleString()}
                    </p>
                    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        expense.status === 'approved' ? 'bg-emerald-100 text-emerald-600' :
                        expense.status === 'rejected' ? 'bg-red-100 text-red-600' :
                        'bg-amber-100 text-amber-600'
                    }`}>
                      {expense.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
