import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react"; 

export default function ProtectedRoute({ children, role, platformOnly = false }) {
  const { user, activeClub, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">Verifying access...</p>
      </div>
    );
  }

  // 1. Must be logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Platform Admin Check (Strict)
  if (platformOnly) {
    if (!user.isPlatformAdmin) {
      return <Navigate to="/" replace />; // Send them back to regular dashboard
    }
    // Access granted for Platform Admin, skip club checks
    return children;
  }

  // 3. Regular Club Logic (Existing)
  // If the user is on the regular dashboard but has no club (and is not platform admin acting as user)
  if (!activeClub && !user.isPlatformAdmin) {
     // You might want to redirect to a "Join/Create Club" page here
  }

  if (role && activeClub?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}