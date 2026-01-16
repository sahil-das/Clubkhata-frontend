import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { updateAsset, deleteAsset } from "../api/assets"; // 👈 Added deleteAsset
import { useToast } from "../context/ToastContext";
import { Loader2, Save, X, MapPin, Trash2 } from "lucide-react"; // 👈 Added Trash2
import ConfirmModal from "../components/ui/ConfirmModal"; 

export default function EditAssetModal({ asset, onClose, refresh }) {
  const { register, handleSubmit, reset } = useForm();
  const toast = useToast();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (asset) {
      reset({
        name: asset.name,
        quantity: asset.quantity,
        location: asset.location,
        estimatedValue: asset.estimatedValue
      });
    }
  }, [asset, reset]);

  const onSubmit = async (data) => {
    try {
      await updateAsset(asset._id, {
        name: data.name,
        quantity: Number(data.quantity),
        estimatedValue: Number(data.estimatedValue),
        location: data.location 
      });
      toast.success("Asset details updated");
      refresh();
      onClose();
    } catch (err) {
      toast.error("Failed to update asset");
    }
  };

  const handleDelete = async () => {
    setIsConfirmModalOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteAsset(asset._id);
      toast.success("Asset removed");
      refresh();
      onClose();
    } catch (err) {
      toast.error("Failed to delete asset");
    }
    setIsConfirmModalOpen(false);
  };

  const cancelDelete = () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800">
        
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h2 className="font-bold text-slate-800 dark:text-white">Edit Asset</h2>
            <button onClick={onClose}><X className="text-slate-400 hover:text-slate-600"/></button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* ... Inputs for Name, Location, etc. (Keep existing inputs) ... */}
            
            {/* NAME */}
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-1">Item Name</label>
                <input {...register("name", { required: true })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 font-bold outline-none focus:border-blue-500" />
            </div>

            {/* LOCATION */}
            <div>
                <label className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-1 flex items-center gap-1"><MapPin size={12}/> Update Location</label>
                <input type="text" {...register("location", { required: true })} className="w-full px-4 py-2 border border-blue-200 dark:border-blue-900 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 font-bold outline-none focus:border-blue-500" />
            </div>

            {/* QTY & VALUE */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1">Quantity</label>
                    <input type="number" {...register("quantity", { required: true })} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 outline-none focus:border-blue-500" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1">Value (₹)</label>
                    <input type="number" {...register("estimatedValue")} className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 outline-none focus:border-blue-500" />
                </div>
            </div>

            <button type="submit" className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex justify-center items-center gap-2 mt-2">
                <Save size={18} /> Save Changes
            </button>

            {/* ✅ NEW: Delete Button */}
            <button 
                type="button" 
                onClick={handleDelete}
                className="w-full py-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium text-sm flex justify-center items-center gap-2 mt-2"
            >
                <Trash2 size={16} /> Delete Asset
            </button>
        </form>

        <ConfirmModal
          isOpen={isConfirmModalOpen}
          title="Confirm Deletion"
          message="Are you sure you want to remove this item? This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />

      </div>
    </div>
  );
}