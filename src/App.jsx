import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Context Providers
import { AuthProvider } from "./context/AuthContext";
import { FinanceProvider } from "./context/FinanceContext";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Pages - Auth & Core
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // Ensure this uses <Outlet /> now
import DashboardHome from "./pages/DashboardHome";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import History from "./pages/History";

// Pages - Financials
import CollectionsOverview from "./pages/CollectionsOverview";
import Contributions from "./pages/Contributions";
import WeeklyContributions from "./pages/WeeklyContributions";
import PujaContributions from "./pages/PujaContributions";
import Donations from "./pages/Donations";
import Expenses from "./pages/Expenses";

// Pages - Admin/Members
import Members from "./pages/Members";
import MemberDetails from "./pages/MemberDetails";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <AuthProvider>
      <FinanceProvider>
        <BrowserRouter>
          <Routes>
            {/* --- Public Routes --- */}
            <Route path="/login" element={<Login />} />

            {/* --- Main Dashboard Layout --- */}
            {/* The parent route handles the Layout and Basic Auth */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              {/* Index matches "/dashboard" exactly */}
              <Route index element={<DashboardHome />} />
              
              <Route path="profile" element={<UserProfile />} />
              <Route path="history" element={<History />} />
              
              {/* Financial Routes */}
              <Route path="collections" element={<CollectionsOverview />} />
              <Route path="contributions" element={<Contributions />} />
              <Route path="weekly" element={<WeeklyContributions />} />
              <Route path="puja-contributions" element={<PujaContributions />} />
              <Route path="donations" element={<Donations />} />
              <Route path="expenses" element={<Expenses />} />

              {/* --- Admin Only Routes --- */}
              {/* These are nested, but we wrap the element to enforce Role checks */}
              <Route 
                path="members" 
                element={
                  <ProtectedRoute role="admin">
                    <Members />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="members/:memberId" 
                element={
                  <ProtectedRoute role="admin">
                    <MemberDetails />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="reports" 
                element={
                  <ProtectedRoute role="admin">
                    <Reports />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="settings" 
                element={
                  <ProtectedRoute role="admin">
                    <Settings />
                  </ProtectedRoute>
                } 
              />
            </Route>

            {/* --- Fallback --- */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </BrowserRouter>
      </FinanceProvider>
    </AuthProvider>
  );
}