import type { Component, NavFormType, Submission } from '../../../models';
import getCustomUtils from '../../formio/utilsCustom';
import getCheckConditionUtils from '../checkCondition';
import type { ConditionComponent, EvaluateFunction } from '../types';

const getValue = (obj: Record<string, unknown>, key: string) => {
  const data = (obj as { data?: Record<string, unknown> }).data ?? obj;

  return data[key];
};

const Utils = { getValue, ...getCustomUtils({ getValue }) };

const evaluate: EvaluateFunction = (func, args) => {
  const fn = new Function(...Object.keys(args), func);

  return fn(...Object.values(args));
};

const { checkCondition } = getCheckConditionUtils(Utils, evaluate, () => true);

const createComponent = (overrides: Partial<Component>): Component =>
  ({
    key: 'field',
    label: 'Field',
    type: 'textfield',
    input: true,
    ...overrides,
  }) as Component;

const createForm = (components: Component[], submissionTypes: string[] = ['DIGITAL']) =>
  ({
    components,
    properties: {
      skjemanummer: 'TEST',
      tema: 'TES',
      submissionTypes,
      subsequentSubmissionTypes: [],
    },
  }) as unknown as NavFormType;

const createSubmission = (data: Submission['data'], metadata?: Submission['metadata']) =>
  ({
    data,
    ...(metadata ? { metadata } : {}),
  }) as Submission;

const createParentInstance = (overrides: Partial<Component>, parent?: ConditionComponent): ConditionComponent =>
  ({
    ...createComponent(overrides),
    parent,
  }) as unknown as ConditionComponent;

const createConditionInstance = (
  component: Partial<Component>,
  data: Record<string, unknown>,
  parent?: ConditionComponent,
): ConditionComponent =>
  ({
    ...component,
    data,
    parent,
  }) as unknown as ConditionComponent;

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

export {
  checkCondition,
  clone,
  createComponent,
  createConditionInstance,
  createForm,
  createParentInstance,
  createSubmission,
};
