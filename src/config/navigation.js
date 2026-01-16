import { 
  LayoutDashboard, Users, Wallet, Heart, Sparkles, PieChart,
  History, Settings, FileText, Archive, CalendarRange,
  // ✅ NEW ICONS
  Vote, PiggyBank, Package
} from "lucide-react";

const NAV_ITEMS = [
  { 
    label: "Dashboard", 
    path: "/", 
    icon: LayoutDashboard,
    roles: ["admin", "member"] 
  },
  {
    label: "Community Polls", // ✅ NEW: Phase 2
    path: "/polls",
    icon: Vote,
    roles: ["admin", "member"]
  },
  { 
    label: "Members", 
    path: "/members", 
    icon: Users,
    roles: ["admin", "member"] 
  },
  {
    label: "My Subscriptions",
    path: "/contributions",
    icon: CalendarRange,
    roles: ["admin", "member"]
  },
  { 
    label: "Member's Contribution", 
    path: "/members-contribution", 
    icon: Sparkles,
    roles: ["admin", "member"] 
  },
  { 
    label: "Collections Overview", 
    path: "/collections", 
    icon: Wallet,
    roles: ["admin", "member"] 
  },
  { 
    label: "Donations", 
    path: "/donations", 
    icon: Heart,
    roles: ["admin", "member"] 
  },
  { 
    label: "Expenses", 
    path: "/expenses", 
    icon: FileText,
    roles: ["admin", "member"] 
  },
  {
    label: "Budget Planning", // ✅ NEW: Phase 2
    path: "/budgeting",
    icon: PiggyBank, // Using PiggyBank to signify Savings/Planning
    roles: ["admin"] // Usually restricted to Admin
  },
  {
    label: "Asset Registry", // ✅ NEW: Phase 2
    path: "/assets",
    icon: Package,
    roles: ["admin", "member"] // Members can view, Admins edit
  },
  {
    label: "Audit Logs",
    path: "/audit-logs",
    icon: History,
    roles: ["admin"]
  },
  { 
    label: "Archives", 
    path: "/archives", 
    icon: Archive,
    roles: ["admin", "member"] 
  },
  // Admin Only Section
  { 
    label: "Reports", 
    path: "/reports", 
    icon: PieChart,
    roles: ["admin"] 
  },
  { 
    label: "Settings", 
    path: "/settings", 
    icon: Settings,
    roles: ["admin"] 
  },
];

export default NAV_ITEMS;