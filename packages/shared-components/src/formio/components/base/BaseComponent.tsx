import { ReactNode } from 'react';
import FormioReactComponent2 from '../FormioReactComponent2';

class BaseComponent extends FormioReactComponent2 {
  getId() {
    return `${this.component?.id}-${this.component?.key}`;
  }

  getLabel() {
    return `${this.t(this.component?.label ?? '')}${
      !this.component?.validate?.required && !this.component?.readOnly ? ` (${this.t('valgfritt')})` : ''
    }`;
  }

  getDefaultValue() {
    return this.dataForSetting || this.dataValue;
  }

  getDescription(): ReactNode {
    return this.component?.description ? (
      <div dangerouslySetInnerHTML={{ __html: this.component?.description }}></div>
    ) : undefined;
  }

  getClassName() {
    return this.component?.fieldSize;
  }

  getAutocomplete() {
    return this.component?.autoComplete ?? 'off';
  }

  focus() {
    if (this.reactInstance) {
      this.reactInstance.focus();
    }
  }

  onBlur() {
    this.emit('blur', this);
  }
}

export default BaseComponent;
