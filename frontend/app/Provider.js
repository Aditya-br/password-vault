"use client";

import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./redux/store";
import { PasswordProvider } from "./Context/passwordContext";

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PasswordProvider>
          {children}
        </PasswordProvider>
      </PersistGate>
    </Provider>
  );
}
