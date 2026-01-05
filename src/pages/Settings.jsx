import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  Save, AlertTriangle, CheckCircle, PlusCircle, Lock, Calculator, Calendar, 
  Loader2, Edit3, X, Clock, Coins, ShieldAlert, Power 
} from "lucide-react";
import { clsx } from "clsx";

// Design System
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

export default function Settings() {
  const { activeClub } = useAuth(); 
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  
  // UI States
  const [isEditing, setIsEditing] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [closeInput, setCloseInput] = useState("");
  
  // Data States
  const [activeYearId, setActiveYearId] = useState(null);
  const [noActiveCycle, setNoActiveCycle] = useState(false);
  const [hasExistingPayments, setHasExistingPayments] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    startDate: "",
    endDate: "",
    subscriptionFrequency: "weekly",
    amountPerInstallment: 0,
    totalInstallments: 52,
    openingBalance: 0,
  });

  /* ================= LOAD SETTINGS ================= */
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get("/years/active");
      const d = res.data.data;
      
      const financeRes = await api.get("/finance/summary");
      const collectedAmount = financeRes.data.data.weeklyTotal || 0;

      if (d) {
        setNoActiveCycle(false);
        setActiveYearId(d._id);
        setHasExistingPayments(collectedAmount > 0);
        setIsEditing(false);
        
        setFormData({
          name: d.name,
          startDate: d.startDate ? d.startDate.slice(0, 10) : "",
          endDate: d.endDate ? d.endDate.slice(0, 10) : "",
          subscriptionFrequency: d.subscriptionFrequency || "weekly",
          amountPerInstallment: d.amountPerInstallment || 0,
          totalInstallments: d.totalInstallments || 52,
          openingBalance: d.openingBalance || 0,
        });
      }
    } catch (err) {
      setNoActiveCycle(true);
      setIsEditing(true); 
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, startDate: today, name: `New Year ${new Date().getFullYear()}` }));
    } finally {
      setLoading(false);
    }
  };

  /* ================= HANDLERS ================= */
  const handleFrequencyChange = (newFreq) => {
    let newInstallments = formData.totalInstallments;
    if (newFreq === 'weekly') newInstallments = 52;
    if (newFreq === 'monthly') newInstallments = 12;
    if (newFreq === 'none') newInstallments = 0;

    setFormData({ 
        ...formData, 
        subscriptionFrequency: newFreq,
        totalInstallments: newInstallments 
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (activeClub?.role !== 'admin') return;

    setLoading(true);
    try {
      if (noActiveCycle) {
        await api.post("/years", formData);
        setMessage({ type: "success", text: "New Festival Year Started!" });
      } else {
        await api.put(`/years/${activeYearId}`, formData);
        setMessage({ type: "success", text: "Settings updated successfully!" });
      }
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Operation failed" });
      setLoading(false);
    }
  };

  const handleCloseYear = async () => {
    if (activeClub?.role !== 'admin' || closeInput !== "CLOSE") return;
    try {
      setLoading(true);
      await api.post(`/years/${activeYearId}/close`);
      window.location.reload(); 
    } catch (err) {
      setMessage({ type: "error", text: "Failed to close year" });
      setLoading(false);
    }
  };

  const getFrequencyLabel = (freq) => {
    if (freq === 'weekly') return 'Weekly Subscription';
    if (freq === 'monthly') return 'Monthly Subscription';
    return 'Donation Based (No Recurring)';
  };

  const totalExpected = formData.amountPerInstallment * formData.totalInstallments;

  if (loading && !formData.name) return <div className="h-64 flex items-center justify-center"><Loader2 className="animate-spin text-primary-600"/></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">System Settings</h2>
          <p className="text-slate-500 text-sm">
            {noActiveCycle ? "Setup a new financial year." : "Manage active cycle configuration."}
          </p>
        </div>
        
        {!noActiveCycle && !isEditing && activeClub?.role === "admin" && (
          <Button 
            onClick={() => setIsEditing(true)}
            leftIcon={<Edit3 size={18} />}
          >
             Edit Configuration
          </Button>
        )}
      </div>

      {message && (
        <div className={clsx(
            "p-4 rounded-xl flex items-center gap-3 shadow-sm border animate-slide-up",
            message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
        )}>
          {message.type === "success" ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
          <span className="font-medium text-sm">{message.text}</span>
        </div>
      )}

      {/* ==================== VIEW MODE (READ ONLY) ==================== */}
      {!isEditing && !noActiveCycle && (
        <div className="space-y-6">
            {/* Main Info Card */}
            <Card className="overflow-hidden border-slate-200" noPadding>
                <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-200 uppercase tracking-wider">
                        Active Year
                        </span>
                        <span className="text-slate-400 text-sm font-medium flex items-center gap-1">
                        <Clock size={14}/> {new Date(formData.startDate).getFullYear()}
                        </span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{formData.name}</h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2">
                    <div className="p-8 space-y-8 border-r border-slate-100">
                         <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Duration</label>
                            <div className="flex items-center gap-2 text-slate-700 font-medium bg-slate-50 inline-flex px-3 py-1.5 rounded-lg border border-slate-100">
                                <Calendar size={16} className="text-slate-400"/>
                                {new Date(formData.startDate).toLocaleDateString()} 
                                <span className="text-slate-300">➝</span>
                                {new Date(formData.endDate).toLocaleDateString()}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-slate-400 uppercase block mb-1">Collection Rule</label>
                            <p className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                {getFrequencyLabel(formData.subscriptionFrequency)}
                            </p>
                            {formData.subscriptionFrequency !== 'none' && (
                                <p className="text-sm text-slate-500 mt-1">
                                {formData.totalInstallments} installments of <span className="text-primary-600 font-bold">₹{formData.amountPerInstallment}</span> each.
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50/30 flex flex-col justify-center items-center text-center">
                        {formData.subscriptionFrequency !== 'none' ? (
                            <>
                                <div className="w-16 h-16 bg-primary-50 text-primary-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                                    <Coins size={32} />
                                </div>
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Projected Revenue</p>
                                <p className="text-3xl font-bold text-slate-800 tracking-tight">₹ {totalExpected.toLocaleString()}</p>
                                <p className="text-xs text-slate-400 mt-1">Target per member</p>
                            </>
                        ) : (
                            <p className="text-sm text-slate-500 italic">No recurring revenue projection for donation-based events.</p>
                        )}
                    </div>
                </div>
            </Card>

            {/* DANGER ZONE */}
            {activeClub?.role === "admin" && (
                <Card className="border-red-100 shadow-none overflow-hidden" noPadding>
                     <div className="bg-red-50/50 p-6 border-b border-red-100 flex items-start gap-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-xl shrink-0">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-red-900">Danger Zone</h3>
                            <p className="text-sm text-red-600/80 mt-1">
                                Closing the financial year is irreversible. It will freeze all current data and archive it.
                            </p>
                        </div>
                     </div>
                     <div className="p-6 bg-red-50/20">
                        {!showCloseConfirm ? (
                            <Button 
                                variant="danger" 
                                onClick={() => setShowCloseConfirm(true)}
                                leftIcon={<Power size={18} />}
                            >
                                Close Financial Year
                            </Button>
                        ) : (
                            <div className="flex items-end gap-3 animate-slide-up">
                                <div className="flex-1">
                                    <label className="text-xs font-bold text-red-700 mb-1 block">Type "CLOSE" to confirm</label>
                                    <Input 
                                        value={closeInput}
                                        onChange={(e) => setCloseInput(e.target.value)}
                                        placeholder="CLOSE"
                                        className="border-red-200 focus:border-red-500 focus:ring-red-200"
                                    />
                                </div>
                                <Button 
                                    variant="danger" 
                                    onClick={handleCloseYear}
                                    disabled={closeInput !== "CLOSE"}
                                    isLoading={loading}
                                >
                                    Confirm Closure
                                </Button>
                                <Button variant="ghost" onClick={() => setShowCloseConfirm(false)}>Cancel</Button>
                            </div>
                        )}
                     </div>
                </Card>
            )}
        </div>
      )}

      {/* ==================== EDIT/CREATE FORM ==================== */}
      {(isEditing || noActiveCycle) && (
        <Card className={noActiveCycle ? "border-primary-200 shadow-lg" : "border-slate-200"}>
          
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
            <h3 className="font-bold text-lg flex items-center gap-2 text-slate-800">
              {noActiveCycle ? <PlusCircle size={20} className="text-primary-600"/> : <Edit3 size={20} className="text-slate-500"/>}
              {noActiveCycle ? "Setup New Year" : "Edit Configuration"}
            </h3>
            {!noActiveCycle && (
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20}/>
              </button>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                    <Input 
                        label="Event Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Durga Puja 2026"
                        required
                    />
                </div>
                <div>
                    <Input 
                        type="date"
                        label="Start Date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <Input 
                        type="date"
                        label="End Date"
                        min={formData.startDate}
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                    />
                </div>
            </div>

            <div className="h-px bg-slate-100 my-4" />

            {/* Rules */}
            <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Lock size={14} className="text-slate-400"/> Financial Rules
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Frequency</label>
                        <select 
                            value={formData.subscriptionFrequency}
                            onChange={(e) => handleFrequencyChange(e.target.value)}
                            disabled={hasExistingPayments && !noActiveCycle}
                            className="w-full bg-white border border-slate-200 text-slate-900 text-sm rounded-xl py-3 px-4 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 disabled:bg-slate-50 disabled:text-slate-400"
                        >
                            <option value="weekly">Weekly Collection</option>
                            <option value="monthly">Monthly Collection</option>
                            <option value="none">No Recurring (Donations Only)</option>
                        </select>
                        {hasExistingPayments && !noActiveCycle && (
                            <p className="text-[10px] text-amber-600 mt-1 ml-1 flex items-center gap-1">
                                <Lock size={10} /> Locked due to existing payments
                            </p>
                        )}
                    </div>

                    {formData.subscriptionFrequency !== 'none' && (
                        <>
                            <Input 
                                type="number"
                                label="Amount per Installment"
                                value={formData.amountPerInstallment}
                                onChange={(e) => setFormData({ ...formData, amountPerInstallment: e.target.value })}
                                icon={Coins}
                                required
                            />
                            
                            {formData.subscriptionFrequency === 'weekly' ? (
                                <Input 
                                    type="number"
                                    label="Total Weeks"
                                    value={formData.totalInstallments}
                                    onChange={(e) => setFormData({ ...formData, totalInstallments: e.target.value })}
                                    required
                                />
                            ) : (
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-col justify-center">
                                    <span className="text-xs font-bold text-slate-400 uppercase">Duration</span>
                                    <span className="text-sm font-bold text-slate-700">12 Months (Fixed)</span>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Opening Balance (Only for new year) */}
            {noActiveCycle && (
                <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-100">
                    <Input 
                        type="number"
                        label="Opening Balance (Optional)"
                        value={formData.openingBalance}
                        onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
                        placeholder="0"
                        className="bg-white"
                    />
                </div>
            )}

            <div className="flex gap-3 pt-4">
                {!noActiveCycle && (
                    <Button variant="secondary" onClick={() => setIsEditing(false)} className="flex-1">
                        Cancel
                    </Button>
                )}
                <Button 
                    type="submit" 
                    isLoading={loading}
                    className="flex-1"
                    leftIcon={noActiveCycle ? <PlusCircle size={18} /> : <Save size={18} />}
                >
                    {noActiveCycle ? "Start Festival Year" : "Save Changes"}
                </Button>
            </div>

          </form>
        </Card>
      )}
    </div>
  );
}