import { sendinnEntryUtils } from './entryResolver';

const { resolveEntry, requiresLogin } = sendinnEntryUtils;

const submissionId = '3f2a9c4e-8b1d-4e6f-9a7c-2d5b8e1f0c3a';
const query = (value = '') => new URLSearchParams(value);

describe('sendinnEntryUtils', () => {
  describe('resolveEntry', () => {
    describe('lospost', () => {
      it('resolves the reserved lospost segment', () => {
        expect(resolveEntry('/lospost', query())).toEqual({ journey: 'lospost' });
      });

      it('ignores innsendingsId', () => {
        expect(resolveEntry('/lospost', query(`innsendingsId=${submissionId}`))).toEqual({ journey: 'lospost' });
        expect(resolveEntry('/lospost', query('innsendingsId=invalid'))).toEqual({ journey: 'lospost' });
      });
    });

    describe('form', () => {
      it('resolves a valid form path without innsendingsId', () => {
        expect(resolveEntry('/nav123456', query())).toEqual({ journey: 'form', formPath: 'nav123456' });
      });

      it('accepts a trailing slash', () => {
        expect(resolveEntry('/nav123456/', query())).toEqual({ journey: 'form', formPath: 'nav123456' });
      });

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

    describe('unavailable', () => {
      it.each(['', '/', '//'])('returns unavailable for the root path %j', (path) => {
        expect(resolveEntry(path, query())).toEqual({ journey: 'unavailable' });
      });

      it.each(['/nav123456/extra', '/oppgave/nav123456', '/lospost/nav123456'])(
        'returns unavailable for more than one segment %s',
        (path) => {
          expect(resolveEntry(path, query(`innsendingsId=${submissionId}`))).toEqual({ journey: 'unavailable' });
        },
      );
    });
  });

  describe('requiresLogin', () => {
    it.each([
      [{ journey: 'formWithTask', formPath: 'nav123456', submissionId } as const, true],
      [{ journey: 'task', submissionId } as const, true],
      [{ journey: 'form', formPath: 'nav123456' } as const, false],
      [{ journey: 'lospost' } as const, false],
      [{ journey: 'unavailable' } as const, false],
    ])('%j requires login: %s', (entry, expected) => {
      expect(requiresLogin(entry)).toBe(expected);
    });
  });
});
