import FormioContainer from 'formiojs/components/container/Container';
import containerForm from './Container.form';

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
