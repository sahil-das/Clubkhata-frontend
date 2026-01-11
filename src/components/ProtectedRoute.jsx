import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react"; 

export default function ProtectedRoute({ children, role }) {
  const { user, activeClub, loading } = useAuth();

  // ⏳ WAIT for auth check
  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Verifying access...</p>
      </div>
    );
  }

  // 🔒 Check 1: Must be logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🛡️ Check 2: RBAC (Role-Based Access Control)
  if (role && activeClub?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}