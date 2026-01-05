import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. SIDEBAR (Fixed Width) */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* 2. MAIN CONTENT WRAPPER */}
      {/* 'md:pl-64' pushes content to the right on desktop to make room for fixed sidebar */}
      <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 md:pl-64">
        
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
           <Outlet />
        </main>
      </div>

    </div>
  );
}