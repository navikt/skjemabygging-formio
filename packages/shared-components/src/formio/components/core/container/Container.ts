import { Formio } from '@formio/js';
import containerForm from './Container.form';

const FormioContainer = Formio.Components.components.container;

class Container extends FormioContainer {
  static schema(...extend) {
    return {
      ...FormioContainer.schema(...extend),
      label: 'Beholder',
    };
  }

  static editForm() {
    return containerForm();
  }
}

export default Container;
