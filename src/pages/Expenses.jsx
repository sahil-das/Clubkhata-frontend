import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, Search, Trash2, Tag, Calendar, CheckCircle, XCircle, Clock, Loader2 
} from "lucide-react";

export default function Expenses() {
  const { activeClub } = useAuth(); // Need to know if I am Admin
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const CATEGORIES = ["Pandal", "Idol", "Light & Sound", "Food/Bhog", "Priest/Puja", "Transport", "Miscellaneous"];

  const fetchExpenses = async () => {
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchExpenses(); }, []);

  // Calculate Total (Only Approved)
  const totalAmount = expenses
    .filter(e => e.status === "approved")
    .reduce((sum, e) => sum + e.amount, 0);

  // Status Handler (Approve/Reject)
  const handleStatus = async (id, newStatus) => {
    try {
      await api.put(`/expenses/${id}/status`, { status: newStatus });
      // Update UI instantly
      setExpenses(expenses.map(e => e._id === id ? { ...e, status: newStatus } : e));
    } catch (err) {
      alert("Action failed");
    }
  };

  const filteredExpenses = expenses.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 bg-white border border-rose-100 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-rose-700">Expenses</h1>
          <p className="text-gray-500 text-sm">Approved Total</p>
        </div>
        <p className="text-3xl font-bold font-mono text-rose-600">₹{totalAmount.toLocaleString()}</p>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 text-gray-400" size={20} />
          <input 
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search expenses..."
            className="w-full pl-10 pr-4 py-2.5 border rounded-xl outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>
        
        {/* ✅ SHOW ADD BUTTON FOR EVERYONE NOW */}
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-rose-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-rose-700 flex items-center gap-2"
        >
          <Plus size={20} /> Add Bill
        </button>
      </div>

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExpenses.map((e) => (
          <div key={e._id} className={`bg-white p-5 rounded-2xl border transition relative group
            ${e.status === 'pending' ? 'border-yellow-200 bg-yellow-50/30' : 'border-gray-100'}
          `}>
            
            {/* STATUS BADGE */}
            <div className="absolute top-3 right-3">
              {e.status === 'pending' && <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded-full"><Clock size={12}/> Pending Approval</span>}
              {e.status === 'rejected' && <span className="text-xs font-bold text-red-500 bg-red-100 px-2 py-1 rounded-full">Rejected</span>}
            </div>

            <div className="mb-3 pr-20">
               <h3 className="font-bold text-gray-800">{e.title}</h3>
               <p className="text-xs text-gray-500">{new Date(e.date).toLocaleDateString()} • {e.category}</p>
            </div>
            
            <div className="text-xl font-mono font-bold text-rose-600 mb-4">
              ₹{e.amount}
            </div>

            <div className="text-xs text-gray-400 mb-3 border-t pt-2">
              Submitted by: <span className="font-medium text-gray-600">{e.recordedBy?.name || "Unknown"}</span>
            </div>

            {/* ADMIN ACTIONS: APPROVE / REJECT */}
            {activeClub?.role === "admin" && e.status === "pending" && (
              <div className="flex gap-2">
                <button 
                  onClick={() => handleStatus(e._id, "approved")}
                  className="flex-1 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-200 flex justify-center items-center gap-1"
                >
                  <CheckCircle size={16}/> Approve
                </button>
                <button 
                  onClick={() => handleStatus(e._id, "rejected")}
                  className="flex-1 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-bold hover:bg-red-200 flex justify-center items-center gap-1"
                >
                  <XCircle size={16}/> Reject
                </button>
              </div>
            )}
            
          </div>
        ))}
      </div>

      {/* ADD MODAL */}
      {showAddModal && <AddExpenseModal categories={CATEGORIES} onClose={() => setShowAddModal(false)} refresh={fetchExpenses} />}
    </div>
  );
}

// AddExpenseModal remains largely the same, just removed the "Admins Only" check on trigger
function AddExpenseModal({ categories, onClose, refresh }) {
    // ... (Use same modal code as previous answer) ...
    // Just ensure onSubmit calls api.post("/expenses")
    const { register, handleSubmit } = useForm();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            await api.post("/expenses", { ...data, amount: Number(data.amount) });
            refresh();
            onClose();
        } catch(err) {
            alert("Error adding expense");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
             <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6">
                 <h2 className="text-xl font-bold mb-4 text-gray-800">Submit Expense</h2>
                 <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                     <input {...register("title")} placeholder="Item Name" className="w-full border p-2 rounded-lg" required />
                     <input {...register("amount")} type="number" placeholder="Amount" className="w-full border p-2 rounded-lg" required />
                     <select {...register("category")} className="w-full border p-2 rounded-lg" required>
                         <option value="">Select Category</option>
                         {categories.map(c => <option key={c} value={c}>{c}</option>)}
                     </select>
                     <div className="flex gap-2 mt-4">
                         <button type="button" onClick={onClose} className="flex-1 py-2 bg-gray-100 rounded-lg">Cancel</button>
                         <button type="submit" disabled={loading} className="flex-1 py-2 bg-rose-600 text-white rounded-lg">
                             {loading ? <Loader2 className="animate-spin mx-auto"/> : "Submit"}
                         </button>
                     </div>
                 </form>
             </div>
        </div>
    )
}