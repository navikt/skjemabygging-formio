import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

export interface SelectBoxesType extends BaseComponentType {
  values: {
    label: string;
    value: string;
  }[];
}

const selectBoxes = (props: SelectBoxesType) => {
  const { values } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    values,
  };
};

const staticDefaultValues = {
  type: 'selectboxes',
  input: true,
  tableView: false,
  validateOn: 'blur',
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
  dataSrc: 'values',
  authenticate: false,
  ignoreCache: false,
  template: '<span>{{ item.label }}</span>',
  inputType: 'radio',
  data: {
    url: '',
  },
  fieldSet: false,
  inline: false,
  keyModified: true,
};

export default selectBoxes;
