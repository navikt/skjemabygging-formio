import FormioUtils from "formiojs/utils";
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

function hasConditionalOn(paths, component) {
  return (component.conditional &&
      (paths.includes(component.conditional.when)
        || (component.conditional.json && paths.some(key => JSON.stringify(component.conditional.json).search(`data.${key}[^a-zA-z0-9_-]`) > -1))
      )
    )
    || (component.customConditional && paths.some(key => component.customConditional.search(`data.${key}[^a-zA-z0-9_-]`) > -1));
}

const recursivelyFindDependentComponents = (mainId, downstreamPaths, comps) => {
  const dependentKeys = [];
  comps.forEach(comp => {
    if (comp.id !== mainId) {
      if (hasConditionalOn(downstreamPaths, comp)) {
        dependentKeys.push({key: comp.key, label: comp.label});
      }
      if (comp.components?.length > 0) {
        dependentKeys.push(...recursivelyFindDependentComponents(mainId, downstreamPaths, comp.components));
      }
    }
  })
  return dependentKeys;
}

const findById = (id, components) => {
  for (const component of components) {
    if (component.id === id) {
      return component;
    }
    if (component.components) {
      const result = findById(id, component.components);
      if (result) {
        return result;
      }
    }
  }
  return undefined;
}

export const findDependentComponents = (id, form) => {
  const idToPathMapping = {};
  FormioUtils.eachComponent(form.components, (component, path) => {
    idToPathMapping[component.id] = path;
  });

  const component = findById(id, form.components);
  if (component) {
    const downstreamPaths = flattenComponents([component]).map(comp => idToPathMapping[comp.id]);
    return recursivelyFindDependentComponents(id, downstreamPaths, form.components);
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
