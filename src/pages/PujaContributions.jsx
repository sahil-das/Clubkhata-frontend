import { useEffect, useState } from "react";
import api from "../api/axios";
import { useFinance } from "../context/FinanceContext";
import { useAuth } from "../context/AuthContext";

export default function PujaContributions() {
  // ✅ Get pujaTotal from context
  const { fetchCentralFund, pujaTotal } = useFinance();
  const { user } = useAuth();

  const [members, setMembers] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    memberId: "",
    amount: "",
  });

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, pRes] = await Promise.all([
          api.get("/members"),
          api.get("/puja-contributions"),
        ]);

        setMembers(mRes.data.data || []);
        setRows(pRes.data.data || []);
        
        // Ensure totals are up to date on load
        await fetchCentralFund(); 
      } catch (err) {
        console.error("Puja load error", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /* ================= ADD CONTRIBUTION ================= */
  const addContribution = async () => {
    if (!form.memberId || !form.amount) {
      alert("Select member & amount");
      return;
    }

    try {
      await api.post("/puja-contributions", {
        memberId: form.memberId,
        amount: Number(form.amount),
      });

      setForm({ memberId: "", amount: "" });

      // reload list
      const res = await api.get("/puja-contributions");
      setRows(res.data.data || []);

      // update dashboard totals immediately
      await fetchCentralFund();
    } catch (err) {
      console.error(err);
      alert("Failed to add contribution");
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading...</div>;

  return (
    <div className="space-y-6">
      
      {/* ✅ HEADER STATS */}
      <div className="flex justify-end">
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-semibold shadow-sm inline-block">
           Total Puja Collection: ₹ {pujaTotal}
        </div>
      </div>

      {/* ADD FORM (Admin Only) */}
      {user.role === "admin" && (
        <div className="bg-white p-6 rounded-xl shadow max-w-md mx-auto sm:mx-0 border border-gray-100">
          <h3 className="font-semibold mb-4 text-gray-800">Add Contribution</h3>
          <select
            className="w-full border rounded-lg p-2.5 mb-3 bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.memberId}
            onChange={(e) => setForm({ ...form, memberId: e.target.value })}
          >
            <option value="">Select Member</option>
            {members.map((m) => (
              <option key={m._id} value={m._id}>{m.name}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount (₹)"
            className="w-full border rounded-lg p-2.5 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <button
            onClick={addContribution}
            className="w-full bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 font-medium transition-colors"
          >
            Save Contribution
          </button>
        </div>
      )}

      {/* ================= MOBILE VIEW (CARDS) ================= */}
      <div className="block sm:hidden space-y-3">
        {rows.map((r) => (
          <div key={r._id} className="bg-white p-4 rounded-xl shadow border border-gray-100 flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">{r.member?.name || "Unknown Member"}</p>
              <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                 <p>{new Date(r.createdAt).toLocaleDateString()}</p>
                 <p>By: {r.addedBy?.email?.split('@')[0] || "System"}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-green-600">₹ {r.amount}</p>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-center text-gray-500 py-4">No contributions yet.</p>}
      </div>

      {/* ================= DESKTOP VIEW (TABLE) ================= */}
      <div className="hidden sm:block bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full w-full">
            <thead className="bg-gray-50 text-sm text-gray-600 border-b">
              <tr>
                <th className="p-4 text-left font-semibold">Member</th>
                <th className="p-4 text-left font-semibold">Amount</th>
                <th className="p-4 text-left font-semibold">Added By</th>
                <th className="p-4 text-left font-semibold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-800">{r.member?.name || "—"}</td>
                  <td className="p-4 text-green-600 font-bold">₹ {r.amount}</td>
                  <td className="p-4 text-sm text-gray-500">{r.addedBy?.email || "System"}</td>
                  <td className="p-4 text-sm text-gray-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-400">No contributions recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}