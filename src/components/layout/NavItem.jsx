import { NavLink } from "react-router-dom";

export default function NavItem({ label, icon: Icon, to, collapsed }) {
  return (
    <div className="relative group">
      <NavLink
        to={to}
        className={({ isActive }) =>
          `
          w-full flex items-center
          ${collapsed ? "justify-center px-3" : "px-4 gap-3"}
          py-2.5 rounded-lg text-sm font-medium
          transition-all duration-200
          ${
            isActive
              ? "bg-indigo-100 text-indigo-700 shadow-sm"
              : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
          }
        `
        }
      >
        <Icon size={18} />
        {!collapsed && <span>{label}</span>}
      </NavLink>

      {collapsed && (
        <div
          className="absolute left-full top-1/2 -translate-y-1/2 ml-3
          px-2 py-1 rounded bg-gray-900 text-white text-xs
          opacity-0 group-hover:opacity-100 transition"
        >
          {label}
        </div>
      )}
    </div>
  );
}
