import { camelCase } from "./stringUtils";

export const toFormPath = (text) => camelCase(text).toLowerCase();

export const formMatcherPredicate = (pathFromUrl) => (form) => {
  return (
    form.path === pathFromUrl ||
    toFormPath(form.title) === pathFromUrl ||
    toFormPath(form.properties.skjemanummer) === pathFromUrl
  );
};

export function flattenComponents(components) {
  return components.reduce(
    (flattenedComponents, currentComponent) => [
      ...flattenedComponents,
      currentComponent,
      ...(currentComponent.components ? flattenComponents(currentComponent.components) : []),
    ],
    []
  );
}

export const findDependentComponents = (key, form) => {
  const comps = flattenComponents(form.components);
  return comps
    .filter(c => {
      return (c.conditional &&
          (c.conditional.when === key
            || (c.conditional.json && JSON.stringify(c.conditional.json).search(key) > -1)
          )
        )
        || (c.customConditional && c.customConditional.search(key) > -1)
    })
    .map(c => c.key);
};

const navFormUtils = {
  formMatcherPredicate,
  toFormPath,
  findDependentComponents,
  flattenComponents,
};
export default navFormUtils;
