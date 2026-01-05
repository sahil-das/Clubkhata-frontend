// Button.jsx
import React from "react";
import clsx from "clsx";

export default function Button({ children, variant = "primary", className, ...props }) {
  const base = "inline-flex items-center justify-center rounded-lg font-semibold transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const variants = {
    primary: "bg-primary-500 text-white px-4 py-2 shadow-sm hover:shadow-md focus-visible:ring-primary-200",
    ghost: "bg-transparent text-gray-700 px-3 py-2 hover:bg-gray-100",
    secondary: "bg-white border border-gray-200 text-gray-800 px-3 py-2",
    destructive: "bg-destructive-500 text-white px-3 py-2"
  };
  return (
    <button className={clsx(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
