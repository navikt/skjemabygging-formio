import FormioContainer from 'formiojs/components/container/Container';
import resolveFormioDefault from '../../base/resolveFormioDefault';
import containerForm from './Container.form';

const ContainerBase = resolveFormioDefault(FormioContainer);

class Container extends ContainerBase {
  static schema(...extend) {
    return {
      ...ContainerBase.schema(...extend),
      label: 'Beholder',
    };
  }

  static editForm() {
    return containerForm();
  }
}

export default Container;
