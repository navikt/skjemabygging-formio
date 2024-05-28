import { TextField as NavTextField } from '@navikt/ds-react';
import { InputMode } from '@navikt/skjemadigitalisering-shared-domain';
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

  getInputMode(): InputMode {
    return 'text';
  }

  handleChange(value: string): any {
    super.updateValue(value, { modified: true });
  }

  renderReact(element) {
    element.render(
      <NavTextField
        id={this.getId()}
        defaultValue={this.getValue()}
        ref={(ref) => this.setReactInstance(ref)}
        onChange={(event) => this.handleChange(event.currentTarget.value)}
        label={this.getLabel()}
        hideLabel={this.getHideLabel()}
        description={this.getDescription()}
        className={this.getClassName()}
        autoComplete={this.getAutoComplete()}
        readOnly={this.getReadOnly()}
        spellCheck={this.getSpellCheck()}
        error={this.getError()}
        inputMode={this.getInputMode()}
      />,
    );
  }
}

export default TextField;
