// Toast.jsx
import React, { useState, createContext, useContext } from "react";
const ToastCtx = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = (msg, opts={}) => {
    const id = Date.now().toString();
    setToasts(t => [...t, { id, msg, ...opts }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), opts.duration || 4000);
  };
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 bottom-4 space-y-3 z-50">
        {toasts.map(t => (
          <div key={t.id} className="bg-white border border-gray-100 px-4 py-2 rounded-lg shadow-card">
            <div className="text-sm">{t.msg}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  return useContext(ToastCtx);
}
