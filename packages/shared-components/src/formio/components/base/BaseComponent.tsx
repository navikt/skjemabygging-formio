import { Tag } from '@navikt/ds-react';
import { formDiffingTool } from '@navikt/skjemadigitalisering-shared-domain';
import Field from 'formiojs/components/_classes/field/Field';
import { ReactNode } from 'react';
import FormioReactComponent2 from '../FormioReactComponent2';

class BaseComponent extends FormioReactComponent2 {
  static schema(values) {
    return Field.schema({
      input: true,
      clearOnHide: true,
      fieldSize: 'input--xxl',
      dataGridLabel: true,
      validate: {
        required: true,
      },
      ...values,
    });
  }

  getId() {
    return `${this.component?.id}-${this.component?.key}`;
  }

  getLabel() {
    return (
      <>
        {this.t(this.component?.label ?? '')}
        {this.component?.validate?.required && !this.component?.readOnly ? '' : ` (${this.t('valgfritt')})`}
        {this.getDiffTag()}
      </>
    );
  }

  getDiffTag() {
    const publishedForm = this.options?.formConfig?.publishedForm;
    if (!this.builderMode || !publishedForm) {
      return <></>;
    }

    // TODO: Fix mergeSchema
    const mergeSchema = undefined; //self.mergeSchema.bind(self);
    const diff = formDiffingTool.getComponentDiff(this.component!, publishedForm, mergeSchema);

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
