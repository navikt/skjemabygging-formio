import { Alert } from '@navikt/ds-react';
import { useEffect } from 'react';
import { FormComponentProps } from './types';
import { reportUnsupportedComponent } from './unsupportedComponentLogger';

const RenderComponent = (props: FormComponentProps) => {
  const { componentRegistry, component, rendererConfig } = props;
  const { logger, environment } = rendererConfig;
  const { type } = component;
  const RegistryComponent = componentRegistry[type];

  useEffect(() => {
    if (!RegistryComponent) {
      reportUnsupportedComponent(logger, {
        componentType: type,
        formPath: rendererConfig.formPath,
        surface: 'summary',
      });
    }
  }, [logger, RegistryComponent, rendererConfig.formPath, type]);

  if (!componentRegistry[type]) {
    if (environment !== 'production') {
      return <Alert variant="error">Unsupported component type: {type}</Alert>;
    }

    return null;
  }

  return <RegistryComponent {...props} />;
};

export default RenderComponent;
