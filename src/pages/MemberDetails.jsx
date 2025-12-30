import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { CheckCircle } from "lucide-react";

export default function MemberDetails() {
  const { memberId } = useParams();
  const { user } = useAuth();

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
    )
      return;

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
        </div>
      )}
    </div>
  );
}
