import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { createPoll } from "../api/polls";
import { useToast } from "../context/ToastContext";
import { 
  Loader2, X, Plus, Trash2, Calendar, HelpCircle, List, User, Eye, EyeOff 
} from "lucide-react";

export default function CreatePollModal({ onClose, refresh }) {
  const { register, control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      question: "",
      options: [{ text: "" }, { text: "" }],
      expiresAt: "",
      isAnonymous: false // Default Public
    }
  });
  
  const { fields, append, remove } = useFieldArray({ control, name: "options" });
  const isAnonymous = watch("isAnonymous");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const setDuration = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    setValue("expiresAt", date.toISOString().split('T')[0]);
  };

  const onSubmit = async (data) => {
    const validOptions = data.options.filter(o => o.text.trim() !== "");
    if (validOptions.length < 2) {
      toast.error("Please add at least 2 options.");
      return;
    }

    setLoading(true);
    try {
      await createPoll({
        question: data.question,
        options: validOptions,
        expiresAt: data.expiresAt,
        isAnonymous: data.isAnonymous // ✅ Send privacy setting
      });
      toast.success("Poll published successfully!");
      if (refresh) refresh();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create poll");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-600">
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
                <List className="text-indigo-200" size={20}/> Create Poll
            </h2>
            <button onClick={onClose} className="text-indigo-100 hover:text-white transition-colors">
                <X size={24}/>
            </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Question */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <HelpCircle size={16} /> Question
                </label>
                <textarea
                    {...register("question", { required: true })}
                    className="w-full px-4 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none resize-none"
                    placeholder="e.g. What should be the theme for this year's puja?"
                    rows="2"
                    autoFocus
                />
            </div>

            {/* Options */}
            <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Options</span>
                    <span className="text-xs font-normal text-slate-400">{fields.length} items</span>
                </label>
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2 items-center">
                            <span className="text-xs font-bold text-slate-400 w-4 text-center">{index + 1}.</span>
                            <input
                                {...register(`options.${index}.text`, { required: true })}
                                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-950 text-sm focus:border-indigo-500 outline-none"
                                placeholder={`Option ${index + 1}`}
                            />
                            {fields.length > 2 && (
                                <button type="button" onClick={() => remove(index)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button type="button" onClick={() => append({ text: "" })} className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                    <Plus size={16} /> Add Option
                </button>
            </div>

            {/* Settings Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                
                {/* Duration */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        <Calendar size={16} /> Duration
                    </label>
                    <input
                        type="date"
                        {...register("expiresAt", { required: true })}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 outline-none focus:border-indigo-500"
                    />
                    <div className="flex gap-1">
                        {[1, 3, 7].map(d => (
                            <button type="button" key={d} onClick={() => setDuration(d)} className="px-2 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 rounded text-slate-500 hover:text-indigo-600">
                                +{d} Days
                            </button>
                        ))}
                    </div>
                </div>

                {/* Privacy Toggle */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                        {isAnonymous ? <EyeOff size={16}/> : <Eye size={16}/>} Privacy
                    </label>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            {isAnonymous ? "Anonymous Voting" : "Public Voting"}
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" {...register("isAnonymous")} className="sr-only peer" />
                            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight">
                        {isAnonymous ? "Voter names will be hidden." : "Voters names will be visible to everyone."}
                    </p>
                </div>
            </div>

        </form>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
            <button onClick={handleSubmit(onSubmit)} disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={18} /> : "Publish Poll"}
            </button>
        </div>
      </div>
    </div>
  );
}