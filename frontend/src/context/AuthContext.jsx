import { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await API.get("/users/current-user");
      setUser(res.data?.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (email, password) => {
    const res = await API.post("/users/login", { email, password });
    setUser(res.data?.data);
    return res.data;
  };

  const register = async (formData) => {
    const res = await API.post("/users/register", formData);
    return res.data;
  };

  const logout = async () => {
    await API.post("/users/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout, fetchCurrentUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};
