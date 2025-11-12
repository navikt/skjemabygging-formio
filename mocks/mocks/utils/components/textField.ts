import { validate as createValidate, ValidateType } from './index';
import { generateId, trimAndLowerCase } from './shared/dataUtils';

export interface TextFieldType {
  label?: string;
  key?: string;
  description?: string;
  additionalDescriptionText?: string;
  additionalDescriptionLabel?: string;
  autocomplete?: string;
  spellcheck?: boolean;
  calculateValue?: string;
  validate?: ValidateType;
}

const textField = (params?: TextFieldType) => {
  const {
    label,
    key,
    description,
    additionalDescriptionText,
    additionalDescriptionLabel,
    autocomplete,
    spellcheck,
    calculateValue,
    validate,
  } = params ?? {};

  return {
    ...staticValues,
    id: generateId(),
    navId: generateId(),
    key: key ?? trimAndLowerCase(label),
    label: label ?? 'Text Field',
    description: description ?? '',
    additionalDescriptionLabel: additionalDescriptionLabel ?? '',
    additionalDescriptionText: additionalDescriptionText ?? '',
    autocomplete: autocomplete ?? '',
    spellcheck: spellcheck ?? false,
    calculateValue: calculateValue ?? '',
    validate: validate ?? createValidate(),
  };
};

const staticValues = {
  type: 'textfield',
  input: true,
  mask: false,
  addons: [],
  errors: '',
  hidden: false,
  prefix: '',
  suffix: '',
  unique: false,
  widget: {
    type: 'input',
  },
  dbIndex: false,
  overlay: {
    top: '',
    left: '',
    style: '',
    width: '',
    height: '',
  },
  tooltip: '',
  disabled: false,
  multiple: false,
  readOnly: false,
  redrawOn: '',
  tabindex: '',
  autofocus: false,
  encrypted: false,
  fieldSize: 'input--xxl',
  hideLabel: false,
  inputType: 'text',
  modalEdit: false,
  protected: false,
  refreshOn: '',
  tableView: true,
  attributes: {},
  errorLabel: '',
  persistent: true,
  properties: {},
  validateOn: 'blur',
  clearOnHide: true,
  conditional: {},
  customClass: '',
  inputFormat: 'plain',
  placeholder: '',
  dataGridLabel: false,
  labelPosition: 'top',
  showCharCount: false,
  showWordCount: false,
  calculateServer: false,
  customConditional: '',
  allowMultipleMasks: false,
  customDefaultValue: '',
  allowCalculateOverride: false,
  truncateMultipleSpaces: false,
};

export default textField;
