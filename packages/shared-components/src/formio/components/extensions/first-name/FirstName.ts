import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import firstNameBuilder from './FirstName.builder';
import firstNameForm from './FirstName.form';

class FirstName extends TextField {
  static schema() {
    return BaseComponent.schema({
      label: 'Fornavn',
      type: 'firstName',
      autocomplete: 'given-name',
      key: 'fornavn',
    });
  }

  static editForm() {
    return firstNameForm();
  }

  static get builderInfo() {
    return firstNameBuilder();
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

export default FirstName;
