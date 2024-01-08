import Component from 'formiojs/components/_classes/component/Component';
import imageBuilder from './Image.builder';
import imageForm from './Image.form';

export default class Image extends Component {
  static schema() {
    return Component.schema({
      label: 'Bilde',
      type: 'image',
      key: 'image',
      input: false,
    });
  }

  static editForm() {
    return imageForm();
  }

  static get builderInfo() {
    return imageBuilder();
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
      // @ts-ignore
      this.renderTemplate('image', {
        // @ts-ignore
        component: this.component,
      }),
    );
  }
}
