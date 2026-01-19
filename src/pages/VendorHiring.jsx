import { useState, useEffect } from "react";
import { useYear } from "../context/YearContext";
import { useAuth } from "../context/AuthContext"; 
import { getOrders, updateOrderStatus, recordRentalPayment, deleteOrder, getVendors, deleteVendor } from "../api/rentals";
import { getFestivalYears } from "../api/years"; 
import { Button } from "../components/ui/Button"; 
import { Card } from "../components/ui/Card"; 
import { Input } from "../components/ui/Input"; 
import Modal from "../components/ui/Modal"; 
import ConfirmModal from "../components/ui/ConfirmModal"; 

import AddVendorModal from "../components/rentals/AddVendorModal";
import CreateOrderModal from "../components/rentals/CreateOrderModal";
import ReceiveItemsModal from "../components/rentals/ReceiveItemsModal";
import ReturnItemsModal from "../components/rentals/ReturnItemsModal";
import CreateYearModal from "../components/CreateYearModal"; 

import { 
  Calendar, Trash2, Edit, CheckSquare, PackageCheck, Archive, DollarSign, 
  Ban, Users, ShoppingBag, Phone, MapPin, ChevronDown, ChevronUp, 
  AlertCircle, CheckCircle2, PlusCircle, Lock, Plus
} from "lucide-react";
import { toast } from "react-hot-toast";

// --- Sub-Component: Order Item Row ---
const OrderItemRow = ({ item, status }) => {
  const isBooked = status === "Booked" || status === "Draft";
  const isActive = status === "Active";
  const isReturned = status === "Returned" || status === "Completed";
  
  const isMissing = isReturned && item.returnedQuantity < item.receivedQuantity;

  return (
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0 dark:border-slate-700/50 text-sm">
      <div className="flex flex-col">
        <span className="font-medium text-gray-700 dark:text-gray-200">{item.itemName}</span>
      </div>

      <div className="text-right">
        {isBooked && (
            <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-semibold">
                x{item.quantity}
            </span>
        )}

        {isActive && (
            <div className="flex items-center gap-1.5">
                <span className="text-xs text-gray-400">Recv:</span>
                <span className={`font-bold ${item.receivedQuantity < item.quantity ? "text-orange-500" : "text-green-600"}`}>
                    {item.receivedQuantity}/{item.quantity}
                </span>
            </div>
        )}

        {isReturned && (
            <div className="flex items-center gap-1.5">
               {isMissing ? (
                   <span className="flex items-center gap-1 text-xs text-red-500 font-bold bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                      <AlertCircle size={10} /> {item.returnedQuantity}/{item.receivedQuantity}
                   </span>
               ) : (
                   <span className="flex items-center gap-1 text-xs text-green-600 font-bold bg-green-50 px-1.5 py-0.5 rounded border border-green-100">
                      <CheckCircle2 size={10} /> {item.returnedQuantity}/{item.receivedQuantity}
                   </span>
               )}
            </div>
        )}
      </div>
    </div>
  );
};

// --- Sub-Component: Order Card ---
const OrderCard = ({ order, onEdit, onDelete, onCancel, onPay, onReceive, onReturn, onComplete }) => {
  const [expanded, setExpanded] = useState(false);
  const visibleItems = expanded ? order.items : order.items.slice(0, 2); 
  const hiddenCount = order.items.length - 2;

  const getStatusColor = (s) => {
    switch(s) {
      case "Booked": return "bg-blue-50 text-blue-700 border-blue-100";
      case "Active": return "bg-green-50 text-green-700 border-green-100";
      case "Returned": return "bg-orange-50 text-orange-700 border-orange-100";
      case "Completed": return "bg-gray-100 text-gray-600 border-gray-200";
      case "Cancelled": return "bg-red-50 text-red-600 border-red-100 decoration-slate-400";
      default: return "bg-gray-50";
    }
  };

  const isCancelled = order.status === "Cancelled";

  return (
    <Card className={`relative group transition-all duration-300 hover:shadow-lg border-t-4 ${isCancelled ? 'border-t-red-400 opacity-60' : 'border-t-blue-500'}`}>
        
        {/* Top Actions */}
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-slate-800 p-1 rounded-lg shadow-sm border dark:border-slate-700 z-10">
            {!isCancelled && order.status !== "Completed" && (
                <>
                <button onClick={onEdit} className="p-1.5 hover:bg-blue-50 text-blue-600 rounded" title="Edit"><Edit size={16}/></button>
                <button onClick={onCancel} className="p-1.5 hover:bg-orange-50 text-orange-600 rounded" title="Cancel"><Ban size={16}/></button>
                </>
            )}
            <button onClick={onDelete} className="p-1.5 hover:bg-red-50 text-red-600 rounded" title="Delete"><Trash2 size={16}/></button>
        </div>

        {/* Header */}
        <div className="mb-4 pr-10">
            <h3 className={`font-bold text-lg leading-tight ${isCancelled ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-100'}`}>
                {order.vendor?.name}
            </h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                    {order.status}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                   <Users size={12}/> {order.vendor?.category}
                </span>
            </div>
        </div>

        {/* Items Section */}
        <div className="bg-gray-50/80 dark:bg-slate-900/50 rounded-lg p-3 border border-gray-100 dark:border-slate-800 mb-4">
            <div className="space-y-1">
                {visibleItems.map((item, i) => (
                    <OrderItemRow key={i} item={item} status={order.status} />
                ))}
            </div>
            {order.items.length > 2 && (
                <button 
                    onClick={() => setExpanded(!expanded)}
                    className="w-full mt-2 flex items-center justify-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-1.5 rounded transition-colors"
                >
                    {expanded ? (
                        <>Show Less <ChevronUp size={12}/></>
                    ) : (
                        <>+{hiddenCount} more items <ChevronDown size={12}/></>
                    )}
                </button>
            )}
        </div>

        {/* Financials */}
        {!isCancelled && (
            <div className="flex justify-between items-end mb-4 text-sm bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-lg p-2.5 shadow-sm">
                <div>
                    <p className="text-xs text-gray-500 uppercase font-semibold">Total Bill</p>
                    <p className="font-bold text-gray-800 dark:text-white">₹{order.totalEstimatedAmount}</p>
                </div>
                <div className="text-right">
                     <p className="text-xs text-gray-500 uppercase font-semibold">Balance</p>
                     <p className={`font-bold ${order.totalEstimatedAmount - order.advancePaid > 0 ? "text-red-500" : "text-green-600"}`}>
                        ₹{Math.max(0, order.totalEstimatedAmount - order.advancePaid)}
                     </p>
                </div>
            </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
             {!isCancelled && order.status !== "Completed" && (
                 <Button size="sm" className="col-span-1 bg-green-600 hover:bg-green-700 text-white shadow-sm" onClick={onPay}>
                    <DollarSign size={14} className="mr-1"/> Pay
                 </Button>
             )}
             {order.status === "Booked" && (
                <Button size="sm" variant="outline" className="col-span-1" onClick={onReceive}>
                   <CheckSquare size={14} className="mr-1"/> Receive
                </Button>
             )}
             {(order.status === "Active" || order.status === "Returned") && order.status !== "Completed" && (
                <Button size="sm" variant="outline" className="col-span-1" onClick={onReturn}>
                   <PackageCheck size={14} className="mr-1"/> Returns
                </Button>
             )}
             {order.status === "Returned" && (
                <Button size="sm" variant="outline" className="col-span-2 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={onComplete}>
                   <Archive size={14} className="mr-1"/> Complete Order
                </Button>
             )}
             {order.status === "Completed" && (
                 <div className="col-span-2 text-center text-xs font-bold text-green-700 bg-green-50 py-2 rounded border border-green-100 flex items-center justify-center gap-1">
                    <CheckCircle2 size={12}/> Order Completed
                 </div>
             )}
             {isCancelled && (
                 <div className="col-span-2 text-center text-xs font-bold text-red-500 bg-red-50 py-2 rounded border border-red-100">
                    Cancelled
                 </div>
             )}
        </div>
    </Card>
  );
};


export default function VendorHiring() {
  const { selectedYear: globalYear } = useYear();
  const { activeClub } = useAuth();
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
  
  const [deleteId, setDeleteId] = useState(null); 
  const [cancelId, setCancelId] = useState(null); 
  const [deleteVendorId, setDeleteVendorId] = useState(null);

  const [payModal, setPayModal] = useState({ open: false, order: null });
  const [payAmount, setPayAmount] = useState("");
  const [payMode, setPayMode] = useState("Cash");

  // Init
  useEffect(() => {
      const initYear = async () => {
        // If Global Year is provided (and likely valid/active from context), use it.
        if (globalYear) { 
            setActiveYear(globalYear); 
            return; 
        }

        try {
          const res = await getFestivalYears();
          const list = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          
          // ✅ FIX: Do NOT fallback to list[0] if no year is active. Set null.
          const foundActive = list.find(y => y.isActive);
          setActiveYear(foundActive || null);

        } catch (e) { 
            console.error(e); 
            setActiveYear(null);
        }
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

  // Handlers
  const handleDeleteOrder = async () => {
    try { await deleteOrder(deleteId); toast.success("Order deleted"); setDeleteId(null); fetchOrders(); } catch { toast.error("Failed"); }
  };
  const handleCancelOrder = async () => {
    try { await updateOrderStatus(cancelId, "Cancelled"); toast.success("Cancelled"); setCancelId(null); fetchOrders(); } catch { toast.error("Failed"); }
  };
  const handleDeleteVendor = async () => {
    try { await deleteVendor(deleteVendorId); toast.success("Vendor deleted"); setDeleteVendorId(null); fetchVendorsList(); } catch { toast.error("Failed"); }
  };
  const handlePayment = async (e) => {
    e.preventDefault();
    try { await recordRentalPayment(payModal.order._id, { amount: payAmount, paymentMode: payMode }); toast.success("Paid!"); setPayModal({ open: false, order: null }); fetchOrders(); } catch { toast.error("Failed"); }
  };
  const handleStatusUpdate = async (id, status) => {
    try { await updateOrderStatus(id, status); toast.success(`Updated to ${status}`); fetchOrders(); } catch { toast.error("Failed"); }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-gray-800 dark:text-white tracking-tight">Vendor Management</h1>
           <span className="text-gray-500 text-sm flex items-center gap-1 mt-1 font-medium">
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
                        ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600 scale-[1.02]" 
                        : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
                >
                    {tab === "orders" ? <ShoppingBag size={16}/> : <Users size={16}/>} {tab}
                </button>
            ))}
        </div>

        <div className="flex gap-3">
          {activeTab === "vendors" && <Button onClick={() => setVendorModal({ open: true, data: null })}>+ Add Vendor</Button>}
          {/* ✅ Only show '+ New Order' if activeYear exists */}
          {activeTab === "orders" && activeYear && <Button onClick={() => setOrderModal({ open: true, data: null })}>+ New Order</Button>}
        </div>
      </div>

      {/* ================= VENDORS TAB (Always Visible) ================= */}
      {activeTab === "vendors" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
            {vendors.map(vendor => (
                <Card key={vendor._id} className="relative group hover:shadow-lg transition-all border-l-4 border-l-purple-500">
                     <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setVendorModal({ open: true, data: vendor })} className="p-1.5 hover:bg-gray-100 text-blue-600 rounded"><Edit size={16} /></button>
                        <button onClick={() => setDeleteVendorId(vendor._id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded"><Trash2 size={16} /></button>
                    </div>
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-800 dark:text-white">{vendor.name}</h3>
                        <span className="text-xs font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded-lg border border-purple-100">{vendor.category}</span>
                    </div>
                    <div className="space-y-2.5 text-sm text-gray-600 dark:text-gray-300 mt-4 bg-gray-50 dark:bg-slate-900/50 p-3 rounded-lg">
                        <div className="flex items-center gap-3"><Phone size={14} className="text-green-500"/> {vendor.phone}</div>
                        {vendor.address && <div className="flex items-start gap-3"><MapPin size={14} className="text-red-500 mt-0.5"/> <span className="flex-1">{vendor.address}</span></div>}
                    </div>
                </Card>
            ))}
             {vendors.length === 0 && <p className="col-span-full text-center text-gray-500 py-10 italic">No vendors found.</p>}
          </div>
      )}

      {/* ================= ORDERS TAB ================= */}
      {activeTab === "orders" && (
        <>
            {/* ✅ CASE 1: NO ACTIVE YEAR */}
            {!activeYear ? (
                <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800 animate-in fade-in">
                  {activeClub?.role === 'admin' ? (
                      <>
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md mb-6 ring-4 ring-slate-100 dark:ring-slate-700">
                            <PlusCircle size={32} className="text-indigo-500 dark:text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">No Active Budget</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mt-3 mb-8 leading-relaxed">
                            You need to start a new financial year to record and manage rental orders.
                        </p>
                        <Button onClick={() => setShowCreateYear(true)} className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none">
                            <PlusCircle size={18} className="mr-2" /> Start New Year
                        </Button>
                      </>
                  ) : (
                      <>
                        <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-md mb-6 ring-4 ring-slate-100 dark:ring-slate-700">
                            <Lock size={32} className="text-slate-400 dark:text-slate-500" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200">Orders Locked</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-md mt-2">
                            Orders cannot be viewed or added until the new financial year begins.
                        </p>
                      </>
                  )}
                </div>
            ) : (
                /* ✅ CASE 2: ACTIVE YEAR EXISTS */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    {orders.map(order => (
                        <OrderCard 
                            key={order._id} 
                            order={order}
                            onEdit={() => setOrderModal({ open: true, data: order })}
                            onCancel={() => setCancelId(order._id)}
                            onDelete={() => setDeleteId(order._id)}
                            onPay={() => { setPayModal({ open: true, order }); setPayAmount(order.totalEstimatedAmount - order.advancePaid); }}
                            onReceive={() => setReceiveModal({ open: true, order })}
                            onReturn={() => setReturnModal({ open: true, order })}
                            onComplete={() => handleStatusUpdate(order._id, "Completed")}
                        />
                    ))}
                    {orders.length === 0 && <p className="col-span-full text-center text-gray-500 py-12 bg-gray-50 rounded-xl border border-dashed">No active orders found.</p>}
                </div>
            )}
        </>
      )}

      {/* --- MODALS & CONFIRMS --- */}
      <AddVendorModal isOpen={vendorModal.open} onClose={() => setVendorModal({ open: false, data: null })} onSuccess={fetchVendorsList} initialData={vendorModal.data} />
      <CreateOrderModal isOpen={orderModal.open} onClose={() => setOrderModal({ open: false, data: null })} onSuccess={fetchOrders} activeYear={activeYear} initialData={orderModal.data} />
      <ReceiveItemsModal isOpen={receiveModal.open} onClose={() => setReceiveModal({ open: false, order: null })} onSuccess={fetchOrders} order={receiveModal.order} />
      <ReturnItemsModal isOpen={returnModal.open} onClose={() => setReturnModal({ open: false, order: null })} onSuccess={fetchOrders} order={returnModal.order} />
      
      {showCreateYear && (
          <CreateYearModal 
              onSuccess={() => { setShowCreateYear(false); window.location.reload(); }} 
              onClose={() => setShowCreateYear(false)} 
          />
      )}

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDeleteOrder} title="Delete Order?" message="Permanently remove?" confirmText="Delete" confirmVariant="danger" />
      <ConfirmModal isOpen={!!cancelId} onClose={() => setCancelId(null)} onConfirm={handleCancelOrder} title="Cancel Order?" message="Mark as Cancelled?" confirmText="Cancel Order" confirmVariant="warning" />
      <ConfirmModal isOpen={!!deleteVendorId} onClose={() => setDeleteVendorId(null)} onConfirm={handleDeleteVendor} title="Delete Vendor?" message="Remove from list?" confirmText="Delete Vendor" confirmVariant="danger" />

      <Modal isOpen={payModal.open} onClose={() => setPayModal({ open: false, order: null })} title="Record Payment">
        <form onSubmit={handlePayment} className="space-y-4">
             <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-sm border border-blue-100">
                Recording payment for <b>{payModal.order?.vendor?.name}</b>
             </div>
             <Input label="Amount (₹)" type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
             <div className="flex justify-end pt-2"><Button type="submit">Confirm Payment</Button></div>
        </form>
      </Modal>
    </div>
  );
}