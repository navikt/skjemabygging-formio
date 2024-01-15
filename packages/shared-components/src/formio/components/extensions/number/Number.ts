import FormioNumber from 'formiojs/components/number/Number';
import numberForm from './Number.form';

class Number extends FormioNumber {
  // TODO: Try and see if can get delimiter (tusenskilletegn) default set for all numbers.
  static schema() {
    return FormioNumber.schema({
      label: 'Tall',
      type: 'number',
      key: 'number',
      fieldSize: 'input--m',
      input: true,
      dataGridLabel: true,
      spellcheck: false,
      clearOnHide: true,
    });
  }

  static editForm() {
    return numberForm();
  }
}

export default Number;
