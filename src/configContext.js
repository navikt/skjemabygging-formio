import React from "react";

const AppConfigContext = React.createContext({});

function AppConfigProvider({ children, dokumentinnsendingBaseURL, fyllutBaseURL, featureToggles }) {
  return (
    <AppConfigContext.Provider value={{ dokumentinnsendingBaseURL, fyllutBaseURL, featureToggles }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export { AppConfigProvider, AppConfigContext };
