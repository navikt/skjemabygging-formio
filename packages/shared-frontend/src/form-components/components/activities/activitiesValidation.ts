import { SubmissionMethod, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { toFieldValidation, toValidationFields } from '../../../components/shared/fieldValidation';
import { ValidationField } from '../../../context/validation/validationTypes';

interface ActivitiesValidationInput {
  statePath: string;
  label?: string;
  value?: unknown;
  submissionMethod?: SubmissionMethod;
}

/** Activities are only rendered - and only required - in the digital flow. */
const toActivitiesValidationFields = ({
  statePath,
  label,
  value,
  submissionMethod,
}: ActivitiesValidationInput): ValidationField[] =>
  submissionMethod === 'digital'
    ? toValidationFields(
        statePath,
        value,
        toFieldValidation({ statePath, label: label ?? TEXTS.statiske.activities.label, required: true }),
      )
    : [];

export { toActivitiesValidationFields };
export type { ActivitiesValidationInput };
