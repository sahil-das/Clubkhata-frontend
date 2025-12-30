import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";

export default function Expenses() {
  const { user } = useAuth();
  const { centralFund, fetchCentralFund } = useFinance();

  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({ title: "", amount: "" });
  const [loading, setLoading] = useState(true);

  /* ================= LOAD ================= */
  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data.data);
      await fetchCentralFund();
    } catch (err) {
      console.error("Expense load error", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= ADD ================= */
  const addExpense = async () => {
    if (!form.title || !form.amount) return;

    await api.post("/expenses", {
      title: form.title,
      amount: Number(form.amount),
      addedBy: user._id,   // ✅ REQUIRED
    });


    setForm({ title: "", amount: "" });
    loadExpenses();
  };

  /* ================= APPROVE ================= */
  const approveExpense = async (id) => {
    await api.put(`/expenses/${id}/approve`);
    loadExpenses();
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading expenses…
      </div>
    );
  }

  return (
    <div>
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between mb-6">
        <h2 className="text-xl font-semibold">Expenses</h2>

        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-semibold">
          Central Fund: ₹ {centralFund}
        </div>
      </div>

      {/* ADD EXPENSE */}
      <div className="bg-white p-6 rounded-xl shadow mb-6 max-w-md">
        <h3 className="font-semibold mb-4">Add Expense</h3>

        <input
          placeholder="Expense title"
          value={form.title}
          onChange={(e) =>
            setForm({ ...form, title: e.target.value })
          }
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />

        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) =>
            setForm({ ...form, amount: e.target.value })
          }
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <button
          onClick={addExpense}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          Submit Expense
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="min-w-[700px] w-full">
          <thead className="bg-gray-100 text-sm">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Added By</th>
              <th className="p-3">Status</th>
              {user.role === "admin" && (
                <th className="p-3">Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e._id} className="border-t">
                <td className="p-3">{e.title}</td>
                <td className="p-3">₹ {e.amount}</td>
                <td className="p-3 text-sm">
                  {e.addedBy?.email}
                </td>
                <td className="p-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      e.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {e.status}
                  </span>
                </td>

                {user.role === "admin" && (
                  <td className="p-3">
                    {e.status === "pending" && (
                      <button
                        onClick={() =>
                          approveExpense(e._id)
                        }
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        Approve
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
