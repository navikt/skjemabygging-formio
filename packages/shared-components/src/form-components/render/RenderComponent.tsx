import { useAppConfig } from '../../context/config/configContext';
import { FormComponentProps } from '../types';

const RenderComponent = ({ component, submissionPath, componentRegistry, panelValidationList }: FormComponentProps) => {
  const { logger } = useAppConfig();
  const { type } = component;
  const RegistryComponent = componentRegistry[type];

  if (!componentRegistry[type]) {
    logger?.error(`Unsupported component type in summary: ${type}`);
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
