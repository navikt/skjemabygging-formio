import { TEXTS, validatorUtils } from '@navikt/skjemadigitalisering-shared-domain';
import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import surnameBuilder from './Surname.builder';
import surnameForm from './Surname.form';

class Surname extends TextField {
  static schema() {
    return BaseComponent.schema({
      label: 'Etternavn',
      type: 'surname',
      autocomplete: 'family-name',
      key: 'etternavn',
    });
  }

  static editForm() {
    return surnameForm();
  }
  static get builderInfo() {
    return surnameBuilder();
  }

  override checkComponentValidity(data, dirty, row, options = {}) {
    const isValid = super.checkComponentValidity(data, dirty, row, options);
    if (isValid && !this.getReadOnly()) {
      const errorMessage = this.validateInput();
      if (errorMessage) {
        return this.setComponentValidity([this.createError(errorMessage, undefined)], dirty, undefined);
      }
    }
    return isValid;
  }

  private validateInput() {
    const value = this.getValue();
    if (!validatorUtils.isValidFoerstesideValue(value ?? '')) {
      return this.translateWithLabel(TEXTS.validering.containsInvalidCharacters);
    }
  }
}

export default Surname;
