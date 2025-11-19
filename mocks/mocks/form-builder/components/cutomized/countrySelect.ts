import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface CountrySelectType extends BaseComponentType {
  ignoreNorway?: boolean;
}

const countrySelect = (props?: CountrySelectType) => {
  const { ignoreNorway, label } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent({ ...props, label: label ?? 'Velg land' }),
    ignoreNorway: ignoreNorway ?? false,
  };
};

const staticDefaultValues = {
  type: 'landvelger',
  input: true,
  tableView: false,
  ignoreNorway: false,
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
  keyModified: true,
};

export default countrySelect;
