import { useState, useEffect, useMemo } from "react";
import { getAssets, deleteAsset } from "../api/assets"; // Ensure these exist in api/assets.js
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { exportAssetsPDF } from "../utils/pdfExport";
import { 
  Package, Plus, Search, MapPin, Box, Edit2, Trash2, Download, Filter 
} from "lucide-react";

// Components
import AddAssetModal from "../components/AddAssetModal";
import EditAssetModal from "../components/EditAssetModal";
import ConfirmModal from "../components/ui/ConfirmModal";

export default function Assets() {
  const { activeClub } = useAuth();
  const toast = useToast();
  
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null); // If not null, show Edit Modal
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null });

  // 1. Fetch Data
  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await getAssets();
      setAssets(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load registry");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeClub) fetchAssets();
  }, [activeClub]);

  // 2. Calculations
  const filteredAssets = useMemo(() => {
     return assets.filter(a => 
        a.name.toLowerCase().includes(search.toLowerCase()) || 
        a.location.toLowerCase().includes(search.toLowerCase())
     );
  }, [assets, search]);

  const totalValue = assets.reduce((sum, a) => sum + (a.estimatedValue || 0), 0);
  const totalItems = assets.reduce((sum, a) => sum + (a.quantity || 0), 0);

  // 3. Handlers
  const handleDelete = async () => {
    try {
      await deleteAsset(confirmDelete.id);
      setAssets(prev => prev.filter(a => a._id !== confirmDelete.id));
      toast.success("Asset removed from registry");
    } catch (err) {
      toast.error("Failed to delete asset");
    } finally {
      setConfirmDelete({ isOpen: false, id: null });
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Package className="text-blue-600" /> Asset Registry
                </h1>
                <p className="text-slate-500 text-sm">Track club property, inventory, and storage locations.</p>
            </div>
            
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
                 <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl text-right border border-blue-100 dark:border-blue-900/30">
                    <p className="text-[10px] font-bold text-blue-500 uppercase">Total Inventory Value</p>
                    <p className="text-xl font-mono font-bold text-blue-700 dark:text-blue-300">₹{totalValue.toLocaleString()}</p>
                 </div>
                 
                 {activeClub?.role === 'admin' && (
                    <button 
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
                    >
                        <Plus size={18} /> Add Item
                    </button>
                 )}
            </div>
        </div>

        {/* TOOLBAR */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 justify-between">
            <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input 
                    type="text"
                    placeholder="Search by name or location..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            
            <button 
                onClick={() => exportAssetsPDF({ clubName: activeClub?.clubName, assets: filteredAssets })}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors"
            >
                <Download size={18} /> Export List
            </button>
        </div>

        {/* ASSET GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAssets.map((asset) => (
                <div key={asset._id} className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group relative">
                    
                    {/* Top Row */}
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-500 rounded-xl">
                            <Box size={24} />
                        </div>
                        
                        {/* Location Badge */}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 max-w-[50%]">
                            <MapPin size={12} className="text-slate-400 shrink-0" />
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate">
                                {asset.location}
                            </span>
                        </div>
                    </div>
                    
                    {/* Details */}
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 line-clamp-1" title={asset.name}>
                        {asset.name}
                    </h3>
                    
                    <div className="space-y-2 border-t border-slate-50 dark:border-slate-800 pt-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Quantity</span>
                            <span className="font-bold font-mono text-slate-700 dark:text-slate-200">{asset.quantity} Units</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-500">Est. Value</span>
                            <span className="font-bold font-mono text-slate-700 dark:text-slate-200">
                                {asset.estimatedValue > 0 ? `₹${asset.estimatedValue.toLocaleString()}` : '-'}
                            </span>
                        </div>
                    </div>

                    {/* Admin Actions Overlay (Visible on Hover/Touch) */}
                    {activeClub?.role === 'admin' && (
                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => setEditingAsset(asset)}
                                className="p-2 bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                title="Edit Location/Details"
                            >
                                <Edit2 size={14} />
                            </button>
                            <button 
                                onClick={() => setConfirmDelete({ isOpen: true, id: asset._id })}
                                className="p-2 bg-white dark:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-600 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                                title="Delete Item"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
        
        {/* Empty State */}
        {filteredAssets.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Filter size={48} className="mb-4 opacity-20" />
                <p>No assets found matching your search.</p>
            </div>
        )}

        {/* MODALS */}
        {showAddModal && <AddAssetModal onClose={() => setShowAddModal(false)} refresh={fetchAssets} />}
        
        {editingAsset && (
            <EditAssetModal 
                asset={editingAsset} 
                onClose={() => setEditingAsset(null)} 
                refresh={fetchAssets} 
            />
        )}

        <ConfirmModal 
            isOpen={confirmDelete.isOpen}
            onClose={() => setConfirmDelete({ isOpen: false, id: null })}
            onConfirm={handleDelete}
            title="Delete Asset?"
            message="Are you sure you want to remove this item from the registry? This cannot be undone."
            isDangerous={true}
        />
    </div>
  );
}