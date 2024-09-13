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
}

export default Surname;
