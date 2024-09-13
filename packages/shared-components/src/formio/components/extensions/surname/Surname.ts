import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';
import surenameForm from './Surename.form';
import surnameBuilder from './Surname.builder';

class Surname extends TextField {
  static schema() {
    return BaseComponent.schema({
      label: 'Fornavn',
      type: 'surename',
      autocomplete: 'family-name',
      key: 'fornavn',
    });
  }

  static editForm() {
    return surenameForm();
  }
  static get builderInfo() {
    return surnameBuilder();
  }
}

export default Surname;
