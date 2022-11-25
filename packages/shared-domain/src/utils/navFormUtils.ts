// @ts-ignore
import FormioUtils from "formiojs/utils";
import { Component, NavFormType } from "../form";
import { camelCase } from "./stringUtils";

export const toFormPath = (text: string) => camelCase(text).toLowerCase();

export const formMatcherPredicate = (pathFromUrl: string) => (form: NavFormType) => {
  return (
    form.path === pathFromUrl ||
    toFormPath(form.title) === pathFromUrl ||
    toFormPath(form.properties.skjemanummer) === pathFromUrl
  );
};

export function flattenComponents(components: Component[]): Component[] {
  // @ts-ignore|
  return components.reduce((flattenedComponents, currentComponent) => {
    return [
      ...flattenedComponents,
      currentComponent,
      ...(currentComponent.components ? flattenComponents(currentComponent.components) : []),
    ];
  }, []);
}

function isKeyInText(key: string, text: string) {
  return text && text.search(`\\w+\\.${key}[^a-zA-z0-9_-]`) > -1;
}

function areAnyPathsInText(paths: string[], text?: string) {
  return text && text !== "" && paths.some((key) => isKeyInText(key, text));
}

function calculatesValueBasedOn(paths: string[], component: Component) {
  return areAnyPathsInText(paths, component.calculateValue);
}

function validatesBasedOn(paths: string[], component: Component) {
  return (
    component.validate &&
    (areAnyPathsInText(paths, component.validate.custom) ||
      areAnyPathsInText(paths, JSON.stringify(component.validate.json)))
  );
}

function hasConditionalOn(paths: string[], component: Component) {
  return (
    (component.conditional &&
      ((component.conditional.when && paths.includes(component.conditional.when)) ||
        areAnyPathsInText(paths, JSON.stringify(component.conditional.json)))) ||
    areAnyPathsInText(paths, component.customConditional)
  );
}

type DependentKeysType = { key: string; label: string };
const recursivelyFindDependentComponents = (mainId: string, downstreamPaths: string[], comps: Component[]) => {
  const dependentKeys: DependentKeysType[] = [];
  comps.forEach((comp) => {
    if (comp.id !== mainId) {
      if (
        hasConditionalOn(downstreamPaths, comp) ||
        validatesBasedOn(downstreamPaths, comp) ||
        calculatesValueBasedOn(downstreamPaths, comp)
      ) {
        dependentKeys.push({ key: comp.key, label: comp.label });
      }
      if (comp.components && comp.components?.length > 0) {
        dependentKeys.push(...recursivelyFindDependentComponents(mainId, downstreamPaths, comp.components));
      }
    }
  });
  return dependentKeys;
};

type ComponentMatcherFunction = (c: Component) => boolean;
const findComponent = (isMatch: ComponentMatcherFunction, components: Component[]): Component | undefined => {
  for (const component of components) {
    if (isMatch(component)) {
      return component;
    }
    if (component.components) {
      const result = findComponent(isMatch, component.components);
      if (result) {
        return result;
      }
    }
  }
  return undefined;
};

const findById = (id: string, components: Component[]): Component | undefined =>
  findComponent((c) => c.id === id, components);

export const findDependentComponents = (id: string, form: NavFormType) => {
  const idToPathMapping: { [s: string]: string } = {};
  FormioUtils.eachComponent(form.components, (component: Component, path: string) => {
    idToPathMapping[component.id!] = path;
  });

  const component = findById(id, form.components);
  if (component) {
    const downstreamPaths = flattenComponents([component]).map((comp) => idToPathMapping[comp.id!]);
    return recursivelyFindDependentComponents(id, downstreamPaths, form.components);
  }
  return [];
};

type ComponentFilterFunction = (c: Component) => boolean;
const removeRecursively = (component: Component, isTarget: ComponentFilterFunction) => {
  if (component.components?.length) {
    component.components = component.components.filter((c: Component) => !isTarget(c));
    component.components.forEach((component) => {
      removeRecursively(component, isTarget);
    });
  }
};

export const removeComponents = (form: NavFormType, isTarget: ComponentFilterFunction) => {
  const formCopy = JSON.parse(JSON.stringify(form));
  removeRecursively(formCopy, isTarget);
  return formCopy;
};

const VEDLEGGSPANEL_KEY = /^vedlegg(panel)?$/;
export const removeVedleggspanel = (form: NavFormType) => {
  const isVedleggspanel = (component: Component) => component.type === "panel" && VEDLEGGSPANEL_KEY.test(component.key);
  return removeComponents(form, isVedleggspanel);
};

export const isSubmissionMethodAllowed = (submissionMethod: string, form: NavFormType): boolean => {
  const { innsending } = form.properties;
  switch (submissionMethod) {
    case "digital":
      return !innsending || innsending === "PAPIR_OG_DIGITAL" || innsending === "KUN_DIGITAL";
    case "paper":
      return !innsending || innsending === "PAPIR_OG_DIGITAL" || innsending === "KUN_PAPIR";
  }
  return false;
};

const navFormUtils = {
  formMatcherPredicate,
  toFormPath,
  findDependentComponents,
  flattenComponents,
  isSubmissionMethodAllowed,
  removeVedleggspanel,
};
export default navFormUtils;
