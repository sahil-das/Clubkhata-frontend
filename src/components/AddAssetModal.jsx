import { useState } from "react";
import { useForm } from "react-hook-form";
import { addAsset } from "../api/assets";
import { useToast } from "../context/ToastContext";
import { Loader2, Package, MapPin, X } from "lucide-react";

export default function AddAssetModal({ onClose, refresh }) {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await addAsset({
        name: data.name,
        quantity: Number(data.quantity),
        location: data.location, // 👈 Sends text string now
        estimatedValue: Number(data.estimatedValue || 0)
      });
      toast.success("Asset added to registry");
      if (refresh) refresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add asset");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-blue-600 p-4 rounded-t-2xl flex justify-between items-center text-white">
            <h2 className="font-bold flex items-center gap-2"><Package size={20}/> New Asset</h2>
            <button onClick={onClose}><X size={20}/></button>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            
            {/* Item Name */}
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Item Name</label>
                <input
                    {...register("name", { required: true })}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 font-medium outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="e.g. Sound Box (JBL)"
                    autoFocus
                />
            </div>

            {/* Qty & Value */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Quantity</label>
                    <input
                        type="number"
                        {...register("quantity", { required: true, min: 1 })}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="1"
                    />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Total Value (₹)</label>
                    <input
                        type="number"
                        {...register("estimatedValue")}
                        className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        placeholder="Optional"
                    />
                </div>
            </div>

            {/* Location Input (CHANGED TO TEXT) */}
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">Current Location</label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
                    <input
                        type="text"
                        {...register("location", { required: true })}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-slate-400"
                        placeholder="e.g. Storage Room, Rahul's House..."
                    />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 ml-1">Where is this item currently kept?</p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none flex justify-center items-center gap-2 mt-4"
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Save to Registry"}
            </button>
        </form>
      </div>
    </div>
  );
}