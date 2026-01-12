// src/pages/platform/PlatformDashboard.jsx
import { useEffect, useState } from "react";
import { getPlatformStats } from "../../api/platform";
import {
  Server, Activity, Users, Building,
  ArrowUpRight, TrendingUp, ShieldCheck, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PlatformDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPlatformStats()
      .then(res => setStats(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Live Date Widget
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  if (loading) return (
    <div className="md:ml-72 min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-bounce"></div>
            <p className="text-slate-400 font-medium">Loading System Analytics...</p>
        </div>
    </div>
  );

  return (
    <div className="md:ml-72 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 pt-24 md:p-10 transition-colors duration-300">
      
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
            <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">Super Admin Console</p>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Overview</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time monitoring and global metrics.</p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <Clock size={16} className="text-indigo-500" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{today}</span>
        </div>
      </div>
      
      {/* --- KEY METRICS GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        
        {/* 1. DATABASE HEALTH (Special Card) */}
        <div className={`
            relative overflow-hidden rounded-2xl p-6 border transition-all duration-300 group
            ${stats.systemHealth.status === "UP" 
                ? "bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20" 
                : "bg-red-500 text-white border-red-400 shadow-lg shadow-red-500/20"}
        `}>
            <div className="absolute -right-6 -top-6 h-32 w-32 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform"></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <Server size={24} className="text-white" />
                </div>
                {stats.systemHealth.status === "UP" && (
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-xs font-bold backdrop-blur-md">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                        </span>
                        OPERATIONAL
                    </div>
                )}
            </div>
            
            <div className="relative z-10">
                <p className="text-emerald-50 opacity-90 font-medium text-sm">Database Connection</p>
                <h3 className="text-3xl font-bold mt-1 tracking-tight">{stats.systemHealth.status}</h3>
            </div>
        </div>

        {/* 2. TRAFFIC (Graph Style) */}
        <StatCard 
            label="24h Traffic" 
            value={stats.traffic}
            suffix="reqs"
            icon={Activity} 
            color="blue"
            trend="+18%" // Mocked trend
        />
        
        {/* 3. TOTAL USERS */}
        <StatCard 
            label="Total Users" 
            value={stats.users} 
            icon={Users} 
            color="indigo" 
            trend="+5%"
        />

        {/* 4. TOTAL CLUBS */}
        <StatCard 
            label="Registered Clubs" 
            value={stats.clubs.total} 
            icon={Building} 
            color="purple" 
            trend="+2"
        />
      </div>

      {/* --- DETAILED SECTIONS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         {/* STATUS DISTRIBUTION */}
         <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Platform Activity</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Club subscription status overview</p>
                </div>
                <button 
                  onClick={() => navigate("/platform/reports")}
                  className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline">
                    View Report
                </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-emerald-200 dark:hover:border-emerald-800 transition-colors">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Active Clubs</p>
                        <h4 className="text-4xl font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{stats.clubs.active}</h4>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck size={24} />
                    </div>
                </div>

                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between group hover:border-red-200 dark:hover:border-red-800 transition-colors">
                    <div>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Suspended</p>
                        <h4 className="text-4xl font-extrabold text-slate-900 dark:text-white group-hover:text-red-500 dark:group-hover:text-red-400 transition-colors">{stats.clubs.inactive}</h4>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                        <Building size={24} />
                    </div>
                </div>
            </div>

            {/* Mock Visual Progress Bar */}
            <div className="mt-8">
                <div className="flex justify-between text-sm font-medium mb-2">
                    <span className="text-slate-600 dark:text-slate-300">System Capacity</span>
                    <span className="text-indigo-600 dark:text-indigo-400">42%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[42%] rounded-full"></div>
                </div>
            </div>
         </div>

         {/* QUICK ACTIONS / SIDE PANEL */}
         <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative z-10">
                <h3 className="text-lg font-bold mb-6">Quick Actions</h3>
                
                <div className="space-y-4">
                    <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-3 transition-all group">
                        <div className="p-2 bg-indigo-500 rounded-lg group-hover:scale-110 transition-transform">
                            <TrendingUp size={18} />
                        </div>
                        <span className="font-medium text-sm">Generate Audit Report</span>
                    </button>
                    
                    <button className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-xl flex items-center gap-3 transition-all group">
                         <div className="p-2 bg-pink-500 rounded-lg group-hover:scale-110 transition-transform">
                            <ShieldCheck size={18} />
                        </div>
                        <span className="font-medium text-sm">Review Security Logs</span>
                    </button>
                </div>

                <div className="mt-8 pt-8 border-t border-white/10">
                    <p className="text-xs text-indigo-200 mb-2">System Version</p>
                    <p className="font-mono text-sm">v1.2.0 (Stable)</p>
                </div>
            </div>
         </div>

      </div>
    </div>
  );
}

// 🎨 REUSABLE STAT CARD COMPONENT
function StatCard({ label, value, suffix, icon: Icon, color, trend }) {
    const colors = {
        blue: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40",
        indigo: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40",
        purple: "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/40",
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl transition-colors ${colors[color]}`}>
                    <Icon size={24} />
                </div>
                {trend && (
                    <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-lg">
                        <ArrowUpRight size={12} />
                        {trend}
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    {value} <span className="text-base font-normal text-slate-400 ml-1">{suffix}</span>
                </h3>
            </div>
        </div>
    )
}