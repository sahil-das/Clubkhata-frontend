import React, { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { Button } from "../ui/Button"; 
import { useAuth } from "../../context/AuthContext"; 
import { exportPurchaseOrderPDF } from "../../utils/pdfExport"; 
import { deleteRentalPayment } from "../../api/rentals"; 
import { toast } from "react-hot-toast";
import { 
  Calendar, Phone, MapPin, Package, Printer, Trash2, 
  CreditCard, Banknote, CheckCircle2, AlertTriangle, XCircle
} from "lucide-react";

export default function OrderDetailsModal({ isOpen, onClose, order: initialOrder, onUpdate, canManage }) {
  const { activeClub } = useAuth();
  const [order, setOrder] = useState(initialOrder); 
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("items"); // 'items' | 'payments'

  // Sync prop changes to local state
  useEffect(() => { setOrder(initialOrder); }, [initialOrder]);

  if (!order) return null;

  const totalBill = order.totalEstimatedAmount || 0;
  const paid = order.advancePaid || 0;
  const due = totalBill - paid;
  
  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : "-";

  const handleDownloadPO = () => {
    exportPurchaseOrderPDF({ 
        clubName: activeClub?.clubName || "Club Committee", 
        order 
    });
  };

  const handleDeletePayment = async (paymentId) => {
      if(!window.confirm("Are you sure? This will also delete the linked expense record.")) return;
      setLoading(true);
      try {
          const res = await deleteRentalPayment(order._id, paymentId);
          setOrder(res.data); // Update local modal data
          if(onUpdate) onUpdate(); // Refresh parent dashboard
          toast.success("Payment record deleted");
      } catch (e) {
          toast.error("Failed to delete payment");
      } finally {
          setLoading(false);
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Order Details" maxWidth="max-w-2xl">
      <div className="space-y-4">
        
        {/* --- HEADER SUMMARY --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl border dark:border-slate-700">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {order.vendor?.name}
              <span className="text-xs font-bold px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                {order.vendor?.category}
              </span>
            </h3>
            <div className="flex flex-col gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
               <span className="flex items-center gap-2"><Phone size={14}/> {order.vendor?.phone}</span>
               {order.vendor?.address && <span className="flex items-center gap-2"><MapPin size={14}/> {order.vendor?.address}</span>}
            </div>
          </div>
          
          <div className="text-right">
             <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Bill</p>
             <div className="text-2xl font-bold text-gray-800 dark:text-white">₹{totalBill.toLocaleString()}</div>
             <div className={`text-sm font-bold mt-1 ${due > 0 ? "text-red-500" : "text-green-600"}`}>
                {due > 0 ? `Due: ₹${due.toLocaleString()}` : "Fully Paid"}
             </div>
          </div>
        </div>

        {/* --- TABS --- */}
        <div className="flex gap-2 border-b dark:border-slate-700">
            <button 
                onClick={() => setActiveTab("items")} 
                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "items" ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
            >
                Items ({order.items.length})
            </button>
            <button 
                onClick={() => setActiveTab("payments")} 
                className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors ${activeTab === "payments" ? "border-blue-500 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"}`}
            >
                Payment Passbook ({order.payments?.length || 0})
            </button>
        </div>

        {/* --- TAB CONTENT: ITEMS --- */}
        {activeTab === "items" && (
            <div className="border dark:border-slate-700 rounded-xl overflow-hidden animate-in fade-in">
                <div className="bg-gray-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-gray-500 uppercase flex justify-between">
                    <span>Item Breakdown</span>
                    <span>Qty Details</span>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-800 max-h-60 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                    {order.items.map((item, i) => (
                        <div key={i} className="p-3 text-sm flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                            <div>
                                <p className="font-bold text-gray-800 dark:text-gray-200">{item.itemName}</p>
                                <p className="text-xs text-gray-500">
                                    Rate: ₹{item.rate} x {item.days} days = <span className="font-semibold text-gray-600 dark:text-gray-400">₹{item.totalCost}</span>
                                </p>
                            </div>
                            
                            {/* Status Chips */}
                            <div className="flex flex-wrap gap-2 text-xs font-medium">
                                <span className="px-2 py-1 rounded bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-slate-600">
                                    Ord: {item.quantity}
                                </span>
                                
                                {item.receivedQuantity > 0 && (
                                    <span className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                        Recv: {item.receivedQuantity}
                                    </span>
                                )}
                                
                                {item.returnedQuantity > 0 && (
                                    <span className="flex items-center gap-1 px-2 py-1 rounded bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800">
                                        <CheckCircle2 size={10}/> Ret: {item.returnedQuantity}
                                    </span>
                                )}
                                
                                {(item.damagedQuantity > 0) && (
                                    <span className="flex items-center gap-1 px-2 py-1 rounded bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-800">
                                        <AlertTriangle size={10}/> Dmg: {item.damagedQuantity}
                                    </span>
                                )}
                                
                                {(item.lostQuantity > 0) && (
                                    <span className="flex items-center gap-1 px-2 py-1 rounded bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-800">
                                        <XCircle size={10}/> Lost: {item.lostQuantity}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* --- TAB CONTENT: PAYMENTS --- */}
        {activeTab === "payments" && (
            <div className="border dark:border-slate-700 rounded-xl overflow-hidden animate-in fade-in">
                <div className="bg-gray-100 dark:bg-slate-800 px-4 py-2 text-xs font-bold text-gray-500 uppercase grid grid-cols-12 gap-2">
                    <div className="col-span-3">Date</div>
                    <div className="col-span-3">Mode</div>
                    <div className="col-span-4 text-right">Amount</div>
                    <div className="col-span-2 text-center">Action</div>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-slate-800 max-h-60 overflow-y-auto custom-scrollbar bg-white dark:bg-slate-900">
                    {(!order.payments || order.payments.length === 0) ? (
                        <div className="p-8 text-center text-gray-400 text-sm">No payments recorded yet.</div>
                    ) : (
                        order.payments.map((pay) => (
                            <div key={pay._id} className="grid grid-cols-12 gap-2 p-3 text-sm items-center hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                                <div className="col-span-3 text-gray-600 dark:text-gray-300 font-medium">
                                    {new Date(pay.date).toLocaleDateString('en-IN', {day: 'numeric', month: 'short'})}
                                </div>
                                <div className="col-span-3 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                                    {pay.mode === 'Cash' ? <Banknote size={12}/> : <CreditCard size={12}/>}
                                    {pay.mode}
                                </div>
                                <div className="col-span-4 text-right font-bold text-green-600 dark:text-green-400">
                                    ₹{pay.amount.toLocaleString()}
                                </div>
                                <div className="col-span-2 text-center">
                                    {/* 🔒 Protected Action: Only Admins can delete payments */}
                                    {canManage && (
                                        <button 
                                            onClick={() => handleDeletePayment(pay._id)}
                                            disabled={loading}
                                            className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                            title="Delete Payment"
                                        >
                                            <Trash2 size={14}/>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                {/* Total Paid Footer */}
                <div className="bg-gray-50 dark:bg-slate-800 p-3 text-right text-sm border-t dark:border-slate-700">
                    <span className="text-gray-500 mr-2">Total Paid:</span>
                    <span className="font-bold text-green-600 dark:text-green-400">₹{paid.toLocaleString()}</span>
                </div>
            </div>
        )}

        {/* --- FOOTER ACTIONS --- */}
        <div className="flex justify-between items-center pt-2">
            <Button onClick={handleDownloadPO} variant="outline" size="sm" className="flex items-center gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-400 dark:hover:bg-indigo-900/20">
                <Printer size={14} /> Download PO
            </Button>
            
            <Button onClick={onClose} variant="secondary">
                Close
            </Button>
        </div>
      </div>
    </Modal>
  );
}