import FormioButton from 'formiojs/components/button/Button';
import buttonBuilder from './Button.builder';
import buttonForm from './Button.form';

class Button extends FormioButton {
  static schema() {
    return FormioButton.schema({
      label: 'Knapp',
      type: 'button',
      key: 'knapp',
      hideLabel: true,
    });
  }

  static editForm() {
    return buttonForm();
  }

  static get builderInfo() {
    return buttonBuilder();
  }

  get defaultSchema() {
    return Button.schema();
  }
}

export default Button;
