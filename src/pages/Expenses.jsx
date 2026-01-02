import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";

export default function Expenses() {
  const { user } = useAuth();
  const { centralFund, approvedExpenses, fetchCentralFund } = useFinance();

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
      addedBy: user._id,
    });

    setForm({ title: "", amount: "" });
    loadExpenses();
  };

  /* ================= APPROVE ================= */
  const approveExpense = async (id) => {
    await api.put(`/expenses/${id}/approve`);
    loadExpenses();
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading expenses…</div>;

  return (
    <div>
      {/* HEADER TOTALS */}
      <div className="flex flex-col sm:flex-row justify-end mb-6 gap-3">
        <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl font-semibold border border-red-100 shadow-sm text-center sm:text-left">
          Total Expenses: ₹ {approvedExpenses}
        </div>
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl font-semibold shadow-sm text-center sm:text-left">
          Central Fund: ₹ {centralFund}
        </div>
      </div>

      {/* ADD EXPENSE FORM */}
      <div className="bg-white p-6 rounded-xl shadow mb-6 max-w-md mx-auto sm:mx-0">
        <h3 className="font-semibold mb-4">Add Expense</h3>
        <input
          placeholder="Expense title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 mb-3 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="w-full border rounded-lg px-3 py-2 mb-4 outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={addExpense}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Submit Expense
        </button>
      </div>

      {/* ================= MOBILE VIEW (CARDS) ================= */}
      <div className="block sm:hidden space-y-3">
        {expenses.map((e) => (
          <div key={e._id} className="bg-white p-4 rounded-xl shadow border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-gray-800">{e.title}</h4>
                <p className="text-xs text-gray-500">By: {e.addedBy?.email?.split('@')[0]}</p>
              </div>
              <span className="font-bold text-gray-800">₹ {e.amount}</span>
            </div>
            
            <div className="flex justify-between items-center pt-3 border-t border-gray-50 mt-2">
              <span className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wide ${
                e.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                {e.status}
              </span>
              
              {user.role === "admin" && e.status === "pending" && (
                <button
                  onClick={() => approveExpense(e._id)}
                  className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg font-medium hover:bg-indigo-100"
                >
                  Approve
                </button>
              )}
            </div>
          </div>
        ))}
        {expenses.length === 0 && <p className="text-center text-gray-500 py-4">No expenses recorded.</p>}
      </div>

      {/* ================= DESKTOP VIEW (TABLE) ================= */}
      <div className="hidden sm:block bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full w-full">
            <thead className="bg-gray-50 text-sm text-gray-600 border-b">
              <tr>
                <th className="p-4 text-left font-semibold">Title</th>
                <th className="p-4 text-left font-semibold">Amount</th>
                <th className="p-4 text-left font-semibold">Added By</th>
                <th className="p-4 text-left font-semibold">Status</th>
                {user.role === "admin" && <th className="p-4 text-left font-semibold">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {expenses.map((e) => (
                <tr key={e._id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-gray-800 font-medium">{e.title}</td>
                  <td className="p-4 text-gray-600">₹ {e.amount}</td>
                  <td className="p-4 text-sm text-gray-500">{e.addedBy?.email}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      e.status === "approved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  {user.role === "admin" && (
                    <td className="p-4">
                      {e.status === "pending" && (
                        <button
                          onClick={() => approveExpense(e._id)}
                          className="text-indigo-600 text-sm font-semibold hover:underline"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {expenses.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-400">No expenses recorded</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}