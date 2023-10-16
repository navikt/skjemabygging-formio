import FormioSelectBoxes from 'formiojs/components/selectboxes/SelectBoxes';
import FormioSelectBoxesEditForm from 'formiojs/components/selectboxes/SelectBoxes.form';
import { advancedDescription } from './fields/advancedDescription.js';

class SelectBoxes extends FormioSelectBoxes {
  static editForm() {
    return FormioSelectBoxesEditForm([
      {
        label: 'Display',
        key: 'display',
        components: [
          ...advancedDescription,
          {
            key: 'labelPosition',
            ignore: true,
          },
          {
            key: 'optionsLabelPosition',
            ignore: true,
          },
          {
            key: 'tooltip',
            ignore: true,
          },
          {
            key: 'customClass',
            ignore: true,
          },
          {
            key: 'tabindex',
            ignore: true,
          },
          {
            key: 'inline',
            ignore: true,
          },
          {
            key: 'hidden',
            ignore: true,
          },
          {
            key: 'autofocus',
            ignore: true,
          },
          {
            key: 'disabled',
            ignore: true,
          },
          {
            key: 'tableView',
            ignore: true,
          },
          {
            key: 'modalEdit',
            ignore: true,
          },
          {
            key: 'hideLabel',
            ignore: true,
          },
        ],
      },
      {
        key: 'data',
        components: [
          {
            key: 'multiple',
            ignore: true,
          },
          {
            key: 'persistent',
            ignore: true,
          },
          {
            key: 'inputFormat',
            ignore: true,
          },
          {
            key: 'protected',
            ignore: true,
          },
          {
            key: 'dbIndex',
            ignore: true,
          },
          {
            key: 'case',
            ignore: true,
          },
          {
            key: 'encrypted',
            ignore: true,
          },
          {
            key: 'redrawOn',
            ignore: true,
          },
          {
            key: 'calculateServer',
            ignore: true,
          },
          {
            key: 'allowCalculateOverride',
            ignore: true,
          },
          {
            key: 'dataType',
            ignore: true,
          },
        ],
      },
      {
        key: 'validation',
        components: [
          {
            key: 'unique',
            ignore: true,
          },
        ],
      },
      {
        key: 'api',
        components: [
          { key: 'tags', ignore: true },
          { key: 'properties', ignore: true },
        ],
      },
      {
        key: 'logic',
        ignore: true,
        components: false,
      },
      {
        key: 'layout',
        ignore: true,
        components: false,
      },
    ]);
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
    this.refs.wrapper.forEach((wrapper) => {
      if (wrapper.contains(document.activeElement)) {
        wrapper.classList.add('inputPanel--focused');
      }
    });
  }

  onBlurredInput() {
    this.refs.wrapper.forEach((wrapper) => {
      if (!wrapper.contains(document.activeElement)) {
        wrapper.classList.remove('inputPanel--focused');
      }
    });
  }

  attach(element) {
    super.attach(element);
    this.refs.input.forEach((input) => {
      input.addEventListener('change', this.toggleChecked);
      input.addEventListener('focus', () => this.onFocusedInput());
      input.addEventListener('blur', () => this.onBlurredInput());
    });
  }

  detach(element) {
    if (element && this.refs.input) {
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
