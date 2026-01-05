// Badge.jsx
import React from "react";
import clsx from "clsx";
export default function Badge({ children, variant = "default", className }) {
  const variants = {
    default: "bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs",
    success: "bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-xs",
    danger: "bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full text-xs",
    info: "bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-xs",
  };
  return <span className={clsx(variants[variant], className)}>{children}</span>;
}
