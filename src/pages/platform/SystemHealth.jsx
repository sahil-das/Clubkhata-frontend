import { useEffect, useState } from "react";
import { getSystemHealth } from "../../api/platform";
import { 
  Cpu, Database, Clock, Zap, RefreshCw, Server, AlertCircle 
} from "lucide-react";
import { Loader2 } from "lucide-react";

export default function SystemHealth() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await getSystemHealth();
      setData(res.data.data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000); // Auto-refresh 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="md:ml-72 min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-indigo-600" size={40} />
    </div>
  );

  return (
    <div className="md:ml-72 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 pt-24 md:p-10 transition-colors duration-300">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <ActivityPulse /> System Vitals
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
                Real-time server performance metrics.
            </p>
        </div>
        <div className="flex items-center gap-4">
            <span className="text-xs text-slate-400 font-mono hidden md:block">
                Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
            <button 
                onClick={() => fetchData(true)}
                className={`p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 transition-all ${refreshing ? "animate-spin" : ""}`}
            >
                <RefreshCw size={20} />
            </button>
        </div>
      </div>

      {/* 1. KEY METRICS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* UPTIME */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 bg-emerald-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors"></div>
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                    <Clock size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">System Uptime</p>
                    <h3 className="text-2xl font-bold font-mono tracking-tight">{data.uptime.text}</h3>
                </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 animate-pulse w-full"></div>
            </div>
        </div>

        {/* LATENCY */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-16 bg-blue-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors"></div>
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
                    <Zap size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">DB Latency</p>
                    <h3 className="text-2xl font-bold font-mono tracking-tight">{data.database.latency}</h3>
                </div>
            </div>
             <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span> Live Ping
            </div>
        </div>

        {/* SERVER LOAD (MOCKED VISUAL) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
             <div className="absolute top-0 right-0 p-16 bg-purple-500/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-purple-500/10 transition-colors"></div>
            <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
                    <Cpu size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Memory Usage</p>
                    <h3 className="text-2xl font-bold font-mono tracking-tight">{data.memory.percent}%</h3>
                </div>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-purple-500 transition-all duration-1000" 
                    style={{ width: `${data.memory.percent}%` }}
                ></div>
            </div>
        </div>
      </div>

      {/* 2. DETAILED SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* DATABASE DETAILS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Database size={20} className="text-indigo-500" />
                Database Configuration
            </h3>
            
            <div className="space-y-4">
                <InfoRow label="Status" value={data.database.status} status={data.database.status === "Connected"} />
                <InfoRow label="Host" value={data.database.host} />
                <InfoRow label="Database Name" value={data.database.name} />
                <InfoRow label="Connection Type" value="Mongoose Driver" />
            </div>
        </div>

        {/* SERVER ENVIRONMENT */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                <Server size={20} className="text-slate-500" />
                Server Environment
            </h3>

            <div className="space-y-4">
                <InfoRow label="Node.js Version" value={data.server.nodeVersion} />
                <InfoRow label="OS Platform" value={`${data.server.platform} (${data.server.cpuArch})`} />
                <InfoRow label="CPU Cores" value={data.server.cpuCores} />
                <InfoRow label="Heap Used" value={data.memory.heapUsed} />
                <InfoRow label="Heap Total" value={data.memory.heapTotal} />
            </div>
        </div>
      </div>
    </div>
  );
}

// 🎨 Helper Component
function InfoRow({ label, value, status }) {
    return (
        <div className="flex justify-between items-center py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</span>
            <div className="flex items-center gap-2">
                {status !== undefined && (
                    <span className={`h-2 w-2 rounded-full ${status ? "bg-emerald-500" : "bg-red-500"}`}></span>
                )}
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 font-mono">{value}</span>
            </div>
        </div>
    );
}

function ActivityPulse() {
    return (
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
    );
}