import { v4 as uuid } from 'uuid';
import { AcceptedTag, HtmlAsJsonElement, HtmlAsJsonTextElement } from './htmlAsJson';
import htmlAsJsonUtils from './index';

type Options = {
  skipConversionWithin?: AcceptedTag[];
  isMarkdownText?: boolean;
};

abstract class HtmlObject {
  parent?: HtmlElement;
  converter: typeof htmlAsJsonUtils;
  originalHtmlString?: string;
  originalHtmlJson: HtmlAsJsonElement | HtmlAsJsonTextElement;
  id: string;
  options?: Options;

  protected constructor(
    converter: typeof htmlAsJsonUtils,
    htmlString?: string,
    htmlJson?: HtmlAsJsonElement | HtmlAsJsonTextElement,
    parent?: HtmlElement,
    options?: Options,
  ) {
    this.parent = parent;
    this.converter = converter;
    this.originalHtmlString = htmlString;
    this.originalHtmlJson = htmlJson ?? converter.htmlString2Json(htmlString!, ['H3', 'P', 'LI']); // FIXME: htmlString!
    this.id = this.originalHtmlJson.id ? this.originalHtmlJson.id : uuid();
    this.options = options;
  }

  abstract get type(): 'Element' | 'TextElement';
  abstract get innerText(): string;
  abstract clone(): HtmlElement | HtmlTextElement;
  abstract getJson(): HtmlAsJsonElement | HtmlAsJsonTextElement;
  abstract toHtmlString(): string;
  abstract findLeaf(id: string): HtmlTextElement | undefined;

  static isElement(html?: HtmlObject): html is HtmlElement {
    return !!html && html.type === 'Element';
  }

  static isTextElement(html?: HtmlObject): html is HtmlTextElement {
    return !!html && html.type === 'TextElement';
  }

  update(value?: HtmlAsJsonElement | HtmlAsJsonTextElement): HtmlObject | undefined {
    if (value) {
      this.originalHtmlJson = value;
      return this;
    }
  }

  getRoot(): HtmlObject {
    if (this.parent) {
      return this.parent.getRoot();
    }
    return this;
  }

  toHtmlElement() {
    return this.converter.toNode(this.getJson());
  }
}

class HtmlElement extends HtmlObject {
  tagName: string;
  attributes: Array<[string, string]>;
  children: HtmlObject[];
  childrenAsMarkdown?: HtmlTextElement[];
  // isWrapper is true if this is an outer wrapping div, which is used to support htmlStrings with multiple tags on the top level
  isWrapper: boolean;

  constructor(
    converter: typeof htmlAsJsonUtils,
    htmlString?: string,
    htmlJson?: HtmlAsJsonElement,
    parent?: HtmlElement,
    options?: Options,
  ) {
    super(converter, htmlString, htmlJson, parent, options);
    const htmlElementJson = this.originalHtmlJson as HtmlAsJsonElement; //Fixme
    this.tagName = htmlElementJson.tagName;
    this.attributes = htmlElementJson.attributes;
    this.isWrapper = htmlElementJson.isWrapper;
    this.children = this.createChildrenFromJson(htmlElementJson, options);
    this.childrenAsMarkdown = this.createMarkdownChildren(this.children, options?.skipConversionWithin);
  }

  private createChildrenFromJson(htmlElementJson: HtmlAsJsonElement, options?: Options) {
    return htmlElementJson.children.map((childJson) => {
      if (childJson.type === 'Element') {
        return new HtmlElement(this.converter, undefined, childJson, this, options);
      } else if (childJson.type === 'TextElement') {
        return new HtmlTextElement(this.converter, undefined, childJson, this, options);
      }
      throw Error(`unsupported type: ${this.type}`);
    });
  }

  private createMarkdownChildren(children: HtmlObject[], skipConversionWithin: string[] = []) {
    if (skipConversionWithin.includes(this.tagName)) {
      return children.map(
        (child) =>
          new HtmlTextElement(
            this.converter,
            undefined,
            {
              id: child.id,
              type: 'TextElement',
              textContent: this.converter.htmlNode2Markdown(child.toHtmlElement()),
            },
            this,
            { isMarkdownText: true },
          ),
      );
    }
  }

  get type(): 'Element' {
    return 'Element';
  }

  get markdown(): string | undefined {
    return this.childrenAsMarkdown?.map((child) => child.textContent).join('');
  }

  get containsMarkdown(): boolean {
    return !!this.childrenAsMarkdown;
  }

  updateAttributes(sourceAttributes: Array<[string, string]>) {
    const targetAttributeObjects = Object.fromEntries(this.attributes);
    sourceAttributes.forEach(([key, value]) => (targetAttributeObjects[key] = value));
    this.attributes = Object.entries(targetAttributeObjects);
  }

  updateChildren(sourceChildren: Array<HtmlAsJsonElement | HtmlAsJsonTextElement>) {
    let sourceIndex = 0;
    this.children = this.children.reduce((acc: HtmlObject[], child: HtmlObject): HtmlObject[] => {
      const result = child.update(sourceChildren[sourceIndex]);
      if (result) {
        sourceIndex += 1;
        return [...acc, result];
      }
      // If the target doesn't match on type or tagName, either the original element has been removed, or a new element has been placed before it
      // we assume that it was removed, but reconstructs it in the while loop below if that was not the case
      return acc;
    }, []);

    // if there are still leftovers in the sourceChild array, something did not match up or new elements have been added
    // either way, leftovers are constructed as new objects
    while (sourceIndex < sourceChildren.length) {
      const newChildJson = sourceChildren[sourceIndex];
      const newChild =
        newChildJson.type === 'Element'
          ? new HtmlElement(this.converter, undefined, newChildJson, this)
          : new HtmlTextElement(this.converter, undefined, newChildJson, this);
      this.children = [...this.children, newChild];
    }
    return this;
  }
  update(value?: HtmlAsJsonElement | HtmlAsJsonTextElement): HtmlElement | undefined {
    // TODO: must update json and htmlElement
    if (value?.type !== 'Element' || value?.tagName !== this.tagName) {
      return;
    }
    super.update(value);
    this.updateAttributes(value.attributes);
    this.updateChildren(value.children);
    return this;
  }

  updateMarkdown(value: string) {}

  clone(): HtmlElement {
    return new HtmlElement(this.converter, this.originalHtmlString, this.getJson(), this.parent, this.options);
  }

  findChild(id: string) {
    return this.children.find((child) => child.id === id);
  }

  findLeaf(id: string): HtmlTextElement | undefined {
    for (const child of this.children) {
      const leaf = child.findLeaf(id);
      if (leaf) return leaf;
    }
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

  toHtmlString(): string {
    if (this.isWrapper) {
      return (this.toHtmlElement() as HTMLElement).innerHTML.toString();
    }
    return (this.toHtmlElement() as HTMLElement).outerHTML.toString();
  }

  get innerText(): string {
    return (this.toHtmlElement() as HTMLElement).innerText;
  }
}

class HtmlTextElement extends HtmlObject {
  textContent: string | null;
  isMarkdownText: boolean;

  constructor(
    converter: typeof htmlAsJsonUtils,
    htmlString?: string,
    htmlJson?: HtmlAsJsonElement | HtmlAsJsonTextElement,
    parent?: HtmlElement,
    options?: Options,
  ) {
    super(converter, htmlString, htmlJson, parent, options);
    this.textContent = (this.originalHtmlJson as HtmlAsJsonTextElement).textContent; //Fixme
    this.isMarkdownText = !!options?.isMarkdownText;
  }

  get type(): 'TextElement' {
    return 'TextElement';
  }

  update(value?: HtmlAsJsonTextElement | HtmlAsJsonElement): HtmlTextElement | undefined {
    if (value?.type !== 'TextElement') {
      return;
    }
    this.textContent = value.textContent;
    return this;
  }

  clone(): HtmlTextElement {
    return new HtmlTextElement(this.converter, this.originalHtmlString, this.getJson(), this.parent, this.options);
  }

  findLeaf(id: string): HtmlTextElement | undefined {
    if (this.id === id) {
      return this;
    }
  }

  getJson(): HtmlAsJsonTextElement {
    return {
      id: this.id,
      type: 'TextElement', //Fixme
      textContent: this.textContent,
    };
  }

  toHtmlElement() {
    return this.converter.toNode(this.getJson());
  }

  toHtmlString(): string {
    return this.textContent ?? '';
  }

  get innerText(): string {
    return this.textContent ?? '';
  }
}

export { HtmlObject, HtmlTextElement };
export default HtmlElement;
