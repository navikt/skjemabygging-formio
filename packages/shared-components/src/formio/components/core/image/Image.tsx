import InnerHtml from '../../../../components/inner-html/InnerHtml';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import BuilderTags from '../../base/components/BuilderTags';
import imageBuilder from './Image.builder';
import imageForm from './Image.form';

export class Image extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
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

  getWidth = () => {
    if (!this.component?.widthPercent || +this.component?.widthPercent > 100) {
      return '100%';
    }
    return this.component?.widthPercent + '%';
  };

  renderReact(element) {
    if (this.component?.image?.length > 0) {
      element.render(
        <ComponentUtilsProvider component={this}>
          <BuilderTags component={this.component} editFields={this.getEditFields()} />
          <div id={this.getId()}>
            <img
              className="img-component"
              src={this.component?.image[0].url}
              style={{ width: this.getWidth() }}
              alt={this.component?.altText}
            />
            {this.component?.description && (
              <InnerHtml content={this.translate(this.component?.description)} className="img-description" />
            )}
          </div>
        </ComponentUtilsProvider>,
      );
    }
  }
}

export default Image;
