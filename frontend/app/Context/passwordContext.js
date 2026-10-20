// PasswordContext.js
import { createContext, useContext, useState } from "react";

const PasswordContext = createContext();

export const PasswordProvider = ({ children }) => {
  const [encryptionKey, setEncryptionKey] = useState(null);
  const [sessionToken, setSessionToken] = useState(null);
  return (
    <PasswordContext.Provider value={{
      encryptionKey,
      setEncryptionKey,
      sessionToken,
      setSessionToken
    }}>
      {children}
    </PasswordContext.Provider>
  );
};

export const usePassword = () => useContext(PasswordContext);
