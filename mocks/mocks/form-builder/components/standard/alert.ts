import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface AlertType extends Omit<BaseComponentType, 'label'> {
  content: string; // HTML content of the alert
  isInline?: boolean;
  alerttype?: 'info' | 'warning' | 'success' | 'error';
  textDisplay?: 'formPdf' | 'form' | 'pdf';
}

const alert = (props: AlertType) => {
  const { content, isInline, alerttype, textDisplay } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    label: '',
    content,
    isInline: isInline ?? false,
    alerttype: alerttype ?? 'info',
    textDisplay: textDisplay ?? 'formPdf',
  };
};

const staticDefaultValues = {
  type: 'alertstripe',
  input: false,
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
  validateOn: 'change',
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
  keyModified: true,
};

export default alert;
