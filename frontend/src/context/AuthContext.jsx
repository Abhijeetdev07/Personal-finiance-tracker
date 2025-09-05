import { createContext, useState, useEffect } from "react";
import { getProfile, updateUserProfile } from "../utils/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Save token to localStorage whenever it changes
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  const loginUser = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
  };

  const logoutUser = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
    setProfile(null);
  };

  // Fetch profile when token changes and exists
  useEffect(() => {
    const fetchProfile = async () => {
      if (!token) {
        setProfile(null);
        return;
      }
      try {
        setIsProfileLoading(true);
        const data = await getProfile();
        if (data && data.success) {
          setProfile(data.profile);
        } else {
          setProfile(null);
        }
      } catch (err) {
        setProfile(null);
      } finally {
        setIsProfileLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const refreshProfile = async () => {
    const data = await getProfile();
    if (data && data.success) setProfile(data.profile);
    return data;
  };

  const saveProfile = async (updates) => {
    const data = await updateUserProfile(updates);
    if (data && data.success) setProfile(data.profile);
    return data;
  };


  return (
    <AuthContext.Provider value={{
      user,
      token,
      profile,
      isProfileLoading,
      loginUser,
      logoutUser,
      refreshProfile,
      saveProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};
