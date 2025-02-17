import { generateFooterHtml } from './footerBuilder';

const mockTranslate = (text: string) => text;

describe('footerBuilder', () => {
  describe('createFooter', () => {
    const userId: string = '12345678901';
    const schemaVersion: string = '342u43590534mklgfd0i9';
    const skjemanummer: string = 'NAV 11-12.24B';
    const language: string = 'nb';

    let footer: string;

    it('creates a footer html document with labels and the supplied data', () => {
      footer = generateFooterHtml(userId, schemaVersion, skjemanummer, language, mockTranslate);
      expect(footer).toContain(userId);
      expect(footer).toContain(schemaVersion);
      expect(footer).toContain(skjemanummer);
      expect(footer).toContain('<span>F.nr: 12345678901</span>');
      expect(footer).toContain('<span>Opprettet: ');
      expect(footer).toContain('<span>Skjemanummer: ' + skjemanummer + '</span>');
      expect(footer).toContain('<span>Versjon: ' + schemaVersion + '</span>');
      expect(footer).toContain(
        '<span>Side </span><span class="pageNumber"></span><span> av </span><span class="totalPages"></span>',
      );
    });
  });
});
