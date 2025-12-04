import InnerHtml from '../../../../components/inner-html/InnerHtml';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import AdditionalDescription from '../../base/components/AdditionalDescription';
import BuilderTags from '../../base/components/BuilderTags';
import TextDisplayTag from '../../base/components/TextDisplayTag';
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
      <ComponentUtilsProvider component={this}>
        <TextDisplayTag component={this.component} />
        <BuilderTags component={this.component} parent={this.parent} editFields={this.getEditFields()} />
        <InnerHtml tag={this.getTag()} content={this.getContent()} />
        <AdditionalDescription component={this.component} />
      </ComponentUtilsProvider>,
    );
  }
}

export default HtmlElement;
