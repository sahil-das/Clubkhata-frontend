import { useState, useEffect } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLoading } from "../loading/LoadingContext"; // 👈 Import Global Loader
import { User, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from "lucide-react";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card"; 

export default function Login() {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  
  const { login, selectClub, user, loading: authLoading } = useAuth(); 
  const { showLoader, hideLoader } = useLoading(); // 👈 Destructure hooks
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !authLoading) {
      navigate("/", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 1. Show Blocking Overlay immediately
    showLoader(true); 
    setError(null);

    try {
      // 2. Pass flag to SKIP NProgress bar
      const result = await login(input, password, { skipGlobalLoading: true });
      
      const clubs = (result && result.clubs) || [];
      if (clubs && clubs.length === 1) selectClub(clubs[0]);
      navigate("/");
    } catch (err) {
      if (err?.response) {
        const status = err.response.status;
        const data = err.response.data || {};
        const serverMessage = data.message || data.error || null;

        switch (status) {
          case 400: setError(serverMessage || "Bad request. Please check your input."); break;
          case 401: setError(serverMessage || "Invalid credentials. Please double-check your ID and password."); break;
          case 403: setError(serverMessage || "Access forbidden. Your account may be disabled."); break;
          case 404: setError(serverMessage || "Account not found. Please register first."); break;
          case 422: setError(serverMessage || "Validation failed. Please check the form fields."); break;
          case 429: setError(serverMessage || "Too many attempts. Please try again later."); break;
          default: setError(serverMessage || "Server error. Please try again later."); break;
        }
      } else if (err?.request) {
        setError("No response from server. Check your network connection.");
      } else {
        setError(err.message || "An unknown error occurred.");
      }
    } finally {
      // 3. Hide Blocking Overlay
      hideLoader(); 
    }
  };

  if (authLoading) return null; 

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md px-4 relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-lg shadow-slate-200/50 mb-6 ring-1 ring-slate-100">
              <img src="/logo.png" alt="ClubKhata Logo" className="w-12 h-12 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 mt-2 text-sm">Enter your System ID to access ClubKhata.</p>
        </div>
        
        <Card className="shadow-2xl shadow-slate-200/60 border-slate-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 animate-slide-up">
                <AlertCircle className="text-rose-600 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            <Input 
              label="System ID or Email"
              icon={User}
              placeholder="userid@clubcode.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
              className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />

            <div className="space-y-1">
              <Input 
                label="Password"
                type={showPassword ? "text" : "password"}
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                suffix={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="hover:text-slate-600 text-slate-400 transition-colors focus:outline-none" tabIndex={-1}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              <div className="flex justify-end">
                <button type="button" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">Forgot password?</button>
              </div>
            </div>

            <Button type="submit" className="w-full py-3 text-base shadow-lg shadow-indigo-200 hover:shadow-indigo-300" rightIcon={<ArrowRight size={18} />}>
              Sign In
            </Button>
          </form>
        </Card>

        <p className="text-center mt-8 text-slate-500 text-sm font-medium">
          New to ClubKhata?{" "}
          <Link to="/register" className="text-indigo-600 font-bold hover:text-indigo-700 hover:underline transition-all">Register your club here</Link>
        </p>
      </div>
    </div>
  );
}