import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import GlobalBanner from "../components/GlobalBanner"; // 👈 Import Banner

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden transition-colors">
      {/* SIDEBAR */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-full relative w-full transition-all duration-300">
        
        {/* 📢 GLOBAL ANNOUNCEMENT BANNER (Placed above TopBar) */}
        <GlobalBanner />

        {/* TOP BAR */}
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* PAGE CONTENT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 relative scroll-smooth text-slate-900 dark:text-slate-100">
          <div className="max-w-7xl mx-auto w-full pb-20">
             <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}