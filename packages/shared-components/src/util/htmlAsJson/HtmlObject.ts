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
    this.originalHtmlJson = htmlJson ?? converter.htmlString2Json(htmlString!, options?.skipConversionWithin); // FIXME: htmlString!
    this.id = this.originalHtmlJson.id ? this.originalHtmlJson.id : uuid();
    this.options = options;
  }

  abstract get type(): 'Element' | 'TextElement';
  abstract get innerText(): string;
  abstract updateInternal(id: string, value: string): HtmlElement | HtmlTextElement | undefined;
  abstract populate(value: HtmlAsJsonElement | HtmlAsJsonTextElement): HtmlElement | HtmlTextElement | undefined;
  abstract getJson(): HtmlAsJsonElement | HtmlAsJsonTextElement;
  abstract toHtmlString(): string;

  static isElement(html?: HtmlObject): html is HtmlElement {
    return !!html && html.type === 'Element';
  }

  static isTextElement(html?: HtmlObject): html is HtmlTextElement {
    return !!html && html.type === 'TextElement';
  }

  update(id: string, value: string): HtmlElement | HtmlTextElement | undefined {
    if (this.parent) {
      return this.getRoot().update(id, value) as HtmlElement | undefined;
    }
    return this.updateInternal(id, value);
  }

  refresh(): HtmlObject {
    this.originalHtmlJson = this.getJson();
    return this;
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
    if (skipConversionWithin.includes(this.tagName) && children.some((child) => HtmlElement.isElement(child))) {
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

  private updateChildren(sourceChildren: Array<HtmlAsJsonElement | HtmlAsJsonTextElement>) {
    let sourceIndex = 0;
    this.children = this.children.reduce((acc: HtmlObject[], child: HtmlObject): HtmlObject[] => {
      const result = child.populate(sourceChildren[sourceIndex]);
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

  populate(elementJson: HtmlAsJsonElement): HtmlElement {
    this.updateAttributes(elementJson.attributes);
    this.updateChildren(elementJson.children);
    this.childrenAsMarkdown = this.createMarkdownChildren(this.children, this.options?.skipConversionWithin);
    this.refresh();
    return this;
  }

  updateInternal(id: string, value: string): HtmlElement | undefined {
    let newElementJson: HtmlAsJsonElement | undefined;
    if (this.id === id) {
      newElementJson = this.converter.markdown2Json(value);
      if (newElementJson?.tagName !== this.tagName) {
        throw Error(`Can't update. Given value "${value}" is not compatible with element with id ${this.id}.`);
      }
      return this.populate(newElementJson);
    }
    let found;
    for (const child of this.children) {
      const updateResult = child.updateInternal(id, value);
      found = updateResult ? updateResult : undefined;
    }
    return found;
  }

  getJson(): HtmlAsJsonElement {
    return {
      id: this.id,
      type: 'Element', //Fixme
      tagName: this.tagName!, // FIXME
      attributes: this.attributes!,
      children: this.children!.map((child) => child.getJson()),
      isWrapper: !this.parent,
    };
  }

  toHtmlString(): string {
    if (!this.parent) {
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

  updateInternal(id: string, text: string): HtmlTextElement | undefined {
    if (id === this.id) {
      this.textContent = text;
      this.refresh();
      return this;
    }
  }

  populate(value: HtmlAsJsonTextElement) {
    if (value.id && value.textContent) {
      return this.updateInternal(value.id, value.textContent);
    }
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
