import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { Menu, Bell, User, LogOut, ChevronDown } from "lucide-react";

export default function TopBar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 h-16 px-4 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm/50">
      
      {/* LEFT: Mobile Menu Button & Title */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden"
        >
          <Menu size={24} />
        </button>
        
        {/* Breadcrumb or Page Title (Optional) */}
        <h2 className="hidden md:block text-lg font-bold text-gray-700">Dashboard</h2>
      </div>

      {/* RIGHT: Actions & Profile */}
      <div className="flex items-center gap-3">
        
        {/* Notification Icon (Visual Only) */}
        <button className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <div className="h-8 w-px bg-gray-200 mx-1"></div>

        {/* PROFILE DROPDOWN */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-gray-50 border border-transparent hover:border-gray-200 transition"
          >
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-200">
              {user?.name?.charAt(0)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-gray-700 leading-none">{user?.name}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">View Profile</p>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {/* DROPDOWN MENU */}
          {isDropdownOpen && (
            <>
              {/* Invisible Backdrop to close on click outside */}
              <div className="fixed inset-0 z-10" onClick={() => setIsDropdownOpen(false)}></div>
              
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-20 overflow-hidden animate-in fade-in slide-in-from-top-2">
                <div className="p-3 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-xs font-bold text-gray-500 uppercase">Account</p>
                </div>
                
                <Link 
                  to="/profile" 
                  onClick={() => setIsDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition"
                >
                  <User size={16} /> My Profile
                </Link>
                
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-50"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}