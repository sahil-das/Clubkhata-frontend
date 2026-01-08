import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-4xl font-bold text-gray-800">404</h1>
      <p className="text-gray-600 mb-4">Page not found</p>
      <Link to="/" className="text-indigo-600 hover:underline">Go Home</Link>
    </div>
  );
}