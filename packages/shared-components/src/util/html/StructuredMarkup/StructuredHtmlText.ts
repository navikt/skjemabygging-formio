import htmlAsJsonUtils, { HtmlAsJsonElement, HtmlAsJsonTextElement } from '../../htmlAsJson';
import StructuredHtml, { StructuredHtmlOptions } from './StructuredHtml';
import StructuredHtmlElement from './StructuredHtmlElement';

class StructuredHtmlText extends StructuredHtml {
  textContent: string | null;
  isMarkdownText: boolean;

  constructor(
    converter: typeof htmlAsJsonUtils,
    htmlString?: string,
    htmlJson?: HtmlAsJsonElement | HtmlAsJsonTextElement,
    parent?: StructuredHtmlElement,
    options?: StructuredHtmlOptions,
  ) {
    super(converter, htmlString, htmlJson, parent, options);
    this.textContent = (this.originalHtmlJson as HtmlAsJsonTextElement).textContent; //Fixme
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

  toJson(): HtmlAsJsonTextElement {
    return {
      id: this.id,
      type: 'TextElement', //Fixme
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
