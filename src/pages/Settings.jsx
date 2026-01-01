import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Save, AlertTriangle, CheckCircle, PlusCircle, Lock } from "lucide-react";

export default function Settings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  
  // State to track if we are in "Create New" mode
  const [noActiveCycle, setNoActiveCycle] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    weeklyAmount: 0,
    totalWeeks: 52,
    openingBalance: "", // Optional override
    isClosed: false,
  });

  /* ================= LOAD SETTINGS ================= */
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("/settings");
      
      if (res.data.data) {
        // ✅ Active Cycle Found -> Edit Mode
        const d = res.data.data;
        setNoActiveCycle(false);
        setFormData({
          name: d.name,
          startDate: d.startDate ? d.startDate.slice(0, 10) : "",
          endDate: d.endDate ? d.endDate.slice(0, 10) : "",
          weeklyAmount: d.weeklyAmount,
          totalWeeks: d.totalWeeks,
          openingBalance: d.openingBalance || "",
          isClosed: d.isClosed,
        });
      } else {
        // ❌ No Active Cycle (Year Closed) -> Create Mode
        setNoActiveCycle(true);
        setFormData({
          name: "",
          startDate: "",
          endDate: "",
          weeklyAmount: 0,
          totalWeeks: 52,
          openingBalance: "",
          isClosed: false,
        });
      }
    } catch (err) {
      console.error("Failed to load settings", err);
      // Fallback to Create Mode on error if appropriate
      setNoActiveCycle(true); 
    }
  };

  /* ================= HANDLE UPDATE (EXISTING CYCLE) ================= */
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await axios.put("/settings", formData);
      setMessage({ type: "success", text: "Settings updated successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Update failed",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLE CREATE (NEW CYCLE) ================= */
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.name || !formData.startDate || !formData.endDate) {
      setMessage({ type: "error", text: "Please fill in all required fields." });
      setLoading(false);
      return;
    }

    try {
      // Calls the Create Endpoint
      const res = await axios.post("/cycles/create", formData);
      alert(`Success! ${res.data.message || "New cycle created."}`);
      window.location.reload(); // Refresh to enter Edit Mode for the new cycle
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to create cycle",
      });
      setLoading(false);
    }
  };

  /* ================= HANDLE CLOSE YEAR ================= */
  const handleCloseYear = async () => {
    const confirmText = prompt(
      "TYPE 'CLOSE' TO CONFIRM.\n\nThis will permanently FREEZE the current financial year and calculate the Closing Balance. This cannot be undone."
    );

    if (confirmText !== "CLOSE") return;

    try {
      setLoading(true);
      const res = await axios.post("/cycles/close");
      alert(res.data.message);
      window.location.reload(); // Page reload will trigger fetchSettings -> see null -> switch to Create Mode
    } catch (err) {
      alert(err.response?.data?.message || "Failed to close year");
      setLoading(false);
    }
  };

  if (!user || user.role !== "admin") {
    return <p className="text-center mt-10">Access Denied</p>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold">System Settings</h2>
        <p className="text-gray-500">
          {noActiveCycle 
            ? "No active financial year found. Start a new one below." 
            : "Configure the current puja cycle."}
        </p>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg flex items-center gap-2 ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.type === "success" ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          {message.text}
        </div>
      )}

      {/* FORM: DYNAMIC HEADER & SUBMIT ACTION */}
      <div className={`p-6 rounded-xl shadow border ${noActiveCycle ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-100"}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            {noActiveCycle ? (
              <>
                <PlusCircle className="text-indigo-600" /> Start New Financial Cycle
              </>
            ) : (
              "Active Cycle Configuration"
            )}
          </h3>
          
          {!noActiveCycle && formData.isClosed && (
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Lock size={12} /> YEAR CLOSED
            </span>
          )}
        </div>

        <form onSubmit={noActiveCycle ? handleCreate : handleUpdate} className="space-y-4">
          {/* Cycle Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Cycle Name (e.g., "Saraswati Puja 2026")</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={!noActiveCycle && formData.isClosed}
              className="w-full border rounded-lg p-2"
              placeholder={noActiveCycle ? "Enter name for new cycle" : ""}
              required
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                disabled={!noActiveCycle && formData.isClosed}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={!noActiveCycle && formData.isClosed}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
          </div>

          {/* Financial Config */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Weekly Amount (₹)</label>
              <input
                type="number"
                value={formData.weeklyAmount}
                onChange={(e) => setFormData({ ...formData, weeklyAmount: e.target.value })}
                disabled={!noActiveCycle && formData.isClosed}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Total Weeks</label>
              <input
                type="number"
                value={formData.totalWeeks}
                onChange={(e) => setFormData({ ...formData, totalWeeks: e.target.value })}
                disabled={!noActiveCycle && formData.isClosed}
                className="w-full border rounded-lg p-2"
                required
              />
            </div>
          </div>

          {/* Opening Balance (Only for Creation, optional) */}
          {noActiveCycle && (
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Opening Balance (Optional)</label>
              <input
                type="number"
                value={formData.openingBalance}
                onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                className="w-full border rounded-lg p-2"
                placeholder="Auto-detected from previous year if left blank"
              />
              <p className="text-xs text-gray-500 mt-1">If left blank, the system will automatically carry forward the closing balance from the last closed year.</p>
            </div>
          )}

          {/* ACTION BUTTON */}
          <div className="pt-4">
            {noActiveCycle ? (
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex justify-center items-center gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                <PlusCircle size={18} />
                Create & Start New Cycle
              </button>
            ) : (
              !formData.isClosed && (
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex justify-center items-center gap-2"
                >
                  <Save size={18} />
                  Save Configuration
                </button>
              )
            )}
          </div>
        </form>
      </div>

      {/* DANGER ZONE: CLOSE YEAR (Only show if Active Cycle exists) */}
      {!noActiveCycle && !formData.isClosed && (
        <div className="bg-red-50 border border-red-200 p-6 rounded-xl shadow-sm">
          <h3 className="text-red-700 font-bold flex items-center gap-2">
            <AlertTriangle size={20} /> Close Financial Year
          </h3>
          <p className="text-sm text-red-600 mt-2 mb-4">
            This action will calculate the final Closing Balance, lock all records for this cycle, 
            and mark the year as complete. You will need to create a new cycle afterwards.
          </p>
          <button
            onClick={handleCloseYear}
            disabled={loading}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium w-full"
          >
            Close Current Year Permanently
          </button>
        </div>
      )}
    </div>
  );
}