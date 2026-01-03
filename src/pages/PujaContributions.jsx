import { useEffect, useState } from "react";
import api from "../api/axios";
import { useFinance } from "../context/FinanceContext";
import { useAuth } from "../context/AuthContext";
import { Loader2, IndianRupee, User, Plus } from "lucide-react";

export default function PujaContributions() {
  const { fetchCentralFund, pujaTotal } = useFinance();
  const { activeClub } = useAuth(); // Use activeClub for role check

  const [members, setMembers] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // ✅ Form matches Backend expectations (userId instead of memberId)
  const [form, setForm] = useState({
    userId: "",
    amount: "",
    notes: ""
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, pRes] = await Promise.all([
          api.get("/members"),
          api.get("/member-fees"), // ✅ Using Correct Endpoint
        ]);

        setMembers(mRes.data.data || []);
        setRows(pRes.data.data || []);
        
        await fetchCentralFund(); 
      } catch (err) {
        console.error("Data load error", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ================= ADD CONTRIBUTION ================= */
  const addContribution = async (e) => {
    e.preventDefault();
    
    // ✅ Check for userId, not memberId
    if (!form.userId || !form.amount) {
      alert("Please select a member and enter an amount");
      return;
    }

    setSubmitting(true);
    try {
      // ✅ POST to /member-fees with 'userId'
      await api.post("/member-fees", {
        userId: form.userId, 
        amount: Number(form.amount),
        notes: form.notes
      });

      setForm({ userId: "", amount: "", notes: "" });

      // Reload list
      const res = await api.get("/member-fees");
      setRows(res.data.data || []);

      // Update Dashboard
      await fetchCentralFund();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add contribution. Is the Festival Year active?");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= DELETE ================= */
  const deleteRow = async (id) => {
    if(!window.confirm("Delete this record?")) return;
    try {
      await api.delete(`/member-fees/${id}`);
      setRows(rows.filter(r => r._id !== id));
      fetchCentralFund();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-indigo-600"/></div>;

  return (
    <div className="space-y-6 pb-10">
      
      {/* HEADER STATS */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           <IndianRupee className="text-indigo-600"/> Festival Chanda
        </h1>
        <div className="bg-emerald-100 text-emerald-800 px-5 py-2 rounded-xl font-bold shadow-sm border border-emerald-200">
           Total Collected: ₹ {pujaTotal}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === ADMIN FORM (Left) === */}
        {activeClub?.role === "admin" && (
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 sticky top-4">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus size={18} className="text-indigo-600"/> Record Payment
              </h3>
              
              <form onSubmit={addContribution} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Member</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={16} />
                    <select
                      className="w-full border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
                      value={form.userId}
                      onChange={(e) => setForm({ ...form, userId: e.target.value })}
                    >
                      <option value="">Select Member...</option>
                      {members.map((m) => (
                        // ✅ CRITICAL: Value must be the USER ID, not Membership ID
                        <option key={m._id} value={m.user?._id || m.user}>
                          {m.name || m.user?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Amount (₹)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="500"
                  />
                </div>

                 <div>
                  <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Notes</label>
                  <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="e.g. Cash / GPay"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex justify-center items-center gap-2"
                >
                  {submitting ? <Loader2 className="animate-spin" size={18}/> : "Save Record"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* === LIST (Right) === */}
        <div className={activeClub?.role === "admin" ? "lg:col-span-2" : "lg:col-span-3"}>
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             
             {/* Desktop Header */}
             <div className="hidden sm:grid grid-cols-12 bg-gray-50 p-4 text-xs font-bold text-gray-500 uppercase border-b">
                <div className="col-span-4">Member</div>
                <div className="col-span-3">Amount</div>
                <div className="col-span-3">Date</div>
                <div className="col-span-2 text-right">Action</div>
             </div>

             {/* Rows */}
             <div className="divide-y divide-gray-50">
               {rows.map((r) => (
                 <div key={r._id} className="p-4 flex flex-col sm:grid sm:grid-cols-12 items-center hover:bg-gray-50 transition">
                    
                    {/* Member */}
                    <div className="w-full sm:col-span-4 font-semibold text-gray-700 mb-2 sm:mb-0">
                      {r.user?.name || "Unknown"}
                      {r.notes && <span className="block text-xs text-gray-400 font-normal">{r.notes}</span>}
                    </div>

                    {/* Amount */}
                    <div className="w-full sm:col-span-3 mb-2 sm:mb-0">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-md text-sm font-bold">
                        ₹ {r.amount}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="w-full sm:col-span-3 text-sm text-gray-500 mb-2 sm:mb-0">
                       {new Date(r.createdAt).toLocaleDateString()}
                       <div className="text-xs text-gray-400">By: {r.collectedBy?.name || "Admin"}</div>
                    </div>

                    {/* Action */}
                    <div className="w-full sm:col-span-2 text-right">
                       {activeClub?.role === "admin" && (
                         <button onClick={() => deleteRow(r._id)} className="text-xs text-red-500 hover:underline">
                           Delete
                         </button>
                       )}
                    </div>
                 </div>
               ))}
               
               {rows.length === 0 && (
                 <div className="p-8 text-center text-gray-400">No contributions recorded yet.</div>
               )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}