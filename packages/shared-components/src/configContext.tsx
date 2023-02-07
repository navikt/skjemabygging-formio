import React, { useContext, useState } from "react";
import FrontendLogger from "./api/FrontendLogger";
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
  config?: Record<string, string | boolean | object>;
  http?: typeof baseHttp;
  logger?: FrontendLogger;
  diffOn?: boolean;
  setDiffOn?: Function;
}

type AppConfigProviderProps = {
  children: React.ReactNode;
  enableFrontendLogger?: boolean;
} & AppConfigContextType;

const AppConfigContext = React.createContext<AppConfigContextType>({});

function AppConfigProvider({
  children,
  dokumentinnsendingBaseURL,
  baseUrl = "",
  fyllutBaseURL,
  featureToggles,
  submissionMethod,
  app,
  config,
  http = baseHttp,
  enableFrontendLogger = false,
}: AppConfigProviderProps) {
  const logger = new FrontendLogger(http, baseUrl, enableFrontendLogger);
  const [diffOn, setDiffOn] = useState<boolean>(true);
  return (
    <AppConfigContext.Provider
      value={{
        dokumentinnsendingBaseURL,
        baseUrl,
        fyllutBaseURL,
        featureToggles,
        submissionMethod,
        app,
        config,
        http,
        logger,
        diffOn,
        setDiffOn,
      }}
    >
      {children}
    </AppConfigContext.Provider>
  );
}

const useAppConfig = () => useContext(AppConfigContext);

export { AppConfigProvider, useAppConfig };
export type { AppConfigContextType };
