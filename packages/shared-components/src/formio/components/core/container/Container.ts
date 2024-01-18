import FormioContainer from 'formiojs/components/container/Container';
import containerForm from './Container.form';

class Container extends FormioContainer {
  static schema(...extend) {
    return {
      ...FormioContainer.schema(...extend),
      input: false,
      label: 'Beholder',
    };
  }

  static editForm() {
    return containerForm();
  }
}

export default Container;
