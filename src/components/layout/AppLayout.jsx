import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const role = "admin";

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar collapsed={collapsed} role={role} />
      </div>

      {/* Mobile sidebar (ALWAYS MOUNTED) */}
      <div
        className={`
          fixed inset-0 z-40 md:hidden
          transition-opacity duration-300
          ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
        `}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/30"
          onClick={() => setSidebarOpen(false)}
        />

        {/* Drawer */}
        <div
          className={`
            absolute left-0 top-0 h-full
            transform transition-transform duration-300 ease-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <Sidebar role={role} />
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          onToggleSidebar={() => setCollapsed(v => !v)}
        />

        <main className="flex-1 px-6 py-6 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
