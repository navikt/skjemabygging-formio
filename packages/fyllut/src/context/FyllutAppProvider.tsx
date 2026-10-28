import { umamiEventHandler } from '@navikt/skjemadigitalisering-shared-components';
import { FyllutFrontendConfig, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { useAppConfig } from '@navikt/skjemadigitalisering-shared-frontend';
import { createContext, ReactNode, useContext, useMemo } from 'react';

interface FyllutAppContextValue {
  logEvent: ReturnType<typeof umamiEventHandler>;
  // Resolved once from the 'sub' query param at page load
  submissionMethod?: SubmissionMethod;
}

interface Props {
  children: ReactNode;
  submissionMethod?: SubmissionMethod;
}

const FyllutAppContext = createContext<FyllutAppContextValue | undefined>(undefined);

const useFyllutAppConfig = () => useAppConfig<FyllutFrontendConfig>();

/**
 * Fyllut-specific values for the new renderer. Shared values (config, HTTP client, logger, base URL) come from
 * AppConfigProvider in shared-frontend.
 */
const FyllutAppProvider = ({ children, submissionMethod }: Props) => {
  const { config, logger } = useFyllutAppConfig();
  const logEvent = useMemo(() => umamiEventHandler(config, logger), [config, logger]);
  const value = useMemo(() => ({ logEvent, submissionMethod }), [logEvent, submissionMethod]);

  return <FyllutAppContext.Provider value={value}>{children}</FyllutAppContext.Provider>;
};

const useFyllutApp = () => {
  const context = useContext(FyllutAppContext);
  if (!context) {
    throw new Error('useFyllutApp must be used within FyllutAppProvider');
  }
  return context;
};

export { FyllutAppProvider, useFyllutApp, useFyllutAppConfig };
