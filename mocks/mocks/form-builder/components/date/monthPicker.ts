import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

const monthPicker = (props?: BaseComponentType) => {
  const { label } = props ?? {};

  // Add override for month picker validation values.
  return {
    ...staticDefaultValues,
    ...baseComponent({ ...props, label: label ?? 'Månedsvelger (mm.åååå)' }),
  };
};

const staticDefaultValues = {
  type: 'monthPicker',
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
  fields: {
    day: {
      type: 'number',
      placeholder: '',
      required: false,
    },
    month: {
      type: 'select',
      placeholder: '',
      required: false,
    },
    year: {
      type: 'number',
      placeholder: '',
      required: false,
    },
  },
  dayFirst: false,
  keyModified: true,
};

export default monthPicker;
