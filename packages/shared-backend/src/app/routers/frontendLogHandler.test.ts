import type { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { createFrontendLogHandler } from './frontendLogHandler';

const setup = (level: string) => {
  const logger = { info: vi.fn(), error: vi.fn() };
  const req = { params: { level }, body: { message: 'hello' } } as unknown as Request;
  const res = {
    json: vi.fn(),
    sendStatus: vi.fn(),
    status: vi.fn(),
  };
  res.status.mockReturnValue(res);
  return { handler: createFrontendLogHandler(logger), logger, req, res };
};

describe('createFrontendLogHandler', () => {
  it.each(['info', 'error'] as const)('logs %s entries marked as frontend', async (level) => {
    const { handler, logger, req, res } = setup(level);

    await handler(req, res as unknown as Response);

    expect(logger[level]).toHaveBeenCalledWith({ message: 'hello', source: 'frontend' });
    expect(res.sendStatus).toHaveBeenCalledWith(200);
  });

  it('rejects unsupported log levels', async () => {
    const { handler, logger, req, res } = setup('debug');

    await handler(req, res as unknown as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unsupported log level: debug' });
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });
});
