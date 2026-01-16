import { useEffect, useState } from "react";
import { getActiveBroadcasts } from "../api/notices";
import { Megaphone, X, AlertTriangle, Info, CheckCircle, Loader2 } from "lucide-react";

export default function GlobalBanner() {
  const [notices, setNotices] = useState([]);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveBroadcasts()
      .then(res => {
        // ✅ FIX: Check if 'res.data' exists (Array), otherwise default to []
        // If your API returns { success: true, data: [...] }, then 'res.data' is the array.
        setNotices(res.data || []); 
      })
      .catch(err => {
        console.error("Failed to load global notices", err);
        setNotices([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Safe check for empty or loading
  if (!visible || loading || !notices || notices.length === 0) return null;

  // Show only the latest/most urgent notice
  const activeNotice = notices[0];

  const styles = {
    info: "bg-blue-600",
    success: "bg-emerald-600",
    warning: "bg-amber-500",
    urgent: "bg-red-600",
    maintenance: "bg-slate-800"
  };

  const Icons = {
    info: Info,
    success: CheckCircle,
    warning: AlertTriangle,
    urgent: AlertTriangle,
    maintenance: Megaphone
  };

  // Fallback for missing type/icon
  const Icon = activeNotice.type && Icons[activeNotice.type] ? Icons[activeNotice.type] : Info;
  const bgColor = activeNotice.type && styles[activeNotice.type] ? styles[activeNotice.type] : "bg-indigo-600";

  return (
    <div className={`${bgColor} text-white px-4 py-3 shadow-md relative z-50 animate-in slide-in-from-top duration-300`}>
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="p-1.5 bg-white/20 rounded-full shrink-0 animate-pulse">
            <Icon size={18} />
          </div>
          <p className="font-medium text-sm truncate">
            <span className="font-bold uppercase tracking-wide opacity-90 mr-2">
                {activeNotice.title}:
            </span>
            {activeNotice.message}
          </p>
        </div>
        <button 
          onClick={() => setVisible(false)}
          className="p-1 hover:bg-white/20 rounded-full transition-colors shrink-0"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}