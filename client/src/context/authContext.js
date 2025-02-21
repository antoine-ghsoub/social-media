import { createContext, useState, useEffect } from "react";
import { makeRequest } from "../axios";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  // Updated login: call backend API and store user on success
  const login = async (inputs) => {
    const res = await makeRequest.post("/auth/login", inputs);
    setCurrentUser(res.data);
    localStorage.setItem("user", JSON.stringify(res.data));
  };

  // Updated logout: call API then clear user data
  const logout = async () => {
    await makeRequest.post("/auth/logout");
    setCurrentUser(null);
    localStorage.removeItem("user");
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setCurrentUser(storedUser);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
