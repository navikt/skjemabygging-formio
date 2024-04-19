import { htmlString2Json } from './htmlString';
import { jsonElement, jsonTextElement } from './test/testUtils';

describe('htmlString conversion', () => {
  describe('from htmlString to json', () => {
    it('generates a json representation of the html string', () => {
      const actual = htmlString2Json('<h3>Overskrift</h3><p>Avsnitt</p><ol><li>Punkt 1</li><li>Punkt 2</li></ol>');
      const expected = jsonElement(
        'DIV',
        [
          jsonElement('H3', [jsonTextElement('Overskrift')]),
          jsonElement('P', [jsonTextElement('Avsnitt')]),
          jsonElement('OL', [
            jsonElement('LI', [jsonTextElement('Punkt 1')]),
            jsonElement('LI', [jsonTextElement('Punkt 2')]),
          ]),
        ],
        true,
      );
      expect(actual).toEqual(expected);
    });

    it('skips conversion of children within the given tags', () => {
      const actual = htmlString2Json(
        '<p>Avsnitt <b>med fet skrift</b></p><ol><li>Punkt <b>med fet skrift</b></li></ol>',
        ['LI'],
      );
      const expected = jsonElement(
        'DIV',
        [
          jsonElement('P', [jsonTextElement('Avsnitt '), jsonElement('B', [jsonTextElement('med fet skrift')])]),
          jsonElement('OL', [jsonElement('LI', [jsonTextElement('Punkt **med fet skrift**')])]),
        ],
        true,
      );
      expect(actual).toMatchObject(expected);
    });

    it('converts A, STRONG, and B-tags to markdown, if they are skipped when converting to json', () => {
      const actual = htmlString2Json(
        "<p>Avsnitt <strong>med</strong> <a href='www.nav.no'>lenke</a> og <b>fet skrift</b></p>",
        ['P'],
      );
      const expected = jsonElement(
        'DIV',
        [jsonElement('P', [jsonTextElement('Avsnitt**med**[lenke](www.nav.no)og**fetskrift**')])],
        true,
      );
      expect(actual).toMatchObject(expected);
    });

    it('keeps non-accepted tags (like EM) as html strings', () => {
      const actual = htmlString2Json(
        '<p>Avsnitt <em>med kursiv skrift</em></p><ol><li>Punkt <em>med kursiv skrift</em></li></ol>',
        ['LI'],
      );
      const expected = jsonElement(
        'DIV',
        [
          jsonElement('P', [jsonTextElement('Avsnitt '), jsonTextElement('<em>med kursiv skrift</em>')]),
          jsonElement('OL', [jsonElement('LI', [jsonTextElement('Punkt <em>med kursiv skrift</em>')])]),
        ],
        true,
      );
      expect(actual).toMatchObject(expected);
    });
  });
});
