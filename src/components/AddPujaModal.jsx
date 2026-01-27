import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { addFestivalFee } from "../api/festival";
import { useToast } from "../context/ToastContext";
import { X, IndianRupee, User, FileText, Loader2, ChevronDown, Gift, Banknote } from "lucide-react";

// Design System
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

export default function AddPujaModal({ onClose, refresh, preSelectedMemberId }) {
  const { register, handleSubmit, setValue, watch, unregister } = useForm({
      defaultValues: { type: 'cash' }
  });
  
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState([]);
  const toast = useToast();

  // Watch the type to conditionally render fields
  const type = watch("type");

  useEffect(() => {
    if (!preSelectedMemberId) {
        const loadMembers = async () => {
            try {
                const res = await api.get("/members");
                setMembers(res.data.data);
            } catch(err) { console.error(err); }
        }
        loadMembers();
    } else {
        setValue("userId", preSelectedMemberId);
    }
  }, [preSelectedMemberId, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const finalUserId = preSelectedMemberId || data.userId;
      if (!finalUserId) {
          toast.error("Please select a member");
          setLoading(false); return;
      }

      // Prepare Payload
      const payload = {
          userId: finalUserId,
          type: data.type,
          notes: data.notes
      };

      if (data.type === 'item') {
          payload.itemDetails = {
              itemName: data.itemName,
              quantity: data.quantity
          };
      } else {
          payload.amount = Number(data.amount);
      }

      await addFestivalFee(payload);
      toast.success("Contribution recorded successfully");
      if(refresh) try { await refresh(); } catch(e) {}
      onClose();

    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add contribution");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border-0 dark:border dark:border-slate-800">
        
        {/* HEADER */}
        <div className="bg-rose-600 dark:bg-rose-700 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
               <Gift size={20} className="opacity-80"/> Add Contribution
            </h2>
            <p className="text-rose-100 text-xs">Record Money or Items</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-rose-700 dark:hover:bg-rose-600 rounded-lg transition-colors text-white/80 hover:text-white">
             <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
           
           {!preSelectedMemberId && (
               <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">Member</label>
                  <div className="relative">
                     <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={18} />
                     <select 
                         {...register("userId", { required: true })}
                         className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl pl-10 pr-10 py-3 appearance-none outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10"
                     >
                         <option value="">Select Member...</option>
                         {members.map(m => (
                             <option key={m.userId} value={m.userId}>{m.name}</option>
                         ))}
                     </select>
                     <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                  </div>
               </div>
           )}

           {/* TYPE TOGGLE */}
           <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
               <button
                  type="button"
                  onClick={() => setValue("type", "cash")}
                  className={`py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${type === 'cash' ? 'bg-white dark:bg-slate-700 shadow text-rose-600 dark:text-rose-400' : 'text-slate-500 hover:text-slate-700'}`}
               >
                   <Banknote size={16}/> Money
               </button>
               <button
                  type="button"
                  onClick={() => setValue("type", "item")}
                  className={`py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${type === 'item' ? 'bg-white dark:bg-slate-700 shadow text-rose-600 dark:text-rose-400' : 'text-slate-500 hover:text-slate-700'}`}
               >
                   <Gift size={16}/> Item
               </button>
           </div>
           
           {/* CONDITIONAL FIELDS */}
           {type === 'cash' ? (
                <Input 
                    label="Amount (₹)"
                    type="number"
                    icon={IndianRupee}
                    placeholder="e.g. 501"
                    {...register("amount", { required: type === 'cash' })}
                />
           ) : (
                <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <Input 
                            label="Item Name"
                            icon={Gift}
                            placeholder="e.g. Rice, Sari"
                            {...register("itemName", { required: type === 'item' })}
                        />
                    </div>
                    <div className="col-span-1">
                        <Input 
                            label="Qty"
                            placeholder="e.g. 5kg"
                            {...register("quantity", { required: type === 'item' })}
                        />
                    </div>
                </div>
           )}

           <Input 
              label="Notes (Optional)"
              icon={FileText}
              placeholder={type === 'cash' ? "e.g. Payment via UPI" : "e.g. For Bhog preparation"}
              {...register("notes")}
           />

           <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full bg-rose-600 dark:bg-rose-600 hover:bg-rose-700 dark:hover:bg-rose-500 shadow-lg shadow-rose-200 dark:shadow-none border-none"
                isLoading={loading}
              >
                 Record {type === 'cash' ? 'Fee' : 'Item'}
              </Button>
           </div>

        </form>
      </div>
    </div>
  );
}