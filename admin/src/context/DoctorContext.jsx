import React, { createContext, useState } from "react";

export const DoctorContext = createContext();

const DoctorContextProvider = ({ children }) => {
  const [doctorToken, setDoctorToken] = useState(
    localStorage.getItem("doctorToken") || ""
  );
  
  const [currentDoctorId, setCurrentDoctorId] = useState(
    localStorage.getItem("currentDoctorId") || ""
  );

  const login = (email, password, doctorsList) => {
    // Look up the doctor by email in our registered list
    const foundDoc = doctorsList.find(
      (doc) => doc.email.toLowerCase() === email.toLowerCase()
    );

    if (foundDoc && password === "doctor") {
      const token = `mock-doctor-token-${foundDoc._id}`;
      setDoctorToken(token);
      setCurrentDoctorId(foundDoc._id);
      localStorage.setItem("doctorToken", token);
      localStorage.setItem("currentDoctorId", foundDoc._id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setDoctorToken("");
    setCurrentDoctorId("");
    localStorage.removeItem("doctorToken");
    localStorage.removeItem("currentDoctorId");
  };

  const value = {
    doctorToken,
    setDoctorToken,
    currentDoctorId,
    setCurrentDoctorId,
    login,
    logout
  };

  return (
    <DoctorContext.Provider value={value}>
      {children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;