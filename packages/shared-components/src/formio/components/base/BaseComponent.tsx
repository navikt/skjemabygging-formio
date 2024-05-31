import { Tag } from '@navikt/ds-react';
import { Component, ComponentError, formDiffingTool, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import Field from 'formiojs/components/_classes/field/Field';
import FormioUtils from 'formiojs/utils';
import { ReactNode } from 'react';
import InnerHtml from '../../../components/inner-html/InnerHtml';
import FormioReactComponent from './FormioReactComponent';
import { blurHandler, focusHandler } from './focus-helpers';

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
    return `${this.component?.id}-${this.component?.key}`;
  }

  /**
   * Get label for custom component renderReact()
   */
  getLabel(options?: { showOptional?: boolean; showDiffTag?: boolean; labelTextOnly?: boolean }) {
    const defaultOptions = { showOptional: true, showDiffTag: true, labelTextOnly: false };
    const { showOptional, showDiffTag, labelTextOnly } = { ...defaultOptions, ...(options ?? {}) };

    if (labelTextOnly) return this.t(this.component?.label ?? '');

    return (
      <>
        {this.t(this.component?.label ?? '')}
        {this.isRequired() && !this.component?.readOnly ? '' : showOptional && ` (${this.t('valgfritt')})`}
        {showDiffTag && this.getDiffTag()}
      </>
    );
  }

  /**
   * Set which component is currently focused, and optionally which element inside this component.
   * This is stored on 'this.root' which usually points to the webform/wizard.
   * @param component
   * @param elementName
   */
  setFocusedComponent(component: BaseComponent | null, elementName: any = null) {
    this.logger.trace(`setFocusedComponent ${component ? 'this' : 'null'}`, { elementName });
    this.root.focusedComponent = component;
    this.root.focusedElementName = elementName;
  }

  /**
   * @return Currently focused component.
   */
  getFocusedComponent() {
    return this.root.focusedComponent;
  }

  /**
   * @return Name of focused element inside currently focused component.
   */
  getFocusedElementName() {
    return this.root.focusedElementName;
  }

  /**
   * Copied from Formio Component#restoreFocus, and adjusted to our needs.
   * Invoked when component is being attached, e.g. during initial build or on rebuild/redraw.
   */
  restoreFocus() {
    const focusedComponent = this.getFocusedComponent();
    const isFocused = focusedComponent?.path === this.path;
    if (isFocused) {
      const focusedElementName = this.getFocusedElementName();
      this.logger.debug('restoreFocus isFocused', {
        elementName: focusedElementName,
        navId: this.component?.navId,
        type: this.component?.type,
      });
      this.focus({ focusedElementName });
    }
  }

  /**
   * Overrides Formio Component#addFocusBlurEvents. We split the focus and blur handlers
   * in order to be able to reuse them inside our React components.
   * @param element The element
   */
  addFocusBlurEvents(element) {
    this.addEventListener(element, 'focus', focusHandler(this));
    this.addEventListener(element, 'blur', blurHandler(this));
  }

  getHideLabel() {
    return this.component?.hideLabel ?? false;
  }

  /**
   * Get description for custom component renderReact()
   */
  getDescription(): ReactNode {
    return this.component?.description ? <InnerHtml content={this.t(this.component?.description)} /> : undefined;
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
    return this.component?.validate?.required;
  }

  /**
   * Get content for custom component renderReact()
   */
  getContent() {
    return this.component?.content ? this.t(this.component?.content) : '';
  }

  /**
   * Get auto complete for custom component renderReact()
   */
  getAutoComplete() {
    return this.component?.autoComplete ?? 'off';
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
    return this.component?.readOnly || this.options.readOnly;
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
   * Get textDisplay tag for custom component renderReact()
   */
  getTextDisplayTag() {
    if (!this.builderMode) {
      return <></>;
    }

    if (this.component?.textDisplay === 'pdf') {
      return (
        <Tag variant="alt3" className="mb-4" size="xsmall">
          PDF
        </Tag>
      );
    } else if (this.component?.textDisplay === 'formPdf') {
      return (
        <Tag variant="alt3" className="mb-4" size="xsmall">
          Skjema og PDF
        </Tag>
      );
    }
  }

  /**
   * Used to set focus when clicking error summary, and when restoring focus after rerender.
   */
  focus(focusData: any = {}) {
    this.logger.debug('focus', { focusData });
    this.reactReady.then(() => {
      this.logger.debug('focus reactReady', { focusData, reactInstanceExists: !!this.reactInstance });
      const { elementId } = focusData;
      if (elementId) {
        this.getRef(elementId)?.focus();
      } else if (this.reactInstance) {
        this.reactInstance.focus(focusData);
      }
    });
  }

  /**
   * Required and used by Form.io
   */
  get defaultSchema() {
    return (this.constructor as typeof FormioReactComponent).schema();
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
   * Private function
   *
   * Create a diff <Tag> that is used in the label for the custom component.
   */
  getDiffTag() {
    const publishedForm = this.options?.formConfig?.publishedForm;
    if (!this.builderMode || !publishedForm) {
      return <></>;
    }

    const diff = formDiffingTool.generateComponentDiff(this.component!, publishedForm, this.getEditFields());

    return (
      <>
        {diff.isNew && (
          <Tag size="xsmall" variant="warning" data-testid="diff-tag">
            Ny
          </Tag>
        )}
        {diff.changesToCurrentComponent?.length > 0 && (
          <Tag size="xsmall" variant="warning" data-testid="diff-tag">
            Endring
          </Tag>
        )}
        {diff.deletedComponents?.length > 0 && (
          <Tag size="xsmall" variant="warning" data-testid="diff-tag">
            Slettede elementer
          </Tag>
        )}
      </>
    );
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
}

export default BaseComponent;
