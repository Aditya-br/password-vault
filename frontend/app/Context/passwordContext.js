// PasswordContext.js
import { createContext, useContext, useState } from "react";

const PasswordContext = createContext();

export const PasswordProvider = ({ children }) => {
  const [masterPassword, setMasterPassword] = useState("");
  return (
    <PasswordContext.Provider value={{ masterPassword, setMasterPassword }}>
      {children}
    </PasswordContext.Provider>
  );
};

export const usePassword = () => useContext(PasswordContext);
