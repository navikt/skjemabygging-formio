import InnerHtml from '../../../../components/inner-html/InnerHtml';
import { ComponentUtilsProvider } from '../../../../context/component/componentUtilsContext';
import BaseComponent from '../../base/BaseComponent';
import DiffTag from '../../base/components/DiffTag';
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
        <div>
          <TextDisplayTag component={this.component} />
          <DiffTag component={this.component} editFields={this.getEditFields()} />
          <InnerHtml tag={this.getTag()} content={this.getContent()} />
        </div>
      </ComponentUtilsProvider>,
    );
  }
}

export default HtmlElement;
