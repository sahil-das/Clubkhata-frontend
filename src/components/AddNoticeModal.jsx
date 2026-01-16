import { useState } from "react";
import { useForm } from "react-hook-form";
import { createNotice } from "../api/notices"; // ✅ Correct named import
import { useToast } from "../context/ToastContext";
import { X, BellRing, Loader2 } from "lucide-react";

export default function AddNoticeModal({ onClose, refresh }) {
    const { register, handleSubmit, watch, formState: { errors } } = useForm({
        defaultValues: {
            title: "",
            message: "",
            type: "info"
        }
    });

    // ✅ STATE DECLARATION (Must be here)
    const [submitting, setSubmitting] = useState(false);
    
    const toast = useToast();
    
    // Watch type to change UI color dynamically
    const selectedType = watch("type");

    const onSubmit = async (data) => {
        setSubmitting(true); // ✅ Used here
        try {
            await createNotice({ 
                title: data.title, 
                message: data.message, 
                type: data.type 
            });
            toast.success("Notice posted successfully");
            refresh();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to post notice");
        } finally {
            setSubmitting(false); // ✅ Used here
        }
    };

    const getTypeColor = (type) => {
        switch(type) {
            case 'urgent': return 'bg-rose-500';
            case 'warning': return 'bg-amber-500';
            case 'success': return 'bg-emerald-500';
            default: return 'bg-indigo-500';
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
             <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-transparent dark:border-slate-800">
                 
                 {/* Dynamic Header Color */}
                 <div className={`${getTypeColor(selectedType)} px-6 py-4 flex justify-between items-center text-white transition-colors duration-300`}>
                    <div>
                        <h2 className="text-lg font-bold flex items-center gap-2">
                           <BellRing size={20} /> New Notice
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
                        <X size={20} />
                    </button>
                 </div>
                 
                 <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
                     
                     {/* Title Input */}
                     <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Title</label>
                        <input 
                            {...register("title", { required: "Title is required" })} 
                            placeholder="e.g. Meeting Rescheduled"
                            className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm font-bold text-slate-800 dark:text-slate-100"
                        />
                        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                     </div>

                     {/* Type Selector */}
                     <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2 block">Notice Type</label>
                        <div className="grid grid-cols-4 gap-2">
                            {['info', 'success', 'warning', 'urgent'].map((t) => (
                                <label key={t} className={`
                                    cursor-pointer flex flex-col items-center justify-center p-2 rounded-xl border transition-all
                                    ${selectedType === t 
                                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500' 
                                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500'}
                                `}>
                                    <input type="radio" value={t} {...register("type")} className="sr-only" />
                                    <span className="capitalize text-xs font-bold">{t}</span>
                                </label>
                            ))}
                        </div>
                     </div>

                     {/* Message Input */}
                     <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5 block">Message</label>
                        <textarea 
                            {...register("message", { required: "Message is required" })} 
                            rows="4" 
                            placeholder="Write your announcement here..."
                            className="w-full border border-slate-200 dark:border-slate-700 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none font-medium text-slate-800 dark:text-slate-100"
                        ></textarea>
                        {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>}
                     </div>

                     <div className="flex gap-3 pt-2">
                         <button 
                            type="button" 
                            onClick={onClose} 
                            className="flex-1 py-3 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors text-sm"
                         >
                            Cancel
                         </button>
                         <button 
                            type="submit" 
                            disabled={submitting} // ✅ Used here
                            className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 text-sm disabled:opacity-70 ${getTypeColor(selectedType)} hover:opacity-90`}
                         >
                             {submitting ? <Loader2 className="animate-spin" size={18} /> : "Post Notice"} 
                         </button>
                     </div>
                 </form>
             </div>
        </div>
    );
}