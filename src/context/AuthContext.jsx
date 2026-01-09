// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [availableClubs, setAvailableClubs] = useState([]);
  const [activeClub, setActiveClub] = useState(null);
  const [loading, setLoading] = useState(true);

  // ... (Helpers: saveTokens, clearLocalSession, logout remain unchanged) ...
  const saveTokens = ({ accessToken, refreshToken }) => {
    if (accessToken) localStorage.setItem("accessToken", accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (accessToken) api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  };

  const clearLocalSession = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("activeClubId");
  };

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    try {
      if (refreshToken) await api.post("/auth/revoke-token", { token: refreshToken });
    } catch (err) { } 
    finally {
      clearLocalSession();
      setUser(null);
      setAvailableClubs([]);
      setActiveClub(null);
      try { window.dispatchEvent(new Event("logout")); } catch (e) {}
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }
  }, []);

  // --- login (UPDATED) ---
  const login = async (email, password, config = {}) => { // 👈 Added config param
    setLoading(true);
    try {
      // Pass the config (e.g., skipGlobalLoading) to axios
      const res = await api.post("/auth/login", { email, password }, config);
      const { accessToken, refreshToken, user: userData, clubs } = res.data;

      saveTokens({ accessToken, refreshToken });
      setUser(userData || null);
      setAvailableClubs(clubs || []);

      if (clubs && clubs.length > 0) {
        const chosen = clubs[0];
        setActiveClub(chosen);
        localStorage.setItem("activeClubId", chosen.clubId);
      } else {
        setActiveClub(null);
        localStorage.removeItem("activeClubId");
      }

      return { user: userData, clubs };
    } catch (err) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const selectClub = (club) => {
    if (!club?.clubId) return;
    setActiveClub(club);
    localStorage.setItem("activeClubId", club.clubId);
  };

  // ... (useEffect for init and listeners remain unchanged) ...
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const token = localStorage.getItem("accessToken");
      const storedClubId = localStorage.getItem("activeClubId");
      if (!token) { setLoading(false); return; }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      try {
        const res = await api.get("/auth/me");
        if (!mounted) return;
        const userData = res.data.user || null;
        const clubs = res.data.clubs || [];
        setUser(userData);
        setAvailableClubs(clubs);
        if (storedClubId && clubs.length > 0) {
          const matched = clubs.find((c) => c.clubId === storedClubId);
          setActiveClub(matched || clubs[0]);
          if (!matched) localStorage.setItem("activeClubId", clubs[0].clubId);
        } else if (clubs.length > 0) {
          setActiveClub(clubs[0]);
          localStorage.setItem("activeClubId", clubs[0].clubId);
        } else {
          setActiveClub(null);
          localStorage.removeItem("activeClubId");
        }
      } catch (err) {
        clearLocalSession();
        setUser(null);
        setAvailableClubs([]);
        setActiveClub(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const onGlobalLogout = () => {
      clearLocalSession();
      setUser(null);
      setAvailableClubs([]);
      setActiveClub(null);
      setLoading(false);
    };
    const onStorage = (e) => {
      if (e.key === "accessToken" && !e.newValue) onGlobalLogout();
      if (e.key === "activeClubId") {
        const newClubId = e.newValue;
        if (!newClubId) setActiveClub(null);
        else {
          const found = availableClubs.find((c) => c.clubId === newClubId);
          if (found) setActiveClub(found);
        }
      }
    };
    window.addEventListener("logout", onGlobalLogout);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("logout", onGlobalLogout);
      window.removeEventListener("storage", onStorage);
    };
  }, [availableClubs]);

  const value = {
    user, availableClubs, activeClub, loading, login, logout, selectClub, isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}