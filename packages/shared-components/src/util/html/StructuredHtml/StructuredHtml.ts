import { v4 as uuid } from 'uuid';
import htmlConverter, { HtmlAsJsonElement, HtmlAsJsonTextElement } from '../converters';
import { AcceptedTag } from '../converters/htmlAsJson';
import StructuredHtmlElement from './StructuredHtmlElement';
import StructuredHtmlText from './StructuredHtmlText';

type StructuredHtmlOptions = {
  parent?: StructuredHtmlElement;
  skipConversionWithin?: AcceptedTag[];
  isMarkdownText?: boolean;
  withEmptyTextContent?: boolean;
};

abstract class StructuredHtml {
  parent?: StructuredHtmlElement;
  converter: typeof htmlConverter;
  originalHtmlString?: string;
  originalHtmlJson: HtmlAsJsonElement | HtmlAsJsonTextElement;
  id: string;
  internalOptions?: StructuredHtmlOptions;

  protected constructor(
    input: string | HtmlAsJsonElement | HtmlAsJsonTextElement,
    options: StructuredHtmlOptions = {},
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
    const { parent, withEmptyTextContent, ...storedOptions } = options;
    this.internalOptions = storedOptions;
  }

  abstract get type(): 'Element' | 'TextElement';
  abstract get innerText(): string;
  get options(): StructuredHtmlOptions {
    const { parent, withEmptyTextContent, ...publicOptions } = this.internalOptions ?? {};
    return publicOptions;
  }
  abstract populate(
    value: HtmlAsJsonElement | HtmlAsJsonTextElement | undefined,
  ): StructuredHtmlElement | StructuredHtmlText | undefined;
  abstract updateInternal(
    id: string,
    value: string | HtmlAsJsonElement,
  ): StructuredHtmlElement | StructuredHtmlText | undefined;
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

  findChild(id: string): StructuredHtml | undefined {
    if (id === this.id) {
      return this;
    }
    let found: StructuredHtml | undefined;
    if (StructuredHtml.isElement(this)) {
      for (const child of this.children) {
        found = found || child.findChild(id);
        if (found) break;
      }
    }
    return found;
  }

  update(id: string, value: string | HtmlAsJsonElement): StructuredHtmlElement | StructuredHtmlText | undefined {
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
