import { useState, useEffect } from "react";
import Modal from "../ui/Modal"; 
import { Input } from "../ui/Input"; 
import { Button } from "../ui/Button"; 
import { createOrder, getVendors, updateOrder } from "../../api/rentals";
import { toast } from "react-hot-toast";
import { Plus, Trash2, Calendar, Package, IndianRupee, Store } from "lucide-react";

export default function CreateOrderModal({ isOpen, onClose, onSuccess, activeYear, initialData = null }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    vendorId: "",
    deliveryDate: "",
    returnDate: "",
    items: [{ itemName: "", quantity: 1, rate: 0, days: 1 }]
  });

  useEffect(() => { if (isOpen) getVendors().then(res => setVendors(res.data)); }, [isOpen]);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData({
        vendorId: initialData.vendor?._id || initialData.vendor,
        deliveryDate: initialData.deliveryDate ? initialData.deliveryDate.split('T')[0] : "",
        returnDate: initialData.returnDate ? initialData.returnDate.split('T')[0] : "",
        items: initialData.items.map(i => ({
            itemName: i.itemName, quantity: i.quantity, rate: i.rate, days: i.days
        }))
      });
    } else if (isOpen) {
        setFormData({ vendorId: "", deliveryDate: "", returnDate: "", items: [{ itemName: "", quantity: 1, rate: 0, days: 1 }] });
    }
  }, [initialData, isOpen]);

  const updateItem = (index, field, val) => {
    const newItems = [...formData.items];
    newItems[index][field] = val;
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.rate || 0) * Number(item.days || 1)), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeYear) return toast.error("No active year found.");
    if (!formData.vendorId) return toast.error("Select a vendor.");
    
    setLoading(true);
    try {
      if (initialData) {
        await updateOrder(initialData._id, formData);
        toast.success("Order Updated!");
      } else {
        await createOrder({ ...formData, yearId: activeYear._id });
        toast.success("Order Created!");
      }
      onSuccess(); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Rental Order" : "New Rental Order"} maxWidth="max-w-4xl">
      <form onSubmit={handleSubmit} className="flex flex-col h-full">
        
        {/* Scrollable Content Area */}
        <div className="space-y-6 pb-24"> 
            
            {/* Vendor & Dates Section */}
            <div className="bg-gray-50 dark:bg-slate-800/50 p-4 rounded-lg border dark:border-slate-700 grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1">
                    <label className="flex items-center gap-2 text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                        <Store size={16} className="text-blue-500"/> Select Vendor
                    </label>
                    <select 
                        className="w-full p-2.5 border rounded-md bg-white dark:bg-slate-900 dark:border-slate-700 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={formData.vendorId}
                        onChange={e => setFormData({...formData, vendorId: e.target.value})}
                        disabled={!!initialData}
                    >
                       <option value="">-- Choose Vendor --</option>
                       {vendors.map(v => <option key={v._id} value={v._id}>{v.name} ({v.category})</option>)}
                    </select>
                </div>
                
                <div className="md:col-span-1">
                    <label className="flex items-center gap-2 text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                        <Calendar size={16} className="text-green-500"/> Delivery Date
                    </label>
                    <Input type="date" value={formData.deliveryDate} onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
                </div>

                <div className="md:col-span-1">
                    <label className="flex items-center gap-2 text-sm font-medium mb-1.5 text-gray-700 dark:text-gray-300">
                        <Calendar size={16} className="text-orange-500"/> Return Date
                    </label>
                    <Input type="date" value={formData.returnDate} onChange={e => setFormData({...formData, returnDate: e.target.value})} />
                </div>
            </div>

            {/* Items Section */}
            <div>
                <div className="flex justify-between items-center mb-2">
                    <h4 className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200">
                        <Package size={18} /> Rental Items
                    </h4>
                    <span className="text-xs text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded-full">{formData.items.length} Items</span>
                </div>

                {/* Desktop Headers (Hidden on Mobile) */}
                <div className="hidden md:grid grid-cols-12 gap-2 bg-gray-100 dark:bg-slate-800 p-2 text-xs font-bold text-gray-500 uppercase rounded-t-lg">
                    <div className="col-span-4">Item Name</div>
                    <div className="col-span-2 text-center">Qty</div>
                    <div className="col-span-2 text-center">Rate (₹)</div>
                    <div className="col-span-2 text-center">Days</div>
                    <div className="col-span-2 text-center">Total</div>
                </div>

                <div className="space-y-3 md:space-y-0">
                    {formData.items.map((item, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 border dark:border-slate-700 rounded-lg p-3 md:p-2 md:rounded-none md:border-0 md:border-b md:grid md:grid-cols-12 md:gap-2 md:items-center relative shadow-sm md:shadow-none">
                            
                            {/* Mobile: Delete Button Top Right */}
                            <button 
                                type="button" 
                                onClick={() => setFormData({...formData, items: formData.items.filter((_, idx) => idx !== i)})} 
                                className="absolute top-2 right-2 p-1.5 text-red-500 md:hidden bg-red-50 rounded-full"
                            >
                                <Trash2 size={14}/>
                            </button>

                            {/* Item Name */}
                            <div className="md:col-span-4 mb-2 md:mb-0 pr-8 md:pr-0">
                                <label className="text-xs text-gray-400 font-bold uppercase md:hidden mb-1 block">Item Name</label>
                                <Input placeholder="e.g. 50 Chairs" value={item.itemName} onChange={e => updateItem(i, "itemName", e.target.value)} />
                            </div>

                            {/* Numbers Row on Mobile */}
                            <div className="grid grid-cols-3 gap-2 md:contents">
                                <div className="md:col-span-2">
                                     <label className="text-[10px] text-gray-400 font-bold uppercase md:hidden block text-center mb-1">Qty</label>
                                     <Input type="number" placeholder="Qty" className="text-center" value={item.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                     <label className="text-[10px] text-gray-400 font-bold uppercase md:hidden block text-center mb-1">Rate</label>
                                     <Input type="number" placeholder="Rate" className="text-center" value={item.rate} onChange={e => updateItem(i, "rate", e.target.value)} />
                                </div>
                                <div className="md:col-span-2">
                                     <label className="text-[10px] text-gray-400 font-bold uppercase md:hidden block text-center mb-1">Days</label>
                                     <Input type="number" placeholder="Days" className="text-center" value={item.days} onChange={e => updateItem(i, "days", e.target.value)} />
                                </div>
                            </div>

                            {/* Total & Desktop Delete */}
                            <div className="md:col-span-2 flex items-center justify-between md:pl-2 mt-2 md:mt-0 pt-2 md:pt-0 border-t md:border-t-0 border-gray-100 dark:border-slate-700">
                                <span className="text-xs font-bold text-gray-400 uppercase md:hidden">Line Total:</span>
                                <span className="font-bold text-sm text-blue-600 dark:text-blue-400">
                                    ₹{(item.quantity * item.rate * item.days).toFixed(0)}
                                </span>
                                <button 
                                    type="button" 
                                    onClick={() => setFormData({...formData, items: formData.items.filter((_, idx) => idx !== i)})} 
                                    className="hidden md:block p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <div className="mt-4">
                     <Button type="button" variant="outline" size="sm" onClick={() => setFormData({...formData, items: [...formData.items, { itemName: "", quantity: 1, rate: 0, days: 1 }]})} className="w-full border-dashed py-3 md:py-2">
                        <Plus size={16} className="mr-1" /> Add New Item
                    </Button>
                </div>
            </div>
        </div>

        {/* ✅ STICKY FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t dark:border-slate-700 p-4 md:px-6 flex justify-between items-center z-20 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] rounded-b-lg">
            <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Total Est.</span>
                <span className="text-2xl md:text-3xl font-bold text-blue-600 flex items-center">
                    <IndianRupee size={20} className="mr-1" /> {calculateTotal().toLocaleString('en-IN')}
                </span>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" onClick={onClose} type="button" className="hidden md:inline-flex">Cancel</Button>
                <Button loading={loading} type="submit" className="px-6 md:px-8 bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none">
                    {initialData ? "Update" : "Create"}
                </Button>
            </div>
        </div>
      </form>
    </Modal>
  );
}