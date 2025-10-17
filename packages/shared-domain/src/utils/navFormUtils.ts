import { v4 as uuidv4 } from 'uuid';
import { Attachment, Component, FormsResponseForm, NavFormType, Panel, Submission, SubmissionMethod } from '../form';
import { Form, formSummaryUtil, submissionTypesUtils } from '../index';
import FormioUtils from '../utils/formio/FormioUtils';
import { camelCase } from './stringUtils';

export const toFormPath = (text: string) => camelCase(text).toLowerCase();

export const formMatcherPredicate = (pathFromUrl: string) => (form: NavFormType) => {
  return (
    form.path === pathFromUrl ||
    toFormPath(form.title) === pathFromUrl ||
    toFormPath(form.properties.skjemanummer) === pathFromUrl
  );
};

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

const deepSortByKeys = (obj?: object) => {
  if (!obj) return obj;
  return Object.fromEntries(
    Object.entries(obj)
      .map(([key, value]) => (typeof value === 'object' ? [key, deepSortByKeys(value)] : [key, value]))
      .sort((a, b) => a[0].localeCompare(b[0])),
  );
};

export const isEqual = (formA?: NavFormType, formB?: NavFormType, skipProperties: string[] = []) => {
  const replacer = (key: string, value: unknown) => (skipProperties.includes(key) ? undefined : value);
  return JSON.stringify(deepSortByKeys(formA), replacer) === JSON.stringify(deepSortByKeys(formB), replacer);
};

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

const findComponentsByProperty = (property: string, form: NavFormType): Component[] => {
  return flattenComponents(form.components).filter((component) => !!component[property]);
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

const getComponentBranch = (targetComponentId: string) => {
  const depthFirstSearch = (currentComponent: Component, branch: Component[]) => {
    if (currentComponent.type !== 'form') {
      branch.push(currentComponent);
    }
    if (currentComponent.id === targetComponentId) {
      return branch;
    }
    if (currentComponent.components?.length) {
      for (const childComponent of currentComponent.components) {
        const result = depthFirstSearch(childComponent, [...branch]);
        if (result) {
          return result;
        }
      }
    }
    return null;
  };
  return depthFirstSearch;
};

function findClosest(type: string, id: string, form: NavFormType) {
  const componentBranch: Component[] = getComponentBranch(id)(form as unknown as Component, []);
  let closest: Component | undefined = undefined;
  for (let i = componentBranch.length - 2; i >= 0; i--) {
    if (componentBranch[i].type === type) {
      closest = componentBranch[i];
      break;
    }
  }
  return closest;
}

export const findDependentComponents = (id: string, form: NavFormType, evaluateClosestDatagrid: boolean = true) => {
  const idToPathMapping: { [s: string]: string } = {};
  FormioUtils.eachComponent(form.components, (component: Component, path: string) => {
    idToPathMapping[component.id!] = path;
  });

  const component = findById(id, form.components);
  if (component) {
    let dependentComponentsInsideDatagrid: DependentKeysType[] = [];
    if (evaluateClosestDatagrid) {
      const closestDatagrid = findClosest('datagrid', id, form);
      if (closestDatagrid?.components?.length) {
        dependentComponentsInsideDatagrid = findDependentComponents(
          id,
          closestDatagrid as unknown as NavFormType,
          false,
        );
      }
    }
    const downstreamPaths = flattenComponents([component]).map((comp) => idToPathMapping[comp.id!]);
    const dependentComponentsInForm = recursivelyFindDependentComponents(id, downstreamPaths, form.components);
    return [...dependentComponentsInForm, ...dependentComponentsInsideDatagrid];
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

export const isSubmissionMethodAllowed = (
  submissionMethod: SubmissionMethod,
  form: NavFormType | FormsResponseForm,
): boolean => {
  const { submissionTypes } = form.properties;
  if (!submissionMethod && submissionTypes.length === 0) {
    return true;
  }

  switch (submissionMethod) {
    case 'digital':
      return submissionTypesUtils.isDigitalSubmission(submissionTypes);
    case 'paper':
      return submissionTypesUtils.isPaperSubmission(submissionTypes);
    case 'digitalnologin':
      return submissionTypesUtils.isDigitalNoLoginSubmission(submissionTypes);
  }
  return false;
};

export const enrichComponentsWithNavIdsRecursive = (
  components?: Component[],
  navIdGenerator: () => string = FormioUtils.getRandomComponentId,
  foundNavids: string[] = [],
): [Component[] | undefined, string[]] => {
  if (!components) {
    return [undefined, foundNavids];
  }

  let enrichedComponents: Component[] = [];
  let updatedFoundNavIds = [...foundNavids];

  for (const component of components) {
    const subComponents = component.components;
    // if component has no navId, or navId is already used by a different component, generate a new one
    if (!component.navId || updatedFoundNavIds.includes(component.navId)) {
      const [enrichedSubComponents, updatedNavIds] = enrichComponentsWithNavIdsRecursive(
        subComponents,
        navIdGenerator,
        updatedFoundNavIds,
      );

      updatedFoundNavIds = updatedNavIds;
      enrichedComponents = [
        ...enrichedComponents,
        {
          ...component,
          navId: navIdGenerator(),
          ...(enrichedSubComponents && {
            components: enrichedSubComponents,
          }),
        },
      ];
    } else {
      const [enrichedSubComponents, updatedNavIds] = enrichComponentsWithNavIdsRecursive(
        subComponents,
        navIdGenerator,
        [...updatedFoundNavIds, component.navId],
      );

      updatedFoundNavIds = updatedNavIds;
      enrichedComponents = [
        ...enrichedComponents,
        {
          ...component,
          ...(enrichedSubComponents && {
            components: enrichedSubComponents,
          }),
        },
      ];
    }
  }
  return [enrichedComponents, updatedFoundNavIds];
};

export const enrichComponentsWithNavIds = (
  components: Component[],
  navIdGenerator: () => string = FormioUtils.getRandomComponentId,
): Component[] | undefined => {
  const [enrichedComponents] = enrichComponentsWithNavIdsRecursive(components, navIdGenerator, []);
  return enrichedComponents;
};

const getActivePanelsFromForm = (form: NavFormType, submission?: Submission, submissionMethod?: string): Panel[] => {
  const conditionals = formSummaryUtil.mapAndEvaluateConditionals(form, submission ?? { data: {} });
  return form.components
    .filter((component: Component) => component.type === 'panel')
    .filter((panel): panel is Panel => {
      const key = formSummaryUtil.createComponentKeyWithNavId(panel);
      return conditionals[key] !== false;
    })
    .filter(
      (panel) => !((submissionMethod === 'digital' || submissionMethod === 'digitalnologin') && isVedleggspanel(panel)),
    );
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

  return attachmentPanel.components
    .filter((component) => isAttachment(component))
    .map((component) => ({
      vedleggstittel: component.properties?.vedleggstittel,
      vedleggskode: component.properties?.vedleggskode,
      label: component.label,
    }));
};

// TODO: Remove check on leggerVedNaa when all attachment components are migrated to type attachment
const isAttachment = (comp: Component) =>
  comp.type === 'attachment' || comp.values?.some((v) => v.value === 'leggerVedNaa');

const createDefaultForm = (config): Form => ({
  title: '',
  skjemanummer: '',
  path: '',
  properties: {
    skjemanummer: '',
    tema: '',
    submissionTypes: ['PAPER', 'DIGITAL'],
    subsequentSubmissionTypes: ['PAPER', 'DIGITAL'],
    signatures: [{ label: '', description: '', key: uuidv4() }],
    ettersendelsesfrist: '14',
    mellomlagringDurationDays: (config?.mellomlagringDurationDays as string) ?? '28',
  },
  components: [],
});

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
  findComponentsByProperty,
  enrichComponentsWithNavIds,
  getActivePanelsFromForm,
  getAttachmentPanel,
  hasAttachment,
  getAttachmentProperties,
  isAttachment,
  isEqual,
  createDefaultForm,
};
export default navFormUtils;
