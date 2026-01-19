import { useState, useEffect, useRef } from "react";
import { useYear } from "../context/YearContext";
import { useAuth } from "../context/AuthContext"; 
import { getOrders, updateOrderStatus, recordRentalPayment, deleteOrder, getVendors, deleteVendor } from "../api/rentals";
import { getFestivalYears } from "../api/years"; 
import { Button } from "../components/ui/Button"; 
import { Card } from "../components/ui/Card"; 
import { Input } from "../components/ui/Input"; 
import Modal from "../components/ui/Modal"; 
import ConfirmModal from "../components/ui/ConfirmModal"; 

// Import Modals
import AddVendorModal from "../components/rentals/AddVendorModal";
import CreateOrderModal from "../components/rentals/CreateOrderModal";
import ReceiveItemsModal from "../components/rentals/ReceiveItemsModal";
import ReturnItemsModal from "../components/rentals/ReturnItemsModal";
import OrderDetailsModal from "../components/rentals/OrderDetailsModal";
import CreateYearModal from "../components/CreateYearModal"; 

import { 
  Calendar, Trash2, Edit, CheckSquare, PackageCheck, Archive, DollarSign, 
  Ban, Users, ShoppingBag, Phone, MapPin, Eye, MoreVertical, 
  CheckCircle2, PlusCircle, Lock
} from "lucide-react";
import { toast } from "react-hot-toast";

// --- Sub-Component: Action Menu ---
const ActionMenu = ({ onEdit, onDelete, onCancel, status, canManage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // 🔒 If user can't manage, don't render anything
    if (!canManage) return null;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const isEditable = status !== "Cancelled" && status !== "Completed";

    return (
        <div className="relative" ref={menuRef}>
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
                <MoreVertical size={20} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-100 dark:border-slate-700 z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="py-1">
                        {isEditable && (
                            <>
                                <button onClick={() => { onEdit(); setIsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 flex items-center gap-2">
                                    <Edit size={14} /> Edit Order
                                </button>
                                <button onClick={() => { onCancel(); setIsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 flex items-center gap-2">
                                    <Ban size={14} /> Cancel Order
                                </button>
                                <div className="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                            </>
                        )}
                        <button onClick={() => { onDelete(); setIsOpen(false); }} className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                            <Trash2 size={14} /> Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Sub-Component: Order Card ---
const OrderCard = ({ order, onEdit, onDelete, onCancel, onPay, onReceive, onReturn, onComplete, onViewDetails, canManage }) => {
  const isCancelled = order.status === "Cancelled";
  const isCompleted = order.status === "Completed";
  const formattedDate = new Date(order.deliveryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  const pendingAmount = order.totalEstimatedAmount - order.advancePaid;

  const canReceive = !isCancelled && !isCompleted && order.items.some(i => i.receivedQuantity < i.quantity);
  const canReturn = !isCancelled && !isCompleted && order.items.some(i => {
      const accounted = (i.returnedQuantity || 0) + (i.lostQuantity || 0) + (i.damagedQuantity || 0);
      return (i.receivedQuantity || 0) > accounted;
  });

  const getStatusColor = (s) => {
    switch(s) {
      case "Booked": return "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-100 dark:border-blue-800";
      case "Active": return "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800";
      case "Returned": return "bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-100 dark:border-orange-800";
      case "Completed": return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800";
      case "Cancelled": return "bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-900/30 decoration-slate-400";
      default: return "bg-gray-50 dark:bg-slate-800";
    }
  };

  return (
    <Card className={`relative transition-all duration-300 hover:shadow-lg border-t-4 ${isCancelled ? 'border-t-red-400 opacity-75' : 'border-t-blue-500'} dark:bg-slate-900 dark:border-slate-800`}>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
            <div className="flex-1 pr-2">
                <h3 className={`font-bold text-lg leading-tight ${isCancelled ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                    {order.vendor?.name}
                </h3>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                        {order.status}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                       <Calendar size={12}/> {formattedDate}
                    </span>
                </div>
            </div>
            
            <div className="flex items-center gap-1">
                {/* 🔒 ONLY Action Menu checks permissions internally */}
                <ActionMenu onEdit={onEdit} onCancel={onCancel} onDelete={onDelete} status={order.status} canManage={canManage} />
            </div>
        </div>

        {/* Financials */}
        {!isCancelled && (
            <div className="grid grid-cols-3 gap-2 mb-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Bill</span>
                    <span className="font-bold text-gray-700 dark:text-gray-200">₹{order.totalEstimatedAmount}</span>
                </div>
                <div className="flex flex-col text-center">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Paid</span>
                    <span className="font-bold text-green-600 dark:text-green-400">₹{order.advancePaid}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Due</span>
                    <span className={`font-bold ${pendingAmount > 0 ? "text-red-500" : "text-gray-400"}`}>
                        {pendingAmount > 0 ? `₹${pendingAmount}` : "Paid"}
                    </span>
                </div>
            </div>
        )}

        {/* View Details (ALWAYS VISIBLE) */}
        <div className={canManage ? "mb-4" : ""}>
             <button 
                onClick={onViewDetails}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-800"
            >
                <Eye size={16} /> View Details & Items
            </button>
        </div>

        {/* 🔒 Action Buttons Grid (HIDDEN for Members) */}
        {canManage && (
            <div className="grid grid-cols-2 gap-2">
                {!isCancelled && !isCompleted && (
                    <Button size="sm" className="col-span-2 bg-green-600 hover:bg-green-700 text-white shadow-sm h-9" onClick={onPay}>
                        <DollarSign size={14} className="mr-1"/> Record Payment
                    </Button>
                )}
                
                {canReceive && (
                    <Button size="sm" variant="outline" className={`h-9 ${canReturn ? 'col-span-1' : 'col-span-2'}`} onClick={onReceive}>
                    <CheckSquare size={14} className="mr-1"/> Receive
                    </Button>
                )}

                {canReturn && (
                    <Button size="sm" variant="outline" className={`h-9 ${canReceive ? 'col-span-1' : 'col-span-2'}`} onClick={onReturn}>
                    <PackageCheck size={14} className="mr-1"/> Return
                    </Button>
                )}

                {!canReceive && !canReturn && !isCancelled && !isCompleted && (
                    <Button size="sm" variant="secondary" className="col-span-2 border-blue-200 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-9" onClick={onComplete}>
                    <Archive size={14} className="mr-1"/> Complete Order
                    </Button>
                )}

                {isCompleted && (
                    <div className="col-span-2 text-center text-xs font-bold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 py-2 rounded border border-green-100 dark:border-green-800 flex items-center justify-center gap-1">
                        <CheckCircle2 size={12}/> Order Completed
                    </div>
                )}
                {isCancelled && (
                    <div className="col-span-2 text-center text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 py-2 rounded border border-red-100 dark:border-red-800">
                        Order Cancelled
                    </div>
                )}
            </div>
        )}
    </Card>
  );
};


export default function VendorHiring() {
  const { selectedYear: globalYear } = useYear();
  const { activeClub } = useAuth();
  
  // 🔒 Permission Check
  const canManage = activeClub?.role === "admin" || activeClub?.role === "treasurer";

  const [activeYear, setActiveYear] = useState(null);
  const [activeTab, setActiveTab] = useState("orders");

  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [showCreateYear, setShowCreateYear] = useState(false);
  
  // Modals
  const [vendorModal, setVendorModal] = useState({ open: false, data: null });
  const [orderModal, setOrderModal] = useState({ open: false, data: null }); 
  const [receiveModal, setReceiveModal] = useState({ open: false, order: null }); 
  const [returnModal, setReturnModal] = useState({ open: false, order: null });
  const [detailsModal, setDetailsModal] = useState({ open: false, order: null });
  
  const [deleteId, setDeleteId] = useState(null); 
  const [cancelId, setCancelId] = useState(null); 
  const [deleteVendorId, setDeleteVendorId] = useState(null);

  const [payModal, setPayModal] = useState({ open: false, order: null });
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("Cash");

  // Init
  useEffect(() => {
      const initYear = async () => {
        if (globalYear) { setActiveYear(globalYear); return; }
        try {
          const res = await getFestivalYears();
          const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          const foundActive = list.find(y => y.isActive);
          setActiveYear(foundActive || null);
        } catch (e) { console.error(e); setActiveYear(null); }
      };
      initYear();
  }, [globalYear]);

  // Fetch
  const fetchOrders = () => { if (activeYear) getOrders(activeYear._id).then(res => setOrders(res.data)).catch(console.error); };
  const fetchVendorsList = () => { getVendors().then(res => setVendors(res.data)).catch(console.error); };

  useEffect(() => {
    if(activeTab === "orders" && activeYear) fetchOrders();
    if(activeTab === "vendors") fetchVendorsList();
  }, [activeYear, activeTab]);

  // Handlers (Simplified for brevity, logic remains same)
  const handleDeleteOrder = async () => { try { await deleteOrder(deleteId); toast.success("Order deleted"); setDeleteId(null); fetchOrders(); } catch { toast.error("Failed"); } };
  const handleCancelOrder = async () => { try { await updateOrderStatus(cancelId, "Cancelled"); toast.success("Cancelled"); setCancelId(null); fetchOrders(); } catch { toast.error("Failed"); } };
  const handleDeleteVendor = async () => { try { await deleteVendor(deleteVendorId); toast.success("Vendor deleted"); setDeleteVendorId(null); fetchVendorsList(); } catch { toast.error("Failed"); } };
  const handlePayment = async (e) => {
    e.preventDefault();
    try { await recordRentalPayment(payModal.order._id, { amount: payAmount, paymentMode: payMode }); toast.success("Paid!"); setPayModal({ open: false, order: null }); fetchOrders(); } catch { toast.error("Failed"); }
  };
  const handleStatusUpdate = async (id, status) => { try { await updateOrderStatus(id, status); toast.success(`Updated to ${status}`); fetchOrders(); } catch { toast.error("Failed"); } };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Vendor Management</h1>
           <span className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-1 mt-1 font-medium">
             <Calendar size={14}/> {activeYear ? activeYear.name : "No Active Year"}
           </span>
        </div>

        <div className="flex bg-gray-100/80 dark:bg-slate-800 p-1 rounded-xl">
            {["orders", "vendors"].map(tab => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold capitalize transition-all duration-200 ${
                        activeTab === tab 
                        ? "bg-white dark:bg-slate-600 shadow-sm text-blue-600 dark:text-blue-300 scale-[1.02]" 
                        : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    }`}
                >
                    {tab === "orders" ? <ShoppingBag size={16}/> : <Users size={16}/>} {tab}
                </button>
            ))}
        </div>

        {/* 🔒 Add Buttons (Hidden for Members) */}
        {canManage && (
            <div className="flex gap-3 w-full md:w-auto">
                {activeTab === "vendors" && <Button onClick={() => setVendorModal({ open: true, data: null })} className="flex-1 md:flex-none">+ Add Vendor</Button>}
                {activeTab === "orders" && activeYear && <Button onClick={() => setOrderModal({ open: true, data: null })} className="flex-1 md:flex-none">+ New Order</Button>}
            </div>
        )}
      </div>

      {/* ================= VENDORS TAB ================= */}
      {activeTab === "vendors" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {vendors.map(vendor => (
                <Card key={vendor._id} className="relative group hover:shadow-lg transition-all border-l-4 border-l-purple-500 dark:bg-slate-900 dark:border-slate-800">
                     {/* 🔒 Edit/Delete Icons (Hidden for Members) */}
                     {canManage && (
                        <div className="absolute top-3 right-3 flex gap-1">
                            <button onClick={() => setVendorModal({ open: true, data: vendor })} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 text-blue-600 rounded"><Edit size={16} /></button>
                            <button onClick={() => setDeleteVendorId(vendor._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded"><Trash2 size={16} /></button>
                        </div>
                     )}
                     <div className="flex justify-between items-start mb-2 pr-14">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white truncate">{vendor.name}</h3>
                        <span className="text-[10px] font-bold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 px-2 py-1 rounded-lg border border-purple-100 dark:border-purple-800 uppercase tracking-wider">{vendor.category}</span>
                    </div>
                    <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300 mt-4 bg-gray-50 dark:bg-slate-800/50 p-3 rounded-lg">
                        <div className="flex items-center gap-3"><Phone size={14} className="text-green-500"/> {vendor.phone}</div>
                        {vendor.address && <div className="flex items-start gap-3"><MapPin size={14} className="text-red-500 mt-0.5"/> <span className="flex-1">{vendor.address}</span></div>}
                    </div>
                </Card>
            ))}
             {vendors.length === 0 && <p className="col-span-full text-center text-gray-500">No vendors found.</p>}
          </div>
      )}

      {/* ================= ORDERS TAB ================= */}
      {activeTab === "orders" && (
        <>
            {!activeYear ? (
                <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 animate-in fade-in">
                   <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md mb-6 ring-4 ring-slate-100 dark:ring-slate-700">
                        <Lock size={32} className="text-slate-400 dark:text-slate-500" />
                   </div>
                   <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">No Active Year</h2>
                   {activeClub?.role === 'admin' && <Button onClick={() => setShowCreateYear(true)} className="mt-4"><PlusCircle size={18} className="mr-2" /> Start New Year</Button>}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    {orders.map(order => (
                        <OrderCard 
                            key={order._id} 
                            order={order}
                            canManage={canManage} // 🔒 PASS PERMISSION
                            onViewDetails={() => setDetailsModal({ open: true, order })}
                            onEdit={() => setOrderModal({ open: true, data: order })}
                            onCancel={() => setCancelId(order._id)}
                            onDelete={() => setDeleteId(order._id)}
                            onPay={() => { setPayModal({ open: true, order }); setPayAmount(order.totalEstimatedAmount - order.advancePaid); }}
                            onReceive={() => setReceiveModal({ open: true, order })}
                            onReturn={() => setReturnModal({ open: true, order })}
                            onComplete={() => handleStatusUpdate(order._id, "Completed")}
                        />
                    ))}
                    {orders.length === 0 && <p className="col-span-full text-center text-gray-500">No orders found.</p>}
                </div>
            )}
        </>
      )}

      {/* --- MODALS --- */}
      {/* 🔒 Modals are only conditionally rendered or internally protected, but best to keep them here for the state logic to work safely. The buttons to OPEN them are hidden above. */}
      
      {canManage && (
        <>
            <AddVendorModal isOpen={vendorModal.open} onClose={() => setVendorModal({ open: false, data: null })} onSuccess={fetchVendorsList} initialData={vendorModal.data} />
            <CreateOrderModal isOpen={orderModal.open} onClose={() => setOrderModal({ open: false, data: null })} onSuccess={fetchOrders} activeYear={activeYear} initialData={orderModal.data} />
            <ReceiveItemsModal isOpen={receiveModal.open} onClose={() => setReceiveModal({ open: false, order: null })} onSuccess={fetchOrders} order={receiveModal.order} />
            <ReturnItemsModal isOpen={returnModal.open} onClose={() => setReturnModal({ open: false, order: null })} onSuccess={fetchOrders} order={returnModal.order} />
            {showCreateYear && <CreateYearModal onSuccess={() => { setShowCreateYear(false); window.location.reload(); }} onClose={() => setShowCreateYear(false)} />}
            
            <Modal isOpen={payModal.open} onClose={() => setPayModal({ open: false, order: null })} title="Record Payment">
                <form onSubmit={handlePayment} className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-lg text-sm border border-blue-100 dark:border-blue-800">
                        Recording payment for <b>{payModal.order?.vendor?.name}</b>
                    </div>
                    <Input label="Amount (₹)" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="text-lg font-bold" />
                    <div className="grid grid-cols-2 gap-2">
                        {["Cash", "UPI", "Bank Transfer"].map(m => (
                            <button key={m} type="button" onClick={() => setPayMode(m)} className={`text-xs py-2 rounded border ${payMode === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 dark:border-slate-700'}`}>
                                {m}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-end pt-2 border-t dark:border-slate-700"><Button type="submit" className="w-full">Confirm Payment</Button></div>
                </form>
            </Modal>

            <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDeleteOrder} title="Delete Order?" message="Permanently remove?" confirmText="Delete" confirmVariant="danger" />
            <ConfirmModal isOpen={!!cancelId} onClose={() => setCancelId(null)} onConfirm={handleCancelOrder} title="Cancel Order?" message="Mark as Cancelled?" confirmText="Cancel Order" confirmVariant="warning" />
            <ConfirmModal isOpen={!!deleteVendorId} onClose={() => setDeleteVendorId(null)} onConfirm={handleDeleteVendor} title="Delete Vendor?" message="Remove from list?" confirmText="Delete Vendor" confirmVariant="danger" />
        </>
      )}

      {/* Details Modal (Open to Everyone) */}
      <OrderDetailsModal 
        isOpen={detailsModal.open} 
        onClose={() => setDetailsModal({ open: false, order: null })} 
        order={detailsModal.order} 
        onUpdate={fetchOrders}
        canManage={canManage} // 🔒 Pass Permission down to Details Modal too
      />

    </div>
  );
}