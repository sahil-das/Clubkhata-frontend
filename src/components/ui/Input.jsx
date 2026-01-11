import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Input = React.forwardRef(({ className, icon: Icon, suffix, error, label, ...props }, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 ml-1">
          {label}
        </label>
      )}
      
      <div className="relative group">
        {/* LEFT ICON */}
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 dark:group-focus-within:text-primary-400 transition-colors pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        
        <input
          ref={ref}
          className={cn(
            "w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl py-3 transition-all",
            "placeholder:text-slate-400 dark:placeholder:text-slate-600",
            "focus:border-primary-500 dark:focus:border-primary-400 focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-400/10",
            Icon ? "pl-10" : "px-4", 
            suffix ? "pr-10" : "pr-4", 
            error && "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/10",
            className
          )}
          {...props}
        />

        {/* RIGHT SUFFIX (Action Slot) */}
        {suffix && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
            {suffix}
          </div>
        )}
      </div>
      
      {error && <p className="text-xs text-red-500 mt-1 ml-1 font-medium">{error}</p>}
    </div>
  );
});

Input.displayName = "Input";