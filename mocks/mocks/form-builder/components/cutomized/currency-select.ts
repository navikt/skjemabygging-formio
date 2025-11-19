import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface CurrencySelectType extends BaseComponentType {
  defaultValue?: string;
}

const currencySelect = (props?: CurrencySelectType) => {
  const { defaultValue, label } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent({ ...props, label: label ?? 'Velg valuta' }),
    defaultValue: defaultValue ?? '',
  };
};

const staticDefaultValues = {
  type: 'valutavelger',
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
  description: '',
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
  fieldSize: 'input--m',
  dataSrc: 'url',
  data: {
    url: 'https://www.nav.no/fyllut/api/common-codes/currencies?lang=nb',
  },
  disableLimit: true,
  keyModified: true,
};

export default currencySelect;
