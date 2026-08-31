import { Alert } from '@navikt/ds-react';
import { ComponentType, useEffect } from 'react';
import { FormComponentProps, SummaryComponentType } from './types';
import { reportUnsupportedComponent } from './unsupportedComponentLogger';

const RenderComponent = (props: FormComponentProps) => {
  const { componentRegistry, component, rendererConfig } = props;
  const { logger, environment } = rendererConfig;
  const { type } = component;
  // Single boundary cast: indexing the mapped registry by the runtime `type`
  // yields a union of adapters with incompatible props that JSX cannot spread,
  // so we erase to the generic adapter shape here. Adapters remain fully typed.
  const RegistryComponent = componentRegistry[type as SummaryComponentType] as
    ComponentType<FormComponentProps> | undefined;

  useEffect(() => {
    if (!RegistryComponent) {
      reportUnsupportedComponent(logger, {
        componentType: type,
        formPath: rendererConfig.formPath,
        surface: 'summary',
      });
    }
  }, [logger, RegistryComponent, rendererConfig.formPath, type]);

  if (!RegistryComponent) {
    if (environment !== 'production') {
      return <Alert variant="error">Unsupported component type: {type}</Alert>;
    }

    return null;
  }

  return <RegistryComponent {...props} />;
};

export default RenderComponent;
