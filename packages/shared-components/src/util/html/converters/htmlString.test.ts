import { htmlString2Json } from './htmlString';
import { jsonElement, jsonTextElement } from './test/testUtils';

describe('htmlString conversion', () => {
  describe('from htmlString to json', () => {
    it('generates a json representation of the html string', () => {
      const actual = htmlString2Json('<h3>Overskrift</h3><p>Avsnitt</p><ol><li>Punkt 1</li><li>Punkt 2</li></ol>');
      const expected = jsonElement(
        'div-OverskriftAvsnittPunkt1Punkt2',
        'DIV',
        [
          jsonElement('h3-Overskrift', 'H3', [jsonTextElement('Overskrift', 'Overskrift')]),
          jsonElement('p-Avsnitt', 'P', [jsonTextElement('Avsnitt', 'Avsnitt')]),
          jsonElement('ol-Punkt1Punkt2', 'OL', [
            jsonElement('li-Punkt1', 'LI', [jsonTextElement('Punkt1', 'Punkt 1')]),
            jsonElement('li-Punkt2', 'LI', [jsonTextElement('Punkt2', 'Punkt 2')]),
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
        'div-AvsnittmedfetskriftPunktmedfetskrift',
        'DIV',
        [
          jsonElement('p-Avsnittmedfetskrift', 'P', [
            jsonTextElement('Avsnitt', 'Avsnitt '),
            jsonElement('b-medfetskrift', 'B', [jsonTextElement('medfetskrift', 'med fet skrift')]),
          ]),
          jsonElement('ol-Punktmedfetskrift', 'OL', [
            jsonElement('li-Punktmedfetskrift', 'LI', [
              jsonTextElement('Punkt**medfetskrift**', 'Punkt **med fet skrift**'),
            ]),
          ]),
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
        'div-Avsnittmedlenkeogfetskrift',
        'DIV',
        [
          jsonElement('p-Avsnittmedlenkeogfetskrift', 'P', [
            jsonTextElement(
              'Avsnitt**med**[lenke](www.nav.no)og**fetskrift**',
              'Avsnitt **med** [lenke](www.nav.no) og **fet skrift**',
            ),
          ]),
        ],
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
        'div-AvsnittmedkursivskriftPunktmedkursivskrift',
        'DIV',
        [
          jsonElement('p-Avsnittmedkursivskrift', 'P', [
            jsonTextElement('Avsnitt', 'Avsnitt '),
            jsonTextElement('<em>medkursivskrift</em>', '<em>med kursiv skrift</em>'),
          ]),
          jsonElement('ol-Punktmedkursivskrift', 'OL', [
            jsonElement('li-Punktmedkursivskrift', 'LI', [
              jsonTextElement('Punkt<em>medkursivskrift</em>', 'Punkt <em>med kursiv skrift</em>'),
            ]),
          ]),
        ],
        true,
      );
      expect(actual).toMatchObject(expected);
    });
  });
});
