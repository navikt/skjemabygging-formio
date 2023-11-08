// import { ReactComponent } from '@formio/react';
import { TextField as NavTextField } from '@navikt/ds-react';
import FormBuilderOptions from '../../form-builder-options';
import FormioReactComponent from '../FormioReactComponent';
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

  renderReact(element) {
    return element.render(
      <NavTextField
        htmlSize={43}
        id={this.component?.id}
        value={this.dataForSetting || this.dataValue}
        onChange={(event) => this.updateValue(event.currentTarget.value, {})}
        ref={(r) => (this.input = r)}
        label=""
        hideLabel
      />,
    );
  }
}
