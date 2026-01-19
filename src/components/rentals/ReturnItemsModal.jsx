import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { returnItems } from "../../api/rentals";
import { toast } from "react-hot-toast";
import { CheckCircle2, AlertTriangle, XCircle, AlertCircle } from "lucide-react";

export default function ReturnItemsModal({ isOpen, onClose, onSuccess, order }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setItems(order.items.map(item => ({
        _id: item._id,
        itemName: item.itemName,
        received: item.receivedQuantity,
        returnedQuantity: item.returnedQuantity || 0,
        damagedQuantity: item.damagedQuantity || 0,
        lostQuantity: item.lostQuantity || 0
      })));
    }
  }, [order]);

  const handleChange = (index, field, val) => {
    const newItems = [...items];
    const qty = Math.max(0, Number(val));
    newItems[index][field] = qty;
    setItems(newItems);
  };

  const handleAutoFill = () => {
    // Optimistic: Everything returned safely
    setItems(items.map(i => ({ 
      ...i, 
      returnedQuantity: i.received,
      damagedQuantity: 0,
      lostQuantity: 0
    })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: Cannot calculate more than received
    for (const item of items) {
       const total = item.returnedQuantity + item.damagedQuantity + item.lostQuantity;
       if (total > item.received) {
         toast.error(`Check ${item.itemName}: Total counts exceed received quantity.`);
         return;
       }
    }

    setLoading(true);
    try {
      await returnItems(order._id, items);
      toast.success("Return checklist updated!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update return list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Return & Damages Check" maxWidth="max-w-3xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-2 bg-blue-50 dark:bg-slate-800/50 p-3 rounded-lg border border-blue-100 dark:border-slate-700">
            <p className="text-sm text-gray-600 dark:text-slate-400 flex items-start gap-2">
                <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                <span>
                    Enter counts for <b>Returned</b> (Good Condition), <b>Damaged</b> (Broken), and <b>Lost</b> (Missing).
                </span>
            </p>
            <Button type="button" size="xs" variant="outline" onClick={handleAutoFill} className="whitespace-nowrap">
                All Perfect
            </Button>
        </div>

        <div className="bg-gray-50 dark:bg-slate-900 rounded-lg border dark:border-slate-800 max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Desktop Header */}
          <div className="hidden md:grid grid-cols-12 gap-2 p-3 bg-gray-100 dark:bg-slate-800 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10 border-b dark:border-slate-700">
            <div className="col-span-4 pl-2">Item Name</div>
            <div className="col-span-2 text-center">Received</div>
            <div className="col-span-2 text-center text-green-600">Good</div>
            <div className="col-span-2 text-center text-orange-500">Broken</div>
            <div className="col-span-2 text-center text-red-500">Lost</div>
          </div>
          
          <div className="p-2 md:p-0">
          {items.map((item, i) => {
            const currentTotal = item.returnedQuantity + item.damagedQuantity + item.lostQuantity;
            const isError = currentTotal > item.received;
            const isPending = currentTotal < item.received;

            return (
              <div key={item._id} className={`group grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-2 items-center p-3 md:py-2 md:px-3 border-b last:border-0 dark:border-slate-800 transition-colors ${isError ? 'bg-red-50 dark:bg-red-900/20' : 'hover:bg-white dark:hover:bg-slate-800/50'}`}>
                
                {/* Item Label (Mobile & Desktop) */}
                <div className="md:col-span-4 flex justify-between md:block">
                    <div className="font-medium text-sm text-gray-800 dark:text-gray-200">
                        {item.itemName}
                    </div>
                    {/* Mobile Only: Received Badge */}
                    <div className="md:hidden text-xs font-bold bg-gray-200 dark:bg-slate-700 px-2 py-0.5 rounded-full text-gray-600 dark:text-gray-300">
                        Recv: {item.received}
                    </div>
                    
                    {/* Validation Message */}
                    {isPending && <div className="hidden md:block text-[10px] text-blue-500 font-medium">Pending: {item.received - currentTotal}</div>}
                    {isError && <div className="text-[10px] text-red-500 font-bold md:block">Over limit by {currentTotal - item.received}</div>}
                </div>
                
                {/* Desktop: Received Count */}
                <div className="hidden md:block col-span-2 text-center font-bold text-gray-700 dark:text-gray-400">{item.received}</div>
                
                {/* Inputs Row */}
                <div className="md:col-span-6 grid grid-cols-3 gap-2">
                    <div className="relative">
                        <label className="md:hidden text-[10px] font-bold text-green-600 mb-1 block">Good</label>
                        <Input 
                            type="number" min="0" 
                            className="h-9 text-center bg-white dark:bg-slate-900 focus:bg-green-50 dark:focus:bg-green-900/20 border-gray-200 dark:border-slate-700 focus:border-green-500 font-medium"
                            value={item.returnedQuantity}
                            onChange={(e) => handleChange(i, 'returnedQuantity', e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <label className="md:hidden text-[10px] font-bold text-orange-500 mb-1 block">Broken</label>
                        <Input 
                            type="number" min="0" 
                            className="h-9 text-center bg-white dark:bg-slate-900 focus:bg-orange-50 dark:focus:bg-orange-900/20 border-gray-200 dark:border-slate-700 focus:border-orange-500 font-medium text-orange-600"
                            value={item.damagedQuantity}
                            onChange={(e) => handleChange(i, 'damagedQuantity', e.target.value)}
                        />
                    </div>
                    <div className="relative">
                        <label className="md:hidden text-[10px] font-bold text-red-500 mb-1 block">Lost</label>
                        <Input 
                            type="number" min="0" 
                            className="h-9 text-center bg-white dark:bg-slate-900 focus:bg-red-50 dark:focus:bg-red-900/20 border-gray-200 dark:border-slate-700 focus:border-red-500 font-medium text-red-600"
                            value={item.lostQuantity}
                            onChange={(e) => handleChange(i, 'lostQuantity', e.target.value)}
                        />
                    </div>
                </div>

                {/* Mobile: Validation Footer */}
                {isPending && <div className="md:hidden w-full text-center text-xs text-blue-500 bg-blue-50 dark:bg-blue-900/20 py-1 rounded">⚠️ {item.received - currentTotal} items pending count</div>}
              </div>
            );
          })}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button loading={loading} type="submit" className="bg-green-600 hover:bg-green-700 text-white">Confirm Returns</Button>
        </div>
      </form>
    </Modal>
  );
}