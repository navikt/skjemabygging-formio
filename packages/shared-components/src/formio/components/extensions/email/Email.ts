import { InputMode } from '@navikt/skjemadigitalisering-shared-domain';
import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import emailBuilder from './Email.builder';
import emailForm from './Email.form';

class Email extends TextField {
  static schema() {
    return BaseComponent.schema({
      label: 'E-post',
      type: 'email',
      key: 'epost',
      autocomplete: 'email',
      inputType: 'email',
      spellcheck: false,
    });
  }

  static editForm() {
    return emailForm();
  }
  static get builderInfo() {
    return emailBuilder();
  }

  override getInputMode(): InputMode {
    return 'email';
  }

  override handleChange(value: string) {
    super.handleChange(value ? value.trim() : value);
  }

  init() {
    super.init();
  }
}

export default Email;
