import { createContext, useState } from "react";
import { doctors } from "../assets/assets";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const currencySymbol = '$'  
  const [token, setToken] = useState(false)

  const value = {
    doctors,
    currencySymbol,
    token,
    setToken
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
