import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { createFrontendLogHandler } from './frontendLogHandler';

const setup = (level: string) => {
  const logger = { info: vi.fn(), warn: vi.fn(), error: vi.fn() };
  const req = { params: { level }, body: { message: 'hello' } } as unknown as Request;
  const res = { sendStatus: vi.fn() };
  return { handler: createFrontendLogHandler(logger), logger, req, res: res as unknown as Response };
};

describe('createFrontendLogHandler', () => {
  it('logs info entries marked as frontend', () => {
    const { handler, logger, req, res } = setup('info');

    handler(req, res);

    expect(logger.info).toHaveBeenCalledWith({ message: 'hello', source: 'frontend' });
    expect(res.sendStatus).toHaveBeenCalledWith(200);
  });

  it('logs error entries as warnings marked as frontend', () => {
    const { handler, logger, req, res } = setup('error');

    handler(req, res);

    expect(logger.warn).toHaveBeenCalledWith({ message: 'hello', source: 'frontend' });
    expect(logger.error).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(200);
  });

  it('rejects unsupported log levels with a bad request error', () => {
    const { handler, logger, req, res } = setup('debug');

    expect(() => handler(req, res)).toThrow(
      expect.objectContaining({ errorCode: 'BAD_REQUEST', message: 'Unsupported log level: debug' }),
    );
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });
});
