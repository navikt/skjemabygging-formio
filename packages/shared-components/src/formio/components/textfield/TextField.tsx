import { TextField as NavTextField } from '@navikt/ds-react';
import React from 'react';
import FormBuilderOptions from '../../form-builder-options';
import BaseComponent from '../base/BaseComponent';
import textFieldForm from './TextField.form';

export default class TextField extends BaseComponent {
  static editForm() {
    return textFieldForm();
  }

  static schema() {
    return BaseComponent.schema(FormBuilderOptions.builder.basic.components.textfield.schema);
  }

  static get builderInfo() {
    return {
      title: 'Text Field',
      icon: 'terminal',
      group: 'basic',
      documentation: '',
      weight: 0,
      schema: TextField.schema(),
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
        aria-describedby={`d-${this.component?.id}-${this.component?.key} e-${this.component?.id}-${this.component?.key}`}
        label={this.getLabel()}
        className={this.component?.fieldSize}
        readOnly={this.component?.readOnly}
        spellCheck={this.component?.spellCheck}
        autoComplete={this.component?.autoComplete ?? 'off'}
      />
    );

    // this.setReactInstance(instance);
    element.render(instance);
    // this.setReactInstance(ref.current);
    return instance;
  }
}
