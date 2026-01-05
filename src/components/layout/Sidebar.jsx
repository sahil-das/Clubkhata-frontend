import { NAV_ITEMS } from "../../config/navigation";
import NavItem from "./NavItem";
import AppBadge from "../ui/AppBadge";
import ClubBadge from "../ui/ClubBadge";

export default function Sidebar({ collapsed, role = "admin" }) {
  return (
    <aside
      className={`
        h-full flex flex-col
        bg-white/70 backdrop-blur-xl
        shadow-xl shadow-gray-200/40
        border-r border-white/60

        transition-all duration-300 ease-in-out
        will-change-[width]
        ${collapsed ? "w-20" : "w-72"}
      `}
    >
      {/* Branding */}
      <div
        className={`
          px-4 pt-6 pb-4
          transition-all duration-300
          ${collapsed ? "opacity-0 -translate-x-2 pointer-events-none" : "opacity-100 translate-x-0"}
        `}
      >
        <AppBadge />
        <ClubBadge clubName="Shivaji Sports Club" />
      </div>

    {NAV_ITEMS
    .filter(item => item.roles.includes(role))
    .map(item => (
        <NavItem
        key={item.label}
        label={item.label}
        icon={item.icon}
        to={item.path}
        collapsed={collapsed}
        />
    ))}

      {/* Footer */}
      <div
        className={`
          px-6 py-4 text-xs text-gray-400
          transition-opacity duration-200
          ${collapsed ? "opacity-0" : "opacity-100"}
        `}
      >
        © 2026 ClubKhata
      </div>
    </aside>
  );
}
