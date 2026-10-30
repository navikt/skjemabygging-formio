import { sendinnEntryUtils } from './sendinnEntryUtils';

const { createNotFoundPath, resolveEntry, requiresLogin } = sendinnEntryUtils;

const submissionId = '3f2a9c4e-8b1d-4e6f-9a7c-2d5b8e1f0c3a';
const query = (value = '') => new URLSearchParams(value);

describe('sendinnEntryUtils', () => {
  describe('resolveEntry', () => {
    describe('standalone', () => {
      it('resolves the reserved lospost segment to standalone', () => {
        expect(resolveEntry('/lospost', query())).toEqual({ journey: 'standalone' });
      });

      it('ignores innsendingsId', () => {
        expect(resolveEntry('/lospost', query(`innsendingsId=${submissionId}`))).toEqual({ journey: 'standalone' });
        expect(resolveEntry('/lospost', query('innsendingsId=invalid'))).toEqual({ journey: 'standalone' });
      });
    });

    describe('form', () => {
      it('resolves a valid form path without innsendingsId', () => {
        expect(resolveEntry('/nav123456', query())).toEqual({ journey: 'form', formPath: 'nav123456' });
      });

      it('accepts a trailing slash', () => {
        expect(resolveEntry('/nav123456/', query())).toEqual({ journey: 'form', formPath: 'nav123456' });
      });

      it.each(['sendinnCollection', 'sendinnAttachments', 'oppsummering'])(
        'resolves a direct form step %s with language and filters',
        (step) => {
          expect(resolveEntry(`/nav123456/${step}`, query('lang=en&filter=N1&filter=N2'))).toEqual({
            journey: 'form',
            formPath: 'nav123456',
          });
        },
      );

      it('ignores other query parameters', () => {
        expect(resolveEntry('/nav123456', query('lang=en&sub=digital'))).toEqual({
          journey: 'form',
          formPath: 'nav123456',
        });
      });

      it.each(['NAV123456', 'nav-123456', 'nav_123456', 'nav.123', 'nav%20123'])(
        'returns unavailable for invalid form path %s',
        (formPath) => {
          expect(resolveEntry(`/${formPath}`, query())).toEqual({ journey: 'unavailable' });
        },
      );
    });

    describe('formWithTask', () => {
      it('maps innsendingsId to submissionId', () => {
        expect(resolveEntry('/nav123456', query(`innsendingsId=${submissionId}&lang=nn`))).toEqual({
          journey: 'formWithTask',
          formPath: 'nav123456',
          submissionId,
        });
      });

      it('returns unavailable for an invalid innsendingsId', () => {
        expect(resolveEntry('/nav123456', query('innsendingsId=123'))).toEqual({ journey: 'unavailable' });
      });

      it('returns unavailable for an empty innsendingsId', () => {
        expect(resolveEntry('/nav123456', query('innsendingsId='))).toEqual({ journey: 'unavailable' });
      });

      it('returns unavailable for repeated innsendingsId', () => {
        expect(
          resolveEntry('/nav123456', query(`innsendingsId=${submissionId}&innsendingsId=${submissionId}`)),
        ).toEqual({
          journey: 'unavailable',
        });
      });

      it('returns unavailable for an invalid form path', () => {
        expect(resolveEntry('/Nav-123', query(`innsendingsId=${submissionId}`))).toEqual({ journey: 'unavailable' });
      });
    });

    describe('task', () => {
      it('resolves the reserved oppgave segment with a valid innsendingsId', () => {
        expect(resolveEntry('/oppgave', query(`innsendingsId=${submissionId}`))).toEqual({
          journey: 'task',
          submissionId,
        });
      });

      it('accepts an uppercase UUID', () => {
        expect(resolveEntry('/oppgave', query(`innsendingsId=${submissionId.toUpperCase()}`))).toEqual({
          journey: 'task',
          submissionId: submissionId.toUpperCase(),
        });
      });

      it('returns unavailable without innsendingsId', () => {
        expect(resolveEntry('/oppgave', query())).toEqual({ journey: 'unavailable' });
      });

      it('returns unavailable for an invalid innsendingsId', () => {
        expect(resolveEntry('/oppgave', query('innsendingsId=not-a-uuid'))).toEqual({ journey: 'unavailable' });
      });
    });

    describe('taskLink', () => {
      it('resolves a UUID segment to a task link', () => {
        expect(resolveEntry(`/${submissionId}`, query())).toEqual({ journey: 'taskLink', submissionId });
      });

      it('ignores innsendingsId', () => {
        expect(resolveEntry(`/${submissionId}`, query('innsendingsId=invalid'))).toEqual({
          journey: 'taskLink',
          submissionId,
        });
      });

      it('returns unavailable for more than one segment', () => {
        expect(resolveEntry(`/${submissionId}/extra`, query())).toEqual({ journey: 'unavailable' });
      });
    });

    describe('unavailable', () => {
      it.each([
        '/lospost/sendinnCollection',
        '/oppgave/sendinnCollection',
        '/404/oppsummering',
        `/${submissionId}/oppsummering`,
        '/nav123456/oppsummering/extra',
        '/nav123456//sendinnAttachments',
        '//nav123456/sendinnAttachments',
        '/INVALID/sendinnAttachments',
      ])('rejects form steps outside the paper form journey %s', (path) => {
        expect(resolveEntry(path, query())).toEqual({ journey: 'unavailable' });
      });

      it('does not open a task-based form through a paper step', () => {
        expect(resolveEntry('/nav123456/oppsummering', query(`innsendingsId=${submissionId}`))).toEqual({
          journey: 'unavailable',
        });
      });

      it.each(['', '/', '//'])('returns unavailable for the root path %j', (path) => {
        expect(resolveEntry(path, query())).toEqual({ journey: 'unavailable' });
      });

      it.each(['/404', '/404/'])('returns unavailable for the reserved not found segment %s', (path) => {
        expect(resolveEntry(path, query())).toEqual({ journey: 'unavailable' });
        expect(resolveEntry(path, query(`innsendingsId=${submissionId}`))).toEqual({ journey: 'unavailable' });
      });

      it.each(['/nav123456/extra', '/oppgave/nav123456', '/lospost/nav123456'])(
        'returns unavailable for more than one segment %s',
        (path) => {
          expect(resolveEntry(path, query(`innsendingsId=${submissionId}`))).toEqual({ journey: 'unavailable' });
        },
      );
    });
  });

  describe('createNotFoundPath', () => {
    it('returns the not found path without query parameters', () => {
      expect(createNotFoundPath(query())).toBe('/404');
    });

    it('keeps only the language parameter', () => {
      expect(createNotFoundPath(query(`lang=nn&innsendingsId=${submissionId}&sub=digital`))).toBe('/404?lang=nn');
    });

    it('encodes the language parameter', () => {
      expect(createNotFoundPath(query('lang=a%26b'))).toBe('/404?lang=a%26b');
    });

    it('ignores an empty language parameter', () => {
      expect(createNotFoundPath(query('lang='))).toBe('/404');
    });
  });

  describe('requiresLogin', () => {
    it.each([
      [{ journey: 'formWithTask', formPath: 'nav123456', submissionId } as const, true],
      [{ journey: 'task', submissionId } as const, true],
      [{ journey: 'taskLink', submissionId } as const, true],
      [{ journey: 'form', formPath: 'nav123456' } as const, false],
      [{ journey: 'standalone' } as const, false],
      [{ journey: 'unavailable' } as const, false],
    ])('%j requires login: %s', (entry, expected) => {
      expect(requiresLogin(entry)).toBe(expected);
    });
  });
});

describe('createLoginUrl', () => {
  it('encodes a return path under the base path', () => {
    expect(sendinnEntryUtils.createLoginUrl(`/sendinn/oppgave?innsendingsId=${submissionId}&lang=en`)).toBe(
      `/sendinn/oauth2/login?redirect=${encodeURIComponent(`/sendinn/oppgave?innsendingsId=${submissionId}&lang=en`)}`,
    );
  });

  it.each(['https://evil.example/sendinn', '//evil.example/sendinn', '/sendinnx', '/fyllut/nav123', '/sendinn\\evil'])(
    'falls back to the base path for %s',
    (returnPath) => {
      expect(sendinnEntryUtils.createLoginUrl(returnPath)).toBe('/sendinn/oauth2/login?redirect=%2Fsendinn');
    },
  );
});
