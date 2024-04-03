import { AcceptedTag, HtmlAsJsonElement, HtmlAsJsonTextElement } from '../htmlAsJson';
import { fromElement, toNode } from './htmlNode';

const isHtmlString = (text: string) => /<[^>]*>/.test(text);

const htmlString2Json = (htmlString: string, skipConversionWithin: AcceptedTag[] = []): HtmlAsJsonElement => {
  const div = document.createElement('div');
  div.innerHTML = htmlString;
  return JSON.parse(JSON.stringify(fromElement(div, skipConversionWithin, true)));
};

const json2HtmlString = (jsonElement: HtmlAsJsonElement | HtmlAsJsonTextElement): string => {
  switch (jsonElement?.type) {
    case 'Element':
      const htmlElement = toNode(jsonElement) as HTMLElement;
      return jsonElement.isWrapper ? htmlElement.innerHTML.toString() : htmlElement.outerHTML.toString();
    case 'TextElement':
      // markDown2Json(jsonElement.textContent ?? '');
      // const asJson = markDown2Json(jsonElement.textContent ?? '', originalStructure);
      // console.log('AAA markDown2Json', asJson);
      // if (asJson.type === 'Element') {
      //   //TODO check that this is reached
      //   console.log('BBB');
      //   return json2HtmlString(asJson, originalStructure);
      // } else if (asJson.type === 'TextElement') {
      //   // console.log('json2HtmlString', asJson);
      //   //TODO check that this is reached
      //   console.log('CCC');
      //   return asJson.textContent ?? '';
      // }
      // //TODO check that this is reached
      // console.log('DDD');
      return jsonElement.textContent ?? '';
    default:
      throw Error('unsupported type: ' + (jsonElement as any)?.type);
  }
  // const node = toNode(jsonElement, translate);
  // if (!node['outerHTML']?.toString()) {
  //   console.log('NODE', node, node.outerHTML);
  // }
};

export { htmlString2Json, isHtmlString, json2HtmlString };
