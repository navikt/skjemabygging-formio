import { Alert } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentType, useEffect } from 'react';
import { useApplication } from '../context/application/ApplicationContext';
import { useFormDefinition } from '../context/form-definition/FormDefinitionContext';
import { inputComponentRegistry, InputComponentRegistry } from './inputComponentRegistry';
import { InputComponentProps, InputComponentType } from './inputComponentRegistryUtils';
import { reportUnsupportedComponent } from './unsupportedComponentLogger';

interface Props {
  component: Component;
  submissionPath?: string;
  componentRegistry?: InputComponentRegistry;
}

// Unsupported types are logged to the backend always; shown as a visible warning outside prod, and
// silently skipped in prod. Mirrors the summary RenderComponent behavior.
const RenderInputComponent = ({ component, submissionPath, componentRegistry = inputComponentRegistry }: Props) => {
  const { logger, environment } = useApplication();
  const { form } = useFormDefinition();
  // Single boundary cast: indexing the mapped registry by the runtime `type`
  // yields a union of adapters with incompatible props that JSX cannot spread,
  // so we erase to the generic adapter shape here. Adapters remain fully typed.
  const RegistryComponent = componentRegistry[component.type as InputComponentType] as
    ComponentType<InputComponentProps> | undefined;
  const shouldRenderHiddenComponent = component.type === 'maalgruppe';
  const shouldReportUnsupportedComponent = !RegistryComponent && (!component.hidden || shouldRenderHiddenComponent);

  useEffect(() => {
    if (shouldReportUnsupportedComponent) {
      reportUnsupportedComponent(logger, {
        componentType: component.type,
        formPath: form.path,
        surface: 'input',
      });
    }
  }, [component.type, form.path, logger, shouldReportUnsupportedComponent]);

  if (component.hidden && !shouldRenderHiddenComponent) {
    return null;
  }

  if (!RegistryComponent) {
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
