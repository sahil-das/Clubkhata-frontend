import { Menu, ChevronsLeft } from "lucide-react";

export default function Header({ onMenuClick, onToggleSidebar }) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur
      border-b border-gray-200 flex items-center justify-between px-6">

      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100
          focus:outline-none focus:ring-2 focus:ring-indigo-400"
        >
          <Menu size={20} />
        </button>

        {/* Desktop collapse */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex p-2 rounded-lg hover:bg-gray-100
          transition-transform duration-200 hover:-translate-y-[1px]"
        >
          <ChevronsLeft size={18} />
        </button>

        <h1 className="text-lg font-semibold text-gray-900">
          Dashboard
        </h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <div className="text-xs text-gray-500">Shivaji Sports Club</div>
          <div className="text-sm font-medium text-gray-800">Admin</div>
        </div>

        <div className="h-9 w-9 rounded-full bg-indigo-600
          flex items-center justify-center text-white font-semibold
          transition-transform hover:scale-105">
          A
        </div>
      </div>
    </header>
  );
}
