import React from 'react';
import { useLoading } from './LoadingContext';

export default function LoadingOverlay() {
  const { isLoading } = useLoading();

  if (!isLoading) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity"
      role="status"
      aria-busy="true"
    >
      {/* bg-white/80 -> dark:bg-slate-900/90
         Added dark mode text and border colors
      */}
      <div className="flex flex-col items-center bg-white/80 dark:bg-slate-900/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50">
        
        {/* CUSTOM LOGO ANIMATION */}
        <div className="relative flex items-center justify-center mb-4">
          {/* Outer Ring (Spinner) */}
          <div className="absolute w-16 h-16 border-4 border-indigo-100 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin"></div>
          
          {/* Logo in Center */}
          <img 
            src="/logo.png" 
            alt="Loading..." 
            className="w-10 h-10 object-contain animate-pulse" 
          />
        </div>
        
        <p className="text-slate-600 dark:text-slate-300 font-bold text-sm tracking-wide">LOADING</p>
      </div>
    </div>
  );
}