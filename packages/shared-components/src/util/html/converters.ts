interface HtmlAsJsonTextElement {
  id: string;
  type: 'TextElement';
  textContent: string | null;
  // If textContent is a result of several elements being combined, e.g. as markdown, htmlContentAsJson wil store the generated html structure for structural memory
  htmlContentAsJson?: Array<HtmlAsJsonElement | HtmlAsJsonTextElement>;
}

const acceptedTags = ['P', 'H3', 'LI', 'OL', 'UL', 'A', 'B', 'STRONG'];
type AcceptedTag = (typeof acceptedTags)[number];
interface HtmlAsJsonElement {
  id: string;
  type: 'Element';
  tagName: string;
  attributes: Array<[string, string]>;
  children: Array<HtmlAsJsonElement | HtmlAsJsonTextElement>;
  // Used to keep track of wrapping div, which is used to support htmlStrings with multiple tags on the top level
  isWrapper: boolean;
}

const htmlString2Json = (htmlString: string, skipConversionWithin: AcceptedTag[] = []): HtmlAsJsonElement => {
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  return JSON.parse(JSON.stringify(jsonFromElement(div, skipConversionWithin, true)));
};

const fromNode = (node: ChildNode, skipConversionWithin: AcceptedTag[]): HtmlAsJsonElement | HtmlAsJsonTextElement => {
  if (node?.nodeType === Node.TEXT_NODE && node.textContent) {
    return jsonFromTextContent(node.textContent);
  } else if (node?.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    if (acceptedTags.includes(element.tagName)) {
      return jsonFromElement(element, skipConversionWithin);
    }
    return jsonFromTextContent(json2HtmlString(jsonFromElement(element, skipConversionWithin)));
  }
  throw Error(`unsupported nodeType: ${node.nodeType}`);
};

const jsonFromTextContent = (textContent: string, parentElement?: Element): HtmlAsJsonTextElement => {
  const htmlContentAsJson = parentElement
    ? Array.from(parentElement.childNodes, (childNode) => fromNode(childNode, []))
    : undefined;
  return {
    id: textContent.replaceAll(' ', ''),
    type: 'TextElement',
    textContent,
    htmlContentAsJson,
  };
};

const jsonFromElement = (
  element: Element,
  skipConversionWithinTags: AcceptedTag[],
  isWrapper?: boolean,
): HtmlAsJsonElement => {
  const convertChildrenToText = (skipConversionWithinTags as string[]).includes(element.tagName);
  return {
    id: element.textContent!.replaceAll(' ', ''),
    type: 'Element',
    tagName: element.tagName,
    attributes: Array.from(element.attributes, ({ name, value }) => [name, value]),
    isWrapper,
    children: convertChildrenToText
      ? [jsonFromTextContent(Array.from(element.childNodes, htmlNode2MarkDown).join(''), element)]
      : Array.from(element.childNodes, (childNode) => fromNode(childNode, skipConversionWithinTags)),
  };
};

const json2HtmlString = (
  jsonElement: HtmlAsJsonElement | HtmlAsJsonTextElement,
  originalStructure: HtmlAsJsonTextElement,
) => {
  // console.log('json2HtmlString', jsonElement);
  switch (jsonElement?.type) {
    case 'Element':
      const htmlElement = toNode(jsonElement) as HTMLElement;
      return jsonElement.isWrapper ? htmlElement.innerHTML.toString() : htmlElement.outerHTML.toString();
    case 'TextElement':
      // markDown2Json(jsonElement.textContent ?? '');
      const asJson = markDown2Json(jsonElement.textContent ?? '', originalStructure);
      console.log('markDown2Json', asJson);
      if (asJson.type === 'Element') {
        //TODO check that this is reached
        return json2HtmlString(asJson, originalStructure);
      } else if (asJson.type === 'TextElement') {
        // console.log('json2HtmlString', asJson);
        //TODO check that this is reached
        return asJson.textContent ?? '';
      }
      //TODO check that this is reached
      return jsonElement.textContent ?? '';
    default:
      throw Error('unsupported type: ' + (jsonElement as any)?.type);
  }
  // const node = toNode(jsonElement, translate);
  // if (!node['outerHTML']?.toString()) {
  //   console.log('NODE', node, node.outerHTML);
  // }
};

const toNode = (jsonElement: HtmlAsJsonElement | HtmlAsJsonTextElement) => {
  switch (jsonElement?.type) {
    case 'Element':
      return HtmlNode(jsonElement.tagName, jsonElement.attributes, jsonElement.children);
    case 'TextElement':
      return TextNode(jsonElement.textContent);
    default:
      throw Error('unsupported type: ' + (jsonElement as any)?.type);
  }
};

const TextNode = (text: string | null) => {
  return document.createTextNode(text ?? '');
};

const HtmlNode = (
  tagName: string,
  attributes: Array<[string, string]> = [],
  children: Array<HtmlAsJsonElement | HtmlAsJsonTextElement> = [],
) => {
  // console.log('HtmlNode', ...children);
  const htmlElement = document.createElement(tagName);
  for (const [k, v] of attributes) htmlElement.setAttribute(k, v);
  for (const child of children) htmlElement.appendChild(toNode(child));
  // console.log('htmlElement', htmlElement);
  return htmlElement;
};

const markDown2Json = (
  markDown: string,
  original: HtmlAsJsonTextElement,
): HtmlAsJsonElement | HtmlAsJsonTextElement => {
  const markDownLinkRegex = /\[[^[]+\]\([^[]+\)/gm;
  const captureRegex = /\[([^[]+)\]\(([^[]+)\)/;
  const matches = markDown.match(markDownLinkRegex);

  if (matches) {
    // console.log('markDown2Json original', original);
    let htmlString = markDown;
    matches.forEach((match, index) => {
      const captures = captureRegex.exec(match);
      // console.log('captures', { captureRegex, match, captures });
      if (captures) {
        const text = captures[1];
        const url = captures[2];
        // console.log('replace', { htmlString, match });
        //TODO base a-tag-conversion on original
        htmlString = htmlString.replace(match, `<a href=${url}>${text}</a>`);

        // console.log('text, url, html', { text, url, htmlString });
      }
    });
    // console.log('Final htmlString');
    const asJson = htmlString2Json(htmlString);
    // console.log('markDown2Json asJson', asJson);

    return htmlString2Json(htmlString);
    // return json2HtmlString(htmlString2Json(htmlString));
  }
  return { ...original, textContent: markDown };
};

const htmlNode2MarkDown = (node: Element | ChildNode): string => {
  if (node.nodeType === Node.TEXT_NODE) {
    return node.textContent ?? '';
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    const element = node as Element;
    switch (element.tagName) {
      case 'P':
      case 'H3':
      case 'OL':
      case 'UL':
      case 'LI':
        // console.log(element.tagName, element.childNodes);
        return Array.from(element.childNodes, htmlNode2MarkDown).join('');
      case 'STRONG':
      case 'B':
        return `**${Array.from(element.childNodes, htmlNode2MarkDown).join('')}**`;
      case 'A':
        return `[${Array.from(element.childNodes, htmlNode2MarkDown).join('')}](${element.getAttribute('href')})`;
      default:
        return json2HtmlString(fromNode(element, []));
    }
  }
  return '';
};

// const json2MarkDown = (element: HtmlAsJsonElement | HtmlAsJsonTextElement): string => {
//   if (element.type === 'TextElement') {
//     return element.textContent ?? '';
//   }
//   switch (element.tagName) {
//     case 'P':
//     case 'LI':
//     case 'H3':
//       // console.log(element.tagName, element.children);
//       return element.children.map(json2MarkDown).join('');
//     case 'STRONG':
//     case 'B':
//       return `**${element.children.map(json2MarkDown).join('')}**`;
//     default:
//       return json2HtmlString(element);
//   }
// };

export { htmlString2Json, json2HtmlString, markDown2Json };
export type { HtmlAsJsonElement, HtmlAsJsonTextElement };
