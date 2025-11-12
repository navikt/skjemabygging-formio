import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

export interface TextAreaType extends BaseComponentType {
  autoExpand?: boolean;
}

const textArea = (props: TextAreaType) => {
  const { autoExpand } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    autoExpand: autoExpand ?? true,
  };
};

const staticDefaultValues = {
  type: 'textarea',
  input: true,
  tableView: false,
  spellcheck: true,
  placeholder: '',
  prefix: '',
  customClass: '',
  suffix: '',
  multiple: false,
  defaultValue: null,
  protected: false,
  unique: false,
  persistent: true,
  hidden: false,
  clearOnHide: true,
  refreshOn: '',
  redrawOn: '',
  modalEdit: false,
  dataGridLabel: false,
  labelPosition: 'top',
  errorLabel: '',
  tooltip: '',
  hideLabel: false,
  tabindex: '',
  disabled: false,
  autofocus: false,
  dbIndex: false,
  customDefaultValue: '',
  calculateValue: '',
  calculateServer: false,
  widget: null,
  attributes: {},
  validateOn: 'blur',
  overlay: {
    style: '',
    left: '',
    top: '',
    width: '',
    height: '',
  },
  allowCalculateOverride: false,
  encrypted: false,
  showCharCount: false,
  showWordCount: false,
  properties: {},
  allowMultipleMasks: false,
  addons: [],
  fieldSize: 'input--xxl',
  autoExpand: true,
  editor: '',
  keyModified: true,
};

export default textArea;
