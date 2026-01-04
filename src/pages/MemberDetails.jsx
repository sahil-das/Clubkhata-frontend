import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  User, Phone, Mail, Calendar, MapPin, IndianRupee, 
  CheckCircle, XCircle, Clock, Shield, ArrowLeft, Loader2, Plus 
} from "lucide-react";
import AddPujaModal from "../components/AddPujaModal"; 

export default function MemberDetails() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { activeClub } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [frequency, setFrequency] = useState("weekly"); // ✅ Store Frequency Separately
  const [chandaHistory, setChandaHistory] = useState([]);
  const [stats, setStats] = useState({ subPaid: 0, subDue: 0, chandaPaid: 0 });
  
  const [showChandaModal, setShowChandaModal] = useState(false);

  // Helper for Monthly Labels
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  // FETCH ALL DATA
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const subRes = await api.get(`/subscriptions/member/${memberId}`);
      const subData = subRes.data.data;
      
      setMember({
        id: memberId,
        name: subData.memberName,
        userId: subData.memberUserId 
      });
      setSubscription(subData.subscription);
      
      // ✅ FIX: Get Frequency from 'rules' object provided by backend
      setFrequency(subData.rules?.frequency || "weekly");

      try {
        const feeRes = await api.get(`/member-fees/member/${subData.memberUserId}`);
        setChandaHistory(feeRes.data.data.records || []);
        
        setStats({
          subPaid: subData.subscription?.totalPaid || 0,
          subDue: subData.subscription?.totalDue || 0,
          chandaPaid: feeRes.data.data.total || 0
        });
      } catch (e) {
        console.warn("Chanda fetch failed", e);
      }

    } catch (err) {
      console.error("Member Details Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (memberId && activeClub) fetchData();
  }, [memberId, activeClub]);

  const handleTogglePayment = async (inst) => {
    if (activeClub?.role !== "admin") return alert("Only Admins can record payments.");
    
    // Custom confirm message based on frequency
    const label = frequency === 'monthly' ? MONTHS[inst.number - 1] : `Week #${inst.number}`;
    
    if (!window.confirm(`Mark ${label} as ${inst.isPaid ? "UNPAID" : "PAID"}?`)) return;

    try {
      const res = await api.post("/subscriptions/pay", {
        subscriptionId: subscription._id,
        installmentNumber: inst.number
      });
      
      setSubscription(res.data.data);
      setStats(prev => ({
        ...prev,
        subPaid: res.data.data.totalPaid,
        subDue: res.data.data.totalDue
      }));
    } catch (err) {
      alert(err.response?.data?.message || "Payment update failed");
    }
  };

  if (loading) return (
    <div className="h-[80vh] flex justify-center items-center text-indigo-600">
      <Loader2 className="animate-spin w-12 h-12" />
    </div>
  );

  if (!member) return <div className="p-10 text-center">Member not found.</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-fade-in">
      
      {/* 1. TOP BAR */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition">
        <ArrowLeft size={20} /> Back to List
      </button>

      {/* 2. PROFILE HEADER */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-10 -mt-10" />

         <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-3xl shadow-inner shrink-0">
            {member.name?.charAt(0)}
         </div>

         <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-800">{member.name}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
               <span className="flex items-center gap-1"><Shield size={14}/> Member</span>
               <span className="flex items-center gap-1"><Calendar size={14}/> {subscription?.year?.name || "Current Year"}</span>
            </div>
         </div>

         {/* Quick Stats */}
         <div className="flex gap-4 md:gap-8 z-10">
            <div className="text-right">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Contribution</p>
               <p className="text-2xl font-mono font-bold text-emerald-600">₹{(stats.subPaid + stats.chandaPaid).toLocaleString()}</p>
            </div>
            {/* ✅ Show Dues ONLY if not 'none' */}
            {frequency !== 'none' && (
              <div className="text-right border-l pl-4">
                 <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Dues</p>
                 <p className={`text-2xl font-mono font-bold ${stats.subDue > 0 ? "text-rose-500" : "text-gray-400"}`}>
                   ₹{stats.subDue.toLocaleString()}
                 </p>
              </div>
            )}
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 3. SUBSCRIPTION CARD (✅ HIDE if frequency is 'none') */}
        {frequency !== 'none' && (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <div>
                     <h3 className="font-bold text-gray-800 flex items-center gap-2">
                       <Calendar className="text-indigo-600" size={20} /> Subscription Card
                     </h3>
                     <p className="text-xs text-gray-500 mt-1">
                        {/* ✅ Label logic */}
                        {frequency === 'monthly' ? 'Monthly' : 'Weekly'} Payments • ₹{subscription?.year?.amountPerInstallment}/period
                     </p>
                  </div>
                  <div className="text-right">
                     <span className="block text-xs font-bold text-gray-400 uppercase">Status</span>
                     <span className={`text-sm font-bold ${stats.subDue === 0 ? "text-emerald-600" : "text-amber-500"}`}>
                        {stats.subDue === 0 ? "Fully Paid 🎉" : "Pending Dues"}
                     </span>
                  </div>
               </div>

               {/* THE GRID */}
               <div className="p-6">
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                    {subscription?.installments?.map((inst) => {
                      // ✅ LOGIC: Monthly (Jan, Feb) vs Weekly (W1, W2)
                      const label = frequency === 'monthly' ? MONTHS[inst.number - 1] : `W${inst.number}`;
                      
                      return (
                        <button
                          key={inst.number}
                          onClick={() => handleTogglePayment(inst)}
                          disabled={activeClub?.role !== "admin"}
                          title={inst.isPaid ? `Paid on ${new Date(inst.paidDate).toLocaleDateString()}` : `Due: ₹${inst.amountExpected}`}
                          className={`
                            relative flex flex-col items-center justify-center py-3 rounded-xl border-2 transition-all
                            ${inst.isPaid 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200" 
                              : "bg-white border-gray-100 text-gray-400 hover:border-indigo-200 hover:text-indigo-500"
                            }
                          `}
                        >
                          <span className="text-xs font-bold opacity-80">{label}</span>
                          {inst.isPaid && <CheckCircle size={14} className="mt-1" />}
                        </button>
                      );
                    })}
                  </div>
               </div>
               
               <div className="bg-gray-50 p-4 text-xs text-center text-gray-500 flex justify-center gap-6">
                  <span className="flex items-center gap-1"><div className="w-3 h-3 bg-indigo-600 rounded-full"/> Paid</span>
                  <span className="flex items-center gap-1"><div className="w-3 h-3 border-2 border-gray-300 rounded-full"/> Unpaid</span>
               </div>
            </div>
          </div>
        )}

        {/* 4. CHANDA HISTORY (Right 1/3, or full width if no subscription) */}
        <div className={`space-y-6 ${frequency === 'none' ? 'lg:col-span-3' : ''}`}>
           <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-gray-800 flex items-center gap-2">
                   <IndianRupee className="text-rose-500" size={20} /> Puja Chanda
                 </h3>
                 {activeClub?.role === "admin" && (
                    <button 
                      onClick={() => setShowChandaModal(true)}
                      className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition"
                    >
                       <Plus size={18} />
                    </button>
                 )}
              </div>

              {chandaHistory.length === 0 ? (
                 <div className="text-center py-10 text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl">
                    <IndianRupee size={32} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No extra fees recorded.</p>
                 </div>
              ) : (
                 <div className="space-y-3">
                    {chandaHistory.map((fee) => (
                       <div key={fee._id} className="flex justify-between items-center p-3 rounded-xl bg-gray-50 border border-gray-100">
                          <div>
                             <p className="text-sm font-bold text-gray-700">Festival Fee</p>
                             <p className="text-[10px] text-gray-500">{new Date(fee.createdAt).toLocaleDateString()}</p>
                          </div>
                          <span className="text-sm font-bold font-mono text-emerald-600">
                             + ₹{fee.amount}
                          </span>
                       </div>
                    ))}
                 </div>
              )}
           </div>

           {/* Contact Card */}
           <div className="bg-indigo-900 rounded-3xl p-6 text-white shadow-lg text-center">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                 <Phone size={24} />
              </div>
              <h4 className="font-bold">Contact Member</h4>
              <p className="text-indigo-200 text-xs mt-1 mb-4">Need to remind them about dues?</p>
              <button className="w-full py-2 bg-white text-indigo-900 rounded-xl font-bold text-sm hover:bg-indigo-50 transition">
                 Call Now
              </button>
           </div>
        </div>

      </div>

      {/* MODALS */}
      {showChandaModal && (
         <AddPujaModal 
           onClose={() => setShowChandaModal(false)} 
           refresh={fetchData} 
           preSelectedMemberId={member.userId} // ✅ PASSING ID TO LOCK MODAL
         />
      )}
    </div>
  );
}