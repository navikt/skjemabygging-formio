import FormioHTMLElement from 'formiojs/components/html/HTML';
import htmlElementForm from './HtmlElement.form';

class HtmlElement extends FormioHTMLElement {
  // TODO: When rewriting HTMLElement change tag from p to div.
  static schema() {
    return super.schema();
  }

  static editForm() {
    return htmlElementForm();
  }
}

FormioHTMLElement.prototype.addNavClassNames = (text) =>
  text.replace(/<h3/g, "<h3 class='typo-undertittel'").replace(/<a/g, "<a class='lenke'");

export default HtmlElement;
