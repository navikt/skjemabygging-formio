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

const expectNoResponse = (spies: ReturnType<typeof createResponse>['spies']) => {
  for (const method of [spies.header, spies.contentType, spies.status, spies.send, spies.end]) {
    expect(method).not.toHaveBeenCalled();
  }
};

afterEach(() => vi.restoreAllMocks());

describe('requestAbortHandler', () => {
  it('logs a confirmed parser abort once without responding or forwarding it', () => {
    vi.spyOn(correlator, 'getId').mockReturnValue('abort-correlation');
    const info = vi.spyOn(logger, 'info').mockImplementation(() => logger);
    const { res, spies } = createResponse();
    const next = vi.fn();

    requestAbortHandler(createAbortError(), createRequest(), res, next);

    expect(info).toHaveBeenCalledExactlyOnceWith({
      message: 'Request body was aborted.',
      correlationId: 'abort-correlation',
      route: '/api/body',
    });
    expect(next).not.toHaveBeenCalled();
    expectNoResponse(spies);
  });

  it.each([
    { error: new Error('Request aborted'), state: { aborted: true } },
    { error: new Error('Request closed'), state: { aborted: false, destroyed: true, complete: false } },
  ])('logs a confirmed multipart disconnect once with upload context: $error', ({ error, state }) => {
    vi.spyOn(correlator, 'getId').mockReturnValue('upload-correlation');
    const info = vi.spyOn(logger, 'info').mockImplementation(() => logger);
    const req = createRequest({ ...state, is: () => 'multipart/form-data' });
    const { res, spies } = createResponse();
    const next = vi.fn();
    res.locals.requestLogMeta = {
      fieldName: 'filinnhold',
      innsendingsId: 'submission-1',
      attachmentId: 'attachment-1',
    };

    requestAbortHandler(error, req, res, next);

    expect(info).toHaveBeenCalledExactlyOnceWith({
      message: 'Request body was aborted.',
      correlationId: 'upload-correlation',
      route: '/api/body',
      fieldName: 'filinnhold',
      innsendingsId: 'submission-1',
      attachmentId: 'attachment-1',
    });
    expect(next).not.toHaveBeenCalled();
    expectNoResponse(spies);
  });

  it.each<[unknown, Partial<Request>]>([
    [createAbortError(), { aborted: false, destroyed: true, complete: true }],
    [Object.assign(new Error('stream failed'), { type: 'stream.not.readable', status: 500 }), {}],
    [new ResponseError('BAD_REQUEST', 'Invalid input'), {}],
    [new Error('Request aborted'), { is: () => 'multipart/form-data', aborted: false, destroyed: false }],
    [new Error('Request aborted'), { is: () => false }],
    [
      Object.assign(new Error('Request aborted'), { storageErrors: [new Error('Cannot remove file')] }),
      { is: () => 'multipart/form-data' },
    ],
  ])('forwards errors that are not confirmed disconnects unchanged: %o', (error, state) => {
    const info = vi.spyOn(logger, 'info');
    const { res } = createResponse();
    const next = vi.fn();

    requestAbortHandler(error, createRequest(state), res, next);

    expect(next).toHaveBeenCalledExactlyOnceWith(error);
    expect(info).not.toHaveBeenCalled();
  });
});

describe('errorHandler', () => {
  // sendinn-backend and form-spec-api use errorHandler without requestAbortHandler.
  it('logs a confirmed parser abort once without responding', () => {
    const info = vi.spyOn(logger, 'info').mockImplementation(() => logger);
    const errorLog = vi.spyOn(logger, 'error');
    const { res, spies } = createResponse();

    errorHandler(createAbortError(), createRequest(), res, vi.fn());

    expect(info).toHaveBeenCalledOnce();
    expect(errorLog).not.toHaveBeenCalled();
    expectNoResponse(spies);
  });
});
