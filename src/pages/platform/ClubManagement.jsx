import { useEffect, useState } from "react";
import { getAllClubs, toggleClubStatus, impersonateUser } from "../../api/platform";
import { Power, Search, Loader2, Mail, Calendar, Ghost } from "lucide-react";
import { toast } from "react-hot-toast";

export default function ClubManagement() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchClubs = () => {
    setLoading(true);
    getAllClubs()
        .then(res => setClubs(res.data.data))
        .catch(err => {
            console.error(err);
            toast.error("Failed to load clubs");
        })
        .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClubs(); }, []);

  // --- ACTIONS ---

  const handleToggle = async (id, currentStatus) => {
    const action = currentStatus ? "suspend" : "activate";
    if(!window.confirm(`Are you sure you want to ${action} this club?\nSuspended clubs cannot log in.`)) return;
    
    try {
        await toggleClubStatus(id);
        toast.success(`Club ${action}ed successfully`);
        fetchClubs(); 
    } catch (err) {
        toast.error("Failed to update status");
    }
  };

  const handleImpersonate = async (user) => {
    if (!user?._id) return;
    
    if (!window.confirm(`⚠️ GHOST MODE ACTIVATE\n\nYou are about to log in as "${user.name}".\nYou will see exactly what they see.\n\nProceed?`)) {
        return;
    }

    try {
        const res = await impersonateUser(user._id);
        const { accessToken, refreshToken, clubs } = res.data;

        // 1. Manually set LocalStorage with new tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        
        // 2. Set Active Club (Pick first one or clear if none)
        if (clubs && clubs.length > 0) {
            localStorage.setItem("activeClubId", clubs[0].clubId);
        } else {
            localStorage.removeItem("activeClubId");
        }

        toast.success(`Logged in as ${user.name}`);

        // 3. Hard Redirect to Dashboard (Forces App re-render with new user context)
        setTimeout(() => {
            window.location.href = "/"; 
        }, 800);

    } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.message || "Impersonation failed");
    }
  };

  // --- FILTERING ---
  const filtered = clubs.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.code.toLowerCase().includes(search.toLowerCase()) ||
    c.owner?.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="md:ml-72 min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 pt-24 md:p-10 transition-colors duration-300">
      
      {/* --- HEADER & ACTIONS --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Club Management</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage subscriptions, status, and access.</p>
        </div>
        
        <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input 
                type="text" 
                placeholder="Search by name, code, or email..." 
                className="block w-full pl-10 pr-4 py-3 border border-slate-200 dark:border-slate-800 rounded-xl leading-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
                onChange={e => setSearch(e.target.value)}
                value={search}
            />
        </div>
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
             <div className="p-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="animate-spin mb-4 text-indigo-500" size={32} />
                <p>Loading Clubs...</p>
             </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold">
                            <th className="px-6 py-4">Club Details</th>
                            <th className="px-6 py-4">Administrator</th>
                            <th className="px-6 py-4">Registered On</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filtered.length > 0 ? filtered.map(club => (
                            <tr key={club._id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                
                                {/* 1. CLUB NAME + CODE */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shadow-sm">
                                            {club.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white">{club.name}</p>
                                            <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                {club.code}
                                            </span>
                                        </div>
                                    </div>
                                </td>

                                {/* 2. OWNER INFO */}
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="font-medium text-slate-700 dark:text-slate-200">{club.owner?.name}</span>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                                            <Mail size={12} />
                                            {club.owner?.email}
                                        </div>
                                    </div>
                                </td>

                                {/* 3. DATE */}
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                        <Calendar size={14} className="text-slate-400" />
                                        {new Date(club.createdAt).toLocaleDateString(undefined, {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                        })}
                                    </div>
                                </td>

                                {/* 4. STATUS PILL */}
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-sm ${
                                        club.isActive 
                                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800" 
                                            : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
                                    }`}>
                                        <span className={`h-1.5 w-1.5 rounded-full ${club.isActive ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`}></span>
                                        {club.isActive ? "Active" : "Suspended"}
                                    </span>
                                </td>

                                {/* 5. ACTIONS */}
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        
                                        {/* A. GHOST BUTTON (Impersonate) */}
                                        <button 
                                            onClick={() => handleImpersonate(club.owner)}
                                            className="p-2 rounded-lg text-indigo-500 border border-indigo-200 dark:border-indigo-900/50 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all hover:scale-105"
                                            title="Ghost Mode: Log in as this Admin"
                                        >
                                            <Ghost size={18} />
                                        </button>

                                        {/* B. TOGGLE STATUS BUTTON */}
                                        <button 
                                            onClick={() => handleToggle(club._id, club.isActive)}
                                            className={`p-2 rounded-lg transition-all duration-200 border hover:scale-105 ${
                                                club.isActive 
                                                    ? "text-red-500 border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-900/20" 
                                                    : "text-emerald-500 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                            }`}
                                            title={club.isActive ? "Suspend Club" : "Activate Club"}
                                        >
                                            <Power size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center text-slate-400">
                                        <Search size={48} className="mb-4 text-slate-200 dark:text-slate-800" />
                                        <p className="text-lg font-medium text-slate-500 dark:text-slate-400">No clubs found</p>
                                        <p className="text-sm">Try searching for a different name or code.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
}