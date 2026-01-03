import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { Loader2, Calendar, Coins, Settings } from "lucide-react";

export default function CreateYearModal({ onSuccess }) {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      frequency: "weekly",
      totalInstallments: 52,
      amountPerInstallment: 0,
      openingBalance: 0
    }
  });
  
  const [loading, setLoading] = useState(false);
  const frequency = watch("frequency");

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // 🚀 Create the Year with Rules
      await api.post("/years", {
        name: data.name,
        startDate: data.startDate,
        endDate: data.endDate,
        openingBalance: Number(data.openingBalance),
        // The Rules:
        subscriptionFrequency: data.frequency,
        totalInstallments: Number(data.totalInstallments),
        amountPerInstallment: Number(data.amountPerInstallment)
      });
      
      alert("Festival Year Started Successfully!");
      onSuccess(); // Refresh the dashboard
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create year");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white text-center">
          <Calendar className="w-10 h-10 mx-auto mb-2 opacity-90" />
          <h2 className="text-2xl font-bold">Start New Festival Year</h2>
          <p className="text-indigo-100 text-sm">Define your collection rules for this year</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          
          {/* 1. Name & Dates */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
              Event Name
            </label>
            <input
              {...register("name", { required: true })}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-indigo-500 outline-none font-medium"
              placeholder="e.g. Durga Puja 2025"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
              <input type="date" {...register("startDate", { required: true })} className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
              <input type="date" {...register("endDate", { required: true })} className="w-full border rounded-lg px-3 py-2" />
            </div>
          </div>

          {/* 2. Financial Rules (Moved from Register) */}
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
             <h3 className="text-sm font-bold text-indigo-700 mb-3 flex items-center gap-2">
               <Settings size={16}/> Collection Rules
             </h3>
             
             <div className="grid grid-cols-2 gap-3 mb-3">
               <div>
                  <label className="block text-xs text-gray-600 mb-1">Type</label>
                  <select {...register("frequency")} className="w-full border rounded-lg px-2 py-2 text-sm">
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="none">Donations Only</option>
                  </select>
               </div>
               
               {frequency !== "none" && (
                 <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Total {frequency === "weekly" ? "Weeks" : "Months"}
                    </label>
                    <input 
                      type="number" 
                      {...register("totalInstallments")} 
                      className="w-full border rounded-lg px-2 py-2 text-sm"
                      placeholder="52"
                    />
                 </div>
               )}
             </div>

             {frequency !== "none" && (
                <div>
                   <label className="block text-xs text-gray-600 mb-1">Amount per {frequency === "weekly" ? "Week" : "Month"}</label>
                   <input 
                      type="number" 
                      {...register("amountPerInstallment")} 
                      className="w-full border rounded-lg px-2 py-2 text-sm" 
                      placeholder="e.g. 20"
                   />
                </div>
             )}
          </div>

          {/* 3. Opening Balance */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1 flex items-center gap-2">
              <Coins size={14}/> Opening Balance
            </label>
            <input
              type="number"
              {...register("openingBalance")}
              className="w-full border-2 border-gray-100 rounded-xl px-4 py-2 focus:border-green-500 outline-none"
              placeholder="0"
            />
            <p className="text-xs text-gray-400 mt-1">Cash in hand from previous years.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Start Festival Year"}
          </button>

        </form>
      </div>
    </div>
  );
}