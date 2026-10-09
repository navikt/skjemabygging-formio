import type { NextFunction, Request, Response } from 'express';
import { vi } from 'vitest';
import type { AuthHandlerLogger } from '../authHandlerLogger';

const createRequest = (authorization?: string) =>
  ({
    method: 'GET',
    path: '/sendinn/api/test',
    header: (name: string) => (name === 'Authorization' ? authorization : undefined),
  }) as Request;

const createResponse = (locals: Record<string, unknown> = {}) => ({ locals }) as unknown as Response;

const createNext = () => {
  const spy = vi.fn();
  const next = ((error?: unknown) => spy(error)) as NextFunction;
  return { next, spy };
};

const createLogger = (): AuthHandlerLogger => ({ debug: vi.fn(), info: vi.fn(), warn: vi.fn() });

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

export { createLogger, createNext, createRequest, createResponse, jsonResponse };
