import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import type { Response as ExpressResponse, Request } from 'express';
import { createApplicationService } from '../../services/application/applicationService';
import http from '../../shared/http/http';
import { logger } from '../../shared/logger/logger';
import errorHandler from './errorHandler';

const createResponse = () => {
  const res = { locals: {} } as ExpressResponse;
  res.header = vi.fn().mockReturnValue(res);
  res.contentType = vi.fn().mockReturnValue(res);
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

const captureRejection = async (promise: Promise<unknown>): Promise<unknown> => {
  try {
    await promise;
    throw new Error('Expected promise to reject');
  } catch (error) {
    return error;
  }
};

describe('errorHandler', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['error', new ResponseError('INTERNAL_SERVER_ERROR', 'Failed', 'corr-1'), 500],
    ['warn', new ResponseError('SERVICE_UNAVAILABLE', 'Unavailable', 'corr-1'), 503],
  ] as const)('logs at %s level and marks the response as already logged', (level, error, status) => {
    const logSpy = vi.spyOn(logger, level).mockImplementation(() => logger);
    const res = createResponse();

    errorHandler(error, {} as Request, res, vi.fn());

    expect(logSpy).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.locals.errorAlreadyLogged).toBe(true);
  });

  it('logs dependency fields for network failures through http and does not send them to the client', async () => {
    const fetchError = new TypeError('fetch failed', {
      cause: Object.assign(new Error('other side closed'), { code: 'UND_ERR_SOCKET' }),
    });
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(fetchError);
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => logger);
    const res = createResponse();

    const thrown = await captureRejection(http.get('http://kodeverk-api.team-rocket/api/v1/kodeverk/ValutaBetaling'));
    const wrapped = new ResponseError('INTERNAL_SERVER_ERROR', 'Det oppstod en feil', 'corr-1', 'Det oppstod en feil', {
      cause: thrown,
    });

    errorHandler(wrapped, {} as Request, res, vi.fn());

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        errorCode: 'INTERNAL_SERVER_ERROR',
        message: 'Det oppstod en feil',
        errorType: 'NETWORK_ERROR',
        dependency: 'kodeverk-api.team-rocket',
        causeCode: 'UND_ERR_SOCKET',
      }),
    );
    expect(res.send).toHaveBeenCalledWith({
      message: 'Det oppstod en feil',
      errorCode: 'INTERNAL_SERVER_ERROR',
      correlationId: 'corr-1',
      userMessage: 'Det oppstod en feil',
    });
  });

  it('classifies connect timeouts through applicationService draft updates as TIMEOUT rather than NETWORK_ERROR', async () => {
    const fetchError = new TypeError('fetch failed', {
      cause: Object.assign(new Error('Connect Timeout Error'), { code: 'UND_ERR_CONNECT_TIMEOUT' }),
    });
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(fetchError);
    vi.spyOn(logger, 'info').mockImplementation(() => logger);
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => logger);
    const res = createResponse();
    const applicationService = createApplicationService({ baseUrl: 'http://innsending-api.team-soknad' });

    const thrown = await captureRejection(
      applicationService.updateApplication({
        accessToken: 'token',
        innsendingsId: 'draft-123',
        body: { formPath: 'nav123' },
      }),
    );

    errorHandler(thrown, {} as Request, res, vi.fn());

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Draft request failed',
        errorType: 'TIMEOUT',
        dependency: 'innsending-api.team-soknad',
        causeCode: 'UND_ERR_CONNECT_TIMEOUT',
      }),
    );
  });

  it('classifies AbortSignal TimeoutError from http as TIMEOUT', async () => {
    const timeoutError = new DOMException('The operation was aborted due to timeout', 'TimeoutError');
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(timeoutError);
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => logger);
    const res = createResponse();

    const thrown = await captureRejection(http.get('http://forms-api.fyllut-sendinn/v1/forms/nav123'));

    errorHandler(thrown, {} as Request, res, vi.fn());

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        errorType: 'TIMEOUT',
        dependency: 'forms-api.fyllut-sendinn',
        causeCode: 'TimeoutError',
      }),
    );
  });

  it.each([
    [500, 'error', 'INTERNAL_SERVER_ERROR'],
    [503, 'warn', 'SERVICE_UNAVAILABLE'],
  ] as const)(
    'logs ERROR_RESPONSE and dependency for HTTP %s responses from http',
    async (status, level, errorCode) => {
      vi.spyOn(global, 'fetch').mockResolvedValueOnce(
        new Response(JSON.stringify({ message: 'Upstream failed' }), {
          status,
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      vi.spyOn(logger, 'warn').mockImplementation(() => logger);
      const logSpy = vi.spyOn(logger, level).mockImplementation(() => logger);
      const res = createResponse();

      const thrown = await captureRejection(
        http.post('http://familie-pdf.teamfamilie/api/v1/pdf', {}, { suppressTransportLogs: true }),
      );

      errorHandler(thrown, {} as Request, res, vi.fn());

      expect(logSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          errorCode,
          errorType: 'ERROR_RESPONSE',
          dependency: 'familie-pdf.teamfamilie',
        }),
      );
      expect(logSpy.mock.calls[0][0]).not.toHaveProperty('causeCode');
    },
  );

  it('extracts dependency from DNS errors and legacy HttpError causes without http wrapper', () => {
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => logger);
    const res = createResponse();

    const dnsFailure = new TypeError('fetch failed', {
      cause: Object.assign(new Error('getaddrinfo EAI_AGAIN'), {
        code: 'EAI_AGAIN',
        hostname: 'tokenx.prod-gcp.nav.cloud.nais.io',
      }),
    });
    errorHandler(
      new ResponseError('INTERNAL_SERVER_ERROR', 'Det oppstod en feil', 'corr-1', 'Det oppstod en feil', {
        cause: dnsFailure,
      }),
      {} as Request,
      res,
      vi.fn(),
    );

    expect(errorSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        errorType: 'NETWORK_ERROR',
        dependency: 'tokenx.prod-gcp.nav.cloud.nais.io',
        causeCode: 'EAI_AGAIN',
      }),
    );

    const legacyHttpError = Object.assign(new Error('Feil ved generering av førsteside'), {
      http_url: 'https://skjemabygging-proxy.prod-fss-pub.nais.io/foersteside',
      http_status: 502,
    });
    errorHandler(
      new ResponseError('INTERNAL_SERVER_ERROR', 'Feil ved generering av førsteside', 'corr-2', undefined, {
        cause: legacyHttpError,
      }),
      {} as Request,
      res,
      vi.fn(),
    );

    expect(errorSpy).toHaveBeenLastCalledWith(
      expect.objectContaining({
        errorType: 'ERROR_RESPONSE',
        dependency: 'skjemabygging-proxy.prod-fss-pub.nais.io',
      }),
    );
  });

  it('classifies JWKSTimeout causes as TIMEOUT without guessing dependency', () => {
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => logger);
    const res = createResponse();
    const jwksTimeout = Object.assign(new Error('request timed out'), {
      name: 'JWKSTimeout',
      code: 'ERR_JWKS_TIMEOUT',
    });

    errorHandler(
      new ResponseError('INTERNAL_SERVER_ERROR', 'Det oppstod en feil', 'corr-1', 'Det oppstod en feil', {
        cause: jwksTimeout,
      }),
      {} as Request,
      res,
      vi.fn(),
    );

    expect(errorSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        errorType: 'TIMEOUT',
        causeCode: 'ERR_JWKS_TIMEOUT',
      }),
    );
    expect(errorSpy.mock.calls[0][0]).not.toHaveProperty('dependency');
  });

  it('does not classify caller AbortError or internal errors as dependency errors', async () => {
    const abortError = new DOMException('The operation was aborted', 'AbortError');
    vi.spyOn(global, 'fetch').mockRejectedValueOnce(abortError);
    const errorSpy = vi.spyOn(logger, 'error').mockImplementation(() => logger);
    const res = createResponse();

    const thrownAbort = await captureRejection(http.get('http://forms-api.fyllut-sendinn/v1/forms/nav123'));
    errorHandler(thrownAbort, {} as Request, res, vi.fn());

    expect(errorSpy.mock.calls[0][0]).not.toHaveProperty('errorType');
    expect(errorSpy.mock.calls[0][0]).not.toHaveProperty('dependency');

    const internalBug = new Error('Cannot read properties of undefined');
    (internalBug as Error & { cause?: unknown }).cause = internalBug;
    errorHandler(
      new ResponseError('INTERNAL_SERVER_ERROR', 'Det oppstod en feil', 'corr-1', 'Det oppstod en feil', {
        cause: internalBug,
      }),
      {} as Request,
      res,
      vi.fn(),
    );

    expect(errorSpy.mock.calls[1][0]).not.toHaveProperty('errorType');
    expect(errorSpy.mock.calls[1][0]).not.toHaveProperty('dependency');
    expect(errorSpy.mock.calls[1][0]).not.toHaveProperty('causeCode');

    const errorWithArbitraryHostname = Object.assign(new Error('Validation failed'), {
      hostname: 'unexpected.example.test',
    });
    errorHandler(errorWithArbitraryHostname, {} as Request, res, vi.fn());

    expect(errorSpy.mock.calls[2][0]).not.toHaveProperty('errorType');
    expect(errorSpy.mock.calls[2][0]).not.toHaveProperty('dependency');
  });

  it('does not serialize cause or upstream response body when JSON.stringify is called on a wrapped ResponseError', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ message: 'Rejected', details: 'private-user-payload' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.spyOn(logger, 'info').mockImplementation(() => logger);
    vi.spyOn(logger, 'warn').mockImplementation(() => logger);
    const applicationService = createApplicationService({ baseUrl: 'http://innsending-api.team-soknad' });

    const thrown = await captureRejection(
      applicationService.uploadAttachment({
        accessToken: 'token',
        innsendingsId: 'draft-123',
        attachmentId: 'att-1',
        type: 'digital',
        fileBlob: new Blob(['data'], { type: 'application/pdf' }),
        fileName: 'doc.pdf',
      }),
    );

    const serialized = JSON.stringify(thrown);

    expect(serialized).not.toContain('private-user-payload');
    expect(serialized).not.toContain('"cause"');
    expect(serialized).not.toContain('"body"');
  });
});
