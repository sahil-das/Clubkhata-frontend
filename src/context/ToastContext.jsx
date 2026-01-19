// src/context/ToastContext.jsx
import { createContext, useContext, useState, useCallback } from "react";
import ToastContainer from "../components/ui/Toast.jsx";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // ✅ 1. Update: Return the ID so we can use it for dismissal
  const addToast = useCallback((message, type = "info", duration = 4000) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
    return id; // Return ID
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Helper functions for cleaner API
  const toast = {
    success: (msg, duration) => addToast(msg, "success", duration),
    error: (msg, duration) => addToast(msg, "error", duration),
    info: (msg, duration) => addToast(msg, "info", duration),
    
    // ✅ 2. FIX: Add missing 'loading' method (Duration 0 = infinite until dismissed)
    loading: (msg) => addToast(msg, "loading", 0), 

    // ✅ 3. FIX: Add missing 'dismiss' method
    dismiss: (id) => removeToast(id)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}