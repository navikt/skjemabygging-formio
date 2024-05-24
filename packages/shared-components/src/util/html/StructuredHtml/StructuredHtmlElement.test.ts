import { beforeEach, expect } from 'vitest';
import { HtmlAsJsonElement, HtmlAsJsonTextElement } from '../converters';
import StructuredHtmlElement from './StructuredHtmlElement';
import StructuredHtmlText from './StructuredHtmlText';

describe('StructuredHtmlElement', () => {
  describe('from non-html string', () => {
    const nonHtmlString = 'structured html element from string';

    it('creates a text element and a wrapping div when input string is not htmlstring', () => {
      const structuredHtmlElement = new StructuredHtmlElement(nonHtmlString);
      expect(structuredHtmlElement.tagName).toBe('DIV');
      expect(structuredHtmlElement.children).toHaveLength(1);
      expect(structuredHtmlElement.children[0].type).toBe('TextElement');
      expect((structuredHtmlElement.children[0] as StructuredHtmlText).textContent).toBe(nonHtmlString);
    });
  });

  describe('from htmlString', () => {
    const htmlString = '<h3>Overskrift</h3><p>Avsnitt</p><ul><li>Punkt 1</li><li>Punkt 2</li></ul>';
    let structuredHtmlElement: StructuredHtmlElement;

    beforeEach(() => {
      structuredHtmlElement = new StructuredHtmlElement(htmlString);
    });

    it('parses and re-creates the html structure inside a wrapping div', () => {
      expect(structuredHtmlElement.tagName).toBe('DIV');
      expect(structuredHtmlElement.children).toHaveLength(3);
      const children = structuredHtmlElement.children as StructuredHtmlElement[];
      expect(children[0].tagName).toBe('H3');
      expect(children[1].tagName).toBe('P');
      expect(children[2].tagName).toBe('UL');
      expect(children[2].children).toHaveLength(2);
    });

    it('does not contain markdown', () => {
      expect(structuredHtmlElement.containsMarkdown).toBe(false);
    });

    it('returns inner text', () => {
      expect(structuredHtmlElement.innerText).toBe('OverskriftAvsnittPunkt 1Punkt 2');
    });

    it('converts back to htmlString', () => {
      expect(structuredHtmlElement.toHtmlString()).toEqual(htmlString);
    });

    it('converts to json', () => {
      const json = structuredHtmlElement.toJson();
      expect(json.tagName).toBe('DIV');
      expect(json.children).toHaveLength(3);
      const children = json.children as HtmlAsJsonElement[];
      expect(children[0].tagName).toBe('H3');
      expect(children[1].tagName).toBe('P');
      expect(children[2].tagName).toBe('UL');
      expect(children[2].children).toHaveLength(2);
    });

    it('matches structurally similar html', () => {
      const structurallyEqual = new StructuredHtmlElement('<h3></h3><p></p><ul><li></li><li></li></ul>');
      const structurallyEqualWithExtraText = new StructuredHtmlElement(
        '<h3>Text</h3>missplaced text<p></p><ul><li></li><li></li></ul>',
      );
      expect(structuredHtmlElement.matches(structurallyEqual)).toBe(true);
      expect(structurallyEqualWithExtraText.matches(structurallyEqual)).toBe(true);
    });

    it('does not match html with missing or additional tags', () => {
      const missingTag = new StructuredHtmlElement('<h3></h3><ul><li></li><li></li></ul>');
      const additionalTag = new StructuredHtmlElement('<h3></h3><p></p><ul><li></li><li></li><li></li></ul>');
      expect(structuredHtmlElement.matches(missingTag)).toBe(false);
      expect(structuredHtmlElement.matches(additionalTag)).toBe(false);
    });

    it('updates individual values', () => {
      const paragraphId = structuredHtmlElement.children[1].id;
      const listItem1Id = (structuredHtmlElement.children[2] as StructuredHtmlElement).children[0].id;
      structuredHtmlElement.update(paragraphId, 'Nytt avsnitt');
      expect(structuredHtmlElement.toHtmlString()).toBe(
        '<h3>Overskrift</h3><p>Nytt avsnitt</p><ul><li>Punkt 1</li><li>Punkt 2</li></ul>',
      );
      structuredHtmlElement.update(listItem1Id, 'Nytt punkt');
      expect(structuredHtmlElement.toHtmlString()).toBe(
        '<h3>Overskrift</h3><p>Nytt avsnitt</p><ul><li>Nytt punkt</li><li>Punkt 2</li></ul>',
      );
      expect(structuredHtmlElement.innerText).toBe('OverskriftNytt avsnittNytt punktPunkt 2');
      expect((structuredHtmlElement.toJson() as any).children[1].children[0].textContent).toBe('Nytt avsnitt');
      expect((structuredHtmlElement.toJson() as any).children[2].children[0].children[0].textContent).toBe(
        'Nytt punkt',
      );
    });
  });

  describe('from htmlString with links and strong', () => {
    const htmlStringWithLink = '<ul><li>Punkt 1 med <a href="www.url.no">lenketekst</a></li><li>Punkt 2</li></ul>';
    const htmlStringWithStrong = '<p>Avsnitt med <strong>fet skrift</strong>.</p>';
    let withLink: StructuredHtmlElement;
    let withStrong: StructuredHtmlElement;
    let withStrongNoMarkdown: StructuredHtmlElement;

    beforeEach(() => {
      withLink = new StructuredHtmlElement(htmlStringWithLink, { skipConversionWithin: ['LI'] });
      withStrong = new StructuredHtmlElement(htmlStringWithStrong, { skipConversionWithin: ['P'] });
      withStrongNoMarkdown = new StructuredHtmlElement(htmlStringWithStrong);
    });

    describe('Parsing htmlString and re-creating the html structure', () => {
      it('parses and recreates link', () => {
        const ulChild = withLink.children[0] as StructuredHtmlElement;
        expect(ulChild.tagName).toBe('UL');
        const li1Child = ulChild.children[0] as StructuredHtmlElement;
        expect(li1Child.tagName).toBe('LI');
        expect((li1Child.children[0] as StructuredHtmlText).textContent).toBe('Punkt 1 med ');
        const linkChild = li1Child.children[1] as StructuredHtmlElement;
        expect(linkChild.tagName).toBe('A');
        expect(linkChild.attributes).toEqual([['href', 'www.url.no']]);
        expect((linkChild.children[0] as StructuredHtmlText).textContent).toBe('lenketekst');
      });

      it('parses and recreates strong', () => {
        const pChild = withStrong.children[0] as StructuredHtmlElement;
        expect(pChild.tagName).toBe('P');
        expect((pChild.children[0] as StructuredHtmlText).textContent).toBe('Avsnitt med ');
        const strongChild = pChild.children[1] as StructuredHtmlElement;
        expect(strongChild.tagName).toBe('STRONG');
        expect((strongChild.children[0] as StructuredHtmlText).textContent).toBe('fet skrift');
        expect((pChild.children[2] as StructuredHtmlText).textContent).toBe('.');
      });
    });

    it('returns inner text', () => {
      expect(withLink.innerText).toBe('Punkt 1 med lenketekstPunkt 2');
      expect(withStrong.innerText).toBe('Avsnitt med fet skrift.');
    });

    it('converts back to htmlString', () => {
      expect(withLink.toHtmlString()).toBe(htmlStringWithLink);
      expect(withStrong.toHtmlString()).toBe(htmlStringWithStrong);
      expect(withStrongNoMarkdown.toHtmlString()).toBe(htmlStringWithStrong);
    });

    describe('Converting to json', () => {
      it('converts link to json with markdown', () => {
        const withLinkJson = withLink.toJson(true);
        const withLinkJsonMarkdownChildren = (
          (withLinkJson.children[0] as HtmlAsJsonElement).children[0] as HtmlAsJsonElement
        ).children;
        expect((withLinkJsonMarkdownChildren[0] as HtmlAsJsonTextElement).textContent).toBe('Punkt 1 med ');
        expect((withLinkJsonMarkdownChildren[1] as HtmlAsJsonTextElement).textContent).toBe('[lenketekst](www.url.no)');
      });

      it('converts strong to json with markdown', () => {
        const withStrongJson = withStrong.toJson(true);
        const withStrongJsonMarkdownChildren = (withStrongJson.children[0] as HtmlAsJsonElement).children;
        expect((withStrongJsonMarkdownChildren[0] as HtmlAsJsonTextElement).textContent).toBe('Avsnitt med ');
        expect((withStrongJsonMarkdownChildren[1] as HtmlAsJsonTextElement).textContent).toBe('**fet skrift**');
      });

      it('does not convert strong to markdown when conversion was done without skipping within given tags', () => {
        const withStrongNoMarkdownJson = withStrongNoMarkdown.toJson(true);
        const withStrongNoMarkdownJsonJsonChildren = (withStrongNoMarkdownJson.children[0] as HtmlAsJsonElement)
          .children;
        expect((withStrongNoMarkdownJsonJsonChildren[0] as HtmlAsJsonTextElement).textContent).toBe('Avsnitt med ');
        expect(withStrongNoMarkdownJsonJsonChildren[1].type).toBe('Element');
        expect((withStrongNoMarkdownJsonJsonChildren[1] as HtmlAsJsonElement).tagName).toBe('STRONG');
      });
    });
  });
});
