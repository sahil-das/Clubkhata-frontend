import { useEffect, useState } from "react";
import { IndianRupee, ChevronDown, ChevronRight } from "lucide-react";
import { useFinance } from "../context/FinanceContext";
import api from "../api/axios";

export default function CollectionsOverview() {
  const { weeklyTotal, pujaTotal, donationTotal } = useFinance();

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

  const totalCollection =
    weeklyTotal + pujaTotal + donationTotal;

  /* ===== GROUP DONATIONS BY DATE ===== */
  const donationsByDate = donations.reduce((acc, d) => {
    const date = d.createdAt?.slice(0, 10);
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
    <div className="space-y-8">
      {/* ================= HEADER ================= */}
      <div>
        <h2 className="text-xl font-semibold">
          Collections Overview
        </h2>
        <p className="text-sm text-gray-500">
          Weekly, Puja & Outside Donations
        </p>
      </div>

      {/* ================= SUMMARY ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard label="Weekly Contributions" value={weeklyTotal} />
        <SummaryCard label="Puja Contributions" value={pujaTotal} />
        <SummaryCard label="Outside Donations" value={donationTotal} />
        <SummaryCard
          label="Total Collection"
          value={totalCollection}
          highlight
        />
      </div>

      {/* ================= DONATIONS ================= */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-4">
          Outside Donations (Date-wise)
        </h3>

        {loading && (
          <p className="text-gray-500">Loading donations…</p>
        )}

        {!loading && donations.length === 0 && (
          <p className="text-gray-500">
            No outside donations recorded.
          </p>
        )}

        <div className="space-y-4">
          {Object.entries(donationsByDate).map(
            ([date, list]) => {
              const dateTotal = list.reduce(
                (sum, d) => sum + d.amount,
                0
              );
              const isOpen = openDates[date];

              return (
                <div
                  key={date}
                  className="border rounded-lg overflow-hidden"
                >
                  {/* DATE HEADER */}
                  <button
                    onClick={() => toggleDate(date)}
                    className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100"
                  >
                    <div className="flex items-center gap-2">
                      {isOpen ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                      <span className="font-semibold">
                        {date}
                      </span>
                    </div>

                    <span className="font-semibold text-green-600">
                      ₹ {dateTotal}
                    </span>
                  </button>

                  {/* EXPAND */}
                  {isOpen && (
                    <div className="p-4 space-y-2">
                      {list.map((d) => (
                        <div
                          key={d._id}
                          className="flex justify-between text-sm bg-gray-100 rounded-lg px-3 py-2"
                        >
                          <span>
                            {d.donorName || d.addedBy?.name || "Unknown"}
                          </span>

                          <span className="font-medium">
                            ₹ {d.amount}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function SummaryCard({ label, value, highlight }) {
  return (
    <div
      className={`rounded-xl shadow p-5 flex items-center gap-4 ${
        highlight ? "bg-indigo-600 text-white" : "bg-white"
      }`}
    >
      <div
        className={`p-3 rounded-lg ${
          highlight
            ? "bg-white/20"
            : "bg-indigo-100 text-indigo-600"
        }`}
      >
        <IndianRupee />
      </div>

      <div>
        <p
          className={`text-sm ${
            highlight ? "opacity-90" : "text-gray-500"
          }`}
        >
          {label}
        </p>
        <h3 className="text-xl font-bold">
          ₹ {value}
        </h3>
      </div>
    </div>
  );
}
