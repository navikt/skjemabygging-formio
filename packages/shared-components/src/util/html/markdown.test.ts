import { generateMarkdown } from './markdown';

describe('markdown', () => {
  describe('htmlNode2Markdown', () => {
    it('converts A-tags to markdown', () => {
      const a = document.createElement('a');
      a.setAttribute('href', 'www.url.no');
      a.textContent = 'lenkeTekst';
      expect(generateMarkdown(a)).toBe('[lenkeTekst](www.url.no)');
    });

    it('converts B-tags to markdown', () => {
      const b = document.createElement('b');
      b.textContent = 'fet tekst';
      expect(generateMarkdown(b)).toBe('**fet tekst**');
    });

    it('converts STRONG-tags to markdown', () => {
      const strong = document.createElement('strong');
      strong.textContent = 'fet tekst';
      expect(generateMarkdown(strong)).toBe('**fet tekst**');
    });

    it('keeps outer legal tags', () => {
      const p = document.createElement('p');
      p.innerHTML =
        '<h3>Overskrift med<a href="www.url.no">Lenke</a></h3><ol><li><b>listeElement med fet skrift</b></li></ol><ul><li>listeElement</li></ul>';
      expect(generateMarkdown(p)).toBe(
        '<p><h3>Overskrift med[Lenke](www.url.no)</h3><ol><li>**listeElement med fet skrift**</li></ol><ul><li>listeElement</li></ul></p>',
      );
    });

    it('keeps illegal tags as text, but does not convert children to markdown', () => {
      const p = document.createElement('p');
      p.innerHTML =
        '<b>fet skrift</b><h2>Overskrift med <a href="www.url.no">Lenke</a></h2><em>listeElement med kursiv skrift</em><br><details><b>fet skrift</b></details>';
      const result = generateMarkdown(p);
      expect(result).toBe(
        '<p>**fet skrift**<h2>Overskrift med <a href="www.url.no">Lenke</a></h2><em>listeElement med kursiv skrift</em><br><details><b>fet skrift</b></details></p>',
      );
    });

    it('handles spans when converting children to markdown', () => {
      const p = document.createElement('p');
      p.innerHTML = '<b>fet skrift</b><span> og <b>mer fet skrift</b></span>';
      const result = generateMarkdown(p);
      expect(result).toBe('<p>**fet skrift** og **mer fet skrift**</p>');
    });
  });
});
