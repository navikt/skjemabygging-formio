import { Component, NavFormType, SubmissionMethod } from '../../models';
import { submissionTypesUtils } from '../submission/submissionTypesUtils';
import { ConditionComponent, ConditionData, ConditionInstanceData, ConditionRow, EvaluateFunction } from './types';

const inferSubmissionMethod = (form?: NavFormType, submissionMethod?: SubmissionMethod) => {
  if (submissionMethod) {
    return submissionMethod;
  }

  if (form?.properties?.submissionTypes?.length === 1) {
    return submissionTypesUtils.asMethod(form.properties.submissionTypes[0]);
  }
};

const isSameComponent = (target: Partial<Component>, candidate: Partial<Component>) => {
  if (target.navId && candidate.navId) {
    return target.navId === candidate.navId;
  }

  if (target.id && candidate.id) {
    return target.id === candidate.id;
  }

  return target.key === candidate.key && target.type === candidate.type;
};

const toConditionComponent = (component: Component, parent?: ConditionComponent): ConditionComponent => {
  const { components: _components, ...rest } = component;

  return {
    ...rest,
    parent,
  };
};

const findComponentWithParents = (
  components: Component[] | undefined,
  target: Partial<Component>,
  parent?: ConditionComponent,
): ConditionComponent | undefined => {
  for (const component of components ?? []) {
    const candidate = toConditionComponent(component, parent);

    if (isSameComponent(target, component)) {
      return candidate;
    }

    const match = findComponentWithParents(component.components, target, candidate);
    if (match) {
      return match;
    }
  }

  return undefined;
};

const createConditionInstance = (
  component: Partial<Component>,
  form: NavFormType | undefined,
  evaluate: EvaluateFunction,
  submissionMethod?: SubmissionMethod,
): ConditionComponent => {
  const resolvedComponent = findComponentWithParents(form?.components, component) ?? { ...component };
  const resolvedSubmissionMethod = inferSubmissionMethod(form, submissionMethod);
  const conditionInstance: ConditionComponent = {
    ...resolvedComponent,
    isSubmissionPaper: () => resolvedSubmissionMethod === 'paper' || !resolvedSubmissionMethod,
    isSubmissionDigital: () => resolvedSubmissionMethod === 'digital',
    isSubmissionNologin: () => resolvedSubmissionMethod === 'digitalnologin',
  };

  conditionInstance.evaluate = (func, args, ret, tokenize) => {
    return evaluate(func, { component, instance: conditionInstance, ...args }, ret, tokenize);
  };

  return conditionInstance;
};

const shouldCreateSyntheticInstance = (component: Partial<Component>, instance?: ConditionComponent) => {
  if (instance) {
    return false;
  }

  return Boolean(component.customConditional || component.conditional?.when);
};

const isNil = (value: ConditionData | ConditionRow | ConditionInstanceData | undefined) => value == null;

const getEffectiveRowContext = (row: ConditionRow, data: ConditionData | undefined, instance?: ConditionComponent) => {
  if (!isNil(row) && !Array.isArray(row)) {
    return row;
  }

  if (!isNil(instance?.data)) {
    return instance?.data;
  }

  return data;
};

export { createConditionInstance, getEffectiveRowContext, shouldCreateSyntheticInstance };
