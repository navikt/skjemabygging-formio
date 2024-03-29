import { TextField as NavTextField } from '@navikt/ds-react';
import BaseComponent from '../../base/BaseComponent';
import textFieldBuilder from './TextField.builder';
import textFieldForm from './TextField.form';

class TextField extends BaseComponent {
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

  static editForm() {
    return textFieldForm();
  }

  static get builderInfo() {
    return textFieldBuilder();
  }

  getValue() {
    return super.getValue() ?? '';
  }

  renderReact(element) {
    element.render(
      <NavTextField
        id={this.getId()}
        defaultValue={this.getValue()}
        ref={(ref) => this.setReactInstance(ref)}
        onChange={(event) => this.updateValue(event.currentTarget.value, { modified: true })}
        label={this.getLabel()}
        hideLabel={this.getHideLabel()}
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

export default TextField;
