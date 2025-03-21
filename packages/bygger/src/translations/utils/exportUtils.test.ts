import { Form, FormsApiTranslation, MockedComponentObjectForTest } from '@navikt/skjemadigitalisering-shared-domain';
import { getHeadersForExport, getRowsForExportFromForm } from './exportUtils';

const { createFormsApiFormObject, createDummyTextfield, createDummyHTMLElement } = MockedComponentObjectForTest;

const withNB: FormsApiTranslation[] = [
  { key: 'nb1', nb: 'nb1' },
  { key: 'nb2', nb: 'nb2' },
];

const withNBandNN: FormsApiTranslation[] = [
  { key: 'nb1', nb: 'nb1', nn: 'nn1' },
  { key: 'nb2', nb: 'nb2' },
];

const withNBandEN: FormsApiTranslation[] = [
  { key: 'nb1', nb: 'nb1', en: 'en1' },
  { key: 'nb2', nb: 'nb2' },
];

const withAllLanguages: FormsApiTranslation[] = [
  { key: 'nb1', nb: 'nb1', nn: 'nn1' },
  { key: 'nb2', nb: 'nb2', en: 'en2' },
];

let form: Form;

describe('exportUtils', () => {
  describe('getRowsForExportFromForm with standard texts', () => {
    beforeEach(() => {
      form = createFormsApiFormObject([createDummyTextfield('nb1'), createDummyTextfield('nb2')]);
    });

    it('generates rows without translations', () => {
      const result = getRowsForExportFromForm(form, []);
      expect(result).toEqual([
        { type: 'tekst', order: '001', text: 'Test form' },
        { type: 'tekst', order: '002', text: 'nb1' },
        { type: 'tekst', order: '003', text: 'nb2' },
      ]);
    });

    it('generates row with NN translation', () => {
      const result = getRowsForExportFromForm(form, withNBandNN);
      expect(result).toEqual([
        { type: 'tekst', order: '001', text: 'Test form' },
        { type: 'tekst', order: '002', text: 'nb1', nn: 'nn1' },
        { type: 'tekst', order: '003', text: 'nb2' },
      ]);
    });

    it('generates row with NN and EN translation', () => {
      const result = getRowsForExportFromForm(form, withAllLanguages);
      expect(result).toEqual([
        { type: 'tekst', order: '001', text: 'Test form' },
        { type: 'tekst', order: '002', text: 'nb1', nn: 'nn1' },
        { type: 'tekst', order: '003', text: 'nb2', en: 'en2' },
      ]);
    });
  });

  describe('getRowsForExportFromForm with html strings', () => {
    const htmlTextWithList = '<p>Frukt:</p><ol><li>Banan</li><li>Eple</li></ol>';
    const htmlTextWithBoldAndLink =
      '<h3>Info</h3><p>Du kan <b>lese mer</b> om nav ved å <a href="www.nav.no" rel="noopener noreferrer">klikke her</a>.</p>';
    const htmlTextWithParagraphs = '<p>Avsnitt 1</p><p>Avsnitt 2</p>';

    const completeHtmlTranslations = [
      { key: htmlTextWithList, nb: htmlTextWithList, en: '<p>Fruit:</p><ol><li>Banana</li><li>Apple</li></ol>' },
      {
        key: htmlTextWithBoldAndLink,
        nb: htmlTextWithBoldAndLink,
        en: '<h3>Info</h3><p>You can <b>read more</b> about nav by <a href="www.nav.no" rel="noopener noreferrer">clicking here</a>.</p>',
      },
      {
        key: htmlTextWithParagraphs,
        nb: htmlTextWithParagraphs,
        en: '<p>Paragraph 1</p><p></p><div></div><p>Paragraph 2</p>',
      },
    ];

    beforeEach(() => {
      form = createFormsApiFormObject([
        createDummyHTMLElement('HTML', htmlTextWithList),
        createDummyHTMLElement('HTML', htmlTextWithBoldAndLink),
        createDummyHTMLElement('HTML', htmlTextWithParagraphs),
      ]);
    });

    it('generates rows with translations', () => {
      const result = getRowsForExportFromForm(form, completeHtmlTranslations);
      expect(result).toEqual([
        { type: 'tekst', order: '001', text: 'Test form' },
        { type: 'html', order: '002-001', text: 'Frukt:', en: 'Fruit:' },
        { type: 'html', order: '002-002', text: 'Banan', en: 'Banana' },
        { type: 'html', order: '002-003', text: 'Eple', en: 'Apple' },
        { type: 'html', order: '003-001', text: 'Info', en: 'Info' },
        {
          type: 'html',
          order: '003-002',
          text: 'Du kan **lese mer** om nav ved å [klikke her](www.nav.no).',
          en: 'You can **read more** about nav by [clicking here](www.nav.no).',
        },
        { type: 'html', order: '004-001', text: 'Avsnitt 1', en: 'Paragraph 1' },
        { type: 'html', order: '004-002', text: 'Avsnitt 2', en: 'Paragraph 2' },
      ]);
    });
  });

  describe('getHeadersForExport', () => {
    it('should return headers without Nynorsk and English when translations do not have them', () => {
      const result = getHeadersForExport(withNB);
      expect(result).toEqual([
        { label: 'Type', key: 'type' },
        { label: 'Rekkefølge', key: 'order' },
        { label: 'Skjematekster', key: 'text' },
      ]);
    });

    it('should return headers with Nynorsk when translations have Nynorsk', () => {
      const result = getHeadersForExport(withNBandNN);
      expect(result).toEqual([
        { label: 'Type', key: 'type' },
        { label: 'Rekkefølge', key: 'order' },
        { label: 'Skjematekster', key: 'text' },
        { label: 'Nynorsk', key: 'nn' },
      ]);
    });

    it('should return headers with English when translations have English', () => {
      const result = getHeadersForExport(withNBandEN);
      expect(result).toEqual([
        { label: 'Type', key: 'type' },
        { label: 'Rekkefølge', key: 'order' },
        { label: 'Skjematekster', key: 'text' },
        { label: 'Engelsk', key: 'en' },
      ]);
    });

    it('should return headers with both Nynorsk and English when translations have both', () => {
      const result = getHeadersForExport(withAllLanguages);
      expect(result).toEqual([
        { label: 'Type', key: 'type' },
        { label: 'Rekkefølge', key: 'order' },
        { label: 'Skjematekster', key: 'text' },
        { label: 'Nynorsk', key: 'nn' },
        { label: 'Engelsk', key: 'en' },
      ]);
    });
  });
});
