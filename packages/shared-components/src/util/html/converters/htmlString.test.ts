import { expect } from 'vitest';
import { htmlString2Json, isHtmlString, json2HtmlString } from './htmlString';
import { jsonElement, jsonTextElement } from './test/testUtils';

const json = jsonElement('DIV', [
  jsonElement('H3', [jsonTextElement('Overskrift')]),
  jsonElement('P', [jsonTextElement('Avsnitt med '), jsonElement('B', [jsonTextElement('fet skrift')])]),
  jsonElement('OL', [
    jsonElement('LI', [
      jsonElement(
        'A',
        [jsonTextElement('Punkt 1 med lenke')],
        [
          ['href', 'www.url.no'],
          ['target', '_blank'],
        ],
      ),
    ]),
    jsonElement('LI', [jsonTextElement('Punkt 2')]),
  ]),
]);

describe('htmlString conversion', () => {
  describe('isHtmlString', () => {
    it('returns true if string contains an opening tag', () => {
      expect(isHtmlString('bla bla <a>hello')).toBe(true);
      expect(isHtmlString('bla bla <a href="www.url.no">hello')).toBe(true);
      expect(isHtmlString('bla bla <a href="www.url.no" target="_blank" rel="noopener noreferrer">hello')).toBe(true);
    });

    it('returns false if the only tag is a <br>', () => {
      expect(isHtmlString('bla bla <br>hello')).toBe(false);
    });

    it('returns true if it contains an allowed tag in addition to a <br>', () => {
      expect(isHtmlString('bla <a> bla <br>hello')).toBe(true);
    });

    it('does not match when string contains a < with no closing >', () => {
      expect(isHtmlString('bla bla <a hello')).toBe(false);
    });
  });

  describe('htmlString <-> json', () => {
    const htmlString =
      '<h3>Overskrift</h3><p>Avsnitt med <b>fet skrift</b></p><ol><li><a href="www.url.no" target="_blank">Punkt 1 med lenke</a></li><li>Punkt 2</li></ol>';

    it('generates a json representation of the html string and generates back to original htmlString', () => {
      const actual = htmlString2Json(htmlString);
      expect(actual).toEqual(json);
      expect(json2HtmlString(actual)).toEqual(htmlString);
    });

    it('generates a hml string from json and generates back to the original json', () => {
      const actual = json2HtmlString(json);
      expect(actual).toEqual(htmlString);
      expect(htmlString2Json(actual)).toEqual(json);
    });
  });
});
