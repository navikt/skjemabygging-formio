import { Validate, ValidateType } from './index';
import { generateId, trimAndLowerCase } from './utils/dataUtils';

interface TextFieldType {
  label: string;
  key?: string;
  description?: string;
  additionalDescriptionText?: string;
  additionalDescriptionLabel?: string;
  autocomplete?: string;
  spellcheck?: boolean;
  calculateValue?: string;
  validate?: Partial<ValidateType>;
}

const textField = ({
  label,
  key,
  description,
  additionalDescriptionText,
  additionalDescriptionLabel,
  autocomplete,
  spellcheck,
  calculateValue,
  validate,
}: TextFieldType) => {
  return {
    id: generateId(),
    navId: generateId(),
    key: key ?? trimAndLowerCase(label),
    type: 'textfield',
    label,
    description,
    additionalDescriptionText,
    additionalDescriptionLabel,
    autocomplete,
    spellcheck,
    calculateValue,
    validate: validate ?? Validate({}),
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
};

export default textField;
export type { TextFieldType };
