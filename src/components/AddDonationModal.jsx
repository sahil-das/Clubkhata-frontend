import { useState } from "react";
import { useForm } from "react-hook-form";
import { createDonation } from "../api/donations";
import { useToast } from "../context/ToastContext";
import { 
  Loader2, IndianRupee, User, Phone, MapPin, X, 
  Package, Coins, Banknote, CreditCard 
} from "lucide-react";

export default function AddDonationModal({ onClose, refresh }) {
  const { register, handleSubmit, watch, setValue, resetField } = useForm({
    defaultValues: { 
        category: "money", // UI State: 'money' or 'item'
        paymentMode: "cash" // Sub-state for money
    }
  });
  const [loading, setLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const toast = useToast();

  const category = watch("category");
  const paymentMode = watch("paymentMode");

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const payload = { 
        donorName: data.donorName,
        address: data.address,
        phone: data.phone,
        receiptNo: data.receiptNo,
        // Map UI category to Backend Type
        type: data.category === "money" ? data.paymentMode : "item"
      };

      if (data.category === "item") {
        payload.itemDetails = {
            itemName: data.itemName,
            quantity: data.quantity,
            estimatedValue: Number(data.estimatedValue || 0)
        };
      } else {
        payload.amount = Number(data.amount);
      }

      await createDonation(payload);
      toast.success("Donation recorded successfully!");
      if (refresh) refresh();
      handleClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add donation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm transition-all duration-200 ${isClosing ? "animate-fade-out" : "animate-fade-in"}`}>
      <div className={`bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transition-all duration-200 border-0 dark:border dark:border-slate-800 ${isClosing ? "animate-zoom-out-95" : "animate-zoom-in-95"}`}>
        
        {/* HEADER */}
        <div className="bg-amber-500 dark:bg-amber-600 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h2 className="text-lg font-bold">Record Donation</h2>
            <p className="text-amber-100 text-xs">Add contribution to festival fund</p>
          </div>
          <button onClick={handleClose} className="p-1 hover:bg-amber-600 dark:hover:bg-amber-700 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          
          {/* 1. MAIN TOGGLE (Only 2 Options) */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
             <button
               type="button"
               onClick={() => {
                   setValue("category", "money");
                   resetField("itemName"); 
                   resetField("quantity");
               }}
               className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                 category === "money" 
                   ? "bg-white dark:bg-slate-700 text-amber-600 shadow-sm" 
                   : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
               }`}
             >
               <Coins size={16}/> Money
             </button>
             <button
               type="button"
               onClick={() => {
                   setValue("category", "item");
                   resetField("amount");
               }}
               className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${
                 category === "item" 
                   ? "bg-white dark:bg-slate-700 text-amber-600 shadow-sm" 
                   : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
               }`}
             >
               <Package size={16}/> Item
             </button>
          </div>

          {/* 2. DYNAMIC FIELDS */}
          <div className="space-y-4">
            {/* DONOR NAME (Always Visible) */}
            <div>
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Donor Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-400" size={16} />
                <input
                  {...register("donorName", { required: true })}
                  className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                  placeholder="e.g. Amit Store"
                />
              </div>
            </div>

            {category === "money" ? (
                // === MONEY VIEW ===
                <div className="space-y-4 animate-fade-in">
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">
                            Amount (₹)
                        </label>
                        <div className="relative">
                            <IndianRupee className="absolute left-3 top-3 text-slate-400" size={16} />
                            <input
                            type="number"
                            {...register("amount", { required: true })}
                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-bold text-lg"
                            placeholder="500"
                            />
                        </div>
                    </div>

                    {/* Small Sub-selector for Mode (Optional but good for records) */}
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="radio" 
                                value="cash" 
                                {...register("paymentMode")} 
                                className="accent-amber-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-amber-600 transition flex items-center gap-1">
                                <Banknote size={14}/> Cash
                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer group">
                            <input 
                                type="radio" 
                                value="online" 
                                {...register("paymentMode")} 
                                className="accent-amber-500 w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-amber-600 transition flex items-center gap-1">
                                <CreditCard size={14}/> Online
                            </span>
                        </label>
                    </div>
                </div>
            ) : (
                // === ITEM VIEW ===
                <div className="grid grid-cols-2 gap-4 animate-fade-in">
                   <div className="col-span-2">
                     <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Item Name</label>
                     <input
                        {...register("itemName", { required: true })}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        placeholder="e.g. 50kg Rice"
                     />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Quantity</label>
                     <input
                        {...register("quantity", { required: true })}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        placeholder="e.g. 2 Bags"
                     />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Est. Value (₹)</label>
                     <input
                        type="number"
                        {...register("estimatedValue")}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                        placeholder="Optional"
                     />
                   </div>
                </div>
            )}

            {/* OPTIONAL DETAILS - Grouped at bottom */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Optional Details</label>
              <div className="grid grid-cols-2 gap-3">
                 <input
                    {...register("receiptNo")}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                    placeholder="Receipt No (Optional)"
                 />
                 <div className="relative">
                    <Phone className="absolute left-3 top-3 text-slate-400" size={14} />
                    <input
                        {...register("phone")}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                        placeholder="Phone (Optional)"
                    />
                 </div>
                 <div className="col-span-2 relative">
                    <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                        {...register("address")}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
                        placeholder="Address (Optional)"
                    />
                 </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-amber-500 dark:bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-600 dark:hover:bg-amber-500 shadow-lg shadow-amber-200 dark:shadow-none transition-all flex justify-center items-center gap-2 text-sm"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Save Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}