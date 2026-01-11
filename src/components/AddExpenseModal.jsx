import { useState } from "react";
import { useForm } from "react-hook-form";
import { createExpense } from "../api/expenses";
import { useToast } from "../context/ToastContext";
import { Loader2, X, FileText, IndianRupee, AlignLeft, ListFilter, ChevronDown } from "lucide-react";

export default function AddExpenseModal({ categories, onClose, refresh }) {
  const { register, handleSubmit } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const toast = useToast();

  const CATS = categories || [
      "Pandal", "Idol", "Light & Sound", "Food/Bhog", "Priest/Puja", "Transport", "Miscellaneous",
  ];

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await createExpense({ ...data, amount: Number(data.amount), date: new Date() });
      toast.success("Expense added successfully");
      refresh();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add expense");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-all duration-200 ${isClosing ? "animate-fade-out" : "animate-fade-in"}`}
    >
      <div
        /* FIX: Removed 'border-transparent'. Added 'border-0' for light mode and 'dark:border' for dark mode. */
        className={`bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 border-0 dark:border dark:border-slate-800 ${isClosing ? "animate-zoom-out-95" : "animate-zoom-in-95"}`}
      >
        {/* HEADER */}
        <div className="bg-indigo-600 dark:bg-indigo-700 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h2 className="text-lg font-bold">Add New Expense</h2>
            <p className="text-indigo-100 text-xs">Record a bill or payment</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-indigo-700 dark:hover:bg-indigo-600 rounded-lg transition-colors text-indigo-100 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
              <FileText size={14} /> Title
            </label>
            <input
              {...register("title", { required: true })}
              placeholder="e.g. Decorator Payment"
              className="w-full border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-800 dark:text-slate-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-5">
            {/* Amount */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                <IndianRupee size={14} /> Amount
              </label>
              <input
                {...register("amount", { required: true })}
                type="number"
                placeholder="0"
                className="w-full border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-800 dark:text-slate-100"
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
                <ListFilter size={14} /> Category
              </label>
              <div className="relative">
                <select
                  {...register("category", { required: true })}
                  className="w-full border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-800 dark:text-slate-100 appearance-none cursor-pointer"
                >
                  <option value="">Select...</option>
                  {CATS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <ChevronDown size={14} />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
              <AlignLeft size={14} /> Description
            </label>
            <textarea
              {...register("description")}
              rows="3"
              placeholder="Add any additional details (optional)..."
              className="w-full border border-slate-200 dark:border-slate-700 px-4 py-3 rounded-xl bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-medium text-slate-800 dark:text-slate-100 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3.5 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 bg-indigo-600 dark:bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 dark:hover:bg-indigo-500 shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-70"
            >
              {submitting ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                "Submit Bill"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}