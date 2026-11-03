import { SharedFrontendConfig } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useMemo } from 'react';
import baseHttp from '../http/http';
import FrontendLogger from '../logger/FrontendLogger';

interface AppConfigContextValue<TConfig extends SharedFrontendConfig = SharedFrontendConfig> {
  baseUrl: string;
  config: TConfig;
  http: typeof baseHttp;
  logger: FrontendLogger;
}

interface Props<TConfig extends SharedFrontendConfig> {
  baseUrl: string;
  children: ReactNode;
  config: TConfig;
  http?: typeof baseHttp;
}

const AppConfigContext = createContext<AppConfigContextValue | undefined>(undefined);

/**
 * Host-independent app config shared by all hosts. Each host fetches its own config, passes its own HTTP client
 * and keeps host-specific values in a separate context. The legacy AppConfigProvider in shared-components is only
 * used by the legacy renderer and bygger.
 */
const AppConfigProvider = <TConfig extends SharedFrontendConfig>({
  baseUrl,
  children,
  config,
  http = baseHttp,
}: Props<TConfig>) => {
  const value = useMemo(
    () => ({ baseUrl, config, http, logger: new FrontendLogger(http, baseUrl, config.loggerConfig) }),
    [baseUrl, config, http],
  );

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
};

// TConfig must match the config type the host passes to AppConfigProvider. Hosts wrap this in a typed hook.
const useAppConfig = <TConfig extends SharedFrontendConfig = SharedFrontendConfig>() => {
  const context = useContext(AppConfigContext);
  if (!context) {
    throw new Error('useAppConfig must be used within AppConfigProvider');
  }
  return context as AppConfigContextValue<TConfig>;
};

export { AppConfigProvider, useAppConfig };
export type { AppConfigContextValue };
