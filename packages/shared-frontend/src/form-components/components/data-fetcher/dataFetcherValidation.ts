import { DataFetcherElement } from '@navikt/skjemadigitalisering-shared-domain';
import { toFieldValidation, toValidationFields } from '../../../components/shared/fieldValidation';
import { ValidationField } from '../../../context/validation/validationTypes';
import { toSelectedValuesList } from '../../shared/selectedValuesUtils';

interface DataFetcherValidationInput {
  statePath: string;
  label: string;
  required?: boolean;
  values: DataFetcherElement[];
  value?: unknown;
}

const toDataFetcherValidationFields = ({
  statePath,
  label,
  required = false,
  values,
  value,
}: DataFetcherValidationInput): ValidationField[] =>
  values.length > 0
    ? toValidationFields(statePath, toSelectedValuesList(value), toFieldValidation({ statePath, label, required }))
    : [];

export { toDataFetcherValidationFields };
export type { DataFetcherValidationInput };
