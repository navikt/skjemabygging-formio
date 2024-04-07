import { HtmlAsJsonElement, HtmlAsJsonTextElement } from './htmlAsJson';
import htmlAsJsonUtils from './index';

abstract class HtmlObject {
  parent?: HtmlElement;
  converter: typeof htmlAsJsonUtils;
  originalHtmlString?: string;
  htmlJson: HtmlAsJsonElement | HtmlAsJsonTextElement;
  id: string;

  protected constructor(
    converter: typeof htmlAsJsonUtils,
    htmlString?: string,
    htmlJson?: HtmlAsJsonElement | HtmlAsJsonTextElement,
    parent?: HtmlElement,
  ) {
    this.parent = parent;
    this.converter = converter;
    this.originalHtmlString = htmlString;
    this.htmlJson = htmlJson ?? converter.htmlString2Json(htmlString!, ['H3', 'P', 'LI']); // FIXME: htmlString!
    this.id = this.htmlJson.id;
  }

  abstract get type(): 'Element' | 'TextElement';
  abstract getJson(): HtmlAsJsonElement | HtmlAsJsonTextElement;
  abstract getHtmlString(): string;

  static isElement(html: HtmlObject): html is HtmlElement {
    return html.type === 'Element';
  }

  static isTextElement(html: HtmlObject): html is HtmlTextElement {
    return html.type === 'TextElement';
  }

  getHtmlElement() {
    return this.converter.toNode(this.getJson());
  }
}

class HtmlElement extends HtmlObject {
  tagName: string;
  attributes: Array<[string, string]>;
  children: Array<HtmlObject>;
  // isWrapper is true if this is an outer wrapping div, which is used to support htmlStrings with multiple tags on the top level
  isWrapper: boolean;

  constructor(converter, htmlString?: string, htmlJson?: HtmlAsJsonElement, parent?: HtmlElement) {
    super(converter, htmlString, htmlJson, parent);
    const htmlElementJson = this.htmlJson as HtmlAsJsonElement; //Fixme
    this.tagName = htmlElementJson.tagName;
    this.attributes = htmlElementJson.attributes;
    this.isWrapper = htmlElementJson.isWrapper;
    this.children = htmlElementJson.children.map((childJson) => {
      if (childJson.type === 'Element') {
        return new HtmlElement(converter, undefined, childJson, this);
      } else if (childJson.type === 'TextElement') {
        return new HtmlTextElement(converter, undefined, childJson, this);
      }
      throw Error(`unsupported type: ${this.type}`);
    });
  }

  get type(): 'Element' {
    return 'Element';
  }

  getJson(): HtmlAsJsonElement {
    return {
      id: this.id,
      type: 'Element', //Fixme
      tagName: this.tagName!, // FIXME
      attributes: this.attributes!,
      children: this.children!.map((child) => child.getJson()),
      isWrapper: this.isWrapper!,
    };
  }

  getHtmlString(): string {
    if (this.isWrapper) {
      return (this.getHtmlElement() as HTMLElement).innerHTML.toString();
    }
    return (this.getHtmlElement() as HTMLElement).outerHTML.toString();
  }
}

class HtmlTextElement extends HtmlObject {
  textContent: string | null;

  constructor(
    converter: typeof htmlAsJsonUtils,
    htmlString?: string,
    htmlJson?: HtmlAsJsonElement | HtmlAsJsonTextElement,
    parent?: HtmlElement,
  ) {
    super(converter, htmlString, htmlJson, parent);
    this.textContent = (this.htmlJson as HtmlAsJsonTextElement).textContent; //Fixme
  }

  get type(): 'TextElement' {
    return 'TextElement';
  }

  getJson(): HtmlAsJsonTextElement {
    return {
      id: this.id,
      type: 'TextElement', //Fixme
      textContent: this.textContent,
    };
  }

  getHtmlElement() {
    return this.converter.toNode(this.getJson());
  }

  getHtmlString(): string {
    return this.textContent ?? '';
  }
}

export { HtmlObject, HtmlTextElement };
export default HtmlElement;
