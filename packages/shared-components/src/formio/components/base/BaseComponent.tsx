import { Tag } from '@navikt/ds-react';
import { Component, formDiffingTool, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import Field from 'formiojs/components/_classes/field/Field';
import { ReactNode } from 'react';
import FormioReactComponent from './FormioReactComponent';

/**
 * When creating a custom component that extends BaseComponent,
 * minimum the following function should be overridden:
 *
 * static editForm(): Component
 * static schema(): Component
 * static get builderInfo(): Component
 * renderReact(element): void
 */
class BaseComponent extends FormioReactComponent {
  editFields;

  /**
   * Override in custom component and call BaseComponent.schema()
   * with the component schema values like label, type, key and more.
   */
  static schema(values) {
    return Field.schema({
      input: true,
      clearOnHide: true,
      fieldSize: 'input--xxl',
      dataGridLabel: true,
      validate: {
        required: false,
      },
      ...values,
    });
  }

  /**
   * This can be used in builderInfo() in the custom component,
   * to get some default values used for components in the Bygger app.
   *
   * builderInfo() is used by Form.io and is required in the custom component.
   */
  static defaultBuilderInfoSchema() {
    return {
      schema: {
        validateOn: 'blur',
        validate: {
          required: true,
        },
      },
    };
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
      <div dangerouslySetInnerHTML={{ __html: this.component?.description }}></div>
    ) : undefined;
  }

  /**
   * Get class name for custom component renderReact()
   */
  getClassName() {
    return this.component?.fieldSize;
  }

  /**
   * Get auto complete for custom component renderReact()
   */
  getAutoComplete() {
    return this.component?.autoComplete ?? 'off';
  }

  /**
   * Get read only for custom component renderReact()
   */
  getReadOnly() {
    return this.component?.readOnly;
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
   * Used to set focus when clicking error summary.
   */
  focus() {
    if (this.reactInstance) {
      this.reactInstance.focus();
    }
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
