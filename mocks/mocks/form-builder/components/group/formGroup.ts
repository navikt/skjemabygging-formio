import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface FormGroupType extends BaseComponentType {
  yourInformation?: boolean;
  components: any[];
  backgroundColor?: boolean;
}

const formGroup = (props: FormGroupType) => {
  const { components, label, backgroundColor } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    components,
    legend: label,
    backgroundColor: backgroundColor ?? true,
  };
};

const staticDefaultValues = {
  type: 'navSkjemagruppe',
  input: false,
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
  persistent: false,
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
  tree: false,
  lazyLoad: false,
  keyModified: true,
};

export default formGroup;
