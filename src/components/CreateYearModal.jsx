import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { useToast } from "../context/ToastContext";
import { Loader2, Calendar, Coins, Settings, X } from "lucide-react";

export default function CreateYearModal({ onSuccess, onClose }) {
  const { register, handleSubmit, watch, setValue } = useForm({
    defaultValues: {
      frequency: "weekly",
      totalInstallments: 52,
      amountPerInstallment: 0,
      openingBalance: "" 
    }
  });
  
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const frequency = watch("frequency");

  useEffect(() => {
    if (frequency === "monthly") {
      setValue("totalInstallments", 12);
    } else if (frequency === "weekly") {
      setValue("totalInstallments", 52);
    } else {
      setValue("totalInstallments", 0);
    }
  }, [frequency, setValue]);

const onSubmit = async (data) => {
  setLoading(true);
  try {
    const balanceToSend = data.openingBalance === "" ? undefined : Number(data.openingBalance);

    let installmentsToSend;
    if (data.frequency === 'none') {
        installmentsToSend = undefined;
    } else if (data.frequency === 'monthly') {
        installmentsToSend = 12;
    } else {
        installmentsToSend = Number(data.totalInstallments);
    }

    await api.post("/years", {
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      openingBalance: balanceToSend,
      subscriptionFrequency: data.frequency,
      totalInstallments: installmentsToSend,
      amountPerInstallment: Number(data.amountPerInstallment)
    });
    
    if (onSuccess) onSuccess();
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Failed to create year");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
      
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden relative flex flex-col max-h-[90vh] animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 border border-transparent dark:border-slate-800">
        
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all z-10"
        >
          <X size={20} />
        </button>

        <div className="bg-indigo-600 dark:bg-indigo-700 p-6 text-white text-center shrink-0">
          <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-inner">
             <Calendar className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-bold">Start New Cycle</h2>
          <p className="text-indigo-100 text-sm">Set up rules for the upcoming festival.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
          
          {/* Basic Details */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Event Name</label>
            <input
              {...register("name", { required: true })}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 mt-1 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-medium transition-all"
              placeholder="e.g. Durga Puja 2026"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">Start Date</label>
              <input type="date" {...register("startDate", { required: true })} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 mt-1 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase ml-1">End Date</label>
              <input type="date" {...register("endDate", { required: true })} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 mt-1 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500" />
            </div>
          </div>

          {/* RULES SECTION */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
             <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
               <Settings size={16} className="text-indigo-500"/> Collection Rules
             </h3>
             
             <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Frequency</label>
                  <select {...register("frequency")} className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 outline-none focus:border-indigo-500">
                    <option value="weekly">Weekly Collection</option>
                    <option value="monthly">Monthly Collection</option>
                    <option value="none">No Recurring (Donations Only)</option>
                  </select>
               </div>
               
               {frequency !== "none" && (
                 <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 fade-in">
                    {frequency === "weekly" ? (
                      <div>
                         <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Total Weeks</label>
                         <input 
                            type="number" 
                            {...register("totalInstallments")} 
                            className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-indigo-500 outline-none"
                            placeholder="52"
                         />
                      </div>
                    ) : (
                      <div className="flex flex-col justify-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl px-3">
                         <span className="text-[10px] text-slate-400 uppercase font-bold">Duration</span>
                         <span className="text-sm font-bold text-slate-700 dark:text-slate-200">12 Months (Fixed)</span>
                      </div>
                    )}

                    <div>
                       <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">
                         Amount / {frequency === "weekly" ? "Week" : "Month"}
                       </label>
                       <div className="relative">
                          <span className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500 font-bold">₹</span>
                          <input 
                              type="number" 
                              {...register("amountPerInstallment")} 
                              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl pl-7 pr-3 py-2.5 text-sm bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-100 focus:border-indigo-500 outline-none font-bold" 
                              placeholder="e.g. 50"
                          />
                       </div>
                    </div>
                 </div>
               )}
             </div>
          </div>

          {/* Opening Balance */}
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2 ml-1">
              <Coins size={14}/> Opening Balance
            </label>
            <input
              type="number"
              {...register("openingBalance")}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 mt-1 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:border-emerald-500 outline-none placeholder-slate-300 dark:placeholder-slate-600 transition-colors"
              placeholder="Leave empty to auto-transfer balance"
            />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 ml-1 leading-tight">
              If empty, we will calculate and transfer the remaining balance from the last closed year.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 dark:bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 dark:hover:bg-indigo-500 transition flex justify-center items-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Start Year"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}