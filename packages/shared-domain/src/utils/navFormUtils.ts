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
  // @ts-ignore
  return components.reduce((flattenedComponents, currentComponent) => {
    return [
      ...flattenedComponents,
      currentComponent,
      ...(currentComponent.components ? flattenComponents(currentComponent.components) : []),
    ];
  }, []);
}

function isKeyInText(key: string, text: string) {
  return text && text.search(`\\w+\\.${key}\\b`) > -1;
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
const findByKey = (key: string, components: Component[]): Component | undefined =>
  findComponent((c) => c.key === key, components);
const findByNavId = (navId: string, components: Component[]): Component | undefined =>
  findComponent((c) => c.navId === navId, components);
type ComponentIdType = Pick<Component, "navId" | "key">;
const findByNavIdOrKey = (ids: ComponentIdType, components: Component[]): Component | undefined => {
  let comp;
  if (ids.navId) {
    comp = findByNavId(ids.navId, components);
  }
  if (!comp) {
    comp = findByKey(ids.key, components);
  }
  return comp;
};

type DependencyType = "conditional" | "validation" | "calculateValue";
type Dependee = { component: Component; types: DependencyType[] };
export const findDependeeComponents = (componentWithDependencies: Component, form: NavFormType) => {
  const dependees: Dependee[] = [];
  FormioUtils.eachComponent(form.components, (potentialDependee: Component, path: string) => {
    if (potentialDependee.id !== componentWithDependencies.id) {
      const types: DependencyType[] = [];
      if (hasConditionalOn([path], componentWithDependencies)) types.push("conditional");
      if (validatesBasedOn([path], componentWithDependencies)) types.push("validation");
      if (calculatesValueBasedOn([path], componentWithDependencies)) types.push("calculateValue");
      if (types.length > 0) {
        dependees.push({ component: potentialDependee, types });
      }
    }
  });
  return dependees;
};

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

export const isVedleggspanel = (component: Component) =>
  !!(component.type === "panel" && (component.isAttachmentPanel || /^vedlegg(panel)?$/.test(component.key)));

export const removeVedleggspanel = (form: NavFormType) => {
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

export const enrichComponentsWithNavIds = (
  components: Component[] | undefined,
  navIdGenerator: () => string = FormioUtils.getRandomComponentId
): Component[] | undefined => {
  if (components) {
    return components.map((component) => {
      const subComponents = component.components;
      if (!component.navId) {
        return {
          ...component,
          navId: navIdGenerator(),
          ...(subComponents && { components: enrichComponentsWithNavIds(subComponents, navIdGenerator) }),
        };
      }
      return {
        ...component,
        ...(subComponents && { components: enrichComponentsWithNavIds(subComponents, navIdGenerator) }),
      };
    });
  }
  return components;
};

const navFormUtils = {
  formMatcherPredicate,
  toFormPath,
  findDependentComponents,
  findDependeeComponents,
  flattenComponents,
  isSubmissionMethodAllowed,
  isVedleggspanel,
  removeVedleggspanel,
  findByKey,
  findByNavId,
  findByNavIdOrKey,
  enrichComponentsWithNavIds,
};
export default navFormUtils;
