import {
  Component,
  navFormioUtils,
  Submission,
  submissionUtils,
  TEXTS,
  validatorUtils,
} from '@navikt/skjemadigitalisering-shared-domain';

interface BaseEvaluationArgs {
  component: Component;
  submission?: Submission;
  submissionPath: string;
  allowTestTypes?: boolean;
}

interface CustomValidationArgs extends BaseEvaluationArgs {
  input: unknown;
}

const resolveRowData = (submissionPath: string, submission?: Submission) => {
  const parentPath = submissionPath.includes('.') ? submissionPath.slice(0, submissionPath.lastIndexOf('.')) : '';
  return parentPath ? (submissionUtils.getSubmissionValue(parentPath, submission) ?? {}) : (submission?.data ?? {});
};

const createEvaluationInstance = ({ allowTestTypes = false }: Pick<BaseEvaluationArgs, 'allowTestTypes'>) => ({
  validateAccountNumber: (input: unknown) => {
    if (input === '' || input === null || input === undefined) {
      return true;
    }

    return validatorUtils.isAccountNumber(String(input)) ? true : TEXTS.validering.accountNumberCustomError;
  },
  validateOrganizationNumber: (input: unknown) => {
    if (input === '' || input === null || input === undefined) {
      return true;
    }

    return validatorUtils.isOrganizationNumber(String(input)) ? true : TEXTS.validering.orgNrCustomError;
  },
  validateFnrNew: (_input: unknown) => true,
  validateDatePicker: () => true,
  validateDatePickerV2: () => true,
  validateIban: (_input: unknown) => true,
  calculateMaalgruppeValue: () => undefined,
  options: {
    appConfig: {
      config: {
        NAIS_CLUSTER_NAME: allowTestTypes ? 'dev-gcp' : 'prod-gcp',
      },
    },
  },
});

const evaluateFormioExpression = ({
  component,
  submission,
  submissionPath,
  allowTestTypes,
  expression,
  returnKey,
  input,
}: BaseEvaluationArgs & {
  expression: string;
  returnKey: 'valid' | 'value';
  input?: unknown;
}) =>
  navFormioUtils.evaluate(
    expression,
    {
      value: undefined,
      input,
      data: submission?.data ?? {},
      row: resolveRowData(submissionPath, submission),
      util: navFormioUtils,
      utils: navFormioUtils,
      component,
      instance: createEvaluationInstance({ allowTestTypes }),
      submission,
    },
    returnKey,
  );

const evaluateFormioCalculatedValue = ({
  component,
  submission,
  submissionPath,
  allowTestTypes,
}: BaseEvaluationArgs) => {
  if (!component.calculateValue) {
    return undefined;
  }

  return evaluateFormioExpression({
    component,
    submission,
    submissionPath,
    allowTestTypes,
    expression: component.calculateValue,
    returnKey: 'value',
  });
};

const evaluateFormioCustomValidation = ({
  component,
  submission,
  submissionPath,
  input,
  allowTestTypes,
}: CustomValidationArgs) => {
  if (!component.validate?.custom) {
    return true;
  }

  return navFormioUtils.evaluate(`var valid = true; ${component.validate.custom}; return valid;`, {
    value: undefined,
    input,
    data: submission?.data ?? {},
    row: resolveRowData(submissionPath, submission),
    util: navFormioUtils,
    utils: navFormioUtils,
    component,
    instance: createEvaluationInstance({ allowTestTypes }),
    submission,
  });
};

export { evaluateFormioCalculatedValue, evaluateFormioCustomValidation };
