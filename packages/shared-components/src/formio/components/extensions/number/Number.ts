import FormioNumber from 'formiojs/components/number/Number';
import numberForm from './Number.form';

class Number extends FormioNumber {
  static editForm() {
    return numberForm();
  }
}

export default Number;
