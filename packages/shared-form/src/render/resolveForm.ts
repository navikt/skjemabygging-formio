import { ResolvedComponentModel, ResolveFormProps } from '../types';
import { resolveComponent } from './resolveComponent';

const resolveForm = ({ components, ...context }: ResolveFormProps): ResolvedComponentModel[] =>
  components.flatMap((component) => {
    const resolvedComponent = resolveComponent({ component, ...context });

    if (!resolvedComponent) {
      return [];
    }

    return Array.isArray(resolvedComponent) ? resolvedComponent : [resolvedComponent];
  });

export { resolveForm };
