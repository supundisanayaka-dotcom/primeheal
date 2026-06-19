import React, { createContext, useState } from "react";

export const AdminContext = createContext();

const AdminContextProvider = ({ children }) => {
  const [adminToken, setAdminToken] = useState(
    localStorage.getItem("adminToken") || ""
  );

  const login = (email, password) => {
    if (email === "admin@primeheal.com" && password === "admin") {
      const token = "mock-admin-token-12345";
      setAdminToken(token);
      localStorage.setItem("adminToken", token);
      return true;
    }
    return false;
  };

  const logout = () => {
    setAdminToken("");
    localStorage.removeItem("adminToken");
  };

  const value = {
    adminToken,
    setAdminToken,
    login,
    logout
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

export default AdminContextProvider;