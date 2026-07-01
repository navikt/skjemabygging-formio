import { SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext } from 'react';

interface FrameworkLogger {
  debug?: (message: string, metadata?: object) => void;
  info?: (message: string, metadata?: object) => void;
  error?: (message: string, metadata?: object) => void;
}

interface FrameworkAppConfig {
  submissionMethod?: SubmissionMethod;
  logger?: FrameworkLogger;
  config?: {
    NAIS_CLUSTER_NAME?: string;
  };
}

interface Props extends FrameworkAppConfig {
  children: ReactNode;
}

const AppConfigContext = createContext<FrameworkAppConfig>({} as FrameworkAppConfig);

const AppConfigProvider = ({ children, ...appConfig }: Props) => {
  return <AppConfigContext.Provider value={appConfig}>{children}</AppConfigContext.Provider>;
};

const useAppConfig = () => useContext(AppConfigContext);

export { AppConfigProvider, useAppConfig };
export type { FrameworkAppConfig, FrameworkLogger };
