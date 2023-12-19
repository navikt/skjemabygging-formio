import { TextField as NavTextField } from '@navikt/ds-react';
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

  static get builderInfo() {
    return {
      title: 'Tekstfelt',
      group: 'basic',
      schema: {
        ...TextField.schema(),
        ...BaseComponent.defaultBuilderInfoSchema(),
      },
    };
  }

  setValue(value: any) {
    super.setValue(value ?? '');
  }

  renderReact(element) {
    element.render(
      <NavTextField
        id={this.getId()}
        defaultValue={this.getDefaultValue()}
        ref={(ref) => this.setReactInstance(ref)}
        onChange={(event) => this.updateValue(event.currentTarget.value, { modified: true })}
        label={this.getLabel()}
        description={this.getDescription()}
        className={this.getClassName()}
        autoComplete={this.getAutoComplete()}
        readOnly={this.getReadOnly()}
        spellCheck={this.getSpellCheck()}
        error={this.getError()}
      />,
    );
  }
}
