import FormioReactComponent2 from '../FormioReactComponent2';

class BaseComponent extends FormioReactComponent2 {
  getId() {
    return `${this.component?.id}-${this.component?.key}`;
  }

  getLabel() {
    return `${this.component?.label}${
      this.component?.validate?.required && !this.component?.readOnly ? ` (${this.t('valgfritt')})` : ''
    }`;
  }

  getDefaultValue() {
    return this.dataForSetting || this.dataValue;
  }
}

export default BaseComponent;
