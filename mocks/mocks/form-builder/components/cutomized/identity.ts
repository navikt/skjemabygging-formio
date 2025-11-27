import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface IdentityType extends BaseComponentType {
  prefill?: boolean;
}

const identity = (props?: IdentityType) => {
  const { prefill, label } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent({
      ...props,
      label: label ?? 'Identitet',
      key: 'identitet',
    }),
    prefill: prefill ?? false,
  };
};

const staticDefaultValues = {
  input: true,
  tableView: false,
  type: 'identity',
  prefillKey: 'sokerIdentifikasjonsnummer',
  protectedApiKey: true,
  customLabels: {
    doYouHaveIdentityNumber: 'Har du norsk fødselsnummer eller d-nummer?',
  },
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
  hideLabel: true,
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
  fieldSize: 'input--s',
  spellcheck: false,
  keyModified: true,
};

export default identity;
