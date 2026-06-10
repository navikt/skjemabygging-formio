import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { Registry } from 'prom-client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpResponseError } from '../../shared/http/http';
import { sanitizeLabel, sanitizeValue } from './applicationPdfSerializer';
import { createApplicationPdfService } from './applicationPdfService';

const teamLoggerError = vi.hoisted(() => vi.fn());

vi.mock('../../shared/logger/teamLogger', () => ({
  teamLogger: {
    error: teamLoggerError,
  },
}));

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
  beforeEach(() => {
    teamLoggerError.mockClear();
  });

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

  it('logs to team-logs on non-401 HttpResponseError and rethrows', async () => {
    const registry = new Registry();
    const error = new HttpResponseError('SERVICE_UNAVAILABLE', 'boom', 'Internal server error', undefined, 503);
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

    expect(teamLoggerError).toHaveBeenCalledWith(
      'Could not create pdf',
      expect.objectContaining({
        skjemanummer: 'NAV 00-00.00',
        httpResponseStatus: 503,
      }),
    );
  });

  it('does not log to team-logs on unauthorized errors', async () => {
    const registry = new Registry();
    const error = new ResponseError('UNAUTHORIZED', 'nope');
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

    expect(teamLoggerError).not.toHaveBeenCalled();
  });

  it('logs to team-logs on non-HttpResponseError failures with undefined status and rethrows', async () => {
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

    expect(teamLoggerError).toHaveBeenCalledWith(
      'Could not create pdf',
      expect.objectContaining({
        skjemanummer: 'NAV 00-00.00',
        httpResponseStatus: undefined,
      }),
    );
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
