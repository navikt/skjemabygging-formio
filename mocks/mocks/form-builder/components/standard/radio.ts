import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface RadioType extends BaseComponentType {
  values?: Array<{
    value: string;
    label: string;
    description?: string;
  }>;
}

const radio = (props: RadioType) => {
  const { values } = props ?? {};

  const defaultValues = [
    { value: 'valg1', label: 'Valg 1' },
    { value: 'valg2', label: 'Valg 2' },
  ];

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    values: values ?? defaultValues,
  };
};

const staticDefaultValues = {
  type: 'radiopanel',
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

export default radio;
