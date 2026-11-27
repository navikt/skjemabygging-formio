import { ResponseError } from '@navikt/skjemadigitalisering-shared-domain';
import { Request, Response } from 'express';
import { logger } from '../../shared/logger/logger';
import errorHandler from './errorHandler';

const createResponse = () => {
  const res = { locals: {} } as Response;
  res.header = vi.fn().mockReturnValue(res);
  res.contentType = vi.fn().mockReturnValue(res);
  res.status = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

describe('errorHandler', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['error', new ResponseError('INTERNAL_SERVER_ERROR', 'Failed', 'corr-1'), 500],
    ['warn', new ResponseError('BAD_REQUEST', 'Bad request', 'corr-1'), 400],
    ['warn', new ResponseError('SERVICE_UNAVAILABLE', 'Unavailable', 'corr-1'), 503],
  ] as const)('logs at %s level and marks the response as already logged', (level, error, status) => {
    const logSpy = vi.spyOn(logger, level).mockImplementation(() => logger);
    const otherLevel = level === 'error' ? 'warn' : 'error';
    const otherLogSpy = vi.spyOn(logger, otherLevel).mockImplementation(() => logger);
    const res = createResponse();

    errorHandler(error, {} as Request, res, vi.fn());

    expect(logSpy).toHaveBeenCalledOnce();
    expect(otherLogSpy).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(status);
    expect(res.locals.errorAlreadyLogged).toBe(true);
  });
});
