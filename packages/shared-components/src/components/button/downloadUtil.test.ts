import { sanitizeFileName } from './downloadUtil';

describe('downloadUtil', () => {
  describe('sanitizeFileName', () => {
    it('Sanitize nav form names', () => {
      expect(sanitizeFileName('Søknad om lese- og sekretærhjelp for blinde og svaksynte.')).toBe(
        'soeknad-om-lese-og-sekretaerhjelp-for-blinde-og-svaksynte',
      );
      expect(sanitizeFileName('Søknad om dagpenger (ikke permittert)')).toBe('soeknad-om-dagpenger-ikke-permittert');
      expect(sanitizeFileName('Regning for lese- og sekretærhjelp for blinde og svaksynte')).toBe(
        'regning-for-lese-og-sekretaerhjelp-for-blinde-og-svaksynte',
      );
      expect(sanitizeFileName('Søknad om høreapparat / tinnitusmaskerer / tilleggsutstyr')).toBe(
        'soeknad-om-hoereapparat-tinnitusmaskerer-tilleggsutstyr',
      );
      expect(sanitizeFileName('Søknad om tolk til døve, døvblinde og hørselshemmede')).toBe(
        'soeknad-om-tolk-til-doeve-doevblinde-og-hoerselshemmede',
      );
      expect(sanitizeFileName('Søknad om attest PD U1/N-301 til bruk ved overføring av dagpengerettigheter')).toBe(
        'soeknad-om-attest-pd-u1-n-301-til-bruk-ved-overfoering-av-dagpengerettigheter',
      );
    });

    it('Sanitize norwegian characters', () => {
      expect(sanitizeFileName('æ')).toBe('ae');
      expect(sanitizeFileName('Æ')).toBe('ae');
      expect(sanitizeFileName('ø')).toBe('oe');
      expect(sanitizeFileName('Ø')).toBe('oe');
      expect(sanitizeFileName('å')).toBe('aa');
      expect(sanitizeFileName('Å')).toBe('aa');
    });

    it('Make sure we do not get - in first and end of string.', () => {
      expect(sanitizeFileName('-a')).toBe('a');
      expect(sanitizeFileName('.a.')).toBe('a');
      expect(sanitizeFileName('.æ')).toBe('ae');
    });
  });
});
