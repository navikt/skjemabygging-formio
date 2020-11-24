import React from "react";

const AppConfigContext = React.createContext({});

function AppConfigProvider({ children, dokumentinnsendingBaseURL }) {
  return <AppConfigContext.Provider value={{ dokumentinnsendingBaseURL }}>{children}</AppConfigContext.Provider>;
}

export { AppConfigProvider, AppConfigContext };
