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
    (flattenedComponents, currentComponent) => {
      return [
        ...flattenedComponents,
        currentComponent,
        ...(currentComponent.components ? flattenComponents(currentComponent.components) : []),
      ]
    },
    []
  );
}

function hasConditionalOn(keys, component) {
  return (component.conditional &&
      (keys.includes(component.conditional.when)
        || (component.conditional.json && keys.some(key => JSON.stringify(component.conditional.json).search(key) > -1))
      )
    )
    || (component.customConditional && keys.some(key => component.customConditional.search(key) > -1));
}

const recursivelyFindDependentComponents = (mainKey, downstreamKeys, comps) => {
  const dependentKeys = [];
  comps.forEach(comp => {
    if (comp.key !== mainKey) {
      if (hasConditionalOn(downstreamKeys, comp)) {
        dependentKeys.push({key: comp.key, label: comp.label});
      }
      if (comp.components?.length > 0) {
        dependentKeys.push(...recursivelyFindDependentComponents(mainKey, downstreamKeys, comp.components));
      }
    }
  })
  return dependentKeys;
}

const findByKey = (key, components) => {
  for (const component of components) {
    if (component.key === key) {
      return component;
    }
    if (component.components) {
      const result = findByKey(key, component.components);
      if (result) {
        return result;
      }
    }
  }
  return undefined;
}

export const findDependentComponents = (key, form) => {
  const component = findByKey(key, form.components);
  if (component) {
    const downstreamKeys = flattenComponents([component]).map(comp => comp.key);
    return recursivelyFindDependentComponents(key, downstreamKeys, form.components);
  }
  return [];
};

const navFormUtils = {
  formMatcherPredicate,
  toFormPath,
  findDependentComponents,
  flattenComponents,
};
export default navFormUtils;
