import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

export interface HtmlElementType extends BaseComponentType {
  content: string; // HTML content of the element
  textDisplay?: 'formPdf' | 'form' | 'pdf';
}

const htmlElement = (props: HtmlElementType) => {
  const { content, textDisplay } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    label: '',
    content,
    textDisplay: textDisplay ?? 'formPdf',
  };
};

const staticDefaultValues = {
  type: 'htmlelement',
  input: false,
  tableView: false,
  textDisplay: 'formPdf',
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
  fieldSize: 'input--xxl',
  tag: 'div',
  attrs: [],
  keyModified: true,
};

export default htmlElement;
