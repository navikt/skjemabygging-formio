export interface ValidateType {
  required?: boolean;
  maxLength?: string;
  minLength?: string;
  digitsOnly?: boolean;
}

const validate = (params?: ValidateType) => {
  const { required, maxLength, minLength, digitsOnly } = params ?? {};

  return {
    ...staticValues,
    required: required ?? true,
    maxLength: maxLength ?? '',
    minLength: minLength ?? '',
    digitsOnly: digitsOnly ?? false,
  };
};

const staticValues = {
  unique: false,
  multiple: false,
  customMessage: '',
  customPrivate: false,
  strictDateValidation: false,
};

export default validate;
