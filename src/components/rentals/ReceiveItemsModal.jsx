import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { receiveOrder } from "../../api/rentals";
import { toast } from "react-hot-toast";

export default function ReceiveItemsModal({ isOpen, onClose, onSuccess, order }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setItems(order.items.map(item => ({
        _id: item._id,
        itemName: item.itemName,
        ordered: item.quantity,
        receivedQuantity: item.quantity 
      })));
    }
  }, [order]);

  const handleChange = (index, val) => {
    const newItems = [...items];
    newItems[index].receivedQuantity = val;
    setItems(newItems);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await receiveOrder(order._id, items);
      toast.success("Items received & Bill updated!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receive Items Checklist">
      <form onSubmit={handleSubmit} className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 p-3 rounded-lg border dark:border-slate-700">
          Verify the quantity of items actually delivered. The bill will be calculated based on the <b>received quantity</b>, not the ordered quantity.
        </p>

        <div className="bg-white dark:bg-slate-900 rounded-lg border dark:border-slate-700 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-12 gap-2 p-3 bg-gray-100 dark:bg-slate-800 text-xs font-bold text-gray-500 uppercase sticky top-0 z-10">
            <div className="col-span-6 pl-2">Item Name</div>
            <div className="col-span-3 text-center">Ordered</div>
            <div className="col-span-3 text-center">Received</div>
          </div>
          
          <div className="p-2">
            {items.map((item, i) => (
                <div key={item._id} className="grid grid-cols-12 gap-2 items-center mb-3 p-2 hover:bg-gray-50 dark:hover:bg-slate-800/50 rounded transition-colors">
                <div className="col-span-6 font-medium text-sm text-gray-800 dark:text-gray-200 pl-2">{item.itemName}</div>
                <div className="col-span-3 text-center text-gray-500 font-bold">{item.ordered}</div>
                <div className="col-span-3">
                    <Input 
                    type="number" 
                    min="0"
                    className={`h-9 text-center font-bold ${item.receivedQuantity < item.ordered ? "text-orange-500 border-orange-200 bg-orange-50 dark:bg-orange-900/10" : "text-green-600 border-green-200 bg-green-50 dark:bg-green-900/10"}`}
                    value={item.receivedQuantity}
                    onChange={(e) => handleChange(i, e.target.value)}
                    />
                </div>
                </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-700">
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button loading={loading} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Confirm Receipt</Button>
        </div>
      </form>
    </Modal>
  );
}