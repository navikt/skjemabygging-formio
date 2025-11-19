export interface ValidateComponentType {
  required?: boolean;
  maxLength?: string;
  minLength?: string;
  digitsOnly?: boolean;
  custom?: string;
}

const validateComponent = (props?: ValidateComponentType) => {
  const { required, maxLength, minLength, digitsOnly, custom } = props ?? {};

  return {
    ...staticDefaultValues,
    required: required ?? true,
    maxLength: maxLength ?? '',
    minLength: minLength ?? '',
    digitsOnly: digitsOnly ?? false,
    custom: custom ?? '',
  };
};

const staticDefaultValues = {
  unique: false,
  multiple: false,
  customMessage: '',
  customPrivate: false,
  strictDateValidation: false,
};

export default validateComponent;
