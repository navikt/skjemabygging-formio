import htmlConverter, { HtmlAsJsonElement, HtmlAsJsonTextElement } from '../converters';
import StructuredHtml, { StructuredHtmlOptions } from './StructuredHtml';
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
    this.attributes = htmlElementJson.attributes;
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
    if (
      (options?.skipConversionWithin ?? ([] as string[])).includes(this.tagName) &&
      children.some((child) => StructuredHtmlElement.isElement(child))
    ) {
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
      let sourceChild = sourceChildren[sourceIndex];
      if (
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
      // If the target doesn't match on type or tagName, either the original element has been removed, or a new element has been placed before it.
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
    if (this.containsMarkdown && other.containsMarkdown) {
      return true;
    }
    let otherChildIndex = 0;
    this.children.forEach((child) => {
      if (other.children[otherChildIndex] && child.matches(other.children[otherChildIndex])) {
        otherChildIndex++;
      }
    });
    return otherChildIndex >= other.children.length;
  }

  get type(): 'Element' {
    return 'Element';
  }

  get innerText(): string {
    return (this.toHtmlElement() as HTMLElement).innerText;
  }

  get markdown(): string | undefined {
    return this.childrenAsMarkdown?.map((child) => child.textContent).join('');
  }

  get containsMarkdown(): boolean {
    return !!this.childrenAsMarkdown && ((this.options?.skipConversionWithin as string[]) ?? []).includes(this.tagName);
  }

  add(id: string, value: string) {
    if (id === this.id) {
      this.children.push(
        new StructuredHtmlText({ type: 'TextElement', textContent: value }, { parent: this }, this.converter),
      );
      return true;
    }
    let wasAdded = false;
    this.children.forEach((child) => {
      if (!wasAdded && StructuredHtml.isElement(child)) {
        wasAdded = child.add(id, value);
      }
    });
    return wasAdded;
  }

  updateAttributes(sourceAttributes: Array<[string, string]>) {
    const targetAttributeObjects = Object.fromEntries(this.attributes);
    sourceAttributes.forEach(([key, value]) => (targetAttributeObjects[key] = value));
    this.attributes = Object.entries(targetAttributeObjects);
  }

  populate(elementJson: HtmlAsJsonElement): StructuredHtmlElement | undefined {
    if (elementJson.id === this.id) {
      this.updateAttributes(elementJson.attributes);
      this.updateChildren(elementJson.children);
      this.childrenAsMarkdown = this.createMarkdownChildren(this.children, this.options);
      this.refresh();
      return this;
    }
  }

  updateInternal(id: string, value: string): StructuredHtmlElement | StructuredHtmlText | undefined {
    let newElementJson: HtmlAsJsonElement | undefined;
    if (this.id === id) {
      newElementJson = this.converter.markdown2Json(value);
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

  toJson(getMarkdown?: boolean): HtmlAsJsonElement {
    return {
      id: this.id,
      type: 'Element',
      tagName: this.tagName,
      attributes: this.attributes,
      children: (getMarkdown && this.containsMarkdown ? this.childrenAsMarkdown ?? [] : this.children).map((child) =>
        child.toJson(getMarkdown),
      ),
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
