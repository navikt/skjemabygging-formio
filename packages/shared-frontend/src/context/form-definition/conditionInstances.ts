import {
  checkCondition,
  Component,
  Form,
  navFormioUtils,
  SubmissionMethod,
  submissionTypesUtils,
} from '@navikt/skjemadigitalisering-shared-domain';

type ConditionInstance = NonNullable<Parameters<typeof checkCondition>[4]>;
type EvaluateFunction = NonNullable<ConditionInstance['evaluate']>;

// The same sanitizing evaluate that checkCondition gives the instances it creates itself.
const evaluate: EvaluateFunction = navFormioUtils.evaluate;

const conditionComponentIndexes = new WeakMap<Form, Map<string, ConditionInstance>>();

const indexConditionComponents = (
  components: Component[] | undefined,
  index: Map<string, ConditionInstance>,
  parent?: ConditionInstance,
) => {
  (components ?? []).forEach((component) => {
    const { components: childComponents, ...rest } = component;
    const conditionComponent = { ...rest, parent };

    if (component.navId && !index.has(component.navId)) {
      index.set(component.navId, conditionComponent);
    }
    indexConditionComponents(childComponents, index, conditionComponent);
  });
};

/**
 * Components copied without children and linked to their parents, in the shape checkCondition
 * resolves when it creates an instance itself. The first component in depth-first order wins when
 * navIds repeat, like in checkCondition's own search.
 */
const getConditionComponentIndex = (form: Form): Map<string, ConditionInstance> => {
  let index = conditionComponentIndexes.get(form);
  if (!index) {
    index = new Map();
    indexConditionComponents(form.components, index);
    conditionComponentIndexes.set(form, index);
  }

  return index;
};

const inferSubmissionMethod = (form: Form, submissionMethod?: SubmissionMethod) => {
  if (submissionMethod) {
    return submissionMethod;
  }

  if (form.properties?.submissionTypes?.length === 1) {
    return submissionTypesUtils.asMethod(form.properties.submissionTypes[0]);
  }
};

/**
 * Creates the condition instance checkCondition would otherwise create for the component, but
 * resolves the component by navId through an index cached per form instead of searching the whole
 * form for every conditional. Returns undefined when checkCondition needs no instance or the
 * component has no navId in the form, so checkCondition then creates the instance itself.
 */
const getConditionInstance = (
  component: Component,
  form: Form,
  submissionMethod?: SubmissionMethod,
): ConditionInstance | undefined => {
  const { navId } = component;
  if (!navId || !(component.customConditional || component.conditional?.when)) {
    return undefined;
  }

  const resolvedComponent = getConditionComponentIndex(form).get(navId);
  if (!resolvedComponent) {
    return undefined;
  }

  const resolvedSubmissionMethod = inferSubmissionMethod(form, submissionMethod);
  const instance: ConditionInstance = {
    ...resolvedComponent,
    isSubmissionPaper: () => resolvedSubmissionMethod === 'paper' || !resolvedSubmissionMethod,
    isSubmissionDigital: () => resolvedSubmissionMethod === 'digital',
    isSubmissionNologin: () => resolvedSubmissionMethod === 'digitalnologin',
  };
  instance.evaluate = (func, args, ret, tokenize) => evaluate(func, { component, instance, ...args }, ret, tokenize);

  return instance;
};

export { getConditionInstance };
