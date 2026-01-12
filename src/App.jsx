import React, { Suspense } from "react"; 
// 1. Added 'Outlet' to imports for the Platform Layout
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// Providers & Components
import { AuthProvider } from "./context/AuthContext";
import { FinanceProvider } from "./context/FinanceContext"; 
import ProtectedRoute from "./components/ProtectedRoute";
import RequireSubscription from "./components/RequireSubscription";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./context/ToastContext";
import LoadingOverlay from "./loading/LoadingOverlay"; 
import PlatformSidebar from "./components/PlatformSidebar";

// Lazy Load Pages
const Login = React.lazy(() => import("./pages/Login"));
const Dashboard = React.lazy(() => import("./pages/Dashboard")); 
const DashboardHome = React.lazy(() => import("./pages/DashboardHome"));
const UserProfile = React.lazy(() => import("./pages/UserProfile"));
const Settings = React.lazy(() => import("./pages/Settings"));
const CollectionsOverview = React.lazy(() => import("./pages/CollectionsOverview"));
const Contributions = React.lazy(() => import("./pages/Contributions"));
const PujaContributions = React.lazy(() => import("./pages/PujaContributions"));
const Donations = React.lazy(() => import("./pages/Donations"));
const Expenses = React.lazy(() => import("./pages/Expenses"));
const Members = React.lazy(() => import("./pages/Members"));
const MemberDetails = React.lazy(() => import("./pages/MemberDetails"));
const Reports = React.lazy(() => import("./pages/Reports"));
const RegisterClub = React.lazy(() => import("./pages/RegisterClub"));
const AuditLogs = React.lazy(() => import("./pages/AuditLogs"));
const Archives = React.lazy(() => import("./pages/Archives"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// Platform Admin Pages
const PlatformDashboard = React.lazy(() => import("./pages/platform/PlatformDashboard"));
const ClubManagement = React.lazy(() => import("./pages/platform/ClubManagement"));
const PlatformReports = React.lazy(() => import("./pages/platform/PlatformReports"));
const SystemHealth = React.lazy(() => import("./pages/platform/SystemHealth"));
const PlatformAnnouncements = React.lazy(() => import("./pages/platform/PlatformAnnouncements"));
// Fallback for Suspense
const PageLoader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-white dark:bg-slate-950">
    <div className="animate-spin h-8 w-8 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full" />
  </div>
);

// Helper Layout for Platform Admin to ensure Sidebar is always visible
const PlatformLayout = () => (
  <>
    <PlatformSidebar />
    <Outlet /> {/* Renders the child route (Dashboard or ClubManagement) */}
  </>
);

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          {/* Global Blocking Overlay */}
          <LoadingOverlay /> 
          
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* PUBLIC ROUTES */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterClub />} />

                {/* 🚀 NEW: PLATFORM ADMIN ROUTES */}
                <Route 
                  path="/platform" 
                  element={
                    <ProtectedRoute platformOnly={true}>
                      <PlatformLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<PlatformDashboard />} />
                  <Route path="clubs" element={<ClubManagement />} />
                  <Route path="reports" element={<PlatformReports />} />
                  <Route path="health" element={<SystemHealth />} />
                  <Route path="announcements" element={<PlatformAnnouncements />} />
                </Route>

                {/* PROTECTED ROUTES (CLUB MEMBERS & ADMINS) */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <FinanceProvider>
                        <Dashboard />
                      </FinanceProvider>
                    </ProtectedRoute>
                  }
                >
                  
                  <Route index element={<DashboardHome />} />
                  <Route path="profile" element={<UserProfile />} />

                  {/* AVAILABLE TO EVERYONE */}
                  <Route path="members-Contribution" element={<PujaContributions />} />
                  <Route path="collections" element={<CollectionsOverview />} />
                  <Route path="donations" element={<Donations />} />
                  <Route path="expenses" element={<Expenses />} />
                  <Route path="archives" element={<Archives />} />
                  
                  {/* Members is open to all */}
                  <Route path="members" element={<Members />} />

                  {/* SUBSCRIPTIONS */}
                  <Route element={<RequireSubscription />}>
                    <Route path="contributions" element={<Contributions />} />
                  </Route>

                  {/* ADMIN ONLY */}
                  <Route path="members/:memberId" element={<ProtectedRoute role="admin"><MemberDetails /></ProtectedRoute>} />
                  <Route path="reports" element={<ProtectedRoute role="admin"><Reports /></ProtectedRoute>} />
                  <Route path="settings" element={<ProtectedRoute role="admin"><Settings /></ProtectedRoute>} />
                  <Route path="audit-logs" element={<ProtectedRoute role="admin"><AuditLogs /></ProtectedRoute>} />
                </Route>

                {/* CATCH ALL */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}