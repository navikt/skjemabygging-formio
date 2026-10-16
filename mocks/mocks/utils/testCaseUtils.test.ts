import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { compareBodyMiddleware } from './testCaseUtils';

describe('compareBodyMiddleware', () => {
  afterEach(() => vi.unstubAllEnvs());

  it('does not mutate nested expectations when excluding generated fields', async () => {
    const expected = { stable: 'kept', nested: { generated: 'expected' }, attachments: [{ fileIds: ['expected'] }] };
    const original = structuredClone(expected);
    const actual = { stable: 'kept', nested: { generated: 'other' }, attachments: [{ fileIds: ['other'] }] };
    const success = vi.fn();
    const next = vi.fn();
    const middleware = compareBodyMiddleware(expected, ['nested.generated', 'attachments.fileIds'], success);
    await middleware({ body: actual }, {}, next);
    await middleware({ body: actual }, {}, next);
    expect(success).toHaveBeenCalledTimes(2);
    expect(next).not.toHaveBeenCalled();
    expect(expected).toEqual(original);
  });

  it('reports only the verification ID and mismatch paths in the opt-in log', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'fyllut-body-'));
    const path = join(directory, 'checks.jsonl');
    vi.stubEnv('MOCKS_BODY_VERIFICATION_LOG', path);
    const response = { status: vi.fn(), contentType: vi.fn(), send: vi.fn() };
    const success = vi.fn();
    const next = vi.fn();
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const middleware = compareBodyMiddleware({ nested: { value: 'expected' } }, [], success, 'test:tc07');
      await middleware({ body: { nested: { value: 'expected' } } }, response, next);
      await middleware({ body: { nested: { value: 'wrong' } } }, response, next);
      expect(success).toHaveBeenCalledTimes(1);
      expect(response.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
      expect(
        readFileSync(path, 'utf8')
          .trim()
          .split('\n')
          .map((line) => JSON.parse(line)),
      ).toEqual([
        { id: 'test:tc07', mismatches: [] },
        { id: 'test:tc07', mismatches: ['nested.value'] },
      ]);
    } finally {
      errorLog.mockRestore();
      rmSync(directory, { recursive: true });
    }
  });

  it('awaits the response handler and forwards failures to Express', async () => {
    const error = new Error('Response handler failed');
    const next = vi.fn();
    await compareBodyMiddleware({}, [], async () => {
      throw error;
    })({ body: {} }, {}, next);
    expect(next).toHaveBeenCalledWith(error);
  });
});
