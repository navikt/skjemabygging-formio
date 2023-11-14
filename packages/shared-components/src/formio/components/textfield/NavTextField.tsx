// import { ReactComponent } from '@formio/react';
import { TextField as NavTextField } from '@navikt/ds-react';
import FormBuilderOptions from '../../form-builder-options';
// import FormioReactComponent from '../FormioReactComponent';
import FormioReactComponent from '../FormioReactComponent2';

import React from 'react';
import getEditForm from './editForm';

export default class TextField extends FormioReactComponent {
  static editForm() {
    return getEditForm();
  }

  static schema() {
    return FormioReactComponent.schema(FormBuilderOptions.builder.basic.components.textfield.schema);
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
        htmlSize={43}
        id={`${this.component?.id}-${this.component?.key}`}
        defaultValue={this.dataForSetting || this.dataValue}
        ref={(ref) => this.setReactInstance(ref)}
        onChange={(event) => this.updateValue(event.currentTarget.value, {})}
        aria-describedby={`d-${this.component?.id}-${this.component?.key} e-${this.component?.id}-${this.component?.key}`}
        label={this.component?.label}
      />
    );

    // this.setReactInstance(instance);
    element.render(instance);
    // this.setReactInstance(ref.current);
    return instance;
  }
}
