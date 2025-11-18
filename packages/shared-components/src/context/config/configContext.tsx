import { SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import React, { useContext, useMemo, useState } from 'react';
import FrontendLogger, { LoggerConfig } from '../../api/frontend-logger/FrontendLogger';
import baseHttp from '../../api/util/http/http';
import { LogEventFunction, umamiEventHandler } from '../../util/tracking/umami';

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
  setDiffOn?: (diffOn: boolean) => void;
  logEvent?: LogEventFunction;
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
  const logger = useMemo(
    () => new FrontendLogger(http!, baseUrl, config?.loggerConfig as LoggerConfig),
    [baseUrl, config, http],
  );

  const logEvent = useMemo(() => {
    return config ? umamiEventHandler(config, logger) : undefined;
  }, [config, logger]);

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
        logEvent,
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
