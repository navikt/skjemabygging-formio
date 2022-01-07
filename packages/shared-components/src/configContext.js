import React, { useContext } from "react";

const AppConfigContext = React.createContext({});

function AppConfigProvider({ children, dokumentinnsendingBaseURL, baseUrl = "", fyllutBaseURL, featureToggles }) {
  return (
    <AppConfigContext.Provider value={{ dokumentinnsendingBaseURL, baseUrl, fyllutBaseURL, featureToggles }}>
      {children}
    </AppConfigContext.Provider>
  );
}

const useAppConfig = () => useContext(AppConfigContext);

export { AppConfigProvider, useAppConfig };
