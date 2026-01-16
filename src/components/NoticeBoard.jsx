import { useEffect, useState } from "react";
// ❌ REMOVE: import api from "../api/notices";
// ✅ ADD: Named imports
import { fetchNotices, deleteNotice } from "../api/notices"; 
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext"; 
import { Bell, Plus, Trash2, Calendar, Loader2, Megaphone, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";
import { Card } from "./ui/Card";
import ConfirmModal from "./ui/ConfirmModal"; 
import AddNoticeModal from "./AddNoticeModal"; 

export default function NoticeBoard() {
  const { activeClub } = useAuth();
  const toast = useToast();
  
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    if (activeClub) loadNotices();
  }, [activeClub]);

  const loadNotices = async () => {
    try {
      // ✅ FIX: Call function directly
      const res = await fetchNotices();
      setNotices(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      // ✅ FIX: Call function directly
      await deleteNotice(deleteId);
      setNotices(prev => prev.filter(n => n._id !== deleteId));
      toast.success("Notice removed");
    } catch (err) {
      toast.error("Failed to delete notice");
    } finally {
      setDeleteId(null);
    }
  };

  // ... (Rest of component remains exactly the same) ...
  const getNoticeStyle = (type) => {
      switch(type) {
          case 'urgent': return { 
              bg: 'bg-rose-50 dark:bg-rose-900/10', 
              border: 'border-rose-100 dark:border-rose-900/30', 
              icon: <AlertCircle size={16} className="text-rose-500" />,
              title: 'text-rose-700 dark:text-rose-400'
          };
          case 'warning': return { 
              bg: 'bg-amber-50 dark:bg-amber-900/10', 
              border: 'border-amber-100 dark:border-amber-900/30', 
              icon: <AlertTriangle size={16} className="text-amber-500" />,
              title: 'text-amber-700 dark:text-amber-400'
          };
          case 'success': return { 
              bg: 'bg-emerald-50 dark:bg-emerald-900/10', 
              border: 'border-emerald-100 dark:border-emerald-900/30', 
              icon: <CheckCircle size={16} className="text-emerald-500" />,
              title: 'text-emerald-700 dark:text-emerald-400'
          };
          default: return { 
              bg: 'bg-slate-50 dark:bg-slate-800/50', 
              border: 'border-slate-100 dark:border-slate-700', 
              icon: <Info size={16} className="text-indigo-500" />,
              title: 'text-slate-700 dark:text-slate-200'
          };
      }
  };

  return (
    <>
      <Card className="h-full flex flex-col min-h-[320px] shadow-sm border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900" noPadding>
         {/* Header */}
         <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
               <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Megaphone size={16} />
               </div>
               Notice Board
            </h3>
            {activeClub?.role === "admin" && (
               <button 
                  onClick={() => setShowAdd(true)}
                  className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 hover:text-indigo-600 transition shadow-sm text-slate-500 dark:text-slate-400"
                  title="Add Notice"
               >
                  <Plus size={16} />
               </button>
            )}
         </div>

         {/* Content */}
         <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
            {loading ? (
               <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                  <Loader2 className="animate-spin" />
                  <span className="text-xs">Loading updates...</span>
               </div>
            ) : notices.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-center">
                  <Bell className="mb-2 opacity-20" size={32} />
                  <p className="text-sm font-medium">No new announcements</p>
               </div>
            ) : (
               notices.map((notice) => {
                  const style = getNoticeStyle(notice.type);
                  return (
                      <div key={notice._id} className={`group relative p-4 rounded-xl border transition-all ${style.bg} ${style.border}`}>
                         <div className="flex justify-between items-start mb-1">
                             <h4 className={`text-sm font-bold flex items-center gap-2 ${style.title}`}>
                                 {style.icon} {notice.title}
                             </h4>
                             <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap ml-2">
                                {new Date(notice.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                             </span>
                         </div>
                         
                         <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed pl-6">
                            {notice.message}
                         </p>
                         
                         {activeClub?.role === "admin" && (
                            <button 
                              onClick={() => setDeleteId(notice._id)}
                              className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            >
                               <Trash2 size={14} />
                            </button>
                         )}
                      </div>
                  );
               })
            )}
         </div>
      </Card>

      {/* Modals */}
      {showAdd && <AddNoticeModal onClose={() => setShowAdd(false)} refresh={loadNotices} />}
      
      <ConfirmModal 
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Notice?"
        message="This will remove the announcement for all members."
        isDangerous={true}
      />
    </>
  );
}