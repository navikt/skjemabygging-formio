import { createContext, useContext } from 'react';
import { ReactComponentType } from '../../formio/components/base';
import BaseComponent from '../../formio/components/base/BaseComponent';
import { AppConfigContextType } from '../config/configContext';

interface ComponentUtilsContextType {
  appConfig: AppConfigContextType;
  translate: (originalText: string | undefined, params?: Record<string | number, any>) => string;
  locale: 'nb' | 'nn' | 'en';
  addRef: (elementId: string, ref: HTMLElement | null) => void;
  getComponentError: (elementId: string) => string | undefined;
  formConfig: ReactComponentType['options']['formConfig'];
  builderMode: boolean;
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
        addRef: component?.addRef.bind(component),
        getComponentError: component?.getComponentError.bind(component),
        formConfig: component?.getFormConfig(),
        builderMode: component?.builderMode,
      }}
    >
      {children}
    </ComponentUtilsContext.Provider>
  );
};

export const useComponentUtils = () => useContext(ComponentUtilsContext);
