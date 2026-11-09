import { formatUtils, numberUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { toSubmissionFormat, toSubmissionNumber } from '../../formatting/inputFormat';
import InternalTextField, { InternalTextFieldProps } from '../text-field/InternalTextField';
import { FieldValidationProp } from '../types';
import { NumberType, toNumberFieldValidation } from './numberFieldValidation';

type NumberFieldValidation = Pick<FieldValidationProp, 'min' | 'max' | 'notEqual'>;
interface NumberFieldProps extends Omit<
  InternalTextFieldProps,
  'formatKey' | 'toDisplayValue' | 'toStateValue' | 'validation'
> {
  numberType: NumberType;
  calculatedValue?: boolean;
  validation?: NumberFieldValidation;
}

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
    if (formatted === '') {
      return undefined;
    }

    return toSubmissionNumber(formatted, numberType === 'integer') ?? formatted;
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
export type { NumberFieldProps, NumberFieldValidation };
