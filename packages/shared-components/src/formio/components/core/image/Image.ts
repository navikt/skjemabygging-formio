// @ts-nocheck
import Component from 'formiojs/components/_classes/component/Component';

import FormBuilderOptions from '../../../form-builder-options';
import imageForm from './Image.form';

export default class Image extends Component {
  static schema(...extend) {
    return Component.schema(
      {
        ...FormBuilderOptions.builder.basic.components.image.schema,
      },
      ...extend,
    );
  }

  static editForm() {
    return imageForm();
  }

  static get builderInfo() {
    return FormBuilderOptions.builder.basic.components.image;
  }

  get defaultSchema() {
    return Image.schema();
  }

  handleWidth = (imgSize) => {
    if (imgSize > 100) {
      return '100%';
    }
    return imgSize + '%';
  };

  render() {
    return super.render(
      this.renderTemplate('image', {
        component: this.component,
      }),
    );
  }
}
