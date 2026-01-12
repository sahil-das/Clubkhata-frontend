import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Menu, User, LogOut, Settings, Sun, Moon, Monitor } from "lucide-react";

export default function TopBar({ onMenuClick }) {
  const { user, activeClub, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white dark:bg-slate-900 shadow-sm border-b border-gray-100 dark:border-slate-800 h-16 flex items-center justify-between px-4 md:px-8 z-20 relative shrink-0 transition-colors duration-200">
      
      {/* Left: Mobile Menu & Branding */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick} 
          className="md:hidden text-slate-500 dark:text-slate-400 hover:text-indigo-600 transition-colors p-1"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 md:hidden tracking-tight">
          ClubKhata
        </h2>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-4 md:gap-6">

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 focus:outline-none group text-left"
          >
            {/* Name & Role Label */}
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {user?.name}
              </p>
              <p className={`text-[10px] font-bold uppercase tracking-wider text-right ${
                activeClub?.role === 'admin' ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400'
              }`}>
                {activeClub?.role || "Member"}
              </p>
            </div>
            
            {/* Avatar Circle */}
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border-2 border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
              {user?.name?.charAt(0)}
            </div>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 overflow-hidden transform origin-top-right transition-all animate-in fade-in zoom-in-95 duration-200 z-50">
              
              {/* User Info Header */}
              <div className="p-4 border-b border-gray-50 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Signed in as</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate" title={user?.email}>
                  {user?.email}
                </p>
              </div>



              {/* Menu Links */}
              <div className="p-2 space-y-1">
                <Link 
                  to="/profile" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors"
                >
                  <User size={18} /> My Profile
                </Link>
                
                <Link 
                  to="/settings" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors"
                >
                  <Settings size={18} /> Settings
                </Link>
              </div>


              {/* Theme Switcher (Moved here) */}
              <div className="px-4 py-3 border-b border-gray-50 dark:border-slate-800">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Appearance</p>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                      theme === 'light' 
                        ? 'bg-white dark:bg-slate-700 text-yellow-600 dark:text-yellow-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    <Sun size={14} /> Light
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                      theme === 'system' 
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    <Monitor size={14} /> Auto
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-xs font-medium transition-all ${
                      theme === 'dark' 
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' 
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                  >
                    <Moon size={14} /> Dark
                  </button>
                </div>
              </div>

              
              {/* Logout */}
              <div className="p-2 border-t border-gray-50 dark:border-slate-800">
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                >
                  <LogOut size={18} /> Logout
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}