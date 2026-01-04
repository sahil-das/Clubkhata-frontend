import { useEffect, useState } from "react";
import api from "../api/axios";
import { Loader2, Shield, Clock, User, Activity, FileText } from "lucide-react";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get("/audit");
        setLogs(res.data.data);
      } catch (err) {
        console.error("Failed to load logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh] text-indigo-600">
      <Loader2 className="animate-spin w-10 h-10" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <div className="p-3 bg-gray-800 text-white rounded-xl shadow-md">
           <Shield size={24} />
        </div>
        <div>
           <h1 className="text-2xl font-bold text-gray-800">System Audit Logs</h1>
           <p className="text-gray-500 text-sm">Secure record of all administrative actions.</p>
        </div>
      </div>

      {/* LOGS LIST */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {logs.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <Activity className="w-12 h-12 mx-auto mb-2 opacity-50"/>
            <p>No activity recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map((log) => (
              <div key={log._id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center">
                
                {/* Icon based on Action */}
                <div className={`p-3 rounded-full shrink-0 ${getActionColor(log.action)}`}>
                   <Activity size={18} />
                </div>

                {/* Content */}
                <div className="flex-1">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                      <h4 className="font-bold text-gray-800 text-sm md:text-base">
                        {formatAction(log.action)}
                      </h4>
                      <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                        <Clock size={12}/> {new Date(log.createdAt).toLocaleString()}
                      </span>
                   </div>
                   
                   <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium text-gray-900">{log.target || "System"}</span>
                      {log.details && (
                        <span className="text-gray-400 ml-2 text-xs">
                           ({JSON.stringify(log.details)})
                        </span>
                      )}
                   </p>

                   <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                      <User size={12} />
                      Performed by: <span className="font-bold text-indigo-600">{log.actor?.name || "Unknown Admin"}</span>
                   </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helpers for Styling
function formatAction(action) {
  return action.replace(/_/g, " ");
}

function getActionColor(action) {
  if (action.includes("DELETE")) return "bg-red-100 text-red-600";
  if (action.includes("UPDATE")) return "bg-amber-100 text-amber-600";
  if (action.includes("CREATE") || action.includes("PAYMENT")) return "bg-emerald-100 text-emerald-600";
  return "bg-gray-100 text-gray-600";
}