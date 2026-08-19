import { Alert } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { useApplication } from '../../context/application/ApplicationContext';
import { inputComponentRegistry, InputComponentRegistry } from './inputComponentRegistry';

interface Props {
  component: Component;
  submissionPath?: string;
  componentRegistry?: InputComponentRegistry;
}

// Unsupported types are logged to the backend always; shown as a visible warning outside prod, and
// silently skipped in prod. Mirrors the summary RenderComponent behavior.
const RenderInputComponent = ({ component, submissionPath, componentRegistry = inputComponentRegistry }: Props) => {
  const { logger, environment } = useApplication();
  const RegistryComponent = componentRegistry[component.type];
  const shouldRenderHiddenComponent = component.type === 'maalgruppe';

  if (component.hidden && !shouldRenderHiddenComponent) {
    return null;
  }

  if (!RegistryComponent) {
    logger?.error?.(`Unsupported component type in input form: ${component.type}`);
    if (environment !== 'production') {
      return <Alert variant="error">Unsupported component type: {component.type}</Alert>;
    }
    return null;
  }

  const formioClasses = [`formio-component-${component.key}`, `formio-component-${component.type}`]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={formioClasses}>
      <RegistryComponent component={component} submissionPath={submissionPath} componentRegistry={componentRegistry} />
    </div>
  );
};

export default RenderInputComponent;
