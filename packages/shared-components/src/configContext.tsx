import React, { useContext } from "react";

interface AppConfigContextType {
  dokumentinnsendingBaseURL?: string;
  baseUrl?: string;
  fyllutBaseURL?: string;
  featureToggles?: object;
  submissionMethod?: string;
}

type AppConfigProviderProps = { children: React.ReactNode } & AppConfigContextType;

const AppConfigContext = React.createContext<AppConfigContextType>({});

function AppConfigProvider({ children, dokumentinnsendingBaseURL, baseUrl = "", fyllutBaseURL, featureToggles, submissionMethod }: AppConfigProviderProps) {
  return (
    <AppConfigContext.Provider value={{ dokumentinnsendingBaseURL, baseUrl, fyllutBaseURL, featureToggles, submissionMethod }}>
      {children}
    </AppConfigContext.Provider>
  );
}

const useAppConfig = () => useContext(AppConfigContext);

export { AppConfigProvider,useAppConfig };
export type { AppConfigContextType };

