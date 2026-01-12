import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Database,Megaphone, LogOut, Menu, X, Sun, Moon, FileText, Activity
} from "lucide-react";
import { useTheme } from "../context/ThemeContext"; 

export default function PlatformSidebar() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path) => location.pathname === path;
  const closeSidebar = () => setIsOpen(false);

  const menu = [
    { label: "Overview", path: "/platform", icon: LayoutDashboard },
    { label: "Manage Clubs", path: "/platform/clubs", icon: Database },
    { label: "Reports", path: "/platform/reports", icon: FileText },
    { label: "Broadcasts", path: "/platform/announcements", icon: Megaphone },
    { label: "System Health", path: "/platform/health", icon: Activity },
  ];

  return (
    <>
      {/* 📱 MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-40 transition-colors">
        <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">ClubKhata <span className="text-[10px] align-top bg-red-600 text-white px-1 rounded ml-1">SUPER</span></h1>
        </div>
        <button onClick={() => setIsOpen(true)} className="p-2 text-slate-600 dark:text-slate-300">
          <Menu size={24} />
        </button>
      </div>

      {/* 🌑 MOBILE BACKDROP */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={closeSidebar}
        />
      )}

      {/* 🧊 SIDEBAR CONTAINER */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 ease-in-out
        /* 🚀 FIX: Dynamic Background & Text Colors */
        bg-white dark:bg-slate-900 
        text-slate-900 dark:text-white
        border-r border-slate-200 dark:border-slate-800
        ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
      `}>
        
        {/* HEADER */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">ClubKhata</h1> 
            <span className="text-xs text-slate-500 dark:text-slate-400 tracking-wider">PLATFORM ADMIN</span>
          </div>
          <button onClick={closeSidebar} className="md:hidden text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 p-4 space-y-2">
          {menu.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive(item.path) 
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 dark:shadow-indigo-900/50" 
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* FOOTER ACTIONS */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
           {/* THEME TOGGLE */}
           <button 
            onClick={toggleTheme}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            <span className="font-medium">{theme === 'dark' ? "Light Mode" : "Dark Mode"}</span>
          </button>

          {/* EXIT */}
          <Link 
            to="/" 
            className="flex items-center gap-3 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Exit to App</span>
          </Link>
        </div>
      </div>
    </>
  );
}