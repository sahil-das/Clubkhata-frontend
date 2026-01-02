import { useEffect, useState } from "react";
import api from "../api/axios";
import { useFinance } from "../context/FinanceContext";
import { useAuth } from "../context/AuthContext";
import { 
  IndianRupee, 
  Plus, 
  Search, 
  TrendingUp, 
  User, 
  Calendar,
  X 
} from "lucide-react";

export default function Donations() {
  const { fetchCentralFund } = useFinance();
  const { user } = useAuth();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    donorName: "",
    amount: "",
  });

  /* ================= LOAD DONATIONS ================= */
  useEffect(() => {
    loadDonations();
  }, []);

  const loadDonations = async () => {
    try {
      const res = await api.get("/donations");
      setDonations(res.data.data);
    } catch (err) {
      console.error("Donation load error", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD DONATION ================= */
  const addDonation = async () => {
    if (!form.donorName || !form.amount) return;

    try {
      await api.post("/donations", {
        donorName: form.donorName,
        amount: Number(form.amount),
        addedBy: user._id, // Track who added it
      });

      setForm({ donorName: "", amount: "" });
      setShowForm(false);
      await loadDonations();
      await fetchCentralFund(); // Update Dashboard totals
    } catch (err) {
      alert("Failed to save donation");
    }
  };

  /* ================= CALCULATIONS & FILTER ================= */
  const totalDonation = donations.reduce((sum, d) => sum + d.amount, 0);

  const filteredDonations = donations.filter((d) =>
    d.donorName.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 flex flex-col items-center">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        Loading donations...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* ================= TOP SUMMARY SECTION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {/* Total Card */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl p-6 shadow-lg flex items-center justify-between">
          <div>
            <p className="text-emerald-100 font-medium mb-1">Total Collections</p>
            <h3 className="text-3xl font-bold">₹ {totalDonation.toLocaleString()}</h3>
          </div>
          <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
            <TrendingUp size={28} className="text-white" />
          </div>
        </div>

        {/* Action Bar (Search + Add Button) */}
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search donor name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm transition-all"
            />
          </div>

          
            <button
             onClick={() => setShowForm(!showForm)}
             className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-sm
               ${showForm 
                 ? "bg-gray-100 text-gray-600 hover:bg-gray-200" 
                 : "bg-indigo-600 text-white hover:bg-indigo-700"
               }`}
           >
             {showForm ? <X size={20} /> : <Plus size={20} />}
             {showForm ? "Cancel" : "Add New Donation"}
           </button>
          
        </div>
      </div>

      {/* ================= ADD DONATION FORM (COLLAPSIBLE) ================= */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 animate-fade-in-down">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center">
              <Plus size={16} />
            </div>
            Record New Donation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Donor Name</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                placeholder="Ex: Rakesh Kumar"
                value={form.donorName}
                onChange={(e) => setForm({ ...form, donorName: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Amount (₹)</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none transition font-semibold text-gray-700"
                placeholder="0"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={addDonation}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-lg font-medium shadow-md transition-transform active:scale-95"
            >
              Confirm Donation
            </button>
          </div>
        </div>
      )}

      {/* ================= LIST VIEW (RESPONSIVE) ================= */}
      
      {/* Mobile Cards (Visible on Small Screens) */}
      <div className="block sm:hidden space-y-3">
        {filteredDonations.map((d) => (
          <div key={d._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <p className="font-bold text-gray-800 text-lg">{d.donorName}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                <Calendar size={12} />
                <span>{new Date(d.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                <User size={12} />
                <span>By: {d.addedBy?.name || d.addedBy?.email || "System"}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="block text-xl font-bold text-emerald-600">₹{d.amount}</span>
            </div>
          </div>
        ))}
        {filteredDonations.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p>No donations found matching "{search}"</p>
          </div>
        )}
      </div>

      {/* Desktop Table (Visible on Large Screens) */}
      <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Donor Name</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Recorded By</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredDonations.map((d) => (
              <tr key={d._id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4 font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
                  {d.donorName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(d.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">
                    {d.addedBy?.name || d.addedBy?.email || "System"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-emerald-600 text-lg">
                  ₹ {d.amount}
                </td>
              </tr>
            ))}
            {filteredDonations.length === 0 && (
              <tr>
                <td colSpan="4" className="px-6 py-10 text-center text-gray-500">
                  No donations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}