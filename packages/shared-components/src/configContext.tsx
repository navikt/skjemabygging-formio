import React, { useContext } from "react";
import baseHttp from "./api/http";

type FeatureTogglesMap = {
  [key: string]: boolean;
};
type ApplicationName = "bygger" | "fyllut";
interface AppConfigContextType {
  dokumentinnsendingBaseURL?: string;
  baseUrl?: string;
  fyllutBaseURL?: string;
  featureToggles?: FeatureTogglesMap;
  submissionMethod?: string;
  app?: ApplicationName;
  http?: typeof baseHttp;
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
  app,
  http = baseHttp,
}: AppConfigProviderProps) {
  return (
    <AppConfigContext.Provider
      value={{ dokumentinnsendingBaseURL, baseUrl, fyllutBaseURL, featureToggles, submissionMethod, app, http }}
    >
      {children}
    </AppConfigContext.Provider>
  );
}

const useAppConfig = () => useContext(AppConfigContext);

export { AppConfigProvider, useAppConfig };
export type { AppConfigContextType };
