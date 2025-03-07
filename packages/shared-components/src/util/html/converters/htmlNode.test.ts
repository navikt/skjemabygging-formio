import { fromNode, toNode } from './htmlNode';
import { ElementNode, TextNode, jsonElement, jsonTextElement } from './test/testUtils';

describe('htmlNode', () => {
  describe('toNode', () => {
    it('generates a text element when json has type TextElement', () => {
      const htmlElement = toNode(jsonTextElement('Hello world'));
      expect(htmlElement.nodeType).toBe(Node.TEXT_NODE);
      expect(htmlElement.textContent).toBe('Hello world');
    });

    it('generates a html element when json has type Element', () => {
      const htmlElement = toNode(jsonElement('P', [jsonTextElement('Hello world')]));
      expect(htmlElement.nodeType).toBe(Node.ELEMENT_NODE);
      expect(htmlElement.nodeName).toBe('P');
      expect(htmlElement.textContent).toBe('Hello world');
    });

    it('generates a html element with children when json has type Element', () => {
      const htmlElement = toNode(
        jsonElement('DIV', [
          jsonElement('H3', [jsonTextElement('Overskrift')]),
          jsonElement('P', [jsonTextElement('Avsnitt')]),
        ]),
      );
      expect(htmlElement.nodeType).toBe(Node.ELEMENT_NODE);
      expect(htmlElement.nodeName).toBe('DIV');
      expect(htmlElement.childNodes).toHaveLength(2);
      expect(htmlElement.textContent).toBe('OverskriftAvsnitt');
    });
  });

  describe('fromNode', () => {
    it('generates json from an html element', () => {
      expect(
        fromNode(ElementNode('P', [TextNode('Avsnitt med '), ElementNode('STRONG', [TextNode('Fet skrift')])])),
      ).toEqual({
        attributes: [],
        children: [
          {
            textContent: 'Avsnitt med ',
            type: 'TextElement',
          },
          {
            attributes: [],
            children: [
              {
                textContent: 'Fet skrift',
                type: 'TextElement',
              },
            ],
            tagName: 'STRONG',
            type: 'Element',
          },
        ],
        tagName: 'P',
        type: 'Element',
      });
    });

    it('supports span elements', () => {
      expect(
        fromNode(
          ElementNode('P', [
            TextNode('Avsnitt med '),
            ElementNode('SPAN', [ElementNode('STRONG', [TextNode('Fet skrift')])]),
          ]),
        ),
      ).toEqual({
        attributes: [],
        children: [
          {
            textContent: 'Avsnitt med ',
            type: 'TextElement',
          },
          {
            attributes: [],
            children: [
              {
                attributes: [],
                children: [
                  {
                    textContent: 'Fet skrift',
                    type: 'TextElement',
                  },
                ],
                tagName: 'STRONG',
                type: 'Element',
              },
            ],
            tagName: 'SPAN',
            type: 'Element',
          },
        ],
        tagName: 'P',
        type: 'Element',
      });
    });

    it('generates json and keeps non-accepted tags in text content', () => {
      expect(
        fromNode(
          ElementNode('P', [
            TextNode('Avsnitt med '),
            ElementNode('PRE', [ElementNode('STRONG', [TextNode('Fet skrift')])]),
          ]),
        ),
      ).toEqual({
        attributes: [],
        children: [
          {
            textContent: 'Avsnitt med ',
            type: 'TextElement',
          },
          {
            textContent: '<pre><strong>Fet skrift</strong></pre>',
            type: 'TextElement',
          },
        ],
        tagName: 'P',
        type: 'Element',
      });
    });

    it('generates json from html text element', () => {
      expect(fromNode(TextNode('Hello world'))).toEqual({ type: 'TextElement', textContent: 'Hello world' });
    });
  });
});
