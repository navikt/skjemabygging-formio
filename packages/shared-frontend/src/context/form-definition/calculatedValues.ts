import { Component, numberUtils, Submission, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { collectInputSubmissionPaths, DataGridRowScope } from '../../form-components/components/data-grid/dataGridRows';
import { evaluateFormioCalculatedValue } from '../../utils/formioEvaluation';
import { createUpdatedSubmission } from '../state/SubmissionStateContext';

interface CalculationTarget {
  component: Component;
  submissionPath: string;
}

interface CalculationArgs {
  submission: Submission | undefined;
  formComponents: Component[];
  dataGridRowScopes: DataGridRowScope[];
}

const isNumericComponent = (component: Component) =>
  component.type === 'number' || component.type === 'currency' || component.type === 'year';

const isCalculatedComponent = (component: Component) => !!component.calculateValue && component.type !== 'maalgruppe';

/**
 * Numeric answers are kept as raw text while the user is typing, so they must be converted back to
 * numbers before a calculation expression reads them.
 */
const toEvaluationNumber = (component: Component, value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue =
    component.inputType === 'numeric' || component.type === 'year'
      ? value.replace(/\s/g, '')
      : value.replace(/\s/g, '').replace(',', '.');

  if (normalizedValue === '') {
    return value;
  }

  const isValidNumber =
    component.inputType === 'numeric' || component.type === 'year'
      ? numberUtils.isValidInteger(normalizedValue)
      : numberUtils.isValidDecimal(normalizedValue);

  return isValidNumber ? Number(normalizedValue) : value;
};

const collectTargets = (components: Component[], predicate: (component: Component) => boolean): CalculationTarget[] =>
  collectInputSubmissionPaths(components).filter(({ component }) => predicate(component));

/**
 * Calculated components, expanded per data grid row so every row is calculated with its own indexed
 * submission path. Only visible row components are included, because hidden values are removed
 * again by the clear-on-hide handling.
 */
const collectCalculationTargets = ({
  formComponents,
  dataGridRowScopes,
}: Omit<CalculationArgs, 'submission'>): CalculationTarget[] => [
  ...collectTargets(formComponents, isCalculatedComponent),
  ...dataGridRowScopes.flatMap((scope) => collectTargets(scope.activeComponents, isCalculatedComponent)),
];

const collectNumericTargets = ({
  formComponents,
  dataGridRowScopes,
}: Omit<CalculationArgs, 'submission'>): CalculationTarget[] => [
  ...collectTargets(formComponents, isNumericComponent),
  ...dataGridRowScopes.flatMap((scope) => collectTargets(scope.components, isNumericComponent)),
];

/**
 * Applies every calculated value to the submission. Data grid children are evaluated once per
 * stored row with their indexed submission path, which also gives the expression the correct `row`
 * context.
 */
const applyCalculatedValues = ({
  submission,
  formComponents,
  dataGridRowScopes,
}: CalculationArgs): Submission | undefined => {
  const calculationTargets = collectCalculationTargets({ formComponents, dataGridRowScopes });
  if (calculationTargets.length === 0) {
    return submission;
  }

  const numericTargets = collectNumericTargets({ formComponents, dataGridRowScopes });
  const initialSubmission = submission ?? { data: {} };
  let nextSubmission = initialSubmission;

  calculationTargets.forEach(({ component, submissionPath }) => {
    const evaluationSubmission = numericTargets.reduce((acc, numericTarget) => {
      const rawValue = submissionUtils.getSubmissionValue(numericTarget.submissionPath, acc);
      const evaluationValue = toEvaluationNumber(numericTarget.component, rawValue);

      return rawValue === evaluationValue
        ? acc
        : createUpdatedSubmission(acc, numericTarget.submissionPath, evaluationValue);
    }, nextSubmission);

    const calculatedValue = evaluateFormioCalculatedValue({
      component,
      submission: evaluationSubmission,
      submissionPath,
    });
    const normalizedCalculatedValue = calculatedValue === '' ? undefined : calculatedValue;
    const currentValue = submissionUtils.getSubmissionValue(submissionPath, nextSubmission);

    if (currentValue !== normalizedCalculatedValue) {
      nextSubmission = createUpdatedSubmission(nextSubmission, submissionPath, normalizedCalculatedValue);
    }
  });

  return nextSubmission === initialSubmission ? submission : nextSubmission;
};

export {
  applyCalculatedValues,
  collectCalculationTargets,
  collectNumericTargets,
  isCalculatedComponent,
  isNumericComponent,
  toEvaluationNumber,
};
export type { CalculationTarget };
