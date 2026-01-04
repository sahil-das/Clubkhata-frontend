import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2, User, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // ✅ 1. Get selectClub to set the active session immediately
  const { login, selectClub } = useAuth(); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ 2. 'login' returns the list of clubs the user belongs to
      const clubs = await login(input, password);
      
      // ✅ 3. Auto-select logic
      if (clubs && clubs.length === 1) {
        // If user belongs to exactly one club, select it automatically
        selectClub(clubs[0]);
      }
      
      // Navigate to Dashboard
      navigate("/");
      
    } catch (err) {
      alert("Login failed. Check your credentials.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl border border-gray-100 animate-fade-in">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-indigo-200 mb-4 transform rotate-3 hover:rotate-6 transition-transform">
             <span className="text-white font-bold text-3xl">SC</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-500 mt-2">Sign in to manage your club</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email or User ID</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="text" 
                required 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                placeholder="userid@club.com OR gmail"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
              <input 
                type="password" 
                required 
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <>Sign In <ArrowRight size={20}/></>}
          </button>
        </form>

        <p className="text-center mt-8 text-gray-500 text-sm">
          {/* ✅ 4. Fixed Route: /register-club -> /register */}
          Don't have an account? <Link to="/register" className="text-indigo-600 font-bold hover:underline">Register Club</Link>
        </p>
      </div>
    </div>
  );
}