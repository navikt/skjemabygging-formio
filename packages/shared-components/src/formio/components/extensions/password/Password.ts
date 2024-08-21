import BaseComponent from '../../base/BaseComponent';
import TextField from '../../core/textfield/TextField';

class Password extends TextField {
  static schema() {
    return BaseComponent.schema({
      label: 'Passord',
      type: 'password',
      key: 'password',
      protected: true,
    });
  }
}

export default Password;
