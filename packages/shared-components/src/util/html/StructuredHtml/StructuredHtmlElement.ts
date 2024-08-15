import htmlConverter, { HtmlAsJsonElement, HtmlAsJsonTextElement } from '../converters';
import StructuredHtml, { StructuredHtmlOptions, ToJsonOptions } from './StructuredHtml';
import StructuredHtmlText from './StructuredHtmlText';

class StructuredHtmlElement extends StructuredHtml {
  tagName: string;
  attributes: Array<[string, string]>;
  children: StructuredHtml[];
  childrenAsMarkdown?: StructuredHtmlText[];

  constructor(input: string | HtmlAsJsonElement, options?: StructuredHtmlOptions, converter = htmlConverter) {
    super(input, options, converter);
    const htmlElementJson = this.originalHtmlJson as HtmlAsJsonElement;
    this.tagName = htmlElementJson.tagName;
    this.attributes = htmlElementJson.attributes.filter(
      ([key, _]) => !(options?.withEmptyTextContent && key === 'href'),
    );
    this.children = this.createChildrenFromJson(htmlElementJson, options);
    this.childrenAsMarkdown = this.createMarkdownChildren(this.children, options);
  }

  private createChildrenFromJson(htmlElementJson: HtmlAsJsonElement, options?: StructuredHtmlOptions) {
    return htmlElementJson.children.map((childJson) => {
      if (childJson.type === 'Element') {
        return new StructuredHtmlElement(childJson, { ...options, parent: this });
      } else if (childJson.type === 'TextElement') {
        return new StructuredHtmlText(childJson, { ...options, parent: this });
      }
      throw Error(`unsupported type: ${this.type}`);
    });
  }

  private createMarkdownChildren(children: StructuredHtml[], options?: StructuredHtmlOptions) {
    if ((options?.skipConversionWithin ?? ([] as string[])).includes(this.tagName)) {
      return children.map(
        (child) =>
          new StructuredHtmlText(
            {
              id: child.id,
              type: 'TextElement',
              textContent: options?.withEmptyTextContent
                ? null
                : this.converter.htmlNode2Markdown(child.toHtmlElement()),
            },
            { parent: this, isMarkdownText: true },
          ),
      );
    }
  }

  private updateChildren(sourceChildren: Array<HtmlAsJsonElement | HtmlAsJsonTextElement>) {
    let sourceIndex = 0;
    this.children = this.children.reduce((acc: StructuredHtml[], child: StructuredHtml): StructuredHtml[] => {
      let sourceChild: HtmlAsJsonElement | HtmlAsJsonTextElement | undefined = sourceChildren[sourceIndex];
      if (
        sourceChild &&
        !sourceChild.id &&
        sourceChild.type === child.type &&
        (sourceChild.type === 'TextElement' || sourceChild.tagName === (child as StructuredHtmlElement).tagName)
      ) {
        sourceChild = { ...sourceChild, id: child.id };
      }
      const result = child.populate(sourceChild);
      if (result) {
        sourceIndex += 1;
        return [...acc, result];
      }
      // If the target and source doesn't match, either the original element has been removed, or a new element has been placed before it.
      // We assume that it was removed, but reconstructs any remaining source elements below
      return acc;
    }, []);

    // if there are still leftovers in the sourceChild array, something did not match up or new elements have been added
    // either way, leftovers are constructed as new objects
    while (sourceIndex < sourceChildren.length) {
      const newChildJson = sourceChildren[sourceIndex];
      const newChild =
        newChildJson.type === 'Element'
          ? new StructuredHtmlElement(newChildJson, { parent: this })
          : new StructuredHtmlText(newChildJson, { parent: this });
      this.children = [...this.children, newChild];
      sourceIndex += 1;
    }
    return this;
  }

  private matchesChildren(other: StructuredHtmlElement) {
    const thisElementChildren = this.children.filter(StructuredHtml.isElement);
    const othersElementChildren = other.children.filter(StructuredHtml.isElement);

    // if this contains markdown it matches the other element if the following is true:
    // - if other has elements as children they must have been converted to markdown
    if (this.containsMarkdown && (other.containsMarkdown || othersElementChildren.length === 0)) {
      return true;
    }

    // it matches other if the following is true:
    // - must have the same amount or fewer children in total
    // - must have the same amount of element children
    // - each element child must match other's corresponding element child, in sequential order
    return (
      this.children.length >= other.children.length &&
      thisElementChildren.length === othersElementChildren.length &&
      thisElementChildren.every((child, index) => child.matches(othersElementChildren[index]))
    );
  }

  get type(): 'Element' {
    return 'Element';
  }

  get innerText(): string {
    return this.children.map((child) => child.innerText).join('');
  }

  get markdown(): string | undefined {
    return this.childrenAsMarkdown?.map((child) => child.textContent).join('');
  }

  get containsMarkdown(): boolean {
    return !!this.childrenAsMarkdown && ((this.options?.skipConversionWithin as string[]) ?? []).includes(this.tagName);
  }

  updateAttributes(sourceAttributes: Array<[string, string]>) {
    const targetAttributeObjects = Object.fromEntries(this.attributes);
    sourceAttributes.forEach(([key, value]) => (targetAttributeObjects[key] = value));
    this.attributes = Object.entries(targetAttributeObjects);
  }

  populate(elementJson?: HtmlAsJsonElement): StructuredHtmlElement | undefined {
    if (elementJson?.id === this.id) {
      this.updateAttributes(elementJson.attributes);
      this.updateChildren(elementJson.children);
      this.childrenAsMarkdown = this.createMarkdownChildren(this.children, this.options);
      this.refresh();
      return this;
    }
  }

  updateInternal(
    id: string,
    value: string | HtmlAsJsonElement,
  ): StructuredHtmlElement | StructuredHtmlText | undefined {
    let newElementJson: HtmlAsJsonElement | undefined;
    if (this.id === id) {
      newElementJson = typeof value === 'string' ? this.converter.markdown2Json(value) : value;
      return this.populate({ ...this, children: newElementJson.children });
    }

    let found: StructuredHtmlElement | StructuredHtmlText | undefined;
    for (const child of this.children) {
      const updateResult = child.updateInternal(id, value);
      found = updateResult ? updateResult : undefined;
    }
    return found;
  }

  matches(other: StructuredHtml | undefined) {
    if (StructuredHtml.isElement(other) && other.tagName === this.tagName) {
      return this.matchesChildren(other);
    }
    return false;
  }

  toJson(options: ToJsonOptions = {}): HtmlAsJsonElement {
    const markdown = options.getMarkdown && this.containsMarkdown ? this.markdown : undefined;
    const children = markdown
      ? [new StructuredHtmlText(markdown, { isMarkdownText: true, withEmptyTextContent: !!options.noTextContent })]
      : this.children;

    return {
      id: this.id,
      type: 'Element',
      tagName: this.tagName,
      attributes: this.attributes.filter(([key, _]) => !(options.noTextContent && key === 'href')),
      children: children.map((child: StructuredHtml) => child.toJson(options)),
    };
  }

  toHtmlString(): string {
    if (!this.parent) {
      return (this.toHtmlElement() as HTMLElement).innerHTML.toString();
    }
    return (this.toHtmlElement() as HTMLElement).outerHTML.toString();
  }
}

export default StructuredHtmlElement;
