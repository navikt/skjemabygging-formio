import { createContext, ReactNode, useContext, useMemo } from 'react';

type ApplicationEnvironment = 'production' | 'development' | 'test';

interface ApplicationLogger {
  debug?: (message: string, metadata?: object) => void;
  info?: (message: string, metadata?: object) => void;
  error?: (message: string, metadata?: object) => void;
}

interface ApplicationContextValue {
  environment: ApplicationEnvironment;
  logger?: ApplicationLogger;
}

interface Props extends ApplicationContextValue {
  children: ReactNode;
}

const ApplicationContext = createContext<ApplicationContextValue>({
  environment: 'production',
});

const ApplicationProvider = ({ children, environment, logger }: Props) => {
  const value = useMemo(() => ({ environment, logger }), [environment, logger]);
  return <ApplicationContext.Provider value={value}>{children}</ApplicationContext.Provider>;
};

const useApplication = () => useContext(ApplicationContext);

export { ApplicationProvider, useApplication };
export type { ApplicationContextValue, ApplicationEnvironment, ApplicationLogger };
