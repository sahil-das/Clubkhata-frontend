import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import { Building2, User, Mail, Lock, Phone, ArrowRight, Loader2 } from "lucide-react";

export default function RegisterClub() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError("");
    
    try {
      // Simple Registration: Just Identity
      const res = await api.post("/auth/register", {
        clubName: data.clubName,
        clubCode: data.clubCode,
        adminName: data.adminName,
        email: data.email,
        password: data.password,
        phone: data.phone
      });

      if (res.data.success) {
        alert("Club Registered! Please Login.");
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
      setServerError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-indigo-700">Create New Organization</h2>
          <p className="text-gray-500 mt-2">Manage your club's finances securely</p>
        </div>

        {serverError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-6 text-sm text-center">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* SECTION 1: CLUB DETAILS */}
          <div className="bg-indigo-50 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-indigo-800 uppercase tracking-wide flex items-center gap-2">
              <Building2 size={16} /> Organization Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Club Name</label>
                <input
                  {...register("clubName", { required: "Club Name is required" })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. Netaji Sangha"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Unique Club Code</label>
                <input
                  {...register("clubCode", { 
                    required: "Code is required",
                    pattern: { value: /^[a-zA-Z0-9-]+$/, message: "Letters, numbers, dashes only" } 
                  })}
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="e.g. netaji-2025"
                />
              </div>
            </div>
            {/* ❌ REMOVED: Frequency/Settings from here */}
          </div>

          {/* SECTION 2: ADMIN DETAILS */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide flex items-center gap-2 px-2">
              <User size={16} /> Admin Account
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input {...register("adminName", { required: true })} className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Full Name" />
              <input {...register("phone")} className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Phone" />
            </div>
            <input {...register("email", { required: true })} className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Email Address" />
            <input type="password" {...register("password", { required: true, minLength: 6 })} className="w-full border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Password" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-semibold disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Register Club & Admin"} <ArrowRight size={18} />
          </button>
        </form>

        <div className="text-center mt-6">
           <Link to="/login" className="text-sm text-indigo-600 hover:underline">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
}