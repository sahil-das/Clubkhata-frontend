import { 
  LayoutDashboard, Users, Wallet, CreditCard, 
  IndianRupee, History, Settings, FileText, Archive, CalendarRange 
} from "lucide-react";

export const NAV_ITEMS = [
  { 
    label: "Dashboard", 
    path: "/", 
    icon: LayoutDashboard,
    roles: ["admin", "member"] 
  },
  { 
    label: "Members", 
    path: "/members", 
    icon: Users,
    roles: ["admin", "member"] 
  },
  /* 👇 ADDED THIS MISSING LINK */
  {
    label: "My Subscriptions",
    path: "/contributions",
    icon: CalendarRange,
    roles: ["admin", "member"]
  },
  { 
    label: "Puja Chanda", 
    path: "/puja-contributions", 
    icon: IndianRupee,
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
    icon: CreditCard,
    roles: ["admin", "member"] 
  },
  { 
    label: "Expenses", 
    path: "/expenses", 
    icon: FileText,
    roles: ["admin", "member"] 
  },
  { 
    label: "Archives", 
    path: "/archives", 
    icon: Archive,
    roles: ["admin", "member"] 
  },
  // Admin Only
  { 
    label: "Reports", 
    path: "/reports", 
    icon: History,
    roles: ["admin"] 
  },
  { 
    label: "Settings", 
    path: "/settings", 
    icon: Settings,
    roles: ["admin"] 
  },
];