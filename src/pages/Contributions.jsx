import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useFinance } from "../context/FinanceContext";
import { 
  Check, 
  ChevronDown, 
  ChevronRight, 
  AlertCircle,
  Loader2,
  FileText,
  CreditCard,
  IndianRupee,
  Lock
} from "lucide-react";
import { exportWeeklyAllMembersPDF } from "../utils/exportWeeklyAllMembersPDF";

export default function Contributions() {
  const { user, activeClub } = useAuth(); 
  const { fetchCentralFund } = useFinance();

  const [members, setMembers] = useState([]);
  const [cycle, setCycle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [processing, setProcessing] = useState(null);

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 1. Get Active Cycle
        const yearRes = await api.get("/years/active");
        const activeYear = yearRes.data.data;
        
        if (!activeYear) {
            setLoading(false);
            return;
        }

        // Add calculated fields
        const cycleData = {
            ...activeYear,
            subscriptionFrequency: activeYear.subscriptionFrequency || 'weekly',
            totalInstallments: activeYear.totalInstallments || 52,
            amountPerInstallment: activeYear.amountPerInstallment || 0
        };
        setCycle(cycleData);

        // 2. Get All Members
        const memberRes = await api.get("/members");
        const memberList = memberRes.data.data;

        // 3. Fetch Subscriptions
        const membersWithSubs = await Promise.all(
          memberList.map(async (m) => {
            try {
              const subRes = await api.get(`/subscriptions/member/${m.membershipId}`);
              return {
                ...m,
                subscription: subRes.data.data.subscription, 
              };
            } catch (error) {
              return { ...m, subscription: null };
            }
          })
        );

        setMembers(membersWithSubs);
      } catch (err) {
        console.error("Contributions Load Error", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* ================= CALCULATE TOTAL ================= */
  const totalCollected = members.reduce((sum, m) => {
      return sum + (m.subscription?.totalPaid || 0);
  }, 0);

  /* ================= HANDLERS ================= */
  const toggleExpand = (id) =>
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const handlePayment = async (memberId, subscriptionId, installmentNumber, currentStatus) => {
    if (activeClub?.role !== "admin") return;
    if (processing) return;

    setProcessing(`${memberId}-${installmentNumber}`);

    try {
      const res = await api.post("/subscriptions/pay", {
        subscriptionId,
        installmentNumber
      });

      // Optimistic UI Update
      setMembers((prev) =>
        prev.map((m) => {
          if (m.membershipId !== memberId) return m; 
          return {
            ...m,
            subscription: res.data.data 
          };
        })
      );

      fetchCentralFund();

    } catch (err) {
      alert("Payment failed: " + (err.response?.data?.message || err.message));
    } finally {
      setProcessing(null);
    }
  };

  const handleExport = () => {
      if (!cycle || members.length === 0) return;
      
      const exportData = members
        .filter(m => m.subscription) 
        .map(m => ({
            id: m.membershipId,
            name: m.name,
            payments: m.subscription.installments
                .filter(i => i.isPaid)
                .map(i => ({ week: i.number, date: i.paidDate })) 
        }));

      exportWeeklyAllMembersPDF({
          clubName: activeClub?.clubName || "Club Report",
          members: exportData,
          totalWeeks: cycle.totalInstallments,
          weekAmount: cycle.amountPerInstallment
      });
  };

  /* ================= HELPERS ================= */
  const visibleMembers = activeClub?.role === "admin"
      ? members
      : members.filter((m) => m.email === user.email);

  const getLabel = (num) => {
    if (cycle?.subscriptionFrequency === 'monthly') {
       const date = new Date();
       date.setMonth(num - 1);
       return date.toLocaleString('default', { month: 'short' });
    }
    return `W${num}`;
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-indigo-600">
        <Loader2 className="w-10 h-10 animate-spin mb-4" />
        <p className="text-sm font-medium animate-pulse">Loading Subscriptions...</p>
      </div>
    );
  }

  if (!cycle) {
    // Admin view - Show alert to create year
    if (activeClub?.role === "admin") {
      return (
        <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100 mt-6">
          <AlertCircle className="mx-auto mb-2" size={32} />
          <p className="font-bold text-lg">No Active Financial Year found.</p>
          <p className="text-sm mt-1">Please create a new festival year in the Dashboard settings.</p>
        </div>
      );
    }

    // Member view - Show locked message
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <Lock className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-700">Financial Year Closed</h2>
        <p className="text-gray-500 max-w-md mt-2">
          The committee has closed the accounts for the previous year. 
          Please wait for the admin to start the new session.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      
      {/* 1. HEADER & INFO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-gray-100 pb-6">
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <CreditCard className="text-indigo-600" /> 
                {cycle.subscriptionFrequency === 'monthly' ? "Monthly Subscriptions" : "Weekly Subscriptions"}
            </h1>
            <p className="text-gray-500 text-sm mt-1">
                Active Cycle: <span className="font-semibold text-gray-700">{cycle.name}</span>
            </p>
        </div>
        
        <div className="flex flex-wrap gap-3 items-center">
             
             {/* ✅ TOTAL COLLECTED BADGE */}
             <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm border border-emerald-100 flex items-center gap-2">
                <IndianRupee size={16} /> Total: {totalCollected.toLocaleString()}
             </div>

             {/* RATE BADGE */}
             <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm border border-indigo-100">
                Rate: ₹{cycle.amountPerInstallment} / {cycle.subscriptionFrequency.slice(0, -2)}
             </div>

             {/* EXPORT BUTTON */}
             {activeClub?.role === "admin" && (
                <button 
                    onClick={handleExport}
                    className="bg-gray-800 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-700 flex items-center gap-2 shadow-lg shadow-gray-200 transition-all"
                >
                    <FileText size={16} /> Export PDF
                </button>
             )}
        </div>
      </div>

      {/* 2. MEMBER LIST */}
      <div className="space-y-4">
        {visibleMembers.map((m) => {
          if (!m.subscription) return null;

          const isOpen = expanded[m.membershipId];
          const memberTotalPaid = m.subscription.installments.filter(i => i.isPaid).length;
          const progress = (memberTotalPaid / cycle.totalInstallments) * 100;
          const isComplete = memberTotalPaid === cycle.totalInstallments;

          return (
            <div key={m.membershipId} className={`
                bg-white rounded-xl shadow-sm border transition-all duration-300
                ${isComplete ? 'border-emerald-200 bg-emerald-50/10' : 'border-gray-100 hover:border-indigo-200'}
            `}>
              
              {/* Card Header */}
              <button
                onClick={() => toggleExpand(m.membershipId)}
                className="w-full p-5 flex justify-between items-center hover:bg-gray-50 transition-colors rounded-xl"
              >
                <div className="flex items-center gap-4">
                   <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm
                        ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}
                   `}>
                        {m.name.charAt(0)}
                   </div>
                   
                   <div className="text-left">
                        <p className="font-bold text-gray-800">{m.name}</p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                            Status: 
                            <span className={`ml-1 ${isComplete ? 'text-emerald-600 font-bold' : 'text-indigo-600'}`}>
                                {memberTotalPaid} / {cycle.totalInstallments} Paid
                            </span>
                        </p>
                   </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:block w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`} 
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    {isOpen ? <ChevronDown className="text-gray-400" /> : <ChevronRight className="text-gray-400" />}
                </div>
              </button>

              {/* Collapsible Grid */}
              {isOpen && (
                <div className="px-5 pb-6 pt-2 border-t border-gray-50 animate-in fade-in slide-in-from-top-1">
                    <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
                        {m.subscription.installments.map((inst) => {
                            const isProcessing = processing === `${m.membershipId}-${inst.number}`;
                            
                            return (
                                <button
                                    key={inst.number}
                                    disabled={activeClub?.role !== 'admin' || isProcessing}
                                    onClick={() => handlePayment(m.membershipId, m.subscription._id, inst.number, inst.isPaid)}
                                    className={`
                                        relative flex items-center justify-center h-10 rounded-lg border transition-all duration-200
                                        ${inst.isPaid 
                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm hover:bg-emerald-600' 
                                            : 'bg-white border-gray-200 text-gray-400 hover:border-indigo-300 hover:text-indigo-500'
                                        }
                                        ${activeClub?.role !== 'admin' ? 'cursor-default opacity-90' : 'cursor-pointer'}
                                    `}
                                    title={inst.isPaid ? `Paid: ${new Date(inst.paidDate).toLocaleDateString()}` : "Unpaid"}
                                >
                                    {isProcessing ? (
                                        <Loader2 size={14} className="animate-spin" />
                                    ) : inst.isPaid ? (
                                        <Check size={16} strokeWidth={3} />
                                    ) : (
                                        <span className="text-[10px] font-bold">{getLabel(inst.number)}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                    
                    {activeClub?.role === 'admin' && (
                        <p className="text-[10px] text-gray-400 mt-3 text-center italic">
                            Tap any box to mark as Paid/Unpaid. Changes save instantly.
                        </p>
                    )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}