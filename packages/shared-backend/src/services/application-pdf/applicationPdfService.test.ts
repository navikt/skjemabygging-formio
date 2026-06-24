import { Registry } from 'prom-client';
import type { MockInstance } from 'vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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
  const baseUrl = 'http://familie-pdf';
  const teamLogger = {
    error: vi.fn(),
  };

  beforeEach(() => {
    teamLogger.error.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const createPdfFormData = () => ({
    label: 'Test',
    pdfConfig: { harInnholdsfortegnelse: false, språk: 'nb' },
    skjemanummer: 'NAV 00-00.00',
    verdiliste: [
      {
        label: 'Field label',
        verdi: 'Field value',
      },
    ],
    bunntekst: {
      upperleft: null,
      lowerleft: null,
      upperMiddle: null,
      lowerMiddle: null,
      upperRight: null,
    },
  });

  const createService = (registry = new Registry()) =>
    createApplicationPdfService({
      baseUrl,
      metrics: {
        appName: 'fyllut',
        registry,
      },
      teamLogger,
    });

  const mockFetchResponse = (body: BodyInit, status: number, contentType: string) =>
    vi.spyOn(global, 'fetch').mockResolvedValue(
      new Response(body, {
        status,
        headers: {
          'Content-Type': contentType,
        },
      }),
    );

  const expectCreatePdfRequest = (fetchSpy: MockInstance<typeof fetch>, expectedBody: object) => {
    expect(fetchSpy).toHaveBeenCalledWith(
      `${baseUrl}/api/pdf/v3/opprett-pdf`,
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(expectedBody),
        headers: expect.objectContaining({
          Accept: 'application/pdf',
          Authorization: 'Bearer token',
          'Content-Type': 'application/json',
          'x-correlation-id': expect.any(String),
        }),
      }),
    );
  };

  it('records request and duration on success', async () => {
    const registry = new Registry();
    const fetchSpy = mockFetchResponse(JSON.stringify({ content: 'pdf-base64' }), 200, 'application/json');
    const service = createService(registry);
    const pdfFormData = {
      ...createPdfFormData(),
      verdiliste: [
        {
          label: 'Field label',
          verdi: '<script>alert(1)</script>Test',
        },
      ],
    };

    const result = await service.createPdf({
      accessToken: 'token',
      pdfFormData,
    });

    expect(result).toBe('pdf-base64');
    expectCreatePdfRequest(fetchSpy, {
      ...pdfFormData,
      verdiliste: [
        {
          label: 'Field label',
          verdi: 'Test',
        },
      ],
    });
    expect(registry.getSingleMetric('fyllut_familie_pdf_requests_total')).toBeTruthy();
    expect(registry.getSingleMetric('fyllut_familie_pdf_failures_total')).toBeTruthy();
    expect(registry.getSingleMetric('fyllut_familie_pdf_duration_seconds')).toBeTruthy();
    expect(await registry.metrics()).toContain('fyllut_familie_pdf_requests_total 1');
    expect(await registry.metrics()).toContain('fyllut_familie_pdf_failures_total 0');
    expect(await registry.metrics()).toContain('fyllut_familie_pdf_duration_seconds_count{error="false"} 1');
  });

  it('records failure and duration on error', async () => {
    const registry = new Registry();
    mockFetchResponse('pdf failed', 503, 'text/plain');
    const service = createService(registry);

    await expect(
      service.createPdf({
        accessToken: 'token',
        pdfFormData: createPdfFormData(),
      }),
    ).rejects.toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'pdf failed',
    });

    expect(await registry.metrics()).toContain('fyllut_familie_pdf_requests_total 1');
    expect(await registry.metrics()).toContain('fyllut_familie_pdf_failures_total 1');
    expect(await registry.metrics()).toContain('fyllut_familie_pdf_duration_seconds_count{error="true"} 1');
  });

  it('logs to team-logs on non-401 ResponseError and rethrows', async () => {
    const registry = new Registry();
    mockFetchResponse(JSON.stringify({ message: 'boom', correlationId: 'corr-pdf' }), 503, 'application/json');
    const service = createService(registry);

    await expect(
      service.createPdf({
        accessToken: 'token',
        pdfFormData: createPdfFormData(),
      }),
    ).rejects.toMatchObject({
      errorCode: 'SERVICE_UNAVAILABLE',
      message: 'boom',
      correlationId: 'corr-pdf',
    });

    expect(teamLogger.error).toHaveBeenCalledWith(
      'Could not create pdf',
      expect.objectContaining({
        skjemanummer: 'NAV 00-00.00',
        httpResponseStatus: 503,
      }),
    );
  });

  it('does not log to team-logs on unauthorized errors', async () => {
    const registry = new Registry();
    mockFetchResponse(JSON.stringify({ message: 'nope', correlationId: 'corr-unauthorized' }), 401, 'application/json');
    const service = createService(registry);

    await expect(
      service.createPdf({
        accessToken: 'token',
        pdfFormData: createPdfFormData(),
      }),
    ).rejects.toMatchObject({
      errorCode: 'UNAUTHORIZED',
      message: 'nope',
      correlationId: 'corr-unauthorized',
    });

    expect(teamLogger.error).not.toHaveBeenCalled();
  });

  it('logs to team-logs on non-ResponseError failures with undefined status and rethrows', async () => {
    const registry = new Registry();
    const error = new Error('pdf failed');
    vi.spyOn(global, 'fetch').mockRejectedValue(error);
    const service = createService(registry);

    await expect(
      service.createPdf({
        accessToken: 'token',
        pdfFormData: createPdfFormData(),
      }),
    ).rejects.toThrow(error);

    expect(teamLogger.error).toHaveBeenCalledWith(
      'Could not create pdf',
      expect.objectContaining({
        skjemanummer: 'NAV 00-00.00',
        httpResponseStatus: undefined,
      }),
    );
  });

  it('reuses existing metrics when the same registry is passed more than once', async () => {
    const registry = new Registry();
    const fetchSpy = vi.spyOn(global, 'fetch').mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify({ content: 'pdf-base64' }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      ),
    );
    const firstService = createService(registry);
    const secondService = createService(registry);

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
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });
});
