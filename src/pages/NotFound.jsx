import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center bg-slate-50 dark:bg-slate-950 transition-colors">
      <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100">404</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-4">Page not found</p>
      <Link to="/" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">Go Home</Link>
    </div>
  );
}