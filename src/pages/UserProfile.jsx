import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios"; 
import { 
  IndianRupee, Wallet, Calendar, Shield, User, 
  Mail, Phone, Lock, Camera, Edit3, CheckCircle, AlertCircle, 
  AtSign
} from "lucide-react";

export default function UserProfile() {
  const { user: authUser, setUser: setGlobalUser } = useAuth(); 
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); 

  // --- FORM STATES ---
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ 
    name: "", 
    phone: "", 
    personalEmail: "" // New Field
  });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // --- FEEDBACK STATES ---
  const [status, setStatus] = useState({ type: "", message: "" });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profileRes = await api.get("/auth/me");
        const userData = profileRes.data.user; 
        
        setUser(userData);
        setFormData({
          name: userData.name || "",
          phone: userData.phone || "",
          personalEmail: userData.personalEmail || "", // Fetch personal email
        });

        const statsRes = await api.get("/members/my-stats");
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (error) {
        console.error("Error loading profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const showMessage = (type, msg) => {
    setStatus({ type, message: msg });
    setTimeout(() => setStatus({ type: "", message: "" }), 4000);
  };

  const handleInfoUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put("/auth/profile", formData);
      const updatedUser = data.data;

      setUser(updatedUser);
      if (setGlobalUser) setGlobalUser(updatedUser); 
      
      setIsEditing(false);
      showMessage("success", "Profile details updated successfully.");
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Failed to update profile.");
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showMessage("error", "New passwords do not match.");
      return;
    }

    try {
      await api.put("/auth/change-password", {
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showMessage("success", "Password changed successfully.");
    } catch (error) {
      showMessage("error", error.response?.data?.message || "Password update failed.");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8 pb-20">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-500 text-sm">Manage your personal details and security.</p>
        </div>
        {status.message && (
          <div className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2 ${
            status.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {status.type === 'error' ? <AlertCircle size={16}/> : <CheckCircle size={16}/>}
            {status.message}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 2. LEFT COLUMN: PROFILE CARD (Spans 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative group">
            <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600 relative">
               <div className="absolute inset-0 bg-black/10"></div>
            </div>
            
            <div className="px-6 relative">
              <div className="-mt-12 mb-3 inline-block relative">
                <div className="h-24 w-24 rounded-full border-4 border-white bg-white shadow-md flex items-center justify-center overflow-hidden">
                   <div className="w-full h-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                   </div>
                </div>
                <button className="absolute bottom-0 right-0 p-1.5 bg-gray-900 text-white rounded-full border-2 border-white hover:bg-black transition-colors shadow-sm">
                  <Camera size={14} />
                </button>
              </div>

              <div className="pb-6">
                <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
                <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
                
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wide">
                    {user?.role || "Member"}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-100">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Current Cycle</h3>
             <div className="space-y-4">
                
                <div className="flex justify-between items-center text-sm">
                   <span className="text-gray-500">Festival Chanda</span>
                   <span className="font-bold text-gray-900">₹{stats?.festivalChandaTotal || 0}</span>
                </div>

                {stats?.frequency !== 'none' && (
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500">
                       {stats?.frequency === 'monthly' ? "Monthly Contribution" : "Weekly Contribution"}
                     </span>
                     <span className="font-bold text-emerald-600">₹{stats?.totalPaid || 0}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-gray-50 flex justify-between items-center text-sm">
                   <span className="text-gray-500">Pending Dues</span>
                   <span className="font-bold text-rose-600">₹{stats?.totalDue || 0}</span>
                </div>
             </div>
          </div>
        </div>

        {/* 3. RIGHT COLUMN: TABS & CONTENT (Spans 8 cols) */}
        <div className="lg:col-span-8">
          
          {/* Tabs Navigation */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-1 mb-6 inline-flex w-full md:w-auto">
            {['overview', 'settings', 'security'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-medium rounded-lg transition-all capitalize ${
                  activeTab === tab 
                  ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* TAB CONTENT: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300">
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <IndianRupee size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Festival Contribution</p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{stats?.festivalChandaTotal || 0}</h3>
                  <p className="text-xs text-gray-400 mt-1">Lifetime total for this cycle</p>
                </div>
              </div>

              {stats?.frequency !== 'none' && (
                <>
                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Wallet size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">
                        {stats?.frequency === 'monthly' ? "Monthly Contribution" : "Weekly Contribution"}
                      </p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">₹{stats?.totalPaid || 0}</h3>
                      <p className="text-xs text-gray-400 mt-1">Total paid this cycle</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 md:col-span-2">
                    <div className={`p-3 rounded-xl ${stats?.totalDue > 0 ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-400'}`}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pending Dues</p>
                      <h3 className={`text-2xl font-bold mt-1 ${stats?.totalDue > 0 ? 'text-rose-600' : 'text-gray-400'}`}>
                        ₹{stats?.totalDue || 0}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        {stats?.totalDue > 0 ? "Please clear your dues soon." : "You are all caught up!"}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TAB CONTENT: SETTINGS (Edit Profile) */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-in fade-in slide-in-from-bottom-2 duration-400">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Manage your contact details and communication preferences.
                  </p>
                </div>
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)} 
                    className="flex items-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all shadow-sm"
                  >
                    <Edit3 size={16}/> Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-100">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="text-xs font-bold uppercase tracking-wider">Editing Mode</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleInfoUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <div className="relative group">
                      <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? 'text-indigo-500' : 'text-gray-400'}`}>
                        <User size={18} />
                      </div>
                      <input 
                        disabled={!isEditing}
                        type="text" 
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter your full name"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium text-gray-700 placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                    <div className="relative group">
                      <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? 'text-indigo-500' : 'text-gray-400'}`}>
                        <Phone size={18} />
                      </div>
                      <input 
                        disabled={!isEditing}
                        type="text" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        placeholder="e.g. +91 9876543210"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium text-gray-700 placeholder:text-gray-300"
                      />
                    </div>
                  </div>

                  {/* PERSONAL EMAIL (Editable) */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Personal Contact Email</label>
                    <div className="relative group">
                      <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isEditing ? 'text-indigo-500' : 'text-gray-400'}`}>
                        <Mail size={18} />
                      </div>
                      <input 
                        disabled={!isEditing}
                        type="email" 
                        value={formData.personalEmail}
                        onChange={(e) => setFormData({...formData, personalEmail: e.target.value})}
                        placeholder="Enter your personal email address"
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium text-gray-700 placeholder:text-gray-300"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 ml-1">This email will be used for club communications.</p>
                  </div>

                  {/* SYSTEM EMAIL (Read-Only) */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">System / Login ID</label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                      <input 
                        disabled
                        type="text" 
                        value={user?.email || ""} // Original email from user object
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-100 text-gray-400 cursor-not-allowed font-medium"
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 ml-1">
                      <Lock size={10}/> This is your unique System ID and cannot be changed.
                    </p>
                  </div>

                </div>

                {isEditing && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-50">
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          name: user?.name || "",
                          phone: user?.phone || "",
                          personalEmail: user?.personalEmail || ""
                        });
                      }}
                      className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
                    >
                      Discard Changes
                    </button>
                    <button 
                      type="submit" 
                      className="px-8 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 transition-all active:scale-95"
                    >
                      Update Profile
                    </button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* TAB CONTENT: SECURITY */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-in fade-in duration-300">
               <div className="mb-6">
                   <h3 className="text-lg font-bold text-gray-900">Security Settings</h3>
                   <p className="text-sm text-gray-500">Ensure your account is using a strong password.</p>
               </div>

               <form onSubmit={handlePasswordUpdate} className="max-w-lg space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-500 uppercase">Current Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 text-gray-400" size={18} />
                      <input 
                        type="password" 
                        required
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase">New Password</label>
                      <input 
                        type="password" 
                        required
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-gray-500 uppercase">Confirm Password</label>
                      <input 
                        type="password" 
                        required
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <button 
                      type="submit" 
                      className="px-6 py-2 text-sm font-bold text-white bg-gray-900 hover:bg-black rounded-lg shadow-sm transition-all"
                    >
                      Update Password
                    </button>
                  </div>
               </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}