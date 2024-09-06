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

  init() {
    super.init();
    this.initPrefill();
  }

  initPrefill() {
    if (this.isSubmissionDigital() && this.component?.prefillKey && this.component?.prefillValue) {
      this.setValue(this.component?.prefillValue);
    }
  }

  getReadOnly() {
    return (!!this.component?.prefillKey && this.isSubmissionDigital()) || super.getReadOnly();
  }

  getValue() {
    // TODO: If prefill value is sett, we should always get latest values from prefill instead of mellomlagring.
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
        type={this.isProtected() ? 'password' : 'text'}
      />,
    );
  }
}

export default TextField;
