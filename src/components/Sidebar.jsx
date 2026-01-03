import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  Receipt, 
  LogOut,
  ShieldCheck,
  X,
  Settings, // ✅ Imported Icon
  CreditCard,
  FileText,
  BadgeIndianRupee
} from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const { user, activeClub, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const menuItems = [
    { path: "/", label: "Overview", icon: LayoutDashboard },
    { path: "/contributions", label: "Subscriptions", icon: CreditCard },
    { path: "/puja-contributions", label: "Festival Chanda", icon: BadgeIndianRupee },
    { path: "/members", label: "Members", icon: Users },
    { path: "/donations", label: "Donations", icon: Wallet },
    { path: "/expenses", label: "Expenses", icon: Receipt },
    { path: "/reports", label: "Reports", icon: FileText },
    { path: "/settings", label: "Settings", icon: Settings }, // ✅ New Link
  ];

  return (
    <>
      {/* 🌑 MOBILE BACKDROP */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      {/* 📁 SIDEBAR CONTAINER */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 bg-indigo-900 text-white flex flex-col shadow-2xl
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0
      `}>
        
        {/* 1. HEADER */}
        <div className="p-6 border-b border-indigo-800 flex justify-between items-start">
          <div className="overflow-hidden">
            <h2 className="text-xl font-bold truncate pr-2">
              {activeClub?.clubName || "Club Portal"}
            </h2>
            <div className="flex items-center gap-2 mt-2 text-indigo-300 text-xs uppercase font-bold tracking-wider">
              {activeClub?.role === "admin" && <ShieldCheck size={14} />}
              <span>{activeClub?.role || "Member"}</span>
            </div>
          </div>
          
          <button onClick={onClose} className="md:hidden text-indigo-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* 2. NAVIGATION */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-indigo-600 text-white shadow-md translate-x-1"
                  : "text-indigo-300 hover:bg-indigo-800 hover:text-white"
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* 3. FOOTER */}
        <div className="p-4 border-t border-indigo-800 bg-indigo-950">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-lg font-bold shrink-0">
              {user?.name?.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-indigo-400 truncate">{user?.email}</p>
            </div>
          </div>
          
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 py-2 rounded-lg hover:bg-red-500 hover:text-white transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </>
  );
}