import { useEffect, useState } from "react";
import api from "../api/axios";
import { 
  Archive, Calendar, ChevronRight, Download, Lock, Loader2, TrendingUp, TrendingDown 
} from "lucide-react";
import { exportFinancialReportPDF } from "../utils/exportFinancialReportPDF"; 

export default function Archives() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(null);
  const [yearDetails, setYearDetails] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    fetchClosedYears();
  }, []);

  const fetchClosedYears = async () => {
    try {
      const res = await api.get("/archives");
      setYears(res.data.data);
    } catch (err) {
      console.error("Failed to load archives", err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewYear = async (year) => {
    if (selectedYear?._id === year._id) {
      setSelectedYear(null);
      setYearDetails(null);
      return;
    }
    
    setSelectedYear(year);
    setDetailLoading(true);

    try {
      const res = await api.get(`/archives/${year._id}`);
      setYearDetails(res.data.data);
    } catch (err) {
      console.error("Failed to load year details", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleExport = () => {
    if (!selectedYear || !yearDetails) return;
    
    const { summary, records, info } = yearDetails;

    // ✅ Pass 'frequency' to the PDF generator
    exportFinancialReportPDF({
      clubName: "Club Archive Record",
      year: selectedYear.name,
      openingBalance: summary.openingBalance,
      totalIncome: summary.income.total,
      totalExpense: summary.expense,
      netBalance: summary.netBalance,
      frequency: info.subscriptionFrequency, // <-- IMPORTANT
      
      incomeSources: {
        weekly: summary.income.subscriptions,
        puja: summary.income.fees,
        donation: summary.income.donations
      },
      
      details: {
        expenses: records.expenses,
        donations: records.donations,
        puja: records.fees
      }
    });
  };

  // Helper to determine label
  const getSubLabel = (freq) => {
    if (freq === "monthly") return "Subscriptions (Monthly)";
    if (freq === "weekly") return "Subscriptions (Weekly)";
    return null; // Hidden
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-gray-800 text-white rounded-xl shadow-lg">
           <Archive size={24} />
        </div>
        <div>
           <h1 className="text-2xl font-bold text-gray-800">Archives</h1>
           <p className="text-gray-500 text-sm">Records of previous festival years.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="animate-spin text-indigo-600" /></div>
      ) : years.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
           <p className="text-gray-500">No closed years found yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {years.map((year) => (
            <div key={year._id} className={`bg-white rounded-2xl border transition-all overflow-hidden ${selectedYear?._id === year._id ? 'border-indigo-500 shadow-lg' : 'border-gray-200 shadow-sm hover:border-indigo-300'}`}>
               
               {/* YEAR CARD HEADER */}
               <div 
                 onClick={() => handleViewYear(year)}
                 className="p-5 flex items-center justify-between cursor-pointer bg-white hover:bg-gray-50 transition-colors"
               >
                  <div className="flex items-center gap-4">
                     <div className={`p-3 rounded-full ${selectedYear?._id === year._id ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>
                        <Calendar size={20} />
                     </div>
                     <div>
                        <h3 className="font-bold text-lg text-gray-800">{year.name}</h3>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                           {new Date(year.startDate).getFullYear()} • 
                           <span className="flex items-center gap-1 text-emerald-600 font-medium">
                              <Lock size={10} /> Closed
                           </span>
                        </p>
                     </div>
                  </div>

                  <div className="text-right hidden sm:block">
                     <p className="text-xs font-bold text-gray-400 uppercase">Closing Balance</p>
                     <p className="font-mono font-bold text-xl text-gray-700">Rs. {year.closingBalance?.toLocaleString('en-IN')}</p>
                  </div>
                  
                  <ChevronRight size={20} className={`text-gray-400 transition-transform ${selectedYear?._id === year._id ? 'rotate-90' : ''}`} />
               </div>

               {/* EXPANDED DETAILS PANEL */}
               {selectedYear?._id === year._id && (
                  <div className="bg-gray-50 border-t border-gray-100 p-6 animate-in slide-in-from-top-2">
                     {detailLoading || !yearDetails ? (
                        <div className="flex justify-center py-4"><Loader2 className="animate-spin text-indigo-600" /></div>
                     ) : (
                        <div className="space-y-6">
                           
                           {/* 1. KEY METRICS */}
                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              <DetailBox label="Opening Balance" amount={yearDetails.summary.openingBalance} />
                              <DetailBox label="Total Income" amount={yearDetails.summary.income.total} color="text-emerald-600" icon={<TrendingUp size={14}/>} />
                              <DetailBox label="Total Expenses" amount={yearDetails.summary.expense} color="text-rose-600" icon={<TrendingDown size={14}/>} />
                              <DetailBox label="Net Balance" amount={yearDetails.summary.netBalance} isBold color="text-indigo-600" />
                           </div>

                           {/* 2. BREAKDOWN TABLES */}
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-700 mb-2 border-b pb-2">Income Sources</h4>
                                    <div className="space-y-2 mt-2">
                                        {/* ✅ DYNAMIC SUBSCRIPTION ROW */}
                                        {getSubLabel(yearDetails.info.subscriptionFrequency) && (
                                            <Row 
                                              label={getSubLabel(yearDetails.info.subscriptionFrequency)} 
                                              value={yearDetails.summary.income.subscriptions} 
                                            />
                                        )}
                                        <Row label="Puja Fees" value={yearDetails.summary.income.fees} />
                                        <Row label="Donations" value={yearDetails.summary.income.donations} />
                                    </div>
                                </div>
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-700 mb-2 border-b pb-2">Record Counts</h4>
                                    <div className="space-y-2 mt-2">
                                        <Row label="Expense Bills" value={yearDetails.records.expenses.length} isCount />
                                        <Row label="Fee Records" value={yearDetails.records.fees.length} isCount />
                                        <Row label="Donations" value={yearDetails.records.donations.length} isCount />
                                    </div>
                                </div>
                           </div>

                           {/* 3. EXPORT BUTTON */}
                           <div className="flex justify-end pt-4 border-t border-gray-200">
                              <button 
                                onClick={handleExport}
                                className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-indigo-50 hover:border-indigo-200 transition shadow-sm active:scale-95"
                              >
                                 <Download size={16} /> Download Full Report
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               )}

            </div>
          ))}
        </div>
      )}

    </div>
  );
}

// --- HELPER COMPONENTS ---

function DetailBox({ label, amount, color, isBold, icon }) {
   return (
      <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
         <p className="text-[10px] font-bold text-gray-400 uppercase flex items-center gap-1 mb-1">
            {icon} {label}
         </p>
         <p className={`font-mono text-lg ${isBold ? 'font-black' : 'font-medium'} ${color || 'text-gray-600'}`}>
            Rs. {(amount || 0).toLocaleString('en-IN')}
         </p>
      </div>
   )
}

function Row({ label, value, isCount }) {
    return (
        <div className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
            <span className="text-gray-500 font-medium">{label}</span>
            <span className="font-mono font-bold text-gray-700">
                {isCount ? value : `Rs. ${value.toLocaleString('en-IN')}`}
            </span>
        </div>
    )
}