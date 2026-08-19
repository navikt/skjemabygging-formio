import { createContext, ReactNode, useContext } from 'react';

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

const ApplicationProvider = ({ children, environment, logger }: Props) => (
  <ApplicationContext.Provider value={{ environment, logger }}>{children}</ApplicationContext.Provider>
);

const useApplication = () => useContext(ApplicationContext);

export { ApplicationProvider, useApplication };
export type { ApplicationContextValue, ApplicationEnvironment, ApplicationLogger };
