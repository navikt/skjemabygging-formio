import { v4 as uuid } from 'uuid';
import htmlConverter, { HtmlAsJsonElement, HtmlAsJsonTextElement } from '../converters';
import { AcceptedTag } from '../converters/htmlAsJson';
import StructuredHtmlElement from './StructuredHtmlElement';
import StructuredHtmlText from './StructuredHtmlText';

type StructuredHtmlOptions = {
  parent?: StructuredHtmlElement;
  skipConversionWithin?: AcceptedTag[];
  isMarkdownText?: boolean;
};

abstract class StructuredHtml {
  parent?: StructuredHtmlElement;
  converter: typeof htmlConverter;
  originalHtmlString?: string;
  originalHtmlJson: HtmlAsJsonElement | HtmlAsJsonTextElement;
  id: string;
  options?: StructuredHtmlOptions;

  protected constructor(
    input: string | HtmlAsJsonElement | HtmlAsJsonTextElement,
    options?: StructuredHtmlOptions,
    converter = htmlConverter,
  ) {
    this.parent = options?.parent;
    this.converter = converter;
    if (typeof input === 'string') {
      this.originalHtmlString = input;
      this.originalHtmlJson = converter.htmlString2Json(input);
    } else {
      this.originalHtmlJson = input;
    }
    this.id = this.originalHtmlJson.id ? this.originalHtmlJson.id : uuid();
    this.options = options;
  }

  abstract get type(): 'Element' | 'TextElement';
  abstract get innerText(): string;
  abstract populate(
    value: HtmlAsJsonElement | HtmlAsJsonTextElement,
  ): StructuredHtmlElement | StructuredHtmlText | undefined;
  abstract updateInternal(id: string, value: string): StructuredHtmlElement | StructuredHtmlText | undefined;
  abstract matches(other: StructuredHtml | undefined): boolean;
  abstract toJson(getMarkdown?: boolean): HtmlAsJsonElement | HtmlAsJsonTextElement;
  abstract toHtmlString(): string;

  static isElement(html?: StructuredHtml): html is StructuredHtmlElement {
    return !!html && html.type === 'Element';
  }

  static isText(html?: StructuredHtml): html is StructuredHtmlText {
    return !!html && html.type === 'TextElement';
  }

  getRoot(): StructuredHtml {
    if (this.parent) {
      return this.parent.getRoot();
    }
    return this;
  }

  update(id: string, value: string): StructuredHtmlElement | StructuredHtmlText | undefined {
    if (this.parent) {
      return this.getRoot().update(id, value) as StructuredHtmlElement | undefined;
    }
    return this.updateInternal(id, value);
  }

  refresh(): StructuredHtml {
    this.originalHtmlJson = this.toJson();
    return this;
  }

  toHtmlElement() {
    return this.converter.toNode(this.toJson());
  }
}

export type { StructuredHtmlOptions };
export default StructuredHtml;
