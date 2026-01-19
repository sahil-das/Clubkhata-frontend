import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { returnItems } from "../../api/rentals";
import { toast } from "react-hot-toast";

export default function ReturnItemsModal({ isOpen, onClose, onSuccess, order }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setItems(order.items.map(item => ({
        _id: item._id,
        itemName: item.itemName,
        received: item.receivedQuantity, // Limit return to what was received
        returnedQuantity: item.returnedQuantity || 0 
      })));
    }
  }, [order]);

  const handleChange = (index, val) => {
    const newItems = [...items];
    const qty = Number(val);
    // Prevent negative
    if (qty < 0) return;
    newItems[index].returnedQuantity = qty;
    setItems(newItems);
  };

  const handleAutoFill = () => {
    // Set all returned = received (Return All)
    setItems(items.map(i => ({ ...i, returnedQuantity: i.received })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await returnItems(order._id, items);
      toast.success("Return checklist updated!");
      onSuccess();
      onClose();
    } catch (error) {
      toast.error("Failed to update return list");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Return Items Checklist">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-gray-500">Update count of returned items.</p>
            <Button type="button" size="sm" variant="outline" onClick={handleAutoFill}>Return All</Button>
        </div>

        <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded border dark:border-slate-700 max-h-[60vh] overflow-y-auto">
          <div className="grid grid-cols-12 gap-2 font-bold text-xs mb-2 text-gray-500 uppercase">
            <div className="col-span-6">Item</div>
            <div className="col-span-3 text-center">Received</div>
            <div className="col-span-3 text-center">Returned</div>
          </div>
          
          {items.map((item, i) => (
            <div key={item._id} className="grid grid-cols-12 gap-2 items-center mb-3">
              <div className="col-span-6 font-medium text-sm text-gray-800 dark:text-gray-200">
                {item.itemName}
              </div>
              <div className="col-span-3 text-center text-gray-500">{item.received}</div>
              <div className="col-span-3">
                <Input 
                  type="number" 
                  min="0"
                  max={item.received}
                  className={`h-8 text-center ${item.returnedQuantity < item.received ? "border-orange-300 bg-orange-50" : "border-green-300 bg-green-50"}`}
                  value={item.returnedQuantity}
                  onChange={(e) => handleChange(i, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t dark:border-slate-700">
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button loading={loading} type="submit">Confirm Return</Button>
        </div>
      </form>
    </Modal>
  );
}