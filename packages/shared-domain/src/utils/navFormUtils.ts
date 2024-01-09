// @ts-ignore
import FormioUtils from 'formiojs/utils';
import { Attachment, Component, FormsResponseForm, NavFormType, Panel, PrefillData, Submission } from '../form';
import { formSummaryUtil } from '../index';
import { camelCase } from './stringUtils';

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
  return text && text !== '' && paths.some((key) => isKeyInText(key, text));
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
type ComponentIdType = Pick<Component, 'navId' | 'key'>;
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

const findComponentsByProperty = (property: string, form: NavFormType): Component[] => {
  return flattenComponents(form.components).filter((component) => !!component[property]);
};

const prefillForm = (navForm: NavFormType, prefillData: PrefillData) => {
  const formCopy = JSON.parse(JSON.stringify(navForm));

  FormioUtils.eachComponent(formCopy.components, (component: Component) => {
    if (component.prefillKey && !component.defaultValue && prefillData[component.prefillKey]) {
      component.defaultValue = prefillData[component.prefillKey];
    }
  });

  return formCopy;
};

export type DependencyType = 'conditional' | 'validation' | 'calculateValue';
type Dependee = { component: Component; types: DependencyType[] };
export const findDependeeComponents = (componentWithDependencies: Component, form: NavFormType) => {
  const dependees: Dependee[] = [];
  FormioUtils.eachComponent(form.components, (potentialDependee: Component, path: string) => {
    if (potentialDependee.id !== componentWithDependencies.id) {
      const types: DependencyType[] = [];
      if (hasConditionalOn([path], componentWithDependencies)) types.push('conditional');
      if (validatesBasedOn([path], componentWithDependencies)) types.push('validation');
      if (calculatesValueBasedOn([path], componentWithDependencies)) types.push('calculateValue');
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

export const isVedleggspanel = (component: Component) => {
  return !!(component.type === 'panel' && component.isAttachmentPanel);
};

export const removeVedleggspanel = (form: NavFormType) => {
  return removeComponents(form, isVedleggspanel);
};

export const isSubmissionMethodAllowed = (submissionMethod: string, form: NavFormType | FormsResponseForm): boolean => {
  const { innsending } = form.properties;
  switch (submissionMethod) {
    case 'digital':
      return !innsending || innsending === 'PAPIR_OG_DIGITAL' || innsending === 'KUN_DIGITAL';
    case 'paper':
      return !innsending || innsending === 'PAPIR_OG_DIGITAL' || innsending === 'KUN_PAPIR';
  }
  return false;
};

export const enrichComponentsWithNavIds = (
  components: Component[] | undefined,
  navIdGenerator: () => string = FormioUtils.getRandomComponentId,
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

const getActivePanelsFromForm = (form: NavFormType, submission?: Submission, submissionMethod?: string): Panel[] => {
  const conditionals = formSummaryUtil.mapAndEvaluateConditionals(form, submission?.data ?? {});
  return form.components
    .filter((component: Component) => component.type === 'panel')
    .filter((panel): panel is Panel => conditionals[panel.key] !== false)
    .filter((panel) => !(submissionMethod === 'digital' && isVedleggspanel(panel)));
};

const getAttachmentPanel = (form: NavFormType) => {
  return form.components.find((component) => isVedleggspanel(component));
};

const hasAttachment = (form: NavFormType) => {
  const attachmentPanel = getAttachmentPanel(form);
  return !!attachmentPanel?.components?.length;
};

const getAttachmentProperties = (form: NavFormType): Attachment[] => {
  const attachmentPanel = getAttachmentPanel(form);
  if (!attachmentPanel || !attachmentPanel.components) return [];

  const attachments = attachmentPanel.components
    .filter((component) => isAttachment(component))
    .map((component) => ({
      vedleggstittel: component.properties?.vedleggstittel,
      vedleggskode: component.properties?.vedleggskode,
      label: component.label,
    }));

  return attachments;
};

const isAttachment = (comp: Component) => comp.values?.some((v) => v.value === 'leggerVedNaa');

const isDigital = (type: 'innsending' | 'ettersending', form: NavFormType) => {
  // If field is empty, it defaults to PAPIR_OG_DIGITAL
  if (!form.properties[type]) return true;

  return form.properties[type] === 'KUN_DIGITAL' || form.properties[type] === 'PAPIR_OG_DIGITAL';
};

const isPaper = (type: 'innsending' | 'ettersending', form: NavFormType) => {
  // If field is empty, it defaults to PAPIR_OG_DIGITAL
  if (!form.properties[type]) return true;

  return form.properties[type] === 'KUN_PAPIR' || form.properties[type] === 'PAPIR_OG_DIGITAL';
};

const isNone = (type: 'innsending' | 'ettersending', form: NavFormType) => {
  return form.properties[type] === 'INGEN';
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
  findComponentsByProperty,
  enrichComponentsWithNavIds,
  getActivePanelsFromForm,
  getAttachmentPanel,
  hasAttachment,
  getAttachmentProperties,
  isDigital,
  isPaper,
  isAttachment,
  isNone,
  prefillForm,
};
export default navFormUtils;
