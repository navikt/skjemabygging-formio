import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useForm } from '../../context/form/FormContext';
import UtilsOverrides from '../../formio/overrides/utils-overrides/utils-overrides';

interface RenderContextType {
  activeComponents: Component[];
}

interface RenderProviderProps {
  children: React.ReactNode;
}

const RenderContext = createContext<RenderContextType>({} as RenderContextType);

export const RenderProvider = ({ children }: RenderProviderProps) => {
  const { form, submission } = useForm();
  const [activeComponents, setActiveComponents] = useState<Component[]>(form.components);

  const checkConditions = useCallback(
    (components: Component[]): Component[] => {
      return components
        .map((component) => {
          // TODO: row and instance?
          if (!UtilsOverrides.checkCondition(component, undefined, submission?.data, form, undefined, submission)) {
            console.log('Ignore component', component);
            return;
          }

          if (component.components?.length) {
            component.components = checkConditions(component.components);
          }

          return component;
        })
        .filter((component) => component !== undefined);
    },
    [form, submission],
  );

  useEffect(() => {
    setActiveComponents(checkConditions(JSON.parse(JSON.stringify(form.components))));
  }, [form, checkConditions]);

  return (
    <RenderContext.Provider
      value={{
        activeComponents,
      }}
    >
      {children}
    </RenderContext.Provider>
  );
};

export const useRender = () => useContext(RenderContext);
