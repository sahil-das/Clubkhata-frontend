// Input.jsx
import React from "react";
import clsx from "clsx";

export default function Input({ label, error, className, id, ...props }) {
  return (
    <div className={clsx("w-full", className)}>
      {label && <label htmlFor={id} className="block text-sm font-medium text-gray-600 mb-1">{label}</label>}
      <input
        id={id}
        {...props}
        className={clsx(
          "w-full rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-200",
          error ? "border-rose-400" : "border-gray-200"
        )}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}
