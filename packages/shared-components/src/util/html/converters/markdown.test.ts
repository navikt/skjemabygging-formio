import { htmlNode2Markdown, markdown2Json } from './markdown';
import { Element, TextNode, jsonElement, jsonTextElement } from './test/testUtils';

describe('markdown', () => {
  describe('markdown2Json', () => {
    it('converts link to json', () => {
      expect(markdown2Json('[lenketekst](www.url.no)')).toEqual(
        jsonElement('DIV', [jsonElement('A', [jsonTextElement('lenketekst')], [['href', 'www.url.no']])]),
      );
    });

    it('converts text with several links to json', () => {
      expect(markdown2Json('hei [lenketekst1](www.url1.no) hallo [lenketekst2](www.url2.no) hadet')).toEqual(
        jsonElement('DIV', [
          jsonTextElement('hei '),
          jsonElement('A', [jsonTextElement('lenketekst1')], [['href', 'www.url1.no']]),
          jsonTextElement(' hallo '),
          jsonElement('A', [jsonTextElement('lenketekst2')], [['href', 'www.url2.no']]),
          jsonTextElement(' hadet'),
        ]),
      );
    });

    it('converts bold markdown to json with strong tagName', () => {
      expect(markdown2Json('**fet skrift**')).toEqual(
        jsonElement('DIV', [jsonElement('STRONG', [jsonTextElement('fet skrift')])]),
      );
    });

    it('converts text with several bold markdown parts to json with strong tagName', () => {
      expect(markdown2Json('hei **fet skrift 1 ****fet skrift 2** hallo **fet skrift 3**')).toEqual(
        jsonElement('DIV', [
          jsonTextElement('hei '),
          jsonElement('STRONG', [jsonTextElement('fet skrift 1 ')]),
          jsonElement('STRONG', [jsonTextElement('fet skrift 2')]),
          jsonTextElement(' hallo '),
          jsonElement('STRONG', [jsonTextElement('fet skrift 3')]),
        ]),
      );
    });

    it('converts text with a combination of bold and link markdown to json', () => {
      expect(
        markdown2Json(
          '[**fet lenketekst**](www.url1.no)[vanlig og **fet lenketekst**](www.url2.no)**fet skrift [med lenke](www.url3.no)**.',
        ),
      ).toEqual(
        jsonElement('DIV', [
          jsonElement('A', [jsonElement('STRONG', [jsonTextElement('fet lenketekst')])], [['href', 'www.url1.no']]),
          jsonElement(
            'A',
            [jsonTextElement('vanlig og '), jsonElement('STRONG', [jsonTextElement('fet lenketekst')])],
            [['href', 'www.url2.no']],
          ),
          jsonElement('STRONG', [
            jsonTextElement('fet skrift '),
            jsonElement('A', [jsonTextElement('med lenke')], [['href', 'www.url3.no']]),
          ]),
          jsonTextElement('.'),
        ]),
      );
    });

    it('treats markdown with illegal syntax as text', () => {
      expect(markdown2Json('(abc)[def] (ghi) *A *B* C**')).toEqual(
        jsonElement('DIV', [jsonTextElement('(abc)[def] (ghi) *A *B* C**')]),
      );
    });

    it('supports legal html tags as well', () => {
      expect(markdown2Json('<p>**fet skrift**</p>')).toEqual(
        jsonElement('DIV', [jsonElement('P', [jsonElement('STRONG', [jsonTextElement('fet skrift')])])]),
      );
    });
  });

  describe('htmlNode2Markdown', () => {
    it('converts A-tags to markdown', () => {
      expect(htmlNode2Markdown(Element('A', [TextNode('lenkeTekst')], 'www.url.no'))).toBe('[lenkeTekst](www.url.no)');
    });

    it('converts B-tags to markdown', () => {
      expect(htmlNode2Markdown(Element('B', [TextNode('fet tekst')]))).toBe('**fet tekst**');
    });

    it('converts STRONG-tags to markdown', () => {
      expect(htmlNode2Markdown(Element('STRONG', [TextNode('fet tekst')]))).toBe('**fet tekst**');
    });

    it('keeps outer legal tags', () => {
      expect(
        htmlNode2Markdown(
          Element('P', [
            Element('H3', [TextNode('Overskrift med'), Element('A', [TextNode('Lenke')], 'www.url.no')]),
            Element('OL', [Element('LI', [Element('B', [TextNode('listeElement med fet skrift')])])]),
            Element('UL', [Element('LI', [TextNode('listeElement')])]),
          ]),
        ),
      ).toBe(
        '<p><h3>Overskrift med[Lenke](www.url.no)</h3><ol><li>**listeElement med fet skrift**</li></ol><ul><li>listeElement</li></ul></p>',
      );
    });

    it('keeps illegal tags as text, but does not convert children to markdown', () => {
      expect(
        htmlNode2Markdown(
          Element('P', [
            Element('B', [TextNode('fet skrift')]),
            Element('H2', [TextNode('Overskrift med '), Element('A', [TextNode('Lenke')], 'www.url.no')]),
            Element('EM', [TextNode('listeElement med kursiv skrift')]),
            Element('BR', []),
            Element('SPAN', [Element('B', [TextNode('fet skrift')])]),
          ]),
        ),
      ).toBe(
        '<p>**fet skrift**<h2>Overskrift med <a href="www.url.no">Lenke</a></h2><em>listeElement med kursiv skrift</em><br><span><b>fet skrift</b></span></p>',
      );
    });
  });
});
