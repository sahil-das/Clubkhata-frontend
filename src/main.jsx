import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { YearProvider } from "./context/YearContext";
import { ToastProvider } from "./components/ui/Toast";
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ToastProvider>
      <AuthProvider>
        <YearProvider>
          <App />
        </YearProvider>
      </AuthProvider>
    </ToastProvider>
  </React.StrictMode>
);