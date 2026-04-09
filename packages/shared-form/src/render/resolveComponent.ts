import { createComponentRegistry } from '../components/registry/createComponentRegistry';
import { ComponentResolverResult, ResolveComponentProps } from '../types';

const componentRegistry = createComponentRegistry();

const resolveComponent = ({ component, ...context }: ResolveComponentProps): ComponentResolverResult => {
  const resolver = componentRegistry[component.type];
  if (!resolver) {
    return null;
  }

  return resolver(component, context);
};

export { resolveComponent };
