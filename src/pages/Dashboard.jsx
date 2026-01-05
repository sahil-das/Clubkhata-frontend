import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    // 👇 The 'flex' class here is critical to make them sit side-by-side
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      
      {/* 1. SIDEBAR */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* 2. MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        <TopBar onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto pb-20">
            <Outlet />
          </div>
        </main>
      </div>

    </div>
  );
}