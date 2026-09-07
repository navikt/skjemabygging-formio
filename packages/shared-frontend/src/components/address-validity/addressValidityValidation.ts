import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ValidationField } from '../../context/validation/validationTypes';
import { toDatePickerValidation } from '../date/dateValidation';
import { toValidationFields } from '../shared/fieldValidation';

interface AddressValidityValue {
  gyldigFraOgMed?: string;
  gyldigTilOgMed?: string;
}

interface AddressValidityValidationInput {
  statePath: string;
  required?: boolean;
  value?: AddressValidityValue;
}

/** The two date pickers an address validity renders, with the window they accept. */
const toAddressValidityValidationFields = ({
  statePath,
  required,
  value,
}: AddressValidityValidationInput): ValidationField[] => {
  const minDate = dateUtils.addDays(-365);
  const maxDate = dateUtils.addDays(365);
  const validFromPath = `${statePath}.gyldigFraOgMed`;
  const validToPath = `${statePath}.gyldigTilOgMed`;

  return [
    ...toValidationFields(
      validFromPath,
      value?.gyldigFraOgMed,
      toDatePickerValidation({
        statePath: validFromPath,
        label: TEXTS.statiske.address.validFrom,
        required,
        fromDate: minDate,
        toDate: maxDate,
      }),
    ),
    ...toValidationFields(
      validToPath,
      value?.gyldigTilOgMed,
      toDatePickerValidation({
        statePath: validToPath,
        label: TEXTS.statiske.address.validTo,
        required: false,
        fromDate: value?.gyldigFraOgMed || minDate,
        toDate: maxDate,
      }),
    ),
  ];
};

export { toAddressValidityValidationFields };
export type { AddressValidityValidationInput, AddressValidityValue };
