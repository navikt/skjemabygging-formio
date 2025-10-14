import { Alert } from '@navikt/ds-react';
import { useAppConfig } from '../../context/config/configContext';
import { FormComponentProps } from '../types';

const RenderComponent = ({ component, submissionPath, componentRegistry, panelValidationList }: FormComponentProps) => {
  const { logger, config } = useAppConfig();
  const { type } = component;
  const RegistryComponent = componentRegistry[type];

  if (!componentRegistry[type]) {
    logger?.error(`Unsupported component type in summary: ${type}`);
    if (config?.NAIS_CLUSTER_NAME !== 'prod-gcp') {
      return <Alert variant="error">Unsupported component type: {type}</Alert>;
    }

    return null;
  }

  return (
    <RegistryComponent
      component={component}
      submissionPath={submissionPath}
      componentRegistry={componentRegistry}
      panelValidationList={panelValidationList}
    />
  );
};

export default RenderComponent;
