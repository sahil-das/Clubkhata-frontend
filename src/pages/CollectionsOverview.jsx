import { useEffect, useState } from "react";
import { IndianRupee, ChevronDown, ChevronRight, Calendar, Filter } from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import api from "../api/axios";

export default function CollectionsOverview() {
  const { weeklyTotal, pujaTotal, donationTotal, loading: financeLoading } = useFinance();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ===== LOAD DONATIONS ===== */
  useEffect(() => {
    const loadDonations = async () => {
      try {
        const res = await api.get("/donations");
        setDonations(res.data.data || []);
      } catch (err) {
        console.error("Donation load error", err);
      } finally {
        setLoading(false);
      }
    };

    loadDonations();
  }, []);

  const totalCollection = weeklyTotal + pujaTotal + donationTotal;

  /* ===== GROUP DONATIONS BY DATE ===== */
  // Sort by date descending (Newest first)
  const sortedDonations = [...donations].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));

  const donationsByDate = sortedDonations.reduce((acc, d) => {
    const date = new Date(d.date || d.createdAt).toLocaleDateString("en-IN", { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(d);
    return acc;
  }, {});

  /* ===== COLLAPSE STATE ===== */
  const [openDates, setOpenDates] = useState({});

  const toggleDate = (date) => {
    setOpenDates((prev) => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10 animate-fade-in">
      
      {/* ================= HEADER ================= */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
           <IndianRupee size={28} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Collections Overview</h2>
          <p className="text-sm text-gray-500">Breakdown of all incoming funds.</p>
        </div>
      </div>

      {/* ================= SUMMARY CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          label="Weekly Subs" 
          value={weeklyTotal} 
          loading={financeLoading}
          color="bg-blue-50 border-blue-100 text-blue-700"
        />
        <SummaryCard 
          label="Puja Chanda" 
          value={pujaTotal} 
          loading={financeLoading}
          color="bg-purple-50 border-purple-100 text-purple-700"
        />
        <SummaryCard 
          label="Donations" 
          value={donationTotal} 
          loading={financeLoading}
          color="bg-amber-50 border-amber-100 text-amber-700"
        />
        <SummaryCard
          label="Total Collected"
          value={totalCollection}
          loading={financeLoading}
          highlight
        />
      </div>

      {/* ================= DONATION LEDGER ================= */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-500"/> Donation Ledger
            </h3>
            <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded-md">
                {donations.length} Records
            </span>
        </div>

        <div className="p-6 bg-gray-50/50 min-h-[300px]">
            {loading && (
            <p className="text-center py-10 text-gray-400">Loading records...</p>
            )}

            {!loading && donations.length === 0 && (
            <div className="text-center py-10 flex flex-col items-center">
                <Filter size={40} className="text-gray-300 mb-2" />
                <p className="text-gray-500 font-medium">No outside donations recorded yet.</p>
            </div>
            )}

            <div className="space-y-3">
            {Object.entries(donationsByDate).map(([date, list]) => {
                const dateTotal = list.reduce((sum, d) => sum + d.amount, 0);
                const isOpen = openDates[date];

                return (
                <div key={date} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm transition-all hover:shadow-md">
                    {/* DATE HEADER */}
                    <button
                    onClick={() => toggleDate(date)}
                    className="w-full flex justify-between items-center px-5 py-4 bg-white hover:bg-gray-50 transition-colors"
                    >
                    <div className="flex items-center gap-3">
                        <div className={`p-1 rounded-full ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </div>
                        <span className="font-bold text-gray-700">{date}</span>
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{list.length}</span>
                    </div>

                    <span className="font-mono font-bold text-emerald-600">
                        + ₹{dateTotal.toLocaleString()}
                    </span>
                    </button>

                    {/* EXPANDED LIST */}
                    {isOpen && (
                    <div className="border-t border-gray-100">
                        {list.map((d, index) => (
                        <div
                            key={d._id || index}
                            className="flex justify-between items-center px-5 py-3 text-sm hover:bg-gray-50 border-b last:border-0 border-gray-50"
                        >
                            <div className="flex flex-col">
                                <span className="font-medium text-gray-800">
                                {d.donorName || "Unknown Donor"}
                                </span>
                                {d.receiptNo && (
                                    <span className="text-[10px] text-gray-400">Receipt: {d.receiptNo}</span>
                                )}
                            </div>

                            <div className="text-right">
                                <span className="font-medium text-gray-700 block">
                                    ₹{d.amount.toLocaleString()}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                    Via: {d.paymentMethod || "Cash"}
                                </span>
                            </div>
                        </div>
                        ))}
                    </div>
                    )}
                </div>
                );
            })}
            </div>
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function SummaryCard({ label, value, highlight, loading, color }) {
  return (
    <div
      className={`rounded-2xl p-5 flex items-center gap-4 border transition-transform hover:-translate-y-1 ${
        highlight 
            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" 
            : `${color || 'bg-white border-gray-100'} shadow-sm`
      }`}
    >
      <div
        className={`p-3 rounded-xl ${
          highlight
            ? "bg-white/20 text-white"
            : "bg-white border border-gray-100 text-gray-600 shadow-sm"
        }`}
      >
        <IndianRupee size={20} />
      </div>

      <div>
        <p className={`text-xs font-bold uppercase tracking-wider ${
            highlight ? "opacity-80" : "opacity-60"
        }`}>
          {label}
        </p>
        {loading ? (
             <div className="h-6 w-24 bg-current opacity-20 rounded animate-pulse mt-1"></div>
        ) : (
            <h3 className="text-2xl font-bold font-mono">
             ₹{value.toLocaleString()}
            </h3>
        )}
      </div>
    </div>
  );
}