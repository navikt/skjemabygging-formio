import { HtmlAsJsonTextElement } from '../converters';
import StructuredHtmlText from './StructuredHtmlText';

describe('StructuredHtmlText', () => {
  describe('from string', () => {
    const textContent = 'Structured html text content';
    const structuredHtmlText = new StructuredHtmlText(textContent);

    it('converts to json', () => {
      const result = structuredHtmlText.toJson();
      expect(result.type).toBe('TextElement');
      expect(result.textContent).toBe('Structured html text content');
    });

    it('converts to HtmlElement', () => {
      expect(structuredHtmlText.toHtmlElement().textContent).toBe(textContent);
    });

    it('converts to html string', () => {
      expect(structuredHtmlText.toHtmlString()).toBe(textContent);
    });
  });

  describe('from json', () => {
    const originalJson: HtmlAsJsonTextElement = {
      type: 'TextElement',
      textContent: 'Structured html text content from json',
    };
    const structuredHtmlText = new StructuredHtmlText(originalJson);

    it('converts to json', () => {
      const result = structuredHtmlText.toJson();
      expect(result.type).toBe('TextElement');
      expect(result.textContent).toBe(originalJson.textContent);
    });

    it('converts to HtmlElement', () => {
      expect(structuredHtmlText.toHtmlElement().textContent).toBe(originalJson.textContent);
    });

    it('converts to html string', () => {
      expect(structuredHtmlText.toHtmlString()).toBe(originalJson.textContent);
    });
  });
});
