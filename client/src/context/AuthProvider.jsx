import axios from "axios";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { logout, verifyUser } from "../api/auth.js";
import { releaseServiceWindow } from "../api/staff.api.js";

axios.defaults.withCredentials = true; // send cookies automatically with requests

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🧩 Check authentication via cookie
  const checkAuth = useCallback(async () => {
    try {
      const userData = await verifyUser(); // this calls backend /auth/check or /user/me
      setUser(userData);
      setError(null);
    } catch (error) {
      console.error("Authentication check failed:", error);
      setUser(null);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth(); // check once on mount
  }, [checkAuth]);

  // 🧩 login() is now simpler — you don’t store token manually
  const loginOperation = useCallback((userData) => {
    setUser(userData);
    setError(null);
  }, []);

  // 🧩 logout() — backend clears cookie, frontend clears state
  const logoutOperation = useCallback(async () => {
    try {
      const clearWindowAssignment = await releaseServiceWindow();
      if (!clearWindowAssignment)
        return new Error("There is a problem clearing Window Assignemt", error);
      const logoutUser = await logout(); // backend clears cookie
      if (!logoutUser) throw new Error("Logout failed");
    } catch (error) {
      console.error("Logout failed!", error);
    } finally {
      setUser(null);
      setError(null);
    }
  }, []);

  const value = {
    user,
    isLoading,
    error,
    loginOperation,
    logoutOperation,
    refreshAuth: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
