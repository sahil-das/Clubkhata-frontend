import { useParams } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CheckCircle } from "lucide-react";

export default function MemberDetails() {
  const { memberId } = useParams();
  const { user } = useAuth();
  const { fetchCentralFund } = useFinance();

  const [cycle, setCycle] = useState(null);
  const [paidWeeks, setPaidWeeks] = useState([]);
  const [selectedWeeks, setSelectedWeeks] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        const cycleRes = await api.get("/cycles/active");
        setCycle(cycleRes.data.data);

        const weeklyRes = await api.get(
          `/weekly/member/${memberId}`
        );
        setPaidWeeks(weeklyRes.data.data.paidWeeks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [memberId]);

  /* ================= SELECT WEEK ================= */
  const toggleWeek = (week) => {
    if (paidWeeks.includes(week)) return;

    setSelectedWeeks((prev) =>
      prev.includes(week)
        ? prev.filter((w) => w !== week)
        : [...prev, week]
    );
  };

  /* ================= PAY SELECTED ================= */
  const payWeeks = async () => {
    if (selectedWeeks.length === 0) return;

    if (
      !window.confirm(
        `Pay weeks: ${selectedWeeks.join(", ")} ?`
      )
    );
  };

  /* ================= ADD PUJA ================= */
  const addPujaContribution = async () => {
    if (!amount) return;

    await api.post("/weekly/pay", {
      userId: memberId,
      cycleId: cycle._id,
      weeks: selectedWeeks,
    });

    setSelectedWeeks([]);

    // reload status
    const res = await api.get(
      `/weekly/member/${memberId}`
    );
    setPaidWeeks(res.data.data.paidWeeks);
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!cycle) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg text-yellow-800">
        <p className="font-medium">No active Puja cycle</p>
        <p className="text-sm mt-1">
          Admin must create a new cycle before contributions can start.
        </p>
      </div>
    );
  }

  /* ================= RENDER ================= */
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          Weekly Contributions
        </h2>
        <p className="text-sm text-gray-500">
          {cycle.name} • ₹{cycle.weeklyAmount}/week
        </p>
      </div>

      {/* WEEK GRID */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-3">
        {Array.from(
          { length: cycle.totalWeeks },
          (_, i) => {
            const week = i + 1;
            const isPaid = paidWeeks.includes(week);
            const isSelected =
              selectedWeeks.includes(week);

            return (
              <div
                key={week}
                onClick={() =>
                  user.role === "admin" &&
                  toggleWeek(week)
                }
                className={`p-3 rounded-lg text-center text-sm cursor-pointer select-none
                  ${
                    isPaid
                      ? "bg-green-100 text-green-700"
                      : isSelected
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100"
                  }`}
              >
                <div className="flex items-center justify-center gap-1">
                  {isPaid && <CheckCircle size={14} />}
                  W{week}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* ADMIN ACTION */}
      {user.role === "admin" && (
        <div className="bg-white p-4 rounded-xl shadow">
          <p className="text-sm mb-3">
            Selected weeks:{" "}
            <strong>
              {selectedWeeks.join(", ") || "None"}
            </strong>
          </p>

          <button
            onClick={payWeeks}
            disabled={selectedWeeks.length === 0}
            className="bg-indigo-600 disabled:opacity-50 text-white px-4 py-2 rounded-lg"
          >
            Pay Selected Weeks
          </button>

          <p className="text-xs text-gray-500 mt-2">
            * Only admin can add or update Puja-time contributions
          </p>
        </div>
      )}
      {/* PUJA CONTRIBUTION TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <h3 className="font-semibold px-5 pt-4">
          Member Contribution History
        </h3>

        <table className="w-full text-sm mt-3">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Added By</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {pujaRecords.length === 0 ? (
              <tr>
                <td
                  colSpan="3"
                  className="p-4 text-center text-gray-500"
                >
                  No puja contributions yet
                </td>
              </tr>
            ) : (
              pujaRecords.map((r) => (
                <tr key={r._id} className="border-t">
                  <td className="p-3 font-semibold text-green-600">
                    ₹ {r.amount}
                  </td>
                  <td className="p-3">
                    {r.addedBy?.name || r.addedBy?.email || "Admin"}
                  </td>
                  <td className="p-3">
                    {r.createdAt?.slice(0, 10)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* WEEKLY */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Weekly Contributions</h3>

          <button
            onClick={() => setWeeksExpanded((p) => !p)}
            className="flex items-center gap-1 text-indigo-600 text-sm font-medium"
          >
            {weeksExpanded ? "Collapse" : "Expand"}
            <ChevronDown
              className={`transition-transform duration-300 ${
                weeksExpanded ? "rotate-180" : ""
              }`}
              size={16}
            />
          </button>
        </div>

        {!weeksExpanded && (
          <p className="text-sm text-gray-500 mb-2">
            {paidCount} / {weeks.length} weeks paid
          </p>
        )}

        {/* ANIMATED CONTAINER */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            weeksExpanded
              ? "max-h-[2000px] opacity-100"
              : "max-h-0 opacity-0"
          }`}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-3">
            {weeks.map((w) => (
              <div
                key={w.week}
                className={`rounded-lg p-3 text-sm border ${
                  w.paid
                    ? "bg-green-100 border-green-400"
                    : "bg-gray-50"
                }`}
              >
                <p className="font-semibold">Week {w.week}</p>

                {w.paid ? (
                  <>
                    <p className="text-xs text-green-700">Paid ✓</p>
                    <p className="text-xs text-gray-500">
                      {w.paidAt?.slice(0, 10)}
                    </p>

                    {user.role === "admin" && (
                      <button
                        onClick={() => handleUndoPaid(w.week)}
                        className="mt-2 text-xs text-red-600 underline"
                      >
                        Undo
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <p className="text-xs text-red-500">Not Paid</p>

                    {user.role === "admin" && (
                      <button
                        onClick={() => handleMarkPaid(w.week)}
                        className="mt-2 text-xs text-indigo-600 underline"
                      >
                        Mark Paid
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
