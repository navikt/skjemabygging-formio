// @ts-nocheck
import FormioCheckbox from 'formiojs/components/checkbox/Checkbox';
import checkboxForm from './Checkbox.form';

class Checkbox extends FormioCheckbox {
  static editForm() {
    return checkboxForm();
  }

  updateValue(value, flags) {
    const changed = super.updateValue(value || (this.input && this.input.checked), flags);

    // Update attributes of the input element
    if (changed && this.input) {
      if (this.input.checked) {
        this.input.setAttribute('checked', 'true');
      } else {
        this.input.removeAttribute('checked');
      }
    }

    return changed;
  }
}

export default Checkbox;
