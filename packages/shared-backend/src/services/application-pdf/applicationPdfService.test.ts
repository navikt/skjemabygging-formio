import { Registry } from 'prom-client';
import { describe, expect, it, vi } from 'vitest';
import { sanitizeValue } from './applicationPdfSerializer';
import { createApplicationPdfService } from './applicationPdfService';

describe('Sanitize values before sending to PDF generation', () => {
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
    const client = {
      createPdf: vi.fn().mockResolvedValue('pdf-base64'),
    };
    const service = createApplicationPdfService({
      baseUrl: 'http://familie-pdf',
      metrics: {
        appName: 'fyllut',
        registry,
      },
      client,
    });

    const result = await service.createPdf({
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
    const client = {
      createPdf: vi.fn().mockRejectedValue(error),
    };
    const service = createApplicationPdfService({
      baseUrl: 'http://familie-pdf',
      metrics: {
        appName: 'fyllut',
        registry,
      },
      client,
    });

    await expect(
      service.createPdf({
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
    const client = {
      createPdf: vi.fn().mockResolvedValue('pdf-base64'),
    };
    const firstService = createApplicationPdfService({
      baseUrl: 'http://familie-pdf',
      metrics: {
        appName: 'fyllut',
        registry,
      },
      client,
    });
    const secondService = createApplicationPdfService({
      baseUrl: 'http://familie-pdf',
      metrics: {
        appName: 'fyllut',
        registry,
      },
      client,
    });

    await firstService.createPdf({
      accessToken: 'token',
      pdfFormData: createPdfFormData(),
    });
    await secondService.createPdf({
      accessToken: 'token',
      pdfFormData: createPdfFormData(),
    });

    expect(await registry.getMetricsAsJSON()).toHaveLength(3);
    expect(await registry.metrics()).toContain('fyllut_familie_pdf_requests_total 2');
  });
});
