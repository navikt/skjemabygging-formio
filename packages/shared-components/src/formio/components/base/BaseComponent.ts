import { Component, ComponentError } from '@navikt/skjemadigitalisering-shared-domain';
import Field from 'formiojs/components/_classes/field/Field';
import FormioUtils from 'formiojs/utils';
import { TFunction, TOptions } from 'i18next';
import FormioReactComponent from './FormioReactComponent';
import baseComponentUtils from './baseComponentUtils';

/**
 * When creating a custom component that extends BaseComponent,
 * minimum the following function should be overridden:
 *
 * static schema(): Component
 * static editForm(): Component
 * static get builderInfo(): Component
 * renderReact(element): void (this is optional)
 */
class BaseComponent extends FormioReactComponent {
  editFields;

  /**
   * Override in custom component and call BaseComponent.schema()
   * with the component schema values like label, type, key and more.
   */
  static schema(values) {
    return Field.schema({
      fieldSize: 'input--xxl',
      validateOn: 'blur',
      ...values,
    });
  }

  /**
   * Get id for custom component renderReact()
   */
  getId() {
    return baseComponentUtils.getId(this.component);
  }

  /**
   * Get label for custom component renderReact()
   */
  getLabel() {
    return baseComponentUtils.getLabel(this.component);
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

  translateWithLabel(key: string, options = {}) {
    return this.translate(key, { field: this.getLabel(), ...options });
  }

  getHideLabel() {
    return baseComponentUtils.getHideLabel(this.component);
  }

  getValueDescription(index: number) {
    return this.translate(this.component?.values?.[index]?.description);
  }

  /**
   * Get class name for custom component renderReact()
   */
  getClassName() {
    // TODO: Remove nav-new and nav- prefix for fieldsize when all components are Aksel
    return this.component?.fieldSize ? `nav-${this.component?.fieldSize} nav-new` : 'nav-new';
  }

  /**
   * Get whether custom component is required renderReact()
   */
  isRequired() {
    return baseComponentUtils.isRequired(this.component);
  }

  /**
   * Get content for custom component renderReact()
   */
  getContent() {
    return this.component?.content ? this.translate(this.component?.content) : '';
  }

  /**
   * Get auto complete for custom component renderReact()
   */
  getAutoComplete() {
    return this.component?.autocomplete ?? 'off';
  }

  /**
   * Get language code for custom component renderReact()
   */
  getLocale() {
    return this.root.i18next.language;
  }

  /**
   * Get read only for custom component renderReact()
   */
  getReadOnly() {
    return baseComponentUtils.isReadOnly(this.component, this.options);
  }

  /**
   * Get spell check for custom component renderReact()
   */
  getSpellCheck() {
    return this.component?.spellCheck;
  }

  /**
   * Get error custom for component renderReact()
   */
  getError() {
    return this.error?.message;
  }

  /**
   * Get whether user is logged in or not for custom component renderReact()
   */
  getIsLoggedIn() {
    return this.options?.appConfig?.config?.isLoggedIn;
  }

  /**
   * Required and used by Form.io
   */
  get defaultSchema() {
    return (this.constructor as typeof FormioReactComponent).schema();
  }

  getEditForm(): Component {
    return (this.constructor as typeof FormioReactComponent).editForm();
  }

  /**
   * Private function
   *
   * Get the key from all components that is configured in editForm() in the custom component.
   */
  getEditFields() {
    if (!this.editFields) {
      this.editFields = baseComponentUtils.getEditFields(this.getEditForm());
    }

    return this.editFields;
  }

  // elementId is used to focus to the correct element when clicking on error summary
  // Message is the error message that is shown in the error summary
  addError(message: string, elementId?: string) {
    this.logger.debug('addError', { errorMessage: message });
    this.componentErrors.push(this.createError(message, elementId));
  }

  createError(message: string, elementId?: string): ComponentError {
    return {
      message,
      level: 'error',
      path: FormioUtils.getComponentPath(this.component),
      elementId,
    };
  }

  removeAllErrors() {
    this.componentErrors = [];
  }

  getComponentError(elementId: string) {
    return this.componentErrors.find((error) => error.elementId === elementId)?.message;
  }
}

export default BaseComponent;
