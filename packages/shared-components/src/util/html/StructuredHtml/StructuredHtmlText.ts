import htmlConverter, { HtmlAsJsonTextElement } from '../converters';
import StructuredHtml, { StructuredHtmlOptions } from './StructuredHtml';

class StructuredHtmlText extends StructuredHtml {
  textContent: string | null;
  isMarkdownText: boolean;

  constructor(input: string | HtmlAsJsonTextElement, options?: StructuredHtmlOptions, converter = htmlConverter) {
    super(input, options, converter);
    this.textContent = (this.originalHtmlJson as HtmlAsJsonTextElement).textContent;
    this.isMarkdownText = !!options?.isMarkdownText;
  }

  get type(): 'TextElement' {
    return 'TextElement';
  }

  get innerText(): string {
    return this.textContent ?? '';
  }

  populate(value: HtmlAsJsonTextElement) {
    if (value.id && value.textContent) {
      return this.updateInternal(value.id, value.textContent);
    }
  }

  //TODO: switch content of updateInternal and populates
  updateInternal(id: string, text: string): StructuredHtmlText | undefined {
    if (id === this.id) {
      this.textContent = text;
      this.refresh();
      return this;
    }
  }

  matches(other: StructuredHtml | undefined) {
    return StructuredHtml.isText(other);
  }

  toJson(): HtmlAsJsonTextElement {
    return {
      id: this.id,
      type: 'TextElement',
      textContent: this.textContent,
    };
  }

  toHtmlElement() {
    return this.converter.toNode(this.toJson());
  }

  toHtmlString(): string {
    return this.textContent ?? '';
  }
}

export default StructuredHtmlText;
