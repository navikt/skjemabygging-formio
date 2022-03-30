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
  return components.reduce((flattenedComponents, currentComponent) => {
    return [
      ...flattenedComponents,
      currentComponent,
      ...(currentComponent.components ? flattenComponents(currentComponent.components) : []),
    ];
  }, []);
}

function isKeyInText(key, text) {
  return text && text.search(`\\w+\\.${key}[^a-zA-z0-9_-]`) > -1;
}

function areAnyPathsInText(paths, text) {
  return text && text !== "" && paths.some((key) => isKeyInText(key, text));
}

function calculatesValueBasedOn(paths, component) {
  return areAnyPathsInText(paths, component.calculateValue);
}

function validatesBasedOn(paths, component) {
  return (
    component.validate &&
    (areAnyPathsInText(paths, component.validate.custom) ||
      areAnyPathsInText(paths, JSON.stringify(component.validate.json)))
  );
}

function hasConditionalOn(paths, component) {
  return (
    (component.conditional &&
      (paths.includes(component.conditional.when) ||
        areAnyPathsInText(paths, JSON.stringify(component.conditional.json)))) ||
    areAnyPathsInText(paths, component.customConditional)
  );
}

const recursivelyFindDependentComponents = (mainId, downstreamPaths, comps) => {
  const dependentKeys = [];
  comps.forEach((comp) => {
    if (comp.id !== mainId) {
      if (
        hasConditionalOn(downstreamPaths, comp) ||
        validatesBasedOn(downstreamPaths, comp) ||
        calculatesValueBasedOn(downstreamPaths, comp)
      ) {
        dependentKeys.push({ key: comp.key, label: comp.label });
      }
      if (comp.components?.length > 0) {
        dependentKeys.push(...recursivelyFindDependentComponents(mainId, downstreamPaths, comp.components));
      }
    }
  });
  return dependentKeys;
};

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
};

export const findDependentComponents = (id, form) => {
  /*const idToPathMapping = {};
  FormioUtils.eachComponent(form.components, (component, path) => {
    idToPathMapping[component.id] = path;
  });*/

  const component = findById(id, form.components);
  if (component) {
    //const downstreamPaths = flattenComponents([component]).map((comp) => idToPathMapping[comp.id]);
    const downstreamPaths = flattenComponents([component]).map((comp) => comp.key);
    return recursivelyFindDependentComponents(id, downstreamPaths, form.components);
  }
  return [];
};

const removeRecursively = (component, isTarget) => {
  if (component.components?.length) {
    component.components = component.components.filter((c) => !isTarget(c));
    component.components.forEach((component) => {
      removeRecursively(component, isTarget);
    });
  }
};

export const removeComponents = (form, isTarget) => {
  const formCopy = JSON.parse(JSON.stringify(form));
  removeRecursively(formCopy, isTarget);
  return formCopy;
};

const VEDLEGGSPANEL_KEY = /^vedlegg(panel)?$/;
export const removeVedleggspanel = (form) => {
  const isVedleggspanel = (component) => component.type === "panel" && VEDLEGGSPANEL_KEY.test(component.key);
  return removeComponents(form, isVedleggspanel);
};

const navFormUtils = {
  formMatcherPredicate,
  toFormPath,
  findDependentComponents,
  flattenComponents,
  removeVedleggspanel,
};
export default navFormUtils;
