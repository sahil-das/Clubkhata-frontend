// Card.jsx
import React from "react";
import clsx from "clsx";

export default function Card({ children, className, hideShadow }) {
  return (
    <div className={clsx("bg-surface p-4 rounded-2xl border border-gray-100", hideShadow ? "" : "shadow-card", className)}>
      {children}
    </div>
  );
}
