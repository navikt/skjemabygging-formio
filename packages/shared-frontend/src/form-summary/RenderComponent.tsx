import { Alert } from '@navikt/ds-react';
import { FormComponentProps } from './types';

const RenderComponent = (props: FormComponentProps) => {
  const { componentRegistry, component, rendererConfig } = props;
  const { logger, environment } = rendererConfig;
  const { type } = component;
  const RegistryComponent = componentRegistry[type];

  if (!componentRegistry[type]) {
    logger?.error?.(`Unsupported component type in summary: ${type}`);
    if (environment !== 'production') {
      return <Alert variant="error">Unsupported component type: {type}</Alert>;
    }

    return null;
  }

  return <RegistryComponent {...props} />;
};

export default RenderComponent;
