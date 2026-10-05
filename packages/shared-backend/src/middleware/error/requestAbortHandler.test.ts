import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { Request, Response } from 'express';
import correlator from 'express-correlation-id';
import { logger } from '../../shared/logger/logger';
import errorHandler from './errorHandler';
import { requestAbortHandler } from './requestAbortHandler';

const createRequest = (overrides: Partial<Request> = {}) =>
  ({
    aborted: true,
    destroyed: true,
    complete: false,
    originalUrl: '/api/body?access=hidden',
    is: () => false,
    ...overrides,
  }) as Request;

const createResponse = () => {
  const res = {
    locals: {},
    header: vi.fn<Response['header']>().mockReturnThis(),
    contentType: vi.fn<Response['contentType']>().mockReturnThis(),
    status: vi.fn<Response['status']>().mockReturnThis(),
    send: vi.fn<Response['send']>().mockReturnThis(),
    end: vi.fn<Response['end']>().mockReturnThis(),
  };
  return { res: res as unknown as Response, spies: res };
};

const createAbortError = () =>
  Object.assign(new Error('request aborted'), {
    type: 'request.aborted',
    status: 400,
    received: 10,
    expected: 100,
  });

afterEach(() => vi.restoreAllMocks());

describe.each([
  { name: 'requestAbortHandler', handler: requestAbortHandler },
  { name: 'errorHandler', handler: errorHandler },
])('$name', ({ handler }) => {
  it.each([{ aborted: true }, { aborted: false, destroyed: true, complete: false }])(
    'logs a confirmed parser abort once without responding or forwarding it: %o',
    (state) => {
      vi.spyOn(correlator, 'getId').mockReturnValue('abort-correlation');
      const info = vi.spyOn(logger, 'info').mockImplementation(() => logger);
      const warn = vi.spyOn(logger, 'warn');
      const error = vi.spyOn(logger, 'error');
      const { res, spies } = createResponse();
      const next = vi.fn();

      handler(createAbortError(), createRequest(state), res, next);

      expect(info).toHaveBeenCalledExactlyOnceWith({
        message: 'Request body was aborted.',
        correlationId: 'abort-correlation',
        route: '/api/body',
      });
      expect(warn).not.toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
      for (const method of [spies.header, spies.contentType, spies.status, spies.send, spies.end]) {
        expect(method).not.toHaveBeenCalled();
      }
    },
  );

  it.each([
    { error: new Error('Request aborted'), state: { aborted: true } },
    { error: new Error('Request closed'), state: { aborted: false, destroyed: true, complete: false } },
  ])('logs a confirmed multipart disconnect once without responding or forwarding it: $error', ({ error, state }) => {
    vi.spyOn(correlator, 'getId').mockReturnValue('upload-correlation');
    const info = vi.spyOn(logger, 'info').mockImplementation(() => logger);
    const warn = vi.spyOn(logger, 'warn');
    const errorLog = vi.spyOn(logger, 'error');
    const req = createRequest({ ...state, is: () => 'multipart/form-data', params: { innsendingsId: 'submission-1' } });
    const { res, spies } = createResponse();
    const next = vi.fn();
    res.locals.requestLogMeta = {
      fieldName: 'filinnhold',
      innsendingsId: 'submission-1',
      attachmentId: 'attachment-1',
    };
    req.params = {};

    handler(error, req, res, next);

    expect(info).toHaveBeenCalledExactlyOnceWith({
      message: 'Request body was aborted.',
      correlationId: 'upload-correlation',
      route: '/api/body',
      fieldName: 'filinnhold',
      innsendingsId: 'submission-1',
      attachmentId: 'attachment-1',
    });
    expect(warn).not.toHaveBeenCalled();
    expect(errorLog).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
    for (const method of [spies.header, spies.contentType, spies.status, spies.send, spies.end]) {
      expect(method).not.toHaveBeenCalled();
    }
  });
});

describe('requestAbortHandler', () => {
  it.each<[unknown, Partial<Request>]>([
    [createAbortError(), { aborted: false, destroyed: false }],
    [createAbortError(), { aborted: false, complete: true }],
    [Object.assign(new Error('stream failed'), { type: 'stream.not.readable', status: 500 }), {}],
    [Object.assign(new Error('unexpected abort'), { type: 'request.aborted', status: 500 }), {}],
    [new ResponseError('BAD_REQUEST', 'Invalid input'), {}],
    [new Error('unexpected failure'), {}],
    [new Error('Request aborted'), { is: () => 'multipart/form-data', aborted: false, destroyed: false }],
    [
      new Error('Request aborted'),
      { is: () => 'multipart/form-data', aborted: false, destroyed: true, complete: false },
    ],
    [new Error('Request closed'), { is: () => 'multipart/form-data', aborted: false, complete: true }],
    [new Error('Request aborted'), { is: () => false }],
    [new Error('Request closed'), { is: () => false }],
    [new ResponseError('INTERNAL_SERVER_ERROR', 'Request aborted'), { is: () => 'multipart/form-data' }],
    [Object.assign(new Error('Request aborted'), { code: 'EIO' }), { is: () => 'multipart/form-data' }],
    [Object.assign(new Error('Request aborted'), { status: 500 }), { is: () => 'multipart/form-data' }],
    [
      Object.assign(new Error('Request aborted'), { storageErrors: [new Error('Cannot remove file')] }),
      { is: () => 'multipart/form-data' },
    ],
    [
      new AggregateError([new Error('Cannot remove file')], 'Failed to remove temporary upload files.'),
      { is: () => 'multipart/form-data' },
    ],
    [Object.assign(createAbortError(), { storageErrors: [new Error('Cannot remove file')] }), {}],
    [null, {}],
  ])('forwards errors that are not confirmed parser disconnects unchanged: %o', (error, state) => {
    const info = vi.spyOn(logger, 'info');
    const { res } = createResponse();
    const next = vi.fn();

    requestAbortHandler(error, createRequest(state), res, next);

    expect(next).toHaveBeenCalledExactlyOnceWith(error);
    expect(info).not.toHaveBeenCalled();
  });
});

describe('errorHandler', () => {
  it.each([
    Object.assign(new Error('Request aborted'), { storageErrors: [new Error('Cannot remove file')] }),
    new AggregateError([new Error('Cannot remove file')], 'Failed to remove temporary upload files.'),
  ])('keeps upload cleanup failures alertable after a disconnect: %s', (error) => {
    const errorLog = vi.spyOn(logger, 'error');
    const info = vi.spyOn(logger, 'info');
    const { res, spies } = createResponse();

    errorHandler(error, createRequest({ is: () => 'multipart/form-data' }), res, vi.fn());

    expect(errorLog).toHaveBeenCalledOnce();
    expect(spies.status).toHaveBeenCalledWith(500);
    expect(res.locals.errorAlreadyLogged).toBe(true);
    expect(info).not.toHaveBeenCalled();
  });

  it('keeps unexpected stream errors alertable even after a disconnect', () => {
    const error = Object.assign(new Error('stream failed'), { type: 'stream.not.readable', status: 500 });
    const errorLog = vi.spyOn(logger, 'error');
    const info = vi.spyOn(logger, 'info');
    const { res, spies } = createResponse();

    errorHandler(error, createRequest(), res, vi.fn());

    expect(errorLog).toHaveBeenCalledOnce();
    expect(spies.status).toHaveBeenCalledWith(500);
    expect(spies.send).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'ERROR' }));
    expect(res.locals.errorAlreadyLogged).toBe(true);
    expect(info).not.toHaveBeenCalled();
  });

  it('preserves normal client-error responses', () => {
    const error = new ResponseError('BAD_REQUEST', 'Invalid input', 'client-correlation');
    const warn = vi.spyOn(logger, 'warn');
    const { res, spies } = createResponse();

    errorHandler(error, createRequest({ aborted: false, destroyed: false, complete: true }), res, vi.fn());

    expect(warn).toHaveBeenCalledOnce();
    expect(spies.status).toHaveBeenCalledWith(400);
    expect(spies.header).toHaveBeenCalledWith('x-correlation-id', 'client-correlation');
    expect(spies.send).toHaveBeenCalledWith(
      expect.objectContaining({ errorCode: 'BAD_REQUEST', correlationId: 'client-correlation' }),
    );
  });
});
