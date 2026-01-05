import { useLocation } from "react-router-dom";
import { Menu, Bell } from "lucide-react";
import { NAV_ITEMS } from "../config/navigation";

export default function TopBar({ onMenuClick }) {
  const location = useLocation();

  // Find current page title
  const currentItem = NAV_ITEMS.find(item => item.path === location.pathname) || { label: "Dashboard" };
  
  // Handle dynamic routes (e.g. Member Details)
  const getPageTitle = () => {
    if (location.pathname.includes("/members/") && location.pathname.length > 9) return "Member Details";
    return currentItem.label;
  };

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 flex items-center justify-between transition-all">
      
      <div className="flex items-center gap-3">
        {/* Mobile Trigger */}
        <button 
          onClick={onMenuClick}
          className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg active:scale-95 transition-transform"
        >
          <Menu size={24} />
        </button>

        {/* Page Title / Breadcrumb */}
        <div className="flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 leading-tight">
                {getPageTitle()}
            </h2>
            {/* Optional Breadcrumb */}
            <span className="hidden md:inline-block text-xs font-medium text-slate-400">
               Club Management &bull; {getPageTitle()}
            </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <Bell size={20} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
        </button>
      </div>
    </header>
  );
}