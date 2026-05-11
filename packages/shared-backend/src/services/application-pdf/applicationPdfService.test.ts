import { Registry } from 'prom-client';
import { describe, expect, it, vi } from 'vitest';
import { createApplicationPdfService, sanitizeLabel, sanitizeValue } from './applicationPdfService';

describe('Sanitize values before sending to PDF generation', () => {
  describe('sanitizeLabel', () => {
    it('removes script and unwanted tags, allows only allowed tags and attributes', () => {
      expect(
        sanitizeLabel(
          '<script>alert(1)</script><h2>Header</h2><b>bold</b><a href="https://www.nav.no" target="_blank">link</a>',
        ),
      ).toBe('<h2>Header</h2><b>bold</b><a href="https://www.nav.no">link</a>');
      expect(sanitizeLabel('<img src="x" /><div>text</div>')).toBe('<div>text</div>');
      expect(sanitizeLabel('<a href="https://evil.com" onclick="alert(1)">bad</a>')).toBe(
        '<a href="https://evil.com">bad</a>',
      );
      expect(sanitizeLabel('<a href="https://www.nav.no" onclick="alert(1)">good</a>')).toBe(
        '<a href="https://www.nav.no">good</a>',
      );
      expect(sanitizeLabel('<a href="https://www.nav.no" class="foo" target="_blank">good</a>')).toBe(
        '<a href="https://www.nav.no">good</a>',
      );
      expect(sanitizeLabel('<a href="https://example.com">bad</a>')).toBe('<a href="https://example.com">bad</a>');
      expect(sanitizeLabel('<a>no href</a>')).toBe('<a>no href</a>');
      expect(sanitizeLabel('<p>hello</p>')).toBe('<p>hello</p>');
      expect(sanitizeLabel('plain text')).toBe('plain text');
    });

    it('returns undefined for undefined or empty input', () => {
      expect(sanitizeLabel(undefined)).toBeUndefined();
      expect(sanitizeLabel('')).toBeUndefined();
    });
  });

  describe('sanitizeValue', () => {
    it('removes all HTML tags except text', () => {
      expect(sanitizeValue('<script>alert(1)</script>hello')).toBe('hello');
      expect(sanitizeValue('<script>alert(1) hello')).toBe('');
      expect(sanitizeValue('<b>bold</b> <i>italic</i>')).toBe('bold italic');
      expect(sanitizeValue('<a href="https://www.nav.no">link</a>')).toBe('link');
      expect(sanitizeValue('<img src="x">foo')).toBe('foo');
      expect(sanitizeValue('<div>bar</div>baz')).toBe('barbaz');
    });

    it('returns undefined for non-string or empty input', () => {
      expect(sanitizeValue(undefined)).toBeUndefined();
      expect(sanitizeValue(null)).toBeUndefined();
      expect(sanitizeValue(123)).toBeUndefined();
      expect(sanitizeValue('')).toBe('');
    });
  });
});

describe('createApplicationPdfService', () => {
  const createPdfFormData = () => ({
    label: 'Test',
    pdfConfig: { harInnholdsfortegnelse: false, språk: 'nb' },
    skjemanummer: 'NAV 00-00.00',
    verdiliste: [],
    bunntekst: {
      upperleft: null,
      lowerleft: null,
      upperMiddle: null,
      lowerMiddle: null,
      upperRight: null,
    },
  });

  it('records request and duration on success', async () => {
    const registry = new Registry();
    const apiService = {
      createPdf: vi.fn().mockResolvedValue('pdf-base64'),
    };
    const service = createApplicationPdfService({
      metrics: {
        appName: 'fyllut',
        registry,
      },
      apiService,
    });

    const result = await service.createPdf({
      baseUrl: 'http://familie-pdf',
      accessToken: 'token',
      pdfFormData: createPdfFormData(),
    });

    expect(result).toBe('pdf-base64');
    expect(registry.getSingleMetric('fyllut_familie_pdf_requests_total')).toBeTruthy();
    expect(registry.getSingleMetric('fyllut_familie_pdf_failures_total')).toBeTruthy();
    expect(registry.getSingleMetric('fyllut_familie_pdf_duration_seconds')).toBeTruthy();
    expect(await registry.metrics()).toContain('fyllut_familie_pdf_requests_total 1');
    expect(await registry.metrics()).toContain('fyllut_familie_pdf_failures_total 0');
    expect(await registry.metrics()).toContain('fyllut_familie_pdf_duration_seconds_count{error="false"} 1');
  });

  it('records failure and duration on error', async () => {
    const registry = new Registry();
    const error = new Error('pdf failed');
    const apiService = {
      createPdf: vi.fn().mockRejectedValue(error),
    };
    const service = createApplicationPdfService({
      metrics: {
        appName: 'fyllut',
        registry,
      },
      apiService,
    });

    await expect(
      service.createPdf({
        baseUrl: 'http://familie-pdf',
        accessToken: 'token',
        pdfFormData: createPdfFormData(),
      }),
    ).rejects.toThrow(error);

    expect(await registry.metrics()).toContain('fyllut_familie_pdf_requests_total 1');
    expect(await registry.metrics()).toContain('fyllut_familie_pdf_failures_total 1');
    expect(await registry.metrics()).toContain('fyllut_familie_pdf_duration_seconds_count{error="true"} 1');
  });

  it('reuses existing metrics when the same registry is passed more than once', async () => {
    const registry = new Registry();
    const apiService = {
      createPdf: vi.fn().mockResolvedValue('pdf-base64'),
    };
    const firstService = createApplicationPdfService({
      metrics: {
        appName: 'fyllut',
        registry,
      },
      apiService,
    });
    const secondService = createApplicationPdfService({
      metrics: {
        appName: 'fyllut',
        registry,
      },
      apiService,
    });

    await firstService.createPdf({
      baseUrl: 'http://familie-pdf',
      accessToken: 'token',
      pdfFormData: createPdfFormData(),
    });
    await secondService.createPdf({
      baseUrl: 'http://familie-pdf',
      accessToken: 'token',
      pdfFormData: createPdfFormData(),
    });

    expect(await registry.getMetricsAsJSON()).toHaveLength(3);
    expect(await registry.metrics()).toContain('fyllut_familie_pdf_requests_total 2');
  });
});
