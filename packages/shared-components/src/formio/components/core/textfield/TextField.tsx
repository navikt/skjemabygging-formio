import { TextField as NavTextField } from '@navikt/ds-react';
import { InputMode, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import Description from '../../base/components/Description';
import Label from '../../base/components/Label';
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

  isProtected(): boolean {
    return !!this.component?.protected;
  }

  handleChange(value: string | number) {
    super.handleChange(value);
  }

  checkComponentValidity(data, dirty, row, options = {}) {
    const validity = super.checkComponentValidity(data, dirty, row, options);

    if (validity) {
      const errorMessage = this.validateTextfield();
      if (errorMessage) {
        return this.setComponentValidity([this.createError(errorMessage, undefined)], dirty, undefined);
      }
    }

    return validity;
  }

  private validateTextfield(): string | undefined {
    const value = this.getValue();

    if (value === '' || value === undefined) {
      return;
    }

    if (this.component?.validate?.digitsOnly) {
      const containsDigitsOnly = RegExp(/^\d+$/).test(value);
      if (!containsDigitsOnly) {
        return this.translateWithLabel(TEXTS.validering.digitsOnly);
      }
    }
  }

  renderReact(element) {
    element.render(
      <ComponentUtilsProvider component={this}>
        <NavTextField
          id={this.getId()}
          defaultValue={this.getValue()}
          ref={(ref) => this.setReactInstance(ref)}
          onChange={(event) => this.handleChange(event.currentTarget.value)}
          label={<Label component={this.component} editFields={this.getEditFields()} />}
          hideLabel={this.getHideLabel()}
          description={<Description component={this.component} />}
          className={this.getClassName()}
          autoComplete={this.getAutoComplete()}
          readOnly={this.getReadOnly()}
          spellCheck={this.getSpellCheck()}
          error={this.getError()}
          inputMode={this.getInputMode()}
          type={this.isProtected() ? 'password' : 'text'}
        />
      </ComponentUtilsProvider>,
    );
  }
}

export default TextField;
