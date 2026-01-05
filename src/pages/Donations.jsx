import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { 
  Plus, Search, Trash2, User, Phone, MapPin, IndianRupee, 
  Loader2, Receipt, Calendar, AlertCircle, Lock, Download, 
  Filter, ChevronDown, Heart 
} from "lucide-react";
import { clsx } from "clsx";

// Design System
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";
import { exportDonationsPDF } from "../utils/pdfExport"; 

export default function Donations() {
  const { activeClub } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cycle, setCycle] = useState(null);

  // Fetch Donations
  const fetchDonations = async () => {
    try {
      const yearRes = await api.get("/years/active");
      const activeYear = yearRes.data.data;
      
      if (!activeYear) {
        setLoading(false);
        return;
      }

      setCycle(activeYear);
      const res = await api.get("/donations");
      setDonations(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [activeClub]);

  // Calculate Total
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

  // Filter Logic
  const filteredDonations = useMemo(() => {
      return donations.filter(d => 
        d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.receiptNo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.phone?.includes(searchTerm)
      );
  }, [donations, searchTerm]);

  // Delete Handler
  const handleDelete = async (id) => {
    if(activeClub?.role !== "admin") return;
    if(!window.confirm("Delete this donation record? This will affect the total balance.")) return;
    try {
      await api.delete(`/donations/${id}`);
      setDonations(donations.filter(d => d._id !== id));
    } catch (err) {
      console.error("Failed to delete");
    }
  };

  if (loading) return <LoadingState />;
  if (!cycle) return <NoCycleState isAdmin={activeClub?.role === "admin"} />;

  return (
    <div className="space-y-6 pb-20 animate-fade-in relative">
      
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <div className="flex items-center gap-3">
             <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                <Heart size={24} fill="currentColor" className="opacity-80" />
             </div>
             <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Public Donations</h1>
           </div>
           <p className="text-slate-500 text-sm mt-1 ml-1">
             Collections for <span className="font-bold text-slate-700">{cycle.name}</span>
           </p>
        </div>
        
        <div className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            
            {/* TOTAL BADGE */}
            <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl sm:bg-transparent sm:p-0 sm:border-none sm:text-right flex justify-between sm:block items-center">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">Total Collected</p>
                <p className="text-xl sm:text-2xl font-bold font-mono text-amber-700">₹{totalAmount.toLocaleString()}</p>
            </div>
            
            <Button 
                onClick={() => setShowAddModal(true)}
                className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-200 border-none"
                leftIcon={<Plus size={18} />}
            >
                New Donation
            </Button>
        </div>
      </div>

      {/* 2. TOOLBAR */}
      <Card noPadding className="sticky top-20 z-10 shadow-sm border-slate-200">
        <div className="p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18}/>
                <input 
                    type="text" 
                    placeholder="Search donor, phone, receipt..." 
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Export */}
            <Button 
                variant="secondary" 
                size="sm"
                className="w-full sm:w-auto"
                onClick={() => exportDonationsPDF({ 
                    clubName: activeClub?.clubName, 
                    cycleName: cycle?.name, 
                    donations: filteredDonations 
                })}
            >
                <Download size={18} />
                <span className="ml-2">Export List</span>
            </Button>
        </div>
      </Card>

      {/* 3. DONATIONS LIST */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
         {filteredDonations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                <Filter size={48} className="mb-4 opacity-20"/>
                <p className="text-sm font-medium">No donations found</p>
            </div>
         ) : (
            <div className="w-full">
                {/* DESKTOP HEADER */}
                <div className="hidden md:grid grid-cols-12 bg-slate-50 p-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <div className="col-span-4 pl-2">Donor Details</div>
                    <div className="col-span-3">Receipt / Contact</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2 text-right">Amount</div>
                    <div className="col-span-1 text-right"></div>
                </div>

                {/* ROWS */}
                <div className="divide-y divide-slate-100">
                    {filteredDonations.map((d) => (
                        <div key={d._id} className="group p-4 flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-0 items-start md:items-center hover:bg-slate-50/50 transition-colors">
                            
                            {/* 1. Donor */}
                            <div className="col-span-4 pl-2 w-full">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm shrink-0">
                                     {d.donorName.charAt(0)}
                                   </div>
                                   <div>
                                     <h3 className="font-bold text-slate-800 text-sm md:text-base">{d.donorName}</h3>
                                     <div className="flex items-center gap-1 md:hidden text-xs text-slate-400 mt-0.5">
                                        <Calendar size={10}/> {new Date(d.date).toLocaleDateString()}
                                     </div>
                                     {d.address && <p className="text-xs text-slate-400 truncate max-w-[150px] hidden md:block">{d.address}</p>}
                                   </div>
                                </div>
                            </div>

                            {/* 2. Receipt/Contact (Desktop) */}
                            <div className="hidden md:block col-span-3">
                                {d.receiptNo && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-xs font-mono text-slate-600 mb-1">
                                        <Receipt size={10} /> {d.receiptNo}
                                    </span>
                                )}
                                {d.phone && <div className="text-xs text-slate-500">{d.phone}</div>}
                            </div>

                            {/* 3. Date (Desktop) */}
                            <div className="hidden md:block col-span-2 text-sm text-slate-500">
                                {new Date(d.date).toLocaleDateString()}
                            </div>

                            {/* 4. Amount */}
                            <div className="col-span-2 w-full md:text-right flex justify-between md:block items-center">
                                <span className="md:hidden text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-500">
                                    {d.receiptNo || "No Receipt"}
                                </span>
                                <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
                                    + ₹{d.amount.toLocaleString()}
                                </span>
                            </div>

                            {/* 5. Actions */}
                            <div className="col-span-1 w-full flex justify-end">
                                {activeClub?.role === "admin" && (
                                    <button 
                                        onClick={() => handleDelete(d._id)}
                                        className="p-2 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                                        title="Delete Record"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
         )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && <AddDonationModal onClose={() => setShowAddModal(false)} refresh={fetchDonations} />}
    </div>
  );
}

/* ================= HELPERS ================= */

function AddDonationModal({ onClose, refresh }) {
  const { register, handleSubmit } = useForm();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post("/donations", { ...data, amount: Number(data.amount) });
      refresh();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        
        <div className="bg-amber-500 px-6 py-4 flex justify-between items-center text-white">
          <div>
            <h2 className="text-lg font-bold flex items-center gap-2">
                <Receipt size={20} className="opacity-80"/> Record Donation
            </h2>
            <p className="text-amber-100 text-xs">Add amount to festival fund</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white transition">
              <ChevronDown className="rotate-180" size={24}/>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          
            <div>
                <Input 
                    label="Donor Name"
                    icon={User}
                    placeholder="e.g. Amit Store"
                    {...register("donorName", { required: true })}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Input 
                        label="Amount (₹)"
                        type="number"
                        icon={IndianRupee}
                        placeholder="500"
                        {...register("amount", { required: true })}
                    />
                </div>
                <div>
                    <Input 
                        label="Receipt No"
                        placeholder="Optional"
                        {...register("receiptNo")}
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Input 
                        label="Phone"
                        icon={Phone}
                        placeholder="Optional"
                        {...register("phone")}
                    />
                </div>
                <div>
                    <Input 
                        label="Address"
                        icon={MapPin}
                        placeholder="City/Area"
                        {...register("address")}
                    />
                </div>
            </div>

            <div className="pt-2">
                <Button 
                    type="submit" 
                    className="w-full bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-200 border-none"
                    isLoading={loading}
                >
                    Save Record
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}

function LoadingState() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center text-amber-500">
            <Loader2 className="animate-spin w-10 h-10"/>
        </div>
    );
}

function NoCycleState({ isAdmin }) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
            <div className="bg-slate-100 p-6 rounded-3xl mb-6 shadow-inner">
                {isAdmin ? <AlertCircle className="w-12 h-12 text-slate-400" /> : <Lock className="w-12 h-12 text-slate-400" />}
            </div>
            <h2 className="text-2xl font-bold text-slate-800">No Active Year</h2>
            <p className="text-slate-500 max-w-md mt-2 leading-relaxed">
                {isAdmin 
                    ? "Start a new festival year to accept donations." 
                    : "Donations are closed until the next session begins."}
            </p>
        </div>
    );
}