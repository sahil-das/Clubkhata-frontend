import { 
  LayoutDashboard, Users, Wallet, Heart, Sparkles, PieChart,
  History, Settings, FileText, Archive, CalendarRange,
  Vote, PiggyBank, Package,Briefcase
} from "lucide-react";

const NAV_ITEMS = [
  // 1. Overview
  { 
    label: "Dashboard", 
    path: "/", 
    icon: LayoutDashboard,
    roles: ["admin", "member"] 
  },

  // 2. People & Engagement
  { 
    label: "Members", 
    path: "/members", 
    icon: Users,
    roles: ["admin", "member"] 
  },
  {
    label: "Community Polls",
    path: "/polls",
    icon: Vote,
    roles: ["admin", "member"]
  },

  // 3. Personal Finance (For the logged-in user)
  {
    label: "My Subscriptions",
    path: "/contributions",
    icon: CalendarRange,
    roles: ["admin", "member"]
  },

  // 4. Club Income (Money coming in)
  { 
    label: "Member's Contribution", 
    path: "/members-contribution", 
    icon: Sparkles,
    roles: ["admin", "member"] 
  },
  { 
    label: "Donations", 
    path: "/donations", 
    icon: Heart,
    roles: ["admin", "member"] 
  },

  // 5. Club Expenses & Planning (Money going out)
  { 
    label: "Expenses", 
    path: "/expenses", 
    icon: FileText,
    roles: ["admin", "member"] 
  },
  {
    label: "Budget Planning",
    path: "/budgeting",
    icon: PiggyBank,
    roles: ["admin"]
  },
  { 
    label: "Collections Overview", 
    path: "/collections", 
    icon: Wallet,
    roles: ["admin", "member"] 
  },

  // 6. Assets/Inventory
  {
    label: "Asset Registry",
    path: "/assets",
    icon: Package,
    roles: ["admin", "member"]
  },
  { 
    label: "Vendor Hiring", 
    path: "/rentals", 
    icon: Briefcase, // Make sure to import this
    roles: ["admin", "treasurer", "member"] 
  },
  // 7. Admin Tools & History
  { 
    label: "Reports", 
    path: "/reports", 
    icon: PieChart,
    roles: ["admin"] 
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
  { 
    label: "Settings", 
    path: "/settings", 
    icon: Settings,
    roles: ["admin"] 
  },
];

export default NAV_ITEMS;