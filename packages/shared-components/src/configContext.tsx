import React, { useContext } from "react";
import baseHttp from "./api/http";

interface AppConfigContextType {
  dokumentinnsendingBaseURL?: string;
  baseUrl?: string;
  fyllutBaseURL?: string;
  featureToggles?: object;
  submissionMethod?: string;
  http?: object;
}

type AppConfigProviderProps = { children: React.ReactNode } & AppConfigContextType;

const AppConfigContext = React.createContext<AppConfigContextType>({});

function AppConfigProvider({
  children,
  dokumentinnsendingBaseURL,
  baseUrl = "",
  fyllutBaseURL,
  featureToggles,
  submissionMethod,
  http = baseHttp,
}: AppConfigProviderProps) {
  return (
    <AppConfigContext.Provider
      value={{ dokumentinnsendingBaseURL, baseUrl, fyllutBaseURL, featureToggles, submissionMethod, http }}
    >
      {children}
    </AppConfigContext.Provider>
  );
}

const useAppConfig = () => useContext(AppConfigContext);

export { AppConfigProvider, useAppConfig };
export type { AppConfigContextType };
