import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { X, LogOut, ChevronRight } from "lucide-react";
import { clsx } from "clsx";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { NAV_ITEMS } from "../config/navigation";

export default function Sidebar({ isOpen, onClose }) {
  const { user, activeClub, logout } = useAuth();
  const userRole = activeClub?.role || "member";
  
  // State to track if we should show Weekly/Monthly link
  const [frequency, setFrequency] = useState(null); 

  // ✅ Fetch Active Year to determine Menu Label
  useEffect(() => {
    const fetchActiveYear = async () => {
      try {
        const res = await api.get("/years/active");
        if (res.data.data) {
          setFrequency(res.data.data.subscriptionFrequency); // 'weekly', 'monthly', or 'none'
        }
      } catch (err) { 
        console.error("Failed to fetch year config", err); 
      }
    };
    
    if (activeClub) fetchActiveYear();
  }, [activeClub]);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      logout();
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 shadow-sm">
      {/* HEADER */}
      <div className="h-16 flex items-center px-6 border-b border-slate-100">
        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold mr-3 shadow-md shadow-primary-200">
          SC
        </div>
        <div className="overflow-hidden">
            <h1 className="font-bold text-slate-800 tracking-tight leading-none truncate">Clubkhata</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1 truncate">
                {activeClub?.clubName || "Dashboard"}
            </p>
        </div>
        <button onClick={onClose} className="md:hidden ml-auto text-slate-400">
          <X size={20} />
        </button>
      </div>

      {/* NAV LINKS */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          // 1. Role Check
          if (!item.roles.includes(userRole)) return null;

          // 2. Dynamic Logic for Subscriptions/Chanda
          let label = item.label;
          
          if (item.path === "/contributions") {
            // HIDE if no frequency set
            if (!frequency || frequency === "none") return null;

            // RENAME based on type
            label = frequency === "weekly" ? "Weekly Chanda" : "Monthly Chanda";
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => onClose && window.innerWidth < 768 && onClose()}
              className={({ isActive }) => clsx(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary-50 text-primary-700 font-bold shadow-sm ring-1 ring-primary-100" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon 
                    size={20} 
                    className={isActive ? "text-primary-600" : "text-slate-400 group-hover:text-slate-600"} 
                  />
                  {/* ✅ Use the dynamic label */}
                  <span>{label}</span>
                  
                  {isActive && (
                    <ChevronRight size={16} className="ml-auto text-primary-400" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 mb-3 border border-slate-100">
          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
             {user?.name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
             <p className="text-sm font-bold text-slate-700 truncate">{user?.name}</p>
             <p className="text-xs text-slate-500 capitalize">{userRole}</p>
          </div>
        </div>
        
        <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors"
        >
            <LogOut size={16} /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:block w-64 h-screen fixed left-0 top-0 z-40">
        <SidebarContent />
      </aside>

      {/* MOBILE OVERLAY & DRAWER */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm animate-fade-in" 
            onClick={onClose}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-2xl animate-slide-right">
             <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}