import { DataFetcherElement } from '@navikt/skjemadigitalisering-shared-domain';
import { ValidationField } from '../../context/validation/validationTypes';
import { toFieldValidation, toValidationFields } from '../shared/fieldValidation';
import { toSelectedValuesList } from './dataFetcherUtils';

interface DataFetcherValidationInput {
  statePath: string;
  label: string;
  required?: boolean;
  values: DataFetcherElement[];
  value?: unknown;
}

/**
 * The checkbox group a data fetcher renders once the register data has loaded. It stores a map of
 * every element, but is validated on the list of chosen ones, the way the group renders them.
 */
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
