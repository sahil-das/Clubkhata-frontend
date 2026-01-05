import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  User, Phone, Calendar, Shield, ArrowLeft, Loader2, Plus, 
  CheckCircle, Clock, IndianRupee, Mail, MapPin, CreditCard 
} from "lucide-react";
import { clsx } from "clsx";

// Design System
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import AddPujaModal from "../components/AddPujaModal"; 

export default function MemberDetails() {
  const { memberId } = useParams();
  const navigate = useNavigate();
  const { activeClub } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [frequency, setFrequency] = useState("weekly"); 
  const [chandaHistory, setChandaHistory] = useState([]);
  const [stats, setStats] = useState({ subPaid: 0, subDue: 0, chandaPaid: 0 });
  
  const [showChandaModal, setShowChandaModal] = useState(false);
  const [processing, setProcessing] = useState(null);

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
        userId: subData.memberUserId,
        phone: subData.phone, // Assuming API returns this, or fetch from member profile
        email: subData.email
      });
      setSubscription(subData.subscription);
      
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
    if (activeClub?.role !== "admin") return;
    if (processing) return;

    // Use processing state instead of window.confirm for a smoother UI (optional)
    // keeping confirm for safety as requested, but logic handles loading
    if (!window.confirm(`Mark ${frequency === 'monthly' ? MONTHS[inst.number - 1] : `Week ${inst.number}`} as ${inst.isPaid ? "UNPAID" : "PAID"}?`)) return;

    setProcessing(inst.number);

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
      console.error(err);
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return (
    <div className="min-h-[60vh] flex justify-center items-center text-primary-600">
      <Loader2 className="animate-spin w-12 h-12" />
    </div>
  );

  if (!member) return (
    <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-700">Member not found</h2>
        <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
    </div>
  );

  const totalContribution = stats.subPaid + stats.chandaPaid;
  const progressPercent = subscription ? Math.round((subscription.installments.filter(i => i.isPaid).length / subscription.installments.length) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-fade-in">
      
      {/* 1. TOP BAR */}
      <div className="flex items-center gap-4">
        <button 
            onClick={() => navigate(-1)} 
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
        >
            <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-slate-800 hidden md:block">Member Profile</h1>
      </div>

      {/* 2. PROFILE BANNER */}
      <div className="relative bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
         {/* Background Pattern */}
         <div className="absolute top-0 w-full h-32 bg-gradient-to-r from-slate-900 to-slate-800" />
         
         <div className="relative px-8 pb-8 pt-20 flex flex-col md:flex-row gap-6 items-start md:items-end">
             {/* Avatar */}
             <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-xl -mt-6">
                <div className="w-full h-full bg-primary-100 rounded-xl flex items-center justify-center text-primary-600 font-bold text-3xl">
                    {member.name?.charAt(0)}
                </div>
             </div>

             {/* Info */}
             <div className="flex-1 min-w-0 pb-1">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{member.name}</h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
                   <span className="flex items-center gap-1.5"><Shield size={14} className="text-emerald-500"/> Member</span>
                   <span className="flex items-center gap-1.5"><Calendar size={14}/> Joined {subscription?.year?.name}</span>
                   {/* If phone exists */}
                   <span className="flex items-center gap-1.5"><Phone size={14}/> {member.phone || "No Phone"}</span>
                </div>
             </div>

             {/* Stats Actions */}
             <div className="flex gap-3 w-full md:w-auto">
                 {activeClub?.role === "admin" && (
                    <Button 
                        onClick={() => setShowChandaModal(true)}
                        leftIcon={<Plus size={18} />}
                        className="shadow-lg shadow-primary-200"
                    >
                        Add Fee
                    </Button>
                 )}
             </div>
         </div>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: SUBSCRIPTION */}
        {frequency !== 'none' && (
          <div className="lg:col-span-2 space-y-6">
            
            {/* PROGRESS CARD */}
            <Card>
               <div className="flex justify-between items-end mb-4">
                  <div>
                     <h3 className="font-bold text-slate-800 flex items-center gap-2">
                       <CreditCard className="text-primary-600" size={20} /> Subscription Status
                     </h3>
                     <p className="text-sm text-slate-500 mt-1">
                        {frequency === 'monthly' ? 'Monthly' : 'Weekly'} Plan • <span className="font-bold text-slate-700">₹{subscription?.year?.amountPerInstallment}</span> / period
                     </p>
                  </div>
                  <div className="text-right">
                     <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Progress</span>
                     <span className={clsx("text-2xl font-bold font-mono", progressPercent === 100 ? "text-emerald-600" : "text-primary-600")}>
                        {progressPercent}%
                     </span>
                  </div>
               </div>

               {/* Progress Bar */}
               <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden mb-6">
                  <div 
                    className="h-full bg-primary-600 transition-all duration-500 ease-out" 
                    style={{ width: `${progressPercent}%` }} 
                  />
               </div>

               {/* THE GRID */}
               <div className={clsx(
                   "grid gap-3",
                   frequency === 'monthly' ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-6" : "grid-cols-5 sm:grid-cols-8 md:grid-cols-10"
               )}>
                  {subscription?.installments?.map((inst) => {
                    const label = frequency === 'monthly' ? MONTHS[inst.number - 1] : `${inst.number}`;
                    const isProcessing = processing === inst.number;
                    
                    return (
                      <button
                        key={inst.number}
                        onClick={() => handleTogglePayment(inst)}
                        disabled={activeClub?.role !== "admin" || isProcessing}
                        className={clsx(
                          "relative flex flex-col items-center justify-center rounded-xl border transition-all duration-200 aspect-square",
                          frequency === 'monthly' ? "py-4" : "py-2",
                          inst.isPaid 
                            ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200" 
                            : "bg-white border-slate-200 text-slate-400 hover:border-primary-300 hover:text-primary-600 hover:shadow-sm",
                          isProcessing && "opacity-50 cursor-wait scale-95"
                        )}
                      >
                        {isProcessing ? (
                            <Loader2 size={14} className="animate-spin" />
                        ) : inst.isPaid ? (
                            <CheckCircle size={frequency === 'monthly' ? 20 : 16} strokeWidth={3} />
                        ) : (
                            <span className={clsx("font-bold", frequency === 'monthly' ? "text-sm" : "text-xs")}>{label}</span>
                        )}
                      </button>
                    );
                  })}
               </div>
            </Card>
          </div>
        )}

        {/* RIGHT COLUMN: STATS & CHANDA */}
        <div className={clsx("space-y-6", frequency === 'none' && "lg:col-span-3")}>
           
           {/* FINANCIAL SUMMARY */}
           <div className="grid grid-cols-2 gap-4">
               <Card noPadding className="bg-slate-50 border-slate-100 p-4">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Paid</p>
                   <p className="text-xl font-bold text-emerald-600 font-mono">₹{totalContribution.toLocaleString()}</p>
               </Card>
               {frequency !== 'none' && (
                   <Card noPadding className="bg-slate-50 border-slate-100 p-4">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Current Due</p>
                       <p className={clsx("text-xl font-bold font-mono", stats.subDue > 0 ? "text-rose-500" : "text-slate-400")}>
                           ₹{stats.subDue.toLocaleString()}
                       </p>
                   </Card>
               )}
           </div>

           {/* CHANDA HISTORY */}
           <Card className="min-h-[300px]">
              <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-slate-800 flex items-center gap-2">
                   <IndianRupee className="text-rose-500" size={18} /> Puja Fees
                 </h3>
              </div>

              {chandaHistory.length === 0 ? (
                 <div className="text-center py-8 text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    <p className="text-xs font-medium">No extra fees recorded.</p>
                 </div>
              ) : (
                 <div className="space-y-0 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-100" />
                    
                    {chandaHistory.map((fee) => (
                       <div key={fee._id} className="relative pl-8 py-3 group">
                          <div className="absolute left-2 top-4 w-3.5 h-3.5 bg-white border-2 border-rose-200 rounded-full group-hover:border-rose-500 transition-colors" />
                          
                          <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm font-bold text-slate-700">Festival Payment</p>
                                <p className="text-[10px] text-slate-400">{new Date(fee.createdAt).toLocaleDateString()}</p>
                              </div>
                              <span className="text-sm font-bold font-mono text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                                + ₹{fee.amount}
                              </span>
                          </div>
                          {fee.notes && <p className="text-xs text-slate-400 mt-1 italic">"{fee.notes}"</p>}
                       </div>
                    ))}
                 </div>
              )}
           </Card>

           {/* CONTACT CARD */}
           <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                 <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                    <Phone size={20} />
                 </div>
                 <div>
                    <h4 className="font-bold text-sm">Contact Member</h4>
                    <p className="text-slate-400 text-xs">For dues or updates</p>
                 </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                  <a href={`tel:${member.phone}`} className="py-2 bg-white text-slate-900 rounded-lg text-xs font-bold text-center hover:bg-slate-100 transition">
                      Call
                  </a>
                  <a href={`sms:${member.phone}`} className="py-2 bg-white/10 text-white rounded-lg text-xs font-bold text-center hover:bg-white/20 transition">
                      Message
                  </a>
              </div>
           </div>
        </div>

      </div>

      {/* MODALS */}
      {showChandaModal && (
         <AddPujaModal 
           onClose={() => setShowChandaModal(false)} 
           refresh={fetchData} 
           preSelectedMemberId={member.userId} 
         />
      )}
    </div>
  );
}