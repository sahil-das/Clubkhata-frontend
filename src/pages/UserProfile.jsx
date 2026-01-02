import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios"; 

export default function UserProfile() {
  const { user: authUser } = useAuth(); 
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- EDIT MODES ---
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // --- FORM DATA ---
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // --- ERROR STATES ---
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Profile
        const profileRes = await api.get("/auth/me");
        
        // ✅ FIX 1: Extract '.user' from the response
        const userData = profileRes.data.user; 
        
        setUser(userData);
        setFormData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
        });

        // 2. Fetch Stats
        try {
          const statsRes = await api.get("/members/my-stats");
          // ✅ FIX 2: Check nested data structure for stats
          if (statsRes.data.success) {
            setStats(statsRes.data.data);
          }
        } catch (statsErr) {
          console.warn("Could not fetch stats:", statsErr);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 2. Handle Profile Info Update
  const handleInfoUpdate = async (e) => {
    e.preventDefault();
    setProfileError("");
    try {
      const { data } = await api.put("/auth/profile", formData);
      
      // ✅ FIX 3: Update local state with the returned 'user' object, not the whole response
      setUser(data.user); 
      
      setIsEditingInfo(false); 
    } catch (error) {
      setProfileError(error.response?.data?.message || "Update failed");
    }
  };

  // 3. Handle Password Update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    try {
      await api.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      setIsChangingPassword(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordSuccess("Password changed successfully.");
      
      setTimeout(() => setPasswordSuccess(""), 3000);

    } catch (error) {
      setPasswordError(error.response?.data?.message || "Password update failed");
    }
  };

  if (loading) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* --- LEFT COLUMN: IDENTITY & STATS --- */}
        <div className="md:col-span-1 space-y-6">
          {/* Identity Card */}
          <div className="bg-white p-6 rounded-lg shadow text-center border border-gray-100">
            <div className="w-20 h-20 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-md">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <div className="mt-4">
               <span className="inline-block px-3 py-1 text-xs font-semibold tracking-wide text-indigo-800 bg-indigo-100 rounded-full uppercase">
                {user?.role || "Member"}
              </span>
            </div>
          </div>

          {/* Stats Card */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">
              {stats?.cycleName || "Overview"}
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Paid</span>
                <span className="font-bold text-green-600">
                  ₹{stats?.totalPaid || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Due</span>
                {/* Check totalDue from stats */}
                <span className={`font-bold ${stats?.totalDue > 0 ? "text-red-500" : "text-gray-400"}`}>
                  ₹{stats?.totalDue || 0}
                </span>
              </div>
            </div>

            {/* Recent Mini History */}
            {stats?.history?.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Recent Activity</h4>
                <div className="space-y-2">
                  {stats.history.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm border-l-2 border-indigo-100 pl-2">
                      <span className="text-gray-600">{item.description || item.type}</span>
                      <span className="font-medium text-gray-800">₹{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT COLUMN: DETAILS & SETTINGS --- */}
        <div className="md:col-span-2 space-y-6">
          
          {/* 1. PERSONAL DETAILS CARD */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-800">Personal Details</h3>
              {!isEditingInfo && (
                <button
                  onClick={() => setIsEditingInfo(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                >
                  Edit
                </button>
              )}
            </div>

            {isEditingInfo ? (
              <form onSubmit={handleInfoUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    disabled
                    className="w-full p-2 border border-gray-200 bg-gray-50 rounded text-gray-500 cursor-not-allowed"
                    value={formData.email}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                
                {profileError && (
                  <p className="text-red-500 text-sm mt-2">{profileError}</p>
                )}

                <div className="flex justify-end gap-3 mt-4 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => {
                        setIsEditingInfo(false);
                        setProfileError("");
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Full Name</span>
                  <span className="sm:col-span-2 text-gray-800 font-medium">{user?.name}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2 border-b border-gray-50">
                  <span className="text-gray-500 text-sm">Email</span>
                  <span className="sm:col-span-2 text-gray-800 font-medium">{user?.email}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-2">
                  <span className="text-gray-500 text-sm">Phone</span>
                  <span className="sm:col-span-2 text-gray-800 font-medium">{user?.phone || "Not set"}</span>
                </div>
              </div>
            )}
          </div>

          {/* 2. PASSWORD CARD */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-800">Security</h3>
              {!isChangingPassword && (
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
                >
                  Change Password
                </button>
              )}
            </div>

            {passwordSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded border border-green-200">
                    {passwordSuccess}
                </div>
            )}

            {!isChangingPassword ? (
              <p className="text-gray-500 text-sm">
                Password is hidden. Click "Change Password" to update it.
              </p>
            ) : (
              <form onSubmit={handlePasswordUpdate} className="bg-gray-50 p-5 rounded-lg border border-gray-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>

                {passwordError && (
                  <div className="text-red-600 text-sm bg-red-50 p-2 rounded border border-red-100">
                    {passwordError}
                  </div>
                )}
                
                <div className="flex justify-end gap-3 pt-2">
                   <button
                    type="button"
                    onClick={() => {
                      setIsChangingPassword(false);
                      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                      setPasswordError("");
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors shadow-sm"
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