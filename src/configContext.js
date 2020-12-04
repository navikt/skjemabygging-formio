import React from "react";

const AppConfigContext = React.createContext({});

function AppConfigProvider({ children, dokumentinnsendingBaseURL, featureToggles }) {
  return (
    <AppConfigContext.Provider value={{ dokumentinnsendingBaseURL, featureToggles }}>
      {children}
    </AppConfigContext.Provider>
  );
}

export { AppConfigProvider, AppConfigContext };
