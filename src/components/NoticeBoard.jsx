import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Bell, Plus, Trash2, Calendar, Loader2 } from "lucide-react";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";

export default function NoticeBoard() {
  const { activeClub } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, [activeClub]);

  const fetchNotices = async () => {
    try {
      const res = await api.get("/notices");
      setNotices(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    const text = prompt("Enter notice message:");
    if (!text) return;
    try {
      await api.post("/notices", { title: "Notice", content: text, priority: "normal" });
      fetchNotices();
    } catch (err) {
      alert("Failed to add notice");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete notice?")) return;
    try {
      await api.delete(`/notices/${id}`);
      setNotices(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      alert("Failed");
    }
  };

  return (
    <Card className="h-full flex flex-col min-h-[300px]" noPadding>
       <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
             <Bell className="text-amber-500" size={20} /> Notice Board
          </h3>
          {activeClub?.role === "admin" && (
             <button 
                onClick={handleAdd}
                className="p-1.5 bg-white border border-slate-200 rounded-lg hover:border-primary-500 hover:text-primary-600 transition shadow-sm"
             >
                <Plus size={16} />
             </button>
          )}
       </div>

       <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
          {loading ? (
             <div className="flex justify-center py-10"><Loader2 className="animate-spin text-slate-300"/></div>
          ) : notices.length === 0 ? (
             <div className="text-center py-10 text-slate-400">
                <p className="text-sm">No notices yet.</p>
             </div>
          ) : (
             notices.map((notice) => (
                <div key={notice._id} className="group relative bg-amber-50/50 border border-amber-100 p-4 rounded-xl hover:bg-amber-50 transition-colors">
                   <p className="text-slate-700 text-sm font-medium leading-relaxed">{notice.content}</p>
                   <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <Calendar size={12} /> {new Date(notice.createdAt).toLocaleDateString()}
                   </div>
                   
                   {activeClub?.role === "admin" && (
                      <button 
                        onClick={() => handleDelete(notice._id)}
                        className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-white rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                         <Trash2 size={14} />
                      </button>
                   )}
                </div>
             ))
          )}
       </div>
    </Card>
  );
}