import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  X, ChevronLeft, ChevronRight, ShieldAlert // 👈 Added Icon
} from "lucide-react";
import menuItems from "../config/navigation";

export default function Sidebar({ isOpen, onClose }) {
  const { activeClub, user } = useAuth(); // 👈 Get 'user' to check admin status
  const location = useLocation();
  const [frequency, setFrequency] = useState(null);
  const [collapsed, setCollapsed] = useState(false);

  // Fetch Year Config
  useEffect(() => {
    const fetchActiveYear = async () => {
      if (activeClub) {
        try {
          const res = await api.get("/years/active");
          if (res.data.data) setFrequency(res.data.data.subscriptionFrequency);
        } catch (err) { console.error(err); }
      }
    };
    fetchActiveYear();
  }, [activeClub]);

  const isActive = (path) => location.pathname === path;
  const userRole = activeClub?.role || "member";

  return (
    <>
      {/* --- MOBILE BACKDROP --- */}
      <div
        className={`fixed inset-0 bg-slate-900/40 dark:bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* --- SIDEBAR CONTAINER --- */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 flex flex-col 
        bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 shadow-xl 
        /* Animation Classes */
        transition-all duration-300 ease-in-out
        
        /* Mobile: Slide Logic */
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        
        /* Desktop: Always visible + Width Logic */
        md:translate-x-0 md:relative md:shadow-none
        
        /* Width Logic */
        ${collapsed ? "md:w-20 w-72" : "md:w-72 w-72"}
      `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 h-16 border-b border-slate-100 dark:border-slate-800 relative shrink-0">
           
           {/* BRANDING */}
           <div className={`
             flex items-center transition-all duration-300 ease-in-out
             ${collapsed ? "md:justify-center md:px-0 w-full" : "w-full gap-3"}
           `}>
             
            {/* LOGO */}
            <img 
              src="/logo.png" 
              alt="Club Logo" 
              className="w-8 h-8 rounded-lg object-contain bg-white dark:bg-slate-800 shadow-lg shadow-indigo-100 dark:shadow-none z-10 relative border border-slate-100 dark:border-slate-700" 
            />

             {/* TEXT */}
             <div className={`
               whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
               ${collapsed ? "md:w-0 md:opacity-0 w-40 opacity-100" : "w-40 opacity-100"}
             `}>
               <h2 className="text-sm font-bold truncate leading-tight tracking-wide text-slate-800 dark:text-slate-100">ClubKhata</h2>
               <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold truncate">
                 {activeClub?.clubName || "Select Club"}
               </p>
             </div>
           </div>

           {/* Mobile Close Button */}
           <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 absolute right-4">
             <X size={24} />
           </button>

           {/* Desktop Collapse Toggle */}
           <button
             onClick={() => setCollapsed(!collapsed)}
             className="hidden md:flex items-center justify-center w-6 h-6 rounded-full bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors absolute -right-3 top-1/2 -translate-y-1/2 border border-slate-200 dark:border-slate-700 z-50 shadow-sm"
           >
             {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
           </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 space-y-1 custom-scrollbar">
          {menuItems.map((item) => {
            if (item.roles && !item.roles.includes(userRole)) return null;

            let label = item.label;
            if (item.path === "/contributions") {
              if (!frequency || frequency === "none") return null;
              label = frequency === "weekly" ? "Weekly Collection" : "Monthly Collection";
            }

            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`
                  flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative
                  ${active 
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-100 dark:ring-indigo-900/30" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
                  }
                  ${collapsed ? "md:justify-center md:gap-0 gap-3" : "gap-3"}
                `}
              >
                {/* Icon */}
                <item.icon 
                  size={20} 
                  strokeWidth={active ? 2.5 : 2} 
                  className={`shrink-0 ${active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"}`} 
                />
                
                {/* Label */}
                <span 
                  className={`
                    font-medium text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
                    ${collapsed ? "md:w-0 md:opacity-0 w-52 opacity-100" : "w-52 opacity-100"}
                  `}
                >
                  {label}
                </span>

                {/* Tooltip */}
                {collapsed && (
                  <div className="hidden md:block absolute left-14 px-3 py-1.5 bg-slate-800 dark:bg-slate-700 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                    {label}
                    <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-800 dark:border-r-slate-700"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* 🚀 PLATFORM ADMIN SWITCH (Sticky Footer) */}
        {user?.isPlatformAdmin && (
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
                <Link
                    to="/platform"
                    className={`
                        flex items-center px-3 py-3 rounded-xl transition-all duration-200 group relative
                        bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md hover:opacity-90
                        ${collapsed ? "md:justify-center md:gap-0 gap-3" : "gap-3"}
                    `}
                >
                    <ShieldAlert size={20} strokeWidth={2} className="shrink-0" />
                    
                    <span 
                        className={`
                            font-bold text-sm whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out
                            ${collapsed ? "md:w-0 md:opacity-0 w-52 opacity-100" : "w-52 opacity-100"}
                        `}
                    >
                        Platform Panel
                    </span>

                    {/* Tooltip for Platform Button */}
                    {collapsed && (
                        <div className="hidden md:block absolute left-14 px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
                            Platform Panel
                            <div className="absolute top-1/2 -left-1 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-100"></div>
                        </div>
                    )}
                </Link>
            </div>
        )}
      </div>
    </>
  );
}