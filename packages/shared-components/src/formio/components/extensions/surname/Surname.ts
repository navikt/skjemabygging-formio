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
      const errorMessage = this.validateFoerstesideInputs();
      if (errorMessage) {
        return this.setComponentValidity([this.createError(errorMessage, undefined)], dirty, undefined);
      }
    }
    return isValid;
  }
}

export default Surname;
