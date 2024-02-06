import Field from 'formiojs/components/_classes/field/Field';
import BaseComponent from '../../base/BaseComponent';
import activitiesBuilder from './Activities.builder';
import activitiesForm from './Activities.form';

class Activities extends BaseComponent {
  static schema() {
    return Field.schema({
      type: 'activities',
      key: 'activities',
      input: false,
      hideLabel: true,
    });
  }

  static editForm() {
    return activitiesForm();
  }

  static get builderInfo() {
    return activitiesBuilder();
  }

  renderReact(element) {
    element.render(
      <>
        {this.getDiffTag()}
        <div>halla</div>
      </>,
    );
  }
}

export default Activities;
