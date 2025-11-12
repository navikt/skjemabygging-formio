export interface ValidateType {
  required?: boolean;
  maxLength?: string;
  minLength?: string;
  digitsOnly?: boolean;
}

const validate = (params?: ValidateType) => {
  const { required, maxLength, minLength, digitsOnly } = params ?? {};

  return {
    ...staticDefaultValues,
    required: required ?? true,
    maxLength: maxLength ?? '',
    minLength: minLength ?? '',
    digitsOnly: digitsOnly ?? false,
  };
};

const staticDefaultValues = {
  unique: false,
  multiple: false,
  customMessage: '',
  customPrivate: false,
  strictDateValidation: false,
};

export default validate;
