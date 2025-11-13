import baseComponent, { BaseComponentType } from '../../shared/baseComponent';

interface AccordionType extends BaseComponentType {
  titleSize?: 'xsmall' | 'small';
  accordionValues: Array<{
    title: string;
    content: string;
  }>;
}

const accordion = (props: AccordionType) => {
  const { titleSize, accordionValues } = props ?? {};

  return {
    ...staticDefaultValues,
    ...baseComponent(props),
    titleSize: titleSize ?? 'small',
    accordionValues,
  };
};

const staticDefaultValues = {
  type: 'accordion',
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
  keyModified: true,
};

export default accordion;
