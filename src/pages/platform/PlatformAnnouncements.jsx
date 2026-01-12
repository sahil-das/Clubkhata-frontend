import { useEffect, useState } from "react";
import { createGlobalNotice, getGlobalNotices, deleteGlobalNotice } from "../../api/platform";
import { Megaphone, Trash2, Send, AlertTriangle } from "lucide-react";
import { toast } from "react-hot-toast";

export default function PlatformAnnouncements() {
  const [notices, setNotices] = useState([]);
  const [form, setForm] = useState({ title: "", message: "", type: "info", daysDuration: 3 });
  const [loading, setLoading] = useState(false);

  const fetchNotices = () => getGlobalNotices().then(res => setNotices(res.data.data));

  useEffect(() => { fetchNotices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createGlobalNotice(form);
      toast.success("Broadcast sent successfully!");
      setForm({ title: "", message: "", type: "info", daysDuration: 3 });
      fetchNotices();
    } catch (err) {
      toast.error("Failed to send broadcast");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this broadcast?")) return;
    await deleteGlobalNotice(id);
    fetchNotices();
    toast.success("Broadcast deleted");
  };

  return (
    <div className="md:ml-72 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 pt-24 md:p-10">
      
      <div className="mb-8">
        <h1 className="text-2xl font-bold flex items-center gap-3">
            <Megaphone className="text-indigo-600" /> Global Announcements
        </h1>
        <p className="text-slate-500 mt-1">Send system-wide alerts to all clubs.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CREATE FORM */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
            <h2 className="font-bold text-lg mb-4">Send New Broadcast</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Title (e.g., Maintenance)</label>
                    <input 
                        className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" 
                        value={form.title}
                        onChange={e => setForm({...form, title: e.target.value})}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Message</label>
                    <textarea 
                        className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700" 
                        rows="3"
                        value={form.message}
                        onChange={e => setForm({...form, message: e.target.value})}
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Type</label>
                        <select 
                            className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700"
                            value={form.type}
                            onChange={e => setForm({...form, type: e.target.value})}
                        >
                            <option value="info">Info (Blue)</option>
                            <option value="success">Success (Green)</option>
                            <option value="warning">Warning (Amber)</option>
                            <option value="urgent">Urgent (Red)</option>
                            <option value="maintenance">Maintenance (Dark)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Duration (Days)</label>
                        <input 
                            type="number"
                            className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700"
                            value={form.daysDuration}
                            onChange={e => setForm({...form, daysDuration: e.target.value})}
                        />
                    </div>
                </div>

                <button 
                    disabled={loading}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                >
                    {loading ? "Sending..." : <><Send size={18} /> Broadcast Now</>}
                </button>
            </form>
        </div>

        {/* ACTIVE LIST */}
        <div className="lg:col-span-2">
            <h2 className="font-bold text-lg mb-4">Active Broadcasts</h2>
            <div className="space-y-4">
                {notices.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                        No active announcements.
                    </div>
                ) : notices.map(notice => (
                    <div key={notice._id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
                        <div className={`p-3 rounded-lg shrink-0 ${
                            notice.type === 'urgent' ? 'bg-red-100 text-red-600' :
                            notice.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-blue-600'
                        }`}>
                            <AlertTriangle size={20} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold">{notice.title}</h3>
                            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{notice.message}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-400">
                                <span>Expires: {new Date(notice.expiresAt).toLocaleDateString()}</span>
                                <span className="uppercase px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">{notice.type}</span>
                            </div>
                        </div>
                        <button 
                            onClick={() => handleDelete(notice._id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
}