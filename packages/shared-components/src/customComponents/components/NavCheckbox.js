import FormioCheckbox from "formiojs/components/checkbox/Checkbox";

export default class NavCheckbox extends FormioCheckbox {

  updateValue(value, flags) {
    const changed = super.updateValue(
      value || (this.input && this.input.checked ? "ja" : null),
      flags
    );

    // Update attributes of the input element
    if (changed && this.input) {
      if (this.input.checked) {
        this.input.setAttribute('checked', 'true');
      }
      else {
        this.input.removeAttribute('checked');
      }
    }

    return changed;
  }

}
