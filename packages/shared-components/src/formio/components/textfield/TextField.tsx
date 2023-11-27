import { TextField as NavTextField } from '@navikt/ds-react';
import React from 'react';
import BaseComponent from '../base/BaseComponent';
import textFieldForm from './TextField.form';

export default class TextField extends BaseComponent {
  static editForm() {
    return textFieldForm();
  }

  static schema() {
    return BaseComponent.schema({
      label: 'Tekstfelt',
      type: 'textfield',
      key: 'tekstfelt',
      spellcheck: true,
      inputType: 'text',
      inputFormat: 'plain',
    });
  }

  get defaultSchema() {
    return TextField.schema();
  }

  static get builderInfo() {
    return {
      title: 'Tekstfelt',
      group: 'basic',
      schema: { ...TextField.schema(), validate: { required: true } },
    };
  }

  setValue(value: any) {
    super.setValue(value ?? '');
  }

  renderReact(element) {
    const instance: React.ReactNode = (
      <NavTextField
        id={this.getId()}
        defaultValue={this.getDefaultValue()}
        ref={(ref) => this.setReactInstance(ref)}
        onChange={(event) => this.updateValue(event.currentTarget.value, { modified: true })}
        onBlur={() => this.onBlur()}
        label={this.getLabel()}
        description={this.getDescription()}
        className={this.getClassName()}
        readOnly={this.component?.readOnly}
        spellCheck={this.component?.spellCheck}
        autoComplete={this.getAutocomplete()}
        error={this.error?.message}
      />
    );

    element.render(instance);
    return instance;
  }
}
