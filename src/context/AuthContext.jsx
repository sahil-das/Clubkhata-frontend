import { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [activeClub, setActiveClub] = useState(null);
  const [availableClubs, setAvailableClubs] = useState([]); // List of clubs user belongs to
  const [loading, setLoading] = useState(true);

  // 🔐 Load user & context on app start
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedClubId = localStorage.getItem("activeClubId");

    if (!token) {
      setLoading(false);
      return;
    }

    // Fetch User Profile + Their Clubs
    api
      .get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        setAvailableClubs(res.data.clubs || []);

        // Restore active club if it matches one of the user's clubs
        if (storedClubId && res.data.clubs) {
          const club = res.data.clubs.find((c) => c.clubId === storedClubId);
          if (club) {
            setActiveClub(club);
          } else {
             // If stored ID is invalid (e.g. user removed from club), clear it
            localStorage.removeItem("activeClubId");
          }
        }
      })
      .catch((err) => {
        console.error("Auth Load Error:", err);
        logout();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 🔑 Login Function
  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    
    // We do NOT set activeClub here immediately.
    // The Login Component will decide (Auto-select if 1, or show UI if >1)
    const { token, user, clubs } = res.data;

    localStorage.setItem("token", token);
    setUser(user);
    setAvailableClubs(clubs);
    
    return clubs; // Return clubs to the component so it knows what to display
  };

  // 🏢 Select Club Function
  const selectClub = (club) => {
    localStorage.setItem("activeClubId", club.clubId);
    setActiveClub(club);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("activeClubId");
    setUser(null);
    setActiveClub(null);
    setAvailableClubs([]);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        activeClub, 
        availableClubs, 
        login, 
        selectClub, 
        logout, 
        loading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}