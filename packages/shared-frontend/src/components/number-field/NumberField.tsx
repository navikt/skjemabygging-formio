import { formatUtils, numberUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { toSubmissionFormat } from '../../formatting/inputFormat';
import { FieldValidationInput, toFieldValidation } from '../shared/fieldValidation';
import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';

type NumberFieldValidation = Pick<FieldValidationProp, 'min' | 'max' | 'notEqual'>;
interface NumberFieldProps extends Omit<
  InternalTextFieldProps,
  'formatKey' | 'toDisplayValue' | 'toStateValue' | 'validation'
> {
  numberType: 'integer' | 'decimal';
  calculatedValue?: boolean;
  validation?: NumberFieldValidation;
}

const toNumberFieldValidation = (input: FieldValidationInput, numberType: NumberFieldProps['numberType']) =>
  toFieldValidation(input, { numberType });

const NumberField = ({
  numberType,
  calculatedValue = false,
  validation,
  required = true,
  ...props
}: NumberFieldProps) => {
  const formatKey = numberType === 'integer' ? 'number' : 'decimal';
  const toStateValue = (value: string) => {
    const formatted = toSubmissionFormat(value, formatKey);
    const normalized =
      numberType === 'integer' ? formatted.replace(/\s/g, '') : formatted.replace(/\s/g, '').replace(',', '.');
    if (normalized === '') {
      return undefined;
    }

    const isValid =
      numberType === 'integer' ? numberUtils.isValidInteger(normalized) : numberUtils.isValidDecimal(normalized);
    return isValid ? Number(normalized) : formatted;
  };
  const toDisplayValue = (value: unknown) => {
    if (value === undefined || value === null || value === '') {
      return '';
    }

    if (props.readOnly && calculatedValue) {
      return numberUtils.toLocaleString(
        typeof value === 'number' || typeof value === 'string' ? value : String(value),
        {
          maximumFractionDigits: 2,
        },
      );
    }

    return formatUtils.formatNumber(String(value), numberType === 'integer');
  };

  return (
    <InternalTextField
      {...props}
      required={required}
      formatKey={formatKey}
      toDisplayValue={toDisplayValue}
      toStateValue={toStateValue}
      validation={toNumberFieldValidation({ ...props, required, validation }, numberType).rules}
    />
  );
};

export default NumberField;
export { toNumberFieldValidation };
export type { NumberFieldProps, NumberFieldValidation };
