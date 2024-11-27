import { Component, ComponentError, CustomLabels, FieldSize } from '@navikt/skjemadigitalisering-shared-domain';
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
   * @deprecated Use getFieldSize instead.
   *
   * Get class name for custom component renderReact()
   */
  getClassName() {
    // TODO: Remove nav-new and nav- prefix for fieldsize when all components are Aksel
    return this.component?.fieldSize ? `nav-${this.component?.fieldSize} nav-new` : 'nav-new';
  }

  /**
   * Get the correct FieldSize for useComponentStyles
   */
  getFieldSize(): FieldSize | undefined {
    switch (this.component?.fieldSize) {
      case 'input--xxs':
        return 'xxsmall';
      case 'input--xs':
        return 'xsmall';
      case 'input--s':
        return 'small';
      case 'input--m':
        return 'medium';
      case 'input--l':
        return 'large';
      case 'input--xl':
        return 'xlarge';
      case 'input--xxl':
        return 'xxlarge';
    }
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
   * Get custom labels for for use in custom components.
   */
  getCustomLabels(): CustomLabels | undefined {
    return this.component?.customLabels;
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

  isSubmissionPaper() {
    return this.getAppConfig()?.submissionMethod === 'paper' || !this.getAppConfig()?.submissionMethod;
  }

  isSubmissionDigital() {
    return this.getAppConfig()?.submissionMethod === 'digital';
  }

  hasPrefill(): boolean {
    return (this.isSubmissionDigital() && !!this.component?.prefillKey && !!this.component?.prefillValue) ?? false;
  }

  /**
   * elementId is used to focus to the correct element when clicking on error summary
   * Message is the error message that is shown in the error summary
   */
  addError(message: string, elementId?: string) {
    if (this.showErrorMessages()) {
      this.logger.debug('addError', { errorMessage: message });
      this.componentErrors.push(this.createError(message, elementId));
    }
  }

  get errors() {
    return this.componentErrors;
  }

  override setCustomValidity(messages: string | ComponentError[], _dirty?: boolean, _external?: boolean) {
    this.removeAllErrors();

    if (messages) {
      if (Array.isArray(messages)) {
        if (messages.length > 1) {
          this.logger.info(`Should never get more then one message, got ${messages.length}.`, { messages });
        }
        messages.forEach((componentError: ComponentError) => {
          this.addError(componentError.message, this.getId());
        });
      } else {
        this.addError(messages, this.getId());
      }
    }
    this.rerender();
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

  getError() {
    return this.getComponentError(this.getId());
  }

  getComponentError(elementId: string) {
    return this.componentErrors.find((error) => error.elementId === elementId)?.message;
  }

  /**
   * nextPageClicked: When user click next page in Fyllut (except last page)
   * submitted: When user click next page in Fyllut (last page)
   * builderMode: When user is in the regular form builder
   * editFormDialog: When user have open a form dialog in the form builder
   */
  showErrorMessages() {
    return (
      this.root.currentPage?.nextPageClicked || this.root.submitted || this.builderMode || this.root.editFormDialog
    );
  }
}

export default BaseComponent;
