import { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Loader2, UserPlus, User, Mail, Phone, AtSign, Lock } from "lucide-react";

export default function AddMemberModal({ onClose, refresh }) {
  const { activeClub } = useAuth(); 
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  // ✅ FIX: Use 'clubCode' (from backend) instead of 'code'
  const emailSuffix = activeClub?.clubCode 
    ? `@${activeClub.clubCode}.com` 
    : "@club.com";

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      // Create System ID (userid@clubcode.com)
      const systemLoginId = `${data.usernamePrefix}${emailSuffix}`.toLowerCase();

      const payload = {
        name: data.name,
        email: systemLoginId,        // 👈 System ID
        personalEmail: data.personalEmail, // 👈 Optional Gmail
        phone: data.phone,
        password: data.password,
        role: "member"
      };

      await api.post("/members", payload);
      if (refresh) refresh();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        
        <div className="bg-indigo-600 p-6 text-white text-center">
          <UserPlus className="w-10 h-10 mx-auto mb-2 opacity-90" />
          <h2 className="text-xl font-bold">Register New Member</h2>
          <p className="text-indigo-100 text-sm">They will be linked to {activeClub?.clubName || "this club"}.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
          {/* Name */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                {...register("name", { required: true })} 
                className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-gray-700" 
                placeholder="e.g. Rahul Roy" 
              />
            </div>
          </div>

          {/* SYSTEM ID (Split Input) */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 flex justify-between">
              <span>System Login ID</span>
              <span className="text-indigo-600">Unique</span>
            </label>
            <div className="flex items-center">
               <div className="relative flex-1">
                  <AtSign className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    {...register("usernamePrefix", { required: true, pattern: /^[a-zA-Z0-9.]+$/ })} 
                    className="w-full pl-10 pr-3 py-2 border border-r-0 rounded-l-xl outline-none focus:ring-2 focus:ring-indigo-500 text-right font-mono text-gray-700 lowercase" 
                    placeholder="userid" 
                  />
               </div>
               <div className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 rounded-r-xl text-gray-500 text-sm font-mono select-none">
                  {emailSuffix}
               </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">
              Used for login only. Format: <b>userid{emailSuffix}</b>
            </p>
          </div>

          <hr className="border-gray-100"/>

          {/* CONTACT INFO (Optional) */}
          <div className="grid grid-cols-2 gap-3">
             <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Personal Email (Optional)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    {...register("personalEmail")} 
                    className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                    placeholder="rahul.roy@gmail.com" 
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">For receipts & notices only.</p>
             </div>

             <div className="col-span-2">
                <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Phone (Optional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input 
                    {...register("phone")} 
                    className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm" 
                    placeholder="9876543210" 
                  />
                </div>
             </div>
          </div>

          {/* Password */}
          <div className="pt-2">
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Initial Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input 
                type="text" 
                {...register("password", { required: true })} 
                className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 text-gray-600 font-mono text-sm" 
                defaultValue="123456" 
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2">
              {loading ? <Loader2 className="animate-spin" /> : "Create Account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}