import { createContext, useContext } from 'react';
import BaseComponent from '../../formio/components/base/BaseComponent';
import { AppConfigContextType } from '../config/configContext';

interface ComponentUtilsContextType {
  appConfig: AppConfigContextType;
  translate: (originalText: string | undefined, params?: Record<string | number, any>) => string;
  locale: 'nb' | 'nn' | 'en';
  addRef: (name: string, ref: HTMLElement | null) => void;
}

interface ComponentUtilsProviderProps {
  component: BaseComponent;
  children: React.ReactNode;
}

const ComponentUtilsContext = createContext<ComponentUtilsContextType>({} as ComponentUtilsContextType);

export const ComponentUtilsProvider = ({ children, ...props }: ComponentUtilsProviderProps) => {
  const component = props.component;
  return (
    <ComponentUtilsContext.Provider
      value={{
        appConfig: component?.getAppConfig(),
        translate: (originalText, params) => component?.t(originalText, params),
        locale: component?.getLocale(),
        addRef: component?.addRef,
      }}
    >
      {children}
    </ComponentUtilsContext.Provider>
  );
};

export const useComponentUtils = () => useContext(ComponentUtilsContext);
