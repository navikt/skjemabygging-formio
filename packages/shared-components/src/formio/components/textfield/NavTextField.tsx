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
  refCallback?: any;
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
        ref={(r) => this.props.refCallback(r)}
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

  renderReact(element) {
    const instance: React.ReactNode = (
      <TextFieldClassComponent
        id={`${this.component?.id}-${this.component?.key}`}
        defaultValue={this.dataForSetting || this.dataValue}
        refCallback={(r) => this.setReactInstance(r)}
        onChange={(event) => this.updateValue(event.currentTarget.value, {})}
        describedBy={`d-${this.component?.id}-${this.component?.key} e-${this.component?.id}-${this.component?.key}`}
      />
    );
    // this.setReactInstance(instance);
    element.render(instance);
    // this.setReactInstance(ref.current);
    return instance;
  }
}
