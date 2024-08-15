import htmlConverter, { HtmlAsJsonTextElement } from '../converters';
import StructuredHtml, { StructuredHtmlOptions, ToJsonOptions } from './StructuredHtml';

class StructuredHtmlText extends StructuredHtml {
  textContent: string | null;
  isMarkdownText: boolean;

  constructor(input: string | HtmlAsJsonTextElement, options?: StructuredHtmlOptions, converter = htmlConverter) {
    super(input, options, converter);
    const inputValue = typeof input === 'string' ? input : input?.textContent;
    this.textContent = options?.withEmptyTextContent ? null : inputValue;
    this.isMarkdownText = !!options?.isMarkdownText;
  }

  get type(): 'TextElement' {
    return 'TextElement';
  }

  get innerText(): string {
    return this.textContent ?? '';
  }

  populate(value?: HtmlAsJsonTextElement) {
    if (value?.id && value.textContent) {
      this.textContent = value.textContent;
      this.refresh();
      return this;
    }
  }

  updateInternal(id: string, text: string): StructuredHtmlText | undefined {
    if (id === this.id) {
      return this.populate({ id, type: 'TextElement', textContent: text });
    }
  }

  matches(other: StructuredHtml | undefined) {
    return StructuredHtml.isText(other);
  }

  toJson({ noContent }: ToJsonOptions = {}): HtmlAsJsonTextElement {
    return {
      id: this.id,
      type: 'TextElement',
      textContent: noContent ? '' : this.textContent,
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
