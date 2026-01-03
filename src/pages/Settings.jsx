import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  Save, AlertTriangle, CheckCircle, PlusCircle, Lock, Calculator, Calendar, Loader2 
} from "lucide-react";

export default function Settings() {
  const { activeClub } = useAuth(); // Check role
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  
  // State to track the Active Year ID for updates
  const [activeYearId, setActiveYearId] = useState(null);
  const [noActiveCycle, setNoActiveCycle] = useState(false);

  // Unified Form State
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    subscriptionFrequency: "weekly", // weekly, monthly, none
    amountPerInstallment: 0,
    totalInstallments: 52,
    openingBalance: 0,
  });

  /* ================= LOAD SETTINGS ================= */
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/years/active");
      const d = res.data.data;
      
      if (d) {
        setNoActiveCycle(false);
        setActiveYearId(d._id);
        setFormData({
          name: d.name,
          startDate: d.startDate ? d.startDate.slice(0, 10) : "",
          endDate: d.endDate ? d.endDate.slice(0, 10) : "",
          subscriptionFrequency: d.subscriptionFrequency || "weekly",
          amountPerInstallment: d.amountPerInstallment || 0,
          totalInstallments: d.totalInstallments || 52,
          openingBalance: d.openingBalance || 0,
        });
      }
    } catch (err) {
      // 404 means no active year
      setNoActiveCycle(true);
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, startDate: today, name: `New Year ${new Date().getFullYear()}` }));
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLERS ================= */
  const isValid = () => {
    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setMessage({ type: "error", text: "End Date must be after Start Date" });
      return false;
    }
    return true;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!isValid()) return;
    if (activeClub?.role !== 'admin') return alert("Admins Only");

    setLoading(true);
    try {
      if (noActiveCycle) {
        // CREATE NEW
        await api.post("/years", formData);
        alert("New Festival Year Started!");
      } else {
        // UPDATE EXISTING
        await api.put(`/years/${activeYearId}`, formData);
        setMessage({ type: "success", text: "Settings updated successfully!" });
      }
      // Refresh
      window.location.reload();
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Operation failed" });
      setLoading(false);
    }
  };

  const handleCloseYear = async () => {
    if (activeClub?.role !== 'admin') return;
    const confirmText = prompt(
      "TYPE 'CLOSE' TO CONFIRM.\n\nThis will FREEZE the current financial year. You cannot undo this."
    );

    if (confirmText !== "CLOSE") return;

    try {
      setLoading(true);
      await api.post(`/years/${activeYearId}/close`);
      alert("Year Closed Successfully.");
      window.location.reload(); 
    } catch (err) {
      alert("Failed to close year");
      setLoading(false);
    }
  };

  // Projection Calculation
  const totalExpected = formData.amountPerInstallment * formData.totalInstallments;

  if (loading && !formData.name) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-indigo-600"/></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
          <p className="text-gray-500 text-sm">
            {noActiveCycle ? "Setup a new financial year." : "Manage active cycle configuration."}
          </p>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center gap-3 shadow-sm ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
          {message.type === "success" ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span className="font-medium">{message.text}</span>
        </div>
      )}

      {/* FORM CARD */}
      <div className={`rounded-2xl shadow-sm border overflow-hidden ${noActiveCycle ? "bg-white border-indigo-200" : "bg-white border-gray-200"}`}>
        
        {/* Banner */}
        <div className={`px-6 py-4 border-b flex justify-between items-center ${noActiveCycle ? "bg-indigo-50" : "bg-gray-50"}`}>
          <h3 className={`font-bold flex items-center gap-2 ${noActiveCycle ? "text-indigo-700" : "text-gray-700"}`}>
            {noActiveCycle ? <PlusCircle size={20} /> : <Calendar size={20} />}
            {noActiveCycle ? "New Cycle Setup" : "Active Cycle Configuration"}
          </h3>
          {activeClub?.role === "admin" && !noActiveCycle && (
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-green-200">
              ACTIVE
            </span>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-6">
          
          {/* 1. Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Event Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                placeholder='e.g. "Durga Puja 2026"'
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">End Date</label>
                <input
                  type="date"
                  min={formData.startDate} 
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  required
                />
              </div>
            </div>
          </div>

          <hr className="border-dashed" />

          {/* 2. Collection Rules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Frequency</label>
                  <select 
                    value={formData.subscriptionFrequency}
                    onChange={(e) => setFormData({...formData, subscriptionFrequency: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                  >
                    <option value="weekly">Weekly Collection</option>
                    <option value="monthly">Monthly Collection</option>
                    <option value="none">No Recurring (Donations Only)</option>
                  </select>
               </div>

               {formData.subscriptionFrequency !== 'none' && (
                 <>
                   <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Amount per {formData.subscriptionFrequency === 'weekly' ? 'Week' : 'Month'} (₹)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.amountPerInstallment}
                      onChange={(e) => setFormData({ ...formData, amountPerInstallment: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none font-bold text-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                      Total {formData.subscriptionFrequency === 'weekly' ? 'Weeks' : 'Months'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={formData.totalInstallments}
                      onChange={(e) => setFormData({ ...formData, totalInstallments: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none"
                      required
                    />
                  </div>
                 </>
               )}
            </div>

            {/* PREVIEW BOX */}
            <div className="bg-indigo-50 rounded-xl p-5 flex flex-col justify-center border border-indigo-100">
               <div className="flex items-center gap-2 text-indigo-800 font-bold mb-2 uppercase text-xs tracking-wider">
                 <Calculator size={16} /> Subscription Projection
               </div>
               <p className="text-3xl font-bold text-indigo-700">₹ {totalExpected.toLocaleString()}</p>
               <p className="text-xs text-indigo-500 mt-1 font-medium">Target per member per year</p>
            </div>
          </div>

          {/* 3. Opening Balance (New Only) */}
          {noActiveCycle && (
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
              <label className="block text-xs font-bold text-yellow-700 uppercase mb-1">Opening Balance</label>
              <input
                type="number"
                value={formData.openingBalance}
                onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                className="w-full border border-yellow-300 rounded-lg px-3 py-2 bg-white"
                placeholder="0"
              />
              <p className="text-[10px] text-yellow-600 mt-2">
                Use this to carry forward cash from previous years.
              </p>
            </div>
          )}

          {/* Submit */}
          {activeClub?.role === 'admin' && (
            <div className="pt-2">
               <button
                 type="submit"
                 disabled={loading}
                 className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-transform active:scale-95 flex justify-center gap-2 ${noActiveCycle ? "bg-indigo-600 hover:bg-indigo-700" : "bg-emerald-600 hover:bg-emerald-700"}`}
               >
                 {noActiveCycle ? <PlusCircle size={20} /> : <Save size={20} />}
                 {loading ? <Loader2 className="animate-spin" /> : (noActiveCycle ? "Start Festival Year" : "Save Changes")}
               </button>
            </div>
          )}
        </form>
      </div>

      {/* DANGER ZONE (Close Year) */}
      {!noActiveCycle && activeClub?.role === 'admin' && (
        <div className="border border-red-200 rounded-xl p-6 bg-white shadow-sm mt-8">
          <h3 className="text-red-700 font-bold flex items-center gap-2 mb-2">
            <Lock size={20} /> End Financial Year
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Closing the year will freeze all data and subscriptions. You should only do this after the festival is complete and all accounts are settled.
          </p>
          <button 
            onClick={handleCloseYear} 
            disabled={loading} 
            className="px-5 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-bold hover:bg-red-600 hover:text-white transition-colors"
          >
            Close Year Permanently
          </button>
        </div>
      )}
    </div>
  );
}