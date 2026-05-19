import { Component, NavFormType, Submission, SubmissionData, SubmissionMethod } from '../../models';

type ConditionPrimitive = string | number | boolean | null | undefined;

interface ConditionObject {
  [key: string]: ConditionInput;
}

type ConditionList = Array<ConditionInput>;

type ConditionInput = ConditionPrimitive | ConditionObject | ConditionList | object;
type ConditionData = SubmissionData | ConditionObject;
type ConditionRow = ConditionObject | ConditionInput[] | object | undefined;
type ConditionResult = ConditionInput | null | undefined;
type ConditionInstanceData = ConditionData | ConditionRow | Component['data'];

interface ConditionLibrary {
  get: (obj: ConditionData | ConditionRow, path: string, defaultValue?: ConditionInput) => ConditionInput | undefined;
  some: <T>(collection: T[] | Record<string, T> | null | undefined, predicate: (item: T) => boolean) => boolean;
  every: <T>(collection: T[] | Record<string, T> | null | undefined, predicate: (item: T) => boolean) => boolean;
}

type ConditionUtils = Record<string, object | string | number | boolean | null | undefined>;

type ConditionEvaluationValue =
  | ConditionInput
  | ConditionUtils
  | ConditionLibrary
  | Submission
  | Partial<Component>
  | ConditionComponent
  | NavFormType
  | undefined;

interface ConditionEvaluationArgs {
  [key: string]: ConditionEvaluationValue;
  row: ConditionData | ConditionRow;
  data: ConditionData | undefined;
  form?: NavFormType;
  component?: Partial<Component>;
  instance?: ConditionComponent;
  utils: ConditionUtils;
  submission?: Submission;
  _: ConditionLibrary;
}

type EvaluateFunction = (
  func: string,
  args: ConditionEvaluationArgs,
  ret?: string,
  tokenize?: boolean,
) => ConditionResult;

type OriginalCheckCondition = (
  component: Partial<Component>,
  row: ConditionRow,
  data: ConditionData | undefined,
  form?: NavFormType,
  instance?: ConditionComponent,
) => boolean;

type ConditionComponent = Partial<Component> & {
  data?: ConditionInstanceData;
  parent?: ConditionComponent;
  evaluate?: EvaluateFunction;
  isSubmissionPaper?: () => boolean;
  isSubmissionDigital?: () => boolean;
  isSubmissionNologin?: () => boolean;
};

interface CheckConditionOptions {
  submissionMethod?: SubmissionMethod;
}

export type {
  CheckConditionOptions,
  ConditionComponent,
  ConditionData,
  ConditionEvaluationArgs,
  ConditionInput,
  ConditionInstanceData,
  ConditionLibrary,
  ConditionObject,
  ConditionResult,
  ConditionRow,
  ConditionUtils,
  EvaluateFunction,
  OriginalCheckCondition,
};
