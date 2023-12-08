import FormioHTMLElement from 'formiojs/components/html/HTML';
import htmlElementForm from './HTMLElement.form';

class HTMLElement extends FormioHTMLElement {
  static editForm() {
    return htmlElementForm();
  }
}

FormioHTMLElement.prototype.addNavClassNames = (text) =>
  text.replace(/<h3/g, "<h3 class='typo-undertittel'").replace(/<a/g, "<a class='lenke'");

export default HTMLElement;
