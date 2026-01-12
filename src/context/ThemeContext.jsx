import { createContext, useContext, useState, useLayoutEffect, useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // Initialize state
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("theme") || "system";
    }
    return "system";
  });

  // Use useLayoutEffect to prevent flashing (FOUC)
  useLayoutEffect(() => {
    const root = window.document.documentElement;

    function applyTheme(targetTheme) {
      // Clean classes
      root.classList.remove("light", "dark");

      if (targetTheme === "dark") {
        root.classList.add("dark");
      } else if (targetTheme === "light") {
        root.classList.add("light");
      } else if (targetTheme === "system") {
        // Check system preference immediately
        const systemPref = window.matchMedia("(prefers-color-scheme: dark)");
        if (systemPref.matches) {
          root.classList.add("dark");
        } else {
          root.classList.add("light");
        }
      }
    }

    applyTheme(theme);

    // Listen for system changes ONLY if theme is 'system'
    if (theme === "system") {
      const systemPref = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = (e) => {
        root.classList.remove("light", "dark");
        root.classList.add(e.matches ? "dark" : "light");
      };
      systemPref.addEventListener("change", listener);
      return () => systemPref.removeEventListener("change", listener);
    }
  }, [theme]);

  // Persist preference
  useEffect(() => {
    localStorage.setItem("theme", theme);
  }, [theme]);

  // 🚀 ADDED THIS HELPER FUNCTION
  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const value = {
    theme,
    setTheme,
    toggleTheme, // 👈 Exported here
    isDark: 
      theme === "dark" || 
      (theme === "system" && typeof window !== 'undefined' && window.matchMedia("(prefers-color-scheme: dark)").matches)
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}