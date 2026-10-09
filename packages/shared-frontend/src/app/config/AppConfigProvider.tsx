import { SharedFrontendConfig } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import baseHttp from '../http/http';
import FrontendLogger from '../logger/FrontendLogger';

interface AppConfigContextValue {
  baseUrl: string;
  config: SharedFrontendConfig;
  http: typeof baseHttp;
  logger: FrontendLogger;
}

interface Props {
  baseUrl: string;
  children: ReactNode;
  config: SharedFrontendConfig;
  http?: typeof baseHttp;
}

const AppConfigContext = createContext<AppConfigContextValue | undefined>(undefined);

/**
 * Host-independent app config. The legacy AppConfigProvider in shared-components carries fyllut and bygger
 * specific fields and is not used by new hosts.
 */
const AppConfigProvider = ({ baseUrl, children, config, http = baseHttp }: Props) => {
  const value = useMemo(
    () => ({ baseUrl, config, http, logger: new FrontendLogger(http, baseUrl, config.loggerConfig) }),
    [baseUrl, config, http],
  );

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
};

const useAppConfig = () => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  return context;
};

export { AppConfigProvider, useAppConfig };
export type { AppConfigContextValue };
