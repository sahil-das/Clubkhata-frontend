import { useEffect, useState } from "react";
import { getPlatformLogs } from "../../api/platform";
import { 
  FileText, Search, Filter, Calendar, Download, 
  ChevronLeft, ChevronRight, ShieldAlert, User, Building 
} from "lucide-react";
import { Loader2 } from "lucide-react";

export default function PlatformReports() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    search: "",
    type: "ALL",
    startDate: "",
    endDate: ""
  });

  const fetchLogs = () => {
    setLoading(true);
    getPlatformLogs({ page, limit: 15, ...filters })
      .then(res => {
        setLogs(res.data.data);
        setTotalPages(res.data.pagination.pages);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs();
    }, 500); // Debounce search
    return () => clearTimeout(delayDebounceFn);
  }, [page, filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
    setPage(1); // Reset to page 1 on filter change
  };

  // 🎨 Helper for Action Badges
  const getActionColor = (action) => {
    if (action.includes("DELETE") || action.includes("SUSPEND")) return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800";
    if (action.includes("CREATE") || action.includes("REGISTER")) return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
    if (action.includes("LOGIN")) return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
    return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
  };

  return (
    <div className="md:ml-72 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 pt-24 md:p-10 transition-colors duration-300">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">System Reports</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Audit trail of all platform activities.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md transition-all text-sm font-bold">
            <Download size={16} /> Export CSV
        </button>
      </div>

      {/* --- FILTERS BAR --- */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm mb-6 flex flex-col lg:flex-row gap-4">
        
        {/* Search */}
        <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                name="search"
                placeholder="Search actions, targets, or details..." 
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all"
                value={filters.search}
                onChange={handleFilterChange}
            />
        </div>

        {/* Action Type */}
        <div className="relative w-full lg:w-48">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
                name="type"
                className="w-full pl-10 pr-8 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none appearance-none cursor-pointer"
                value={filters.type}
                onChange={handleFilterChange}
            >
                <option value="ALL">All Actions</option>
                <option value="LOGIN_SUCCESS">Logins</option>
                <option value="CLUB_REGISTERED">Registrations</option>
                <option value="CLUB_SUSPENDED">Suspensions</option>
                <option value="PAYMENT_COLLECTED">Payments</option>
            </select>
        </div>

        {/* Date Range */}
        <div className="flex gap-2">
            <div className="relative">
                <input 
                    type="date" 
                    name="startDate"
                    className="pl-3 pr-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-sm"
                    value={filters.startDate}
                    onChange={handleFilterChange}
                />
            </div>
            <span className="self-center text-slate-400">-</span>
            <div className="relative">
                <input 
                    type="date" 
                    name="endDate"
                    className="pl-3 pr-2 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-sm"
                    value={filters.endDate}
                    onChange={handleFilterChange}
                />
            </div>
        </div>
      </div>

      {/* --- LOGS TABLE --- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
             <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-4 text-indigo-500" size={32} />
                <p>Fetching Records...</p>
             </div>
        ) : (
            <>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                            <th className="px-6 py-4">Timestamp</th>
                            <th className="px-6 py-4">Actor</th>
                            <th className="px-6 py-4">Action</th>
                            <th className="px-6 py-4">Target / Club</th>
                            <th className="px-6 py-4">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {logs.length > 0 ? logs.map(log => (
                            <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors text-sm">
                                {/* 1. TIME */}
                                <td className="px-6 py-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono">
                                    {new Date(log.createdAt).toLocaleString()}
                                </td>

                                {/* 2. ACTOR */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-1.5 rounded-full ${log.actor?.isPlatformAdmin ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-500"}`}>
                                            {log.actor?.isPlatformAdmin ? <ShieldAlert size={14} /> : <User size={14} />}
                                        </div>
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{log.actor?.name || "Unknown"}</span>
                                    </div>
                                </td>

                                {/* 3. ACTION */}
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded text-xs font-bold border ${getActionColor(log.action)}`}>
                                        {log.action.replace(/_/g, " ")}
                                    </span>
                                </td>

                                {/* 4. TARGET */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-800 dark:text-slate-200">{log.target || "-"}</span>
                                        {log.club && (
                                            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                                <Building size={12} />
                                                {log.club.name}
                                            </div>
                                        )}
                                    </div>
                                </td>

                                {/* 5. DETAILS */}
                                <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={JSON.stringify(log.details)}>
                                    {log.details ? JSON.stringify(log.details).substring(0, 50) + (JSON.stringify(log.details).length > 50 ? "..." : "") : "-"}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="p-12 text-center text-slate-400">
                                    No logs found matching criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* PAGINATION */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button 
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                    <ChevronLeft size={20} />
                </button>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Page {page} of {totalPages}
                </span>
                <button 
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 transition-colors"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
            </>
        )}
      </div>
    </div>
  );
}