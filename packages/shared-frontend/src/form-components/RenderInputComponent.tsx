import { Alert } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { useAppConfig } from '../context/app-config/AppConfigContext';
import { inputComponentRegistry, InputComponentRegistry } from './inputComponentRegistry';

interface Props {
  component: Component;
  submissionPath?: string;
  pageKey: string;
  pageComponents: Component[];
  componentRegistry?: InputComponentRegistry;
}

// Unsupported types are logged to the backend always; shown as a visible warning outside prod, and
// silently skipped in prod. Mirrors the summary RenderComponent behavior.
const RenderInputComponent = ({
  component,
  submissionPath,
  pageKey,
  pageComponents,
  componentRegistry = inputComponentRegistry,
}: Props) => {
  const { logger, config } = useAppConfig();
  const RegistryComponent = componentRegistry[component.type];

  if (!RegistryComponent) {
    logger?.error?.(`Unsupported component type in input form: ${component.type}`);
    if (config?.NAIS_CLUSTER_NAME !== 'prod-gcp') {
      return <Alert variant="error">Unsupported component type: {component.type}</Alert>;
    }
    return null;
  }

  return (
    <RegistryComponent
      component={component}
      submissionPath={submissionPath}
      pageKey={pageKey}
      pageComponents={pageComponents}
      componentRegistry={componentRegistry}
    />
  );
};

export default RenderInputComponent;
