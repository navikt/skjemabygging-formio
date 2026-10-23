import { Component } from '../../models';

export const getNavId = (component: Component): string | undefined => component.navId ?? component.id;

export function flattenComponents<ComponentLike extends { components?: ComponentLike[] }>(
  components: ComponentLike[],
): ComponentLike[] {
  return components.reduce((flattenedComponents: ComponentLike[], currentComponent: ComponentLike) => {
    return [
      ...flattenedComponents,
      currentComponent,
      ...(currentComponent.components ? flattenComponents(currentComponent.components) : []),
    ];
  }, []);
}
