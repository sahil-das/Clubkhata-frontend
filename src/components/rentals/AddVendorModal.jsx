import { useState, useEffect } from "react";
import Modal from "../ui/Modal"; 
import { Input } from "../ui/Input"; 
import { Button } from "../ui/Button"; 
import { createVendor, updateVendor } from "../../api/rentals"; 
import { toast } from "react-hot-toast";
import { User, Phone, MapPin, CreditCard, Tag } from "lucide-react";

const CATEGORIES = ["Tent", "Sound", "Lighting", "Catering", "Priest", "Decor", "Other"];

export default function AddVendorModal({ isOpen, onClose, onSuccess, initialData = null }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", category: "Tent", phone: "", address: "", upiId: ""
  });

  useEffect(() => {
    if (initialData && isOpen) {
        setFormData({
            name: initialData.name || "",
            category: initialData.category || "Tent",
            phone: initialData.phone || "",
            address: initialData.address || "",
            upiId: initialData.upiId || ""
        });
    } else if (isOpen) {
        setFormData({ name: "", category: "Tent", phone: "", address: "", upiId: "" });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await updateVendor(initialData._id, formData);
        toast.success("Vendor updated successfully!");
      } else {
        await createVendor(formData);
        toast.success("Vendor added successfully!");
      }
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? "Edit Vendor Details" : "Add New Vendor"} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-5 pb-2">
        
        {/* Name Input */}
        <div>
           <div className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              <User size={16} className="text-blue-500" /> Vendor Name
           </div>
           <Input required placeholder="e.g. Raju Tent House" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>

        {/* Category & Phone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                 <Tag size={16} className="text-orange-500" /> Category
              </label>
              <div className="relative">
                <select 
                    className="w-full p-2.5 border rounded-lg bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all h-[42px] appearance-none"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
              </div>
            </div>

            <div>
               <div className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
                  <Phone size={16} className="text-green-500" /> Contact Number
               </div>
               <Input required placeholder="98765..." value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </div>
        </div>

        {/* Address */}
        <div>
           <div className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              <MapPin size={16} className="text-red-500" /> Shop Address
           </div>
           <Input placeholder="Shop No, Area..." value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
        </div>

        {/* UPI ID */}
        <div>
           <div className="flex items-center gap-2 mb-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              <CreditCard size={16} className="text-purple-500" /> UPI ID (Optional)
           </div>
           <Input placeholder="username@upi" value={formData.upiId} onChange={(e) => setFormData({...formData, upiId: e.target.value})} />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t dark:border-slate-700">
          <Button variant="outline" onClick={onClose} type="button" className="flex-1 md:flex-none">Cancel</Button>
          <Button loading={loading} type="submit" className="flex-1 md:flex-none px-8 bg-blue-600 hover:bg-blue-700">
            {initialData ? "Save Changes" : "Save Vendor"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}