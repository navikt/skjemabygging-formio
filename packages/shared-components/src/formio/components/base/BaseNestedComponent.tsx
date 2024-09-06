import { Component, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction, TOptions } from 'i18next';
import FormioReactComponent from './FormioReactComponent';
import FormioReactNestedComponent from './FormioReactNestedComponent';
import { IBaseComponent } from './index';

class BaseNestedComponent extends FormioReactNestedComponent implements IBaseComponent {
  editFields;

  /**
   * Required and used by Form.io
   */
  get defaultSchema() {
    return (this.constructor as typeof FormioReactNestedComponent).schema();
  }

  /**
   * Private function
   *
   * Get the key from all components that is configured in editForm() in the custom component.
   */
  getEditFields() {
    if (!this.editFields) {
      const editForm: Component = (this.constructor as typeof FormioReactComponent).editForm();
      this.editFields = navFormUtils
        .flattenComponents(editForm.components?.[0].components as Component[])
        .map((component) => component.key);
    }

    return this.editFields;
  }

  /**
   * @deprecated Use `translate` instead of `t` in React components
   */
  t = (...params) => {
    return super.t(...params);
  };

  translate(key?: string, options: TOptions = {}): ReturnType<TFunction> {
    if (Object.keys(options).length === 0) {
      return super.t(key);
    }
    return super.t(key, { ...options, interpolation: { escapeValue: false } });
  }

  updateSubmission(key: string, value: any) {
    const component = navFormUtils.findByKey(key, this.getComponents()) as any;
    component.updateValue(value);
  }
}

export default BaseNestedComponent;
