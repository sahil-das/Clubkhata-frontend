import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios"; 
import { IndianRupee, Wallet, Calendar, Shield, User, Phone, Mail, Save, X, Edit2, Loader2 } from "lucide-react";

export default function UserProfile() {
  const { user: authUser } = useAuth(); 
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- EDIT MODES ---
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- FORM DATA ---
  // ✅ 1. Added personalEmail to state
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    phone: "", 
    personalEmail: "" 
  });
  
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // --- ERROR STATES ---
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Profile
        const profileRes = await api.get("/auth/me");
        const userData = profileRes.data.user; 
        
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
          personalEmail: userData.personalEmail || "" // ✅ Load personalEmail
        });

        // 2. Fetch Stats
        const statsRes = await api.get("/members/my-stats");
        setStats(statsRes.data.data);

      } catch (err) {
        console.error("Fetch Profile Error:", err);
      } finally {
        setLoading(false);
      }
    };

    if (authUser) fetchData();
  }, [authUser]);

  // --- HANDLERS ---
  
  const handleInfoSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    try {
      // ✅ 2. Send personalEmail to backend
      const res = await api.put("/auth/profile", {
        name: formData.name,
        phone: formData.phone,
        personalEmail: formData.personalEmail // Include this
        // Note: We generally do NOT send 'email' (System ID) back to be updated
      });
      
      setUser(res.data.data);
      setIsEditingInfo(false);
      // Optional: Update local user context if needed
    } catch (err) {
      console.error(err);
      setProfileError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setPasswordError("New passwords do not match");
    }

    try {
      await api.put("/auth/change-password", {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordSuccess("Password updated successfully!");
      setIsChangingPassword(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPasswordError(err.response?.data?.message || "Failed to update password");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64 text-indigo-600">
      <Loader2 className="animate-spin w-8 h-8" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-20">
      
      {/* 1. HEADER CARD */}
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-bl-full -mr-10 -mt-10" />

        {/* Avatar */}
        <div className="w-28 h-28 bg-indigo-600 rounded-full flex items-center justify-center text-white text-5xl font-bold shadow-xl shadow-indigo-200 z-10">
          {user?.name?.charAt(0)}
        </div>

        {/* Info */}
        <div className="flex-1 text-center md:text-left z-10">
          <h1 className="text-3xl font-bold text-gray-800">{user?.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-2">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold flex items-center gap-1">
              <Shield size={14} /> {stats?.role === 'admin' ? 'Club Admin' : 'Member'}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium flex items-center gap-1">
              <Calendar size={14} /> Joined {new Date(stats?.joinedAt || Date.now()).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex gap-6 z-10 bg-white/50 p-4 rounded-2xl backdrop-blur-sm border border-gray-100">
           <div className="text-right">
              <p className="text-xs font-bold text-gray-400 uppercase">Total Paid</p>
              <p className="text-xl font-mono font-bold text-emerald-600 flex items-center justify-end gap-1">
                 <IndianRupee size={16}/> {stats?.totalPaid?.toLocaleString() || 0}
              </p>
           </div>
           {stats?.frequency !== "none" && (
             <div className="text-right border-l pl-6 border-gray-200">
                <p className="text-xs font-bold text-gray-400 uppercase">Current Dues</p>
                <p className={`text-xl font-mono font-bold flex items-center justify-end gap-1 ${stats?.totalDue > 0 ? "text-rose-500" : "text-gray-400"}`}>
                   <IndianRupee size={16}/> {stats?.totalDue?.toLocaleString() || 0}
                </p>
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* 2. PROFILE INFORMATION FORM */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
             <h3 className="font-bold text-gray-700 flex items-center gap-2">
               <User className="text-indigo-600" size={20} /> Profile Information
             </h3>
             {!isEditingInfo ? (
               <button onClick={() => setIsEditingInfo(true)} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                 <Edit2 size={16} /> Edit
               </button>
             ) : (
               <button onClick={() => setIsEditingInfo(false)} className="text-sm font-bold text-gray-400 hover:text-gray-600 flex items-center gap-1">
                 <X size={16} /> Cancel
               </button>
             )}
          </div>
          
          <div className="p-6">
            {profileError && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg">{profileError}</div>}
            
            <form onSubmit={handleInfoSubmit} className="space-y-4">
              
              {/* Name */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    disabled={!isEditingInfo}
                    className={`w-full pl-10 pr-4 py-2 border rounded-xl outline-none transition ${isEditingInfo ? 'focus:ring-2 focus:ring-indigo-500 border-gray-300 bg-white' : 'bg-gray-50 border-transparent'}`}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {/* System ID (Read Only) */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">System Login ID</label>
                <div className="relative">
                  <Shield className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    disabled={true} // ✅ Always Disabled
                    className="w-full pl-10 pr-4 py-2 border border-transparent rounded-xl outline-none bg-gray-100 text-gray-500 cursor-not-allowed"
                    value={formData.email}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 ml-1">This ID is managed by your club admin.</p>
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="text"
                    disabled={!isEditingInfo}
                    placeholder="Add phone number"
                    className={`w-full pl-10 pr-4 py-2 border rounded-xl outline-none transition ${isEditingInfo ? 'focus:ring-2 focus:ring-indigo-500 border-gray-300 bg-white' : 'bg-gray-50 border-transparent'}`}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              {/* ✅ 3. NEW Personal Email Field */}
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Personal Email (Gmail)</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={18} />
                  <input
                    type="email"
                    disabled={!isEditingInfo}
                    placeholder="Add personal email"
                    className={`w-full pl-10 pr-4 py-2 border rounded-xl outline-none transition ${isEditingInfo ? 'focus:ring-2 focus:ring-indigo-500 border-gray-300 bg-white' : 'bg-gray-50 border-transparent'}`}
                    value={formData.personalEmail}
                    onChange={(e) => setFormData({ ...formData, personalEmail: e.target.value })}
                  />
                </div>
                {isEditingInfo && <p className="text-[10px] text-gray-400 mt-1 ml-1">For receiving receipts & notifications.</p>}
              </div>

              {isEditingInfo && (
                <div className="flex justify-end pt-2">
                   <button type="submit" className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                      <Save size={18} /> Save Changes
                   </button>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* 3. CHANGE PASSWORD FORM */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-fit">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
             <h3 className="font-bold text-gray-700 flex items-center gap-2">
               <Shield className="text-indigo-600" size={20} /> Security
             </h3>
          </div>

          <div className="p-6">
            {!isChangingPassword ? (
               <div className="text-center py-4">
                  <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3 text-indigo-600">
                     <Shield size={24} />
                  </div>
                  <p className="text-sm text-gray-500 mb-4">Update your password securely.</p>
                  <button onClick={() => setIsChangingPassword(true)} className="w-full py-2 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition">
                     Change Password
                  </button>
               </div>
            ) : (
              <form onSubmit={handlePasswordSubmit} className="space-y-4 animate-in slide-in-from-top-2">
                {passwordSuccess && <div className="p-3 bg-green-50 text-green-700 text-sm rounded-lg">{passwordSuccess}</div>}
                
                <div>
                    <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Current Password</label>
                    <input
                        type="password"
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase block mb-1">Confirm New</label>
                        <input
                            type="password"
                            required
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            value={passwordData.confirmPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        />
                    </div>
                </div>

                {passwordError && <div className="text-red-600 text-sm font-medium">{passwordError}</div>}
                
                <div className="flex justify-end gap-3 pt-2">
                    <button
                    type="button"
                    onClick={() => {
                        setIsChangingPassword(false);
                        setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                        setPasswordError("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
                    >
                    Cancel
                    </button>
                    <button
                    type="submit"
                    className="px-6 py-2 text-sm font-bold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md shadow-indigo-200 transition"
                    >
                    Update Password
                    </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}