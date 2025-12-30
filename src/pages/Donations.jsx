import { useEffect, useState } from "react";
import api from "../api/axios";
import { useFinance } from "../context/FinanceContext";
import { IndianRupee, PlusCircle } from "lucide-react";

export default function Donations() {
  const { fetchCentralFund } = useFinance();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

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

    await api.post("/donations", {
      donorName: form.donorName,
      amount: Number(form.amount),
    });

    setForm({ donorName: "", amount: "" });
    await loadDonations();
    await fetchCentralFund();
  };

  const totalDonation = donations.reduce(
    (sum, d) => sum + d.amount,
    0
  );

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading donations…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-xl font-semibold">Donations</h2>
        <p className="text-sm text-gray-500">
          All collected donations
        </p>
      </div>

      {/* TOTAL */}
      <div className="bg-green-600 text-white rounded-xl p-6 flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-lg">
          <IndianRupee />
        </div>
        <div>
          <p className="text-sm opacity-90">
            Total Donations
          </p>
          <h3 className="text-2xl font-bold">
            ₹ {totalDonation}
          </h3>
        </div>
      </div>

      {/* ADD DONATION */}
      <div className="bg-white rounded-xl shadow p-6 max-w-lg">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <PlusCircle size={18} /> Add Donation
        </h3>

        <label className="text-sm font-medium">
          Donor Name
        </label>
        <input
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={form.donorName}
          onChange={(e) =>
            setForm({
              ...form,
              donorName: e.target.value,
            })
          }
        />

        <label className="text-sm font-medium">
          Amount
        </label>
        <input
          type="number"
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={form.amount}
          onChange={(e) =>
            setForm({
              ...form,
              amount: e.target.value,
            })
          }
        />

        <button
          onClick={addDonation}
          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
        >
          Save Donation
        </button>
      </div>

      {/* MOBILE CARDS */}
      <div className="space-y-3 sm:hidden">
        {donations.map((d) => (
          <div
            key={d._id}
            className="bg-white rounded-xl shadow p-4"
          >
            <div className="flex justify-between">
              <p className="font-semibold">
                {d.donorName}
              </p>
              <p className="font-bold text-green-600">
                ₹ {d.amount}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              {new Date(d.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-400">
              Added by: {d.addedBy?.name || d.addedBy?.email}
            </p>

          </div>
        ))}
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden sm:block bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-[700px] w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Donor Name</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Added By</th>
              <th className="p-3 text-left">Amount</th>
            </tr>
          </thead>

          <tbody>
            {donations.map((d) => (
            <tr
              key={d._id}
              className="border-t hover:bg-green-50"
            >
              <td className="p-3 font-medium">
                {d.donorName}
              </td>

              <td className="p-3">
                {new Date(d.createdAt).toLocaleDateString()}
              </td>

              <td className="p-3 text-sm text-gray-600">
                {d.addedBy?.name || d.addedBy?.email}
              </td>

              <td className="p-3 font-semibold text-green-600">
                ₹ {d.amount}
              </td>
            </tr>

            ))}

            {donations.length === 0 && (
              <tr>
                <td
                  colSpan="3"
                  className="p-6 text-center text-gray-500"
                >
                  No donations recorded
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
