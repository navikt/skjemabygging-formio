import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface NavSelectType extends BaseComponentType {
  values: {
    label: string;
    value: string;
  }[];
}

const navSelect = (props: NavSelectType) => {
  const { values } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    data: {
      values,
    },
  };
};

const staticDefaultValues = {
  type: 'navSelect',
  input: true,
  tableView: false,
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
  dataSrc: 'values',
  keyModified: true,
};

export default navSelect;
