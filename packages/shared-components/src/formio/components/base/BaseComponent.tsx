import { Tag } from '@navikt/ds-react';
import { Component, formDiffingTool, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import Field from 'formiojs/components/_classes/field/Field';
import { ReactNode } from 'react';
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
  getLabel() {
    return (
      <>
        {this.t(this.component?.label ?? '')}
        {this.component?.validate?.required && !this.component?.readOnly ? '' : ` (${this.t('valgfritt')})`}
        {this.getDiffTag()}
      </>
    );
  }

  setFocusedComponent(component: BaseComponent | null, value: any = null) {
    this.root.focusedComponent = component;
    this.root.focusedValue = value;
  }

  getFocusedComponent() {
    return this.root.focusedComponent;
  }

  getFocusedValue() {
    return this.root.focusedValue;
  }

  restoreFocus() {
    const focusedComponent = this.getFocusedComponent();
    const isFocused = focusedComponent?.path === this.path;
    if (isFocused) {
      const focusedValue = this.getFocusedValue();
      this.focus({ focusedValue });
    }
  }

  addFocusBlurEvents(element) {
    this.addEventListener(element, 'focus', focusHandler(this));
    this.addEventListener(element, 'blur', blurHandler(this));
  }

  getHideLabel() {
    return this.component?.hideLabel ?? false;
  }

  /**
   * Get default value for custom component renderReact()
   */
  getDefaultValue() {
    return this.dataForSetting || this.dataValue;
  }

  /**
   * Get description for custom component renderReact()
   */
  getDescription(): ReactNode {
    return this.component?.description ? (
      <div dangerouslySetInnerHTML={{ __html: this.t(this.component?.description) }}></div>
    ) : undefined;
  }

  /**
   * Get class name for custom component renderReact()
   */
  getClassName() {
    return this.component?.fieldSize ? `nav-${this.component?.fieldSize}` : '';
  }

  /**
   * Get whether custom component is required renderReact()
   */
  getIsRequired() {
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
   * Get app config (same as useAppConfig hook) for custom component renderReact()
   */
  getAppConfig() {
    return this.options?.appConfig;
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
  focus(focusData?: any) {
    this.reactReady.then(() => {
      if (this.reactInstance) {
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
          <Tag size="xsmall" variant="warning">
            Ny
          </Tag>
        )}
        {diff.changesToCurrentComponent?.length > 0 && (
          <Tag size="xsmall" variant="warning">
            Endring
          </Tag>
        )}
        {diff.deletedComponents?.length > 0 && (
          <Tag size="xsmall" variant="warning">
            Slettede elementer
          </Tag>
        )}
      </>
    );
  }
}

export default BaseComponent;
