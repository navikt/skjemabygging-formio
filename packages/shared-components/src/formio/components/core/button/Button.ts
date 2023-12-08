import FormioButton from 'formiojs/components/button/Button';
import FormBuilderOptions from '../../../form-builder-options';
import buttonForm from './Button.form';

class Button extends FormioButton {
  static schema(...extend) {
    return FormioButton.schema(
      {
        ...FormBuilderOptions.builder.basic.components.button.schema,
      },
      ...extend,
    );
  }

  static editForm() {
    return buttonForm();
  }

  static get builderInfo() {
    return FormBuilderOptions.builder.basic.components.button;
  }

  get defaultSchema() {
    return Button.schema();
  }
}

export default Button;
