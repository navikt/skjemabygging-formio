// import { ReactComponent } from '@formio/react';
import { TextField as NavTextField } from '@navikt/ds-react';
import FormBuilderOptions from '../../form-builder-options';
// import FormioReactComponent from '../FormioReactComponent';
import FormioReactComponent from '../FormioReactComponent2';

import React from 'react';
import getEditForm from './editForm';

type TextFieldClassComponentProps = {
  id: string;
  defaultValue?: string;
  customRef: any;
  onChange: (event: any) => void;
  describedBy: string;
};
class TextFieldClassComponent extends React.Component<TextFieldClassComponentProps> {
  render() {
    return (
      <NavTextField
        htmlSize={43}
        id={this.props.id}
        defaultValue={this.props.defaultValue}
        onChange={this.props.onChange}
        // ref={(r) => (this.input = r)}
        ref={this.props.customRef}
        aria-describedby={this.props.describedBy}
        label=""
        hideLabel
      />
    );
  }
}

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

  renderReact(element, ref) {
    const instance: React.ReactNode = (
      <TextFieldClassComponent
        id={`${this.component?.id}-${this.component?.key}`}
        defaultValue={this.dataForSetting || this.dataValue}
        customRef={ref}
        onChange={(event) => this.updateValue(event.currentTarget.value, {})}
        describedBy={`d-${this.component?.id}-${this.component?.key} e-${this.component?.id}-${this.component?.key}`}
      />
    );
    element.render(instance);
    return instance;
  }
}
