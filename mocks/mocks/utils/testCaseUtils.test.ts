import { describe, expect, it, vi } from 'vitest';
import { compareBodyMiddleware, verifyJsonBody } from './testCaseUtils';

describe('request body verification', () => {
  it('does not mutate frozen nested expected data or actual data over repeated calls', () => {
    const expected = Object.freeze({
      attachments: Object.freeze([Object.freeze({ fileIds: Object.freeze(['original']), name: 'attachment' })]),
      footer: Object.freeze({ version: 'version', date: 'today' }),
    });
    const actual = {
      attachments: [{ fileIds: ['generated'], name: 'attachment' }],
      footer: { version: 'version', date: 'tomorrow' },
    };
    const before = structuredClone(actual);
    for (let index = 0; index < 2; index++) {
      expect(verifyJsonBody(actual, expected, ['attachments.fileIds', 'footer.date'])).toEqual([]);
      expect(actual).toEqual(before);
      expect(expected.attachments[0].fileIds).toEqual(['original']);
    }
    expect(
      verifyJsonBody({ ...actual, footer: { version: 'wrong' } }, expected, ['attachments.fileIds', 'footer.date']),
    ).toEqual([{ path: 'footer.version', expected: 'version', actual: 'wrong' }]);
  });

  it('awaits async success and forwards rejection to middleware error handling', async () => {
    const next = vi.fn();
    const error = new Error('controlled failure');
    const middleware = compareBodyMiddleware({}, [], async () => {
      throw error;
    });
    const request = { body: {} } as Parameters<typeof middleware>[0];
    const response = {} as Parameters<typeof middleware>[1];
    await middleware(request, response, next);
    expect(next).toHaveBeenCalledExactlyOnceWith(error);
  });
});
