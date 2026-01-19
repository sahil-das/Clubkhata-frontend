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
      // Default received = ordered quantity
      setItems(order.items.map(item => ({
        _id: item._id,
        itemName: item.itemName,
        ordered: item.quantity,
        receivedQuantity: item.quantity // Default to full receipt
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
        <p className="text-sm text-gray-500">
          Verify the quantity of items actually delivered. The bill will automatically adjust based on what you accept.
        </p>

        <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded border">
          <div className="grid grid-cols-12 gap-2 font-bold text-xs mb-2 text-gray-500 uppercase">
            <div className="col-span-6">Item</div>
            <div className="col-span-3 text-center">Ordered</div>
            <div className="col-span-3 text-center">Received</div>
          </div>
          
          {items.map((item, i) => (
            <div key={item._id} className="grid grid-cols-12 gap-2 items-center mb-3">
              <div className="col-span-6 font-medium text-sm">{item.itemName}</div>
              <div className="col-span-3 text-center text-gray-500">{item.ordered}</div>
              <div className="col-span-3">
                <Input 
                  type="number" 
                  min="0"
                  className="h-8 text-center"
                  value={item.receivedQuantity}
                  onChange={(e) => handleChange(i, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
          <Button loading={loading} type="submit">Confirm Receipt</Button>
        </div>
      </form>
    </Modal>
  );
}