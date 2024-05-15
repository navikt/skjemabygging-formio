import InnerHtml from '../../../../components/inner-html/InnerHtml';
import BaseComponent from '../../base/BaseComponent';
import htmlElementBuilder from './HtmlElement.builder';
import htmlElementForm from './HtmlElement.form';

class HtmlElement extends BaseComponent {
  static schema() {
    return BaseComponent.schema({
      type: 'htmlelement',
      key: 'htmlelement',
      tag: 'div',
      attrs: [],
      content: '',
      input: false,
      hideLabel: true,
      persistent: false,
    });
  }

  static editForm() {
    return htmlElementForm();
  }

  static get builderInfo() {
    return htmlElementBuilder();
  }

  getTag() {
    return this.component?.tag as string;
  }

  renderReact(element) {
    element.render(
      <div>
        {this.getTextDisplayTag()}
        {this.getDiffTag()}
        <InnerHtml tag={this.getTag()} content={this.getContent()} />
      </div>,
    );
  }
}

export default HtmlElement;
