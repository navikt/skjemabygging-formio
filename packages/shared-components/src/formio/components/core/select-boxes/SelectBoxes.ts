import FormioSelectBoxes from 'formiojs/components/selectboxes/SelectBoxes';
import selectBoxesBuilder from './SelectBoxes.builder';
import selectBoxesForm from './SelectBoxes.form';

class SelectBoxes extends FormioSelectBoxes {
  static schema() {
    return FormioSelectBoxes.schema({
      label: 'Flervalg',
      type: 'selectboxes',
      key: 'selectboxes',
      fieldSize: 'input--xxl',
      input: true,
      isNavCheckboxPanel: true,
      clearOnHide: true,
      dataGridLabel: true,
    });
  }

  static editForm() {
    return selectBoxesForm(SelectBoxes.schema().type);
  }

  static get builderInfo() {
    return selectBoxesBuilder();
  }

  toggleChecked(event) {
    if (event.target.checked) {
      event.target.setAttribute('checked', 'checked');
    } else {
      event.target.removeAttribute('checked');
    }
    event.target.setAttribute('aria-checked', event.target.checked);
  }

  onFocusedInput() {
    // @ts-ignore
    this.refs.wrapper.forEach((wrapper) => {
      if (wrapper.contains(document.activeElement)) {
        wrapper.classList.add('inputPanel--focused');
      }
    });
  }

  onBlurredInput() {
    // @ts-ignore
    this.refs.wrapper.forEach((wrapper) => {
      if (!wrapper.contains(document.activeElement)) {
        wrapper.classList.remove('inputPanel--focused');
      }
    });
  }

  attach(element) {
    super.attach(element);
    // @ts-ignore
    this.refs.input.forEach((input) => {
      input.addEventListener('change', this.toggleChecked);
      input.addEventListener('focus', () => this.onFocusedInput());
      input.addEventListener('blur', () => this.onBlurredInput());
    });
  }

  detach(element) {
    // @ts-ignore
    if (element && this.refs.input) {
      // @ts-ignore
      this.refs.input.forEach((input) => {
        input.removeEventListener('change', this.toggleChecked);
        input.removeEventListener('focus', () => this.onFocusedInput());
        input.removeEventListener('blur', () => this.onBlurredInput());
      });
    }
    super.detach(element);
  }
}

export default SelectBoxes;
