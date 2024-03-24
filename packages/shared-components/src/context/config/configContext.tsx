import { SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import React, { useContext, useState } from 'react';
import FrontendLogger, { LoggerConfig } from '../../api/frontend-logger/FrontendLogger';
import baseHttp from '../../api/util/http/http';

type FeatureTogglesMap = {
  [key: string]: boolean;
};

type ApplicationName = 'bygger' | 'fyllut';
interface AppConfigContextType {
  dokumentinnsendingBaseURL?: string;
  baseUrl?: string;
  fyllutBaseURL?: string;
  featureToggles?: FeatureTogglesMap;
  submissionMethod?: SubmissionMethod;
  app?: ApplicationName;
  config?: Record<string, string | boolean | object>;
  http?: typeof baseHttp;
  logger?: FrontendLogger;
  diffOn?: boolean;
  setDiffOn?: Function;
}

type AppConfigProviderProps = {
  children: React.ReactNode;
} & AppConfigContextType;

const AppConfigContext = React.createContext<AppConfigContextType>({});

function AppConfigProvider({
  children,
  dokumentinnsendingBaseURL,
  baseUrl = '',
  fyllutBaseURL,
  featureToggles,
  submissionMethod,
  app,
  config,
  http = baseHttp,
  diffOn = true,
}: AppConfigProviderProps) {
  const logger = new FrontendLogger(http!, baseUrl, config?.loggerConfig as LoggerConfig);
  const [internalDiffOn, setDiffOn] = useState<boolean>(diffOn!);
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
        diffOn: internalDiffOn,
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
