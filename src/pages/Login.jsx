import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Lock, ArrowRight, AlertCircle, LayoutDashboard, Eye, EyeOff } from "lucide-react"; // 👈 Added Eye icons

// Components
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Card } from "../components/ui/Card";

export default function Login() {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 State for visibility
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { login, selectClub } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const clubs = await login(input, password);
      if (clubs && clubs.length === 1) selectClub(clubs[0]);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError("Invalid credentials. Please double-check your ID and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-slate-50">
      
      {/* DECORATIVE BACKGROUND */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-200/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/30 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md px-4 relative z-10 animate-fade-in">
        
        {/* BRANDING */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-lg shadow-slate-200/50 mb-6 ring-1 ring-slate-100">
             <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white">
                <LayoutDashboard size={22} strokeWidth={2.5} />
             </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h1>
          <p className="text-slate-500 mt-2 text-sm">Enter your system ID to access the club dashboard.</p>
        </div>

        {/* LOGIN CARD */}
        <Card className="shadow-2xl shadow-slate-200/60 border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-[var(--radius-button)] flex items-start gap-3 animate-slide-up">
                <AlertCircle className="text-red-600 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <Input 
              label="System ID or Email"
              icon={User}
              placeholder="userid@clubcode.com"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              required
            />

            <div className="space-y-1">
              <Input 
                label="Password"
                type={showPassword ? "text" : "password"} // 👈 Dynamic Type
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                // 👇 The Magic Suffix
                suffix={
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-slate-600 transition-colors focus:outline-none"
                    tabIndex={-1} // Skip tab focus for smoother UX
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              <div className="flex justify-end">
                <button type="button" className="text-xs font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                  Forgot password?
                </button>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full mt-2" 
              size="lg" 
              isLoading={loading}
              rightIcon={<ArrowRight size={18} />}
            >
              Sign In
            </Button>
          </form>
        </Card>

        <p className="text-center mt-8 text-slate-500 text-sm">
          Want to start a new club?{" "}
          <Link to="/register" className="text-primary-600 font-bold hover:text-primary-700 hover:underline transition-all">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}