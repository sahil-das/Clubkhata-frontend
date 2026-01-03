import { useState, useEffect } from "react";
import api from "../api/axios";
import { X, Loader2, CheckCircle, IndianRupee, AlertCircle } from "lucide-react";

export default function SubscriptionModal({ memberId, onClose,canEdit }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // To track which box is spinning

  // 1. Fetch Subscription Data (Auto-creates if missing)
  const fetchData = async () => {
    try {
      const res = await api.get(`/subscriptions/member/${memberId}`);
      setData(res.data.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load subscription data");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [memberId]);

  // 2. Handle Payment Toggle
  const handleToggle = async (installmentNumber) => {
    if (!canEdit) return; // 🔒 Stop clicks if not admin
    // Prevent double clicks
    if (processingId) return;

    setProcessingId(installmentNumber);
    try {
      const res = await api.post("/subscriptions/pay", {
        subscriptionId: data.subscription._id,
        installmentNumber
      });
      
      // Update local state instantly (Optimistic UI would be faster, but this is safer)
      setData(prev => ({
        ...prev,
        subscription: res.data.data
      }));
    } catch (err) {
      alert("Payment failed");
    } finally {
      setProcessingId(null);
    }
  };

  if (!memberId) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* HEADER */}
        <div className="bg-indigo-900 text-white p-6 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <IndianRupee className="text-yellow-400"/> {data?.memberName || "Loading..."}
            </h2>
            {!loading && (
               <p className="text-indigo-200 text-sm mt-1">
                 {data?.rules?.frequency === 'weekly' ? 'Weekly' : 'Monthly'} Collection • ₹{data?.rules?.amount}/installment
               </p>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-indigo-600">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
            
            {/* STATS BAR */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-emerald-100 p-4 rounded-xl border border-emerald-200 text-emerald-800">
                 <p className="text-xs font-bold uppercase opacity-70">Total Paid</p>
                 <p className="text-3xl font-bold font-mono">₹{data?.subscription?.totalPaid}</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-200 text-gray-600">
                 <p className="text-xs font-bold uppercase opacity-70">Remaining Due</p>
                 <p className="text-3xl font-bold font-mono">₹{data?.subscription?.totalDue}</p>
              </div>
            </div>

            {/* THE GRID */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-indigo-600"/> Payment Record
              </h3>
              
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {data?.subscription?.installments.map((inst) => (
                  <button
                    key={inst.number}
                    onClick={() => handleToggle(inst.number)}
                    disabled={!!processingId || !canEdit}
                    className={`
                      relative group h-14 rounded-lg font-bold text-sm flex flex-col items-center justify-center border-2 transition-all
                      ${inst.isPaid 
                        ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200 hover:bg-emerald-600" 
                        : "bg-white border-gray-100 text-gray-400"
                      }
                      ${canEdit && !inst.isPaid ? "hover:border-indigo-300 hover:text-indigo-500 cursor-pointer" : ""}
                      ${!canEdit ? "cursor-default opacity-90" : ""}
                    `}
                  >
                    {/* SPINNER OVERLAY */}
                    {processingId === inst.number ? (
                       <Loader2 className="animate-spin" size={16} />
                    ) : (
                       <>
                         <span>{inst.number}</span>
                         {inst.isPaid && <span className="text-[9px] opacity-80 font-normal">PAID</span>}
                       </>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* READ-ONLY NOTICE */}
            {!canEdit && (
              <div className="mt-4 bg-orange-50 text-orange-600 text-xs p-3 rounded-lg text-center font-bold">
                Viewing Mode Only. Contact an Admin to update payments.
              </div>
            )}

            {/* INFO FOOTER */}
            <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 bg-blue-50 p-3 rounded-lg">
              <AlertCircle size={14} className="text-blue-400"/>
              <span>Green boxes are paid. Tap a box to toggle its status instantly. Totals update automatically.</span>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}