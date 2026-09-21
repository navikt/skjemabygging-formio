import { numberUtils, Submission, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentDefinition } from '../../form-components/component-types';
import { evaluateCalculatedValue } from '../../utils/expressionEvaluation';
import { createUpdatedSubmission } from '../state/SubmissionStateContext';
import { isSameSubmissionValue } from '../state/stateHelpers';
import { collectInputSubmissionPathsInCurrentScope, DataGridRowScope } from './dataGridRows';

interface CalculationTarget {
  component: ComponentDefinition;
  submissionPath: string;
}

interface CalculationArgs {
  submission: Submission | undefined;
  formComponents: ComponentDefinition[];
  dataGridRowScopes: DataGridRowScope[];
  onNonConvergence?: (targets: CalculationTarget[]) => void;
}

const isNumericComponent = (component: ComponentDefinition) =>
  component.type === 'number' || component.type === 'currency' || component.type === 'year';

const isCalculatedComponent = (component: ComponentDefinition) =>
  !!component.calculateValue && component.type !== 'maalgruppe';

/**
 * Numeric answers are kept as raw text while the user is typing, so they must be converted back to
 * numbers before a calculation expression reads them.
 */
const toEvaluationNumber = (component: ComponentDefinition, value: unknown) => {
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

const collectTargets = (
  components: ComponentDefinition[],
  predicate: (component: ComponentDefinition) => boolean,
): CalculationTarget[] =>
  collectInputSubmissionPathsInCurrentScope(components).filter(({ component }) => predicate(component));

/**
 * Calculated components, expanded per data grid row so every row is calculated with its own indexed
 * submission path. `formComponents` and `scope.activeComponents` must both be the *active* (visible)
 * components only: hidden values are removed again by the clear-on-hide handling, so calculating
 * them here would ping-pong against that effect and never settle.
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
  ...dataGridRowScopes.flatMap((scope) => collectTargets(scope.activeComponents, isNumericComponent)),
];

/**
 * Applies calculated values until they settle. Data grid children are evaluated once per stored
 * row with their indexed submission path, which also gives the expression the correct `row`
 * context.
 */
const applyCalculatedValues = ({
  submission,
  formComponents,
  dataGridRowScopes,
  onNonConvergence,
}: CalculationArgs): Submission | undefined => {
  const calculationTargets = collectCalculationTargets({ formComponents, dataGridRowScopes });
  if (calculationTargets.length === 0) {
    return submission;
  }

  const numericTargets = collectNumericTargets({ formComponents, dataGridRowScopes });
  const initialSubmission = submission ?? { data: {} };
  let nextSubmission = initialSubmission;
  let evaluationSubmission = numericTargets.reduce((currentSubmission, numericTarget) => {
    const rawValue = submissionUtils.getSubmissionValue(numericTarget.submissionPath, currentSubmission);
    const evaluationValue = toEvaluationNumber(numericTarget.component, rawValue);

    return Object.is(rawValue, evaluationValue)
      ? currentSubmission
      : createUpdatedSubmission(currentSubmission, numericTarget.submissionPath, evaluationValue);
  }, initialSubmission);
  const maximumPasses = calculationTargets.length + 1;

  for (let pass = 0; pass < maximumPasses; pass += 1) {
    let changed = false;

    calculationTargets.forEach(({ component, submissionPath }) => {
      const calculatedValue = evaluateCalculatedValue({
        component,
        submission: evaluationSubmission,
        submissionPath,
      });
      const normalizedCalculatedValue = calculatedValue === '' ? undefined : calculatedValue;
      const currentValue = submissionUtils.getSubmissionValue(submissionPath, nextSubmission);

      if (!isSameSubmissionValue(currentValue, normalizedCalculatedValue)) {
        nextSubmission = createUpdatedSubmission(nextSubmission, submissionPath, normalizedCalculatedValue);
        evaluationSubmission = createUpdatedSubmission(
          evaluationSubmission,
          submissionPath,
          toEvaluationNumber(component, normalizedCalculatedValue),
        );
        changed = true;
      }
    });

    if (!changed) {
      return nextSubmission === initialSubmission ? submission : nextSubmission;
    }
  }

  onNonConvergence?.(calculationTargets);
  return submission;
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
