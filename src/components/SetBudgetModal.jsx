import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { setBudget } from "../api/budget";
import { getExpenseCategories } from "../api/expenses"; // 👈 Fetch used categories
import { useToast } from "../context/ToastContext";
import { Loader2, X, IndianRupee, Tag, AlertTriangle, ChevronDown } from "lucide-react";

export default function SetBudgetModal({ onClose, refresh, existingCategory, prefillAmount}) {
  const { register, handleSubmit, setValue } = useForm({
    defaultValues: {
        category: existingCategory || "",
        amount: prefillAmount || ""
    }   
  });
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const toast = useToast();

  // Standard Defaults (in case no expenses exist yet)
  const DEFAULT_CATEGORIES = [
    "Pandal", "Idol", "Light & Sound", "Food/Bhog", "Priest/Puja", "Transport", "Miscellaneous"
  ];

  // 1. Fetch Categories on Mount
  useEffect(() => {
    const loadCategories = async () => {
        try {
            const res = await getExpenseCategories();
            // If backend has data, use it. Otherwise fall back to defaults.
            if (res.data && res.data.length > 0) {
                setCategories(res.data);
            } else {
                setCategories(DEFAULT_CATEGORIES);
            }
        } catch (err) {
            console.error("Failed to load categories", err);
            setCategories(DEFAULT_CATEGORIES);
        }
    };
    
    // Only fetch if we are NOT editing an existing category
    if (!existingCategory) {
        loadCategories();
    }
  }, [existingCategory]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await setBudget({
        category: data.category,
        amount: Number(data.amount)
      });
      toast.success(`Budget set for ${data.category}`);
      if (refresh) refresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to set budget");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="p-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Set Budget Limit</h2>
                    <p className="text-sm text-slate-500">Plan expenses for a specific category.</p>
                </div>
                <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600" /></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                {/* CATEGORY SELECTION */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Category</label>
                    <div className="relative">
                        <Tag className="absolute left-3 top-3 text-slate-400" size={16} />
                        
                        {/* If Editing: Show Read-only Input */}
                        {existingCategory ? (
                             <input
                                {...register("category")}
                                className="w-full pl-9 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-slate-500 cursor-not-allowed outline-none"
                                readOnly
                             />
                        ) : (
                            /* If New: Show Strict Dropdown */
                            <>
                                <select
                                    {...register("category", { required: true })}
                                    className="w-full pl-9 pr-10 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 font-bold outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none cursor-pointer text-slate-800 dark:text-slate-100"
                                >
                                    <option value="">Select Category...</option>
                                    {categories.map((cat, idx) => (
                                        <option key={idx} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <ChevronDown size={16} />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* AMOUNT INPUT */}
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Max Budget (₹)</label>
                    <div className="relative">
                        <IndianRupee className="absolute left-3 top-3 text-slate-400" size={16} />
                        <input
                            type="number"
                            {...register("amount", { required: true, min: 1 })}
                            className="w-full pl-9 pr-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-xl font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            placeholder="50000"
                            autoFocus
                        />
                    </div>
                </div>

                <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-700 dark:text-amber-400 text-xs">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <p>Alerts will be triggered if expenses exceed 90% of this amount.</p>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none flex justify-center items-center gap-2 transition-transform active:scale-95"
                >
                    {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Budget Plan"}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}