interface ValidateType {
  required?: boolean;
  maxLength?: string;
  minLength?: string;
  digitsOnly?: boolean;
}

const validate = ({ required, maxLength, minLength, digitsOnly }: ValidateType) => {
  return {
    required: required ?? true,
    maxLength: maxLength ?? '',
    minLength: minLength ?? '',
    digitsOnly: digitsOnly ?? false,
    unique: false,
    multiple: false,
    customMessage: '',
    customPrivate: false,
    strictDateValidation: false,
  };
};

export default validate;
export type { ValidateType };
