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

  init() {
    super.init();
    this.validators.push('email');
  }
}

export default Email;
