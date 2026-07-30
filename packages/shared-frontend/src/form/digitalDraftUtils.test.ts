import {
  buildDigitalFormSearch,
  isSoknadAlreadyExistsResponse,
  resolveDigitalDraftResume,
  shouldUseLegacyPageForNewRenderer,
} from './digitalDraftUtils';

describe('digitalDraftUtils', () => {
  describe('resolveDigitalDraftResume', () => {
    it('resumes a single existing draft when no draft id is present in the URL', () => {
      expect(
        resolveDigitalDraftResume('', [
          {
            innsendingsId: 'draft-1',
            soknadstype: 'soknad',
          },
        ]),
      ).toEqual({ type: 'resume', innsendingsId: 'draft-1' });
    });

    it('redirects to active tasks when multiple or mixed active tasks exist', () => {
      expect(
        resolveDigitalDraftResume('', [
          {
            innsendingsId: 'draft-1',
            soknadstype: 'soknad',
          },
          {
            innsendingsId: 'draft-2',
            soknadstype: 'ettersendelse',
          },
        ]),
      ).toEqual({ type: 'active-tasks' });
    });

    it('skips resume lookup when the URL already controls draft handling', () => {
      expect(
        resolveDigitalDraftResume('?innsendingsId=current-draft', [
          {
            innsendingsId: 'draft-1',
            soknadstype: 'soknad',
          },
        ]),
      ).toEqual({ type: 'none' });

      expect(
        resolveDigitalDraftResume('?forceMellomlagring=true', [
          {
            innsendingsId: 'draft-1',
            soknadstype: 'soknad',
          },
        ]),
      ).toEqual({ type: 'none' });

      expect(
        resolveDigitalDraftResume('?deletedDraft=1', [
          {
            innsendingsId: 'draft-1',
            soknadstype: 'soknad',
          },
        ]),
      ).toEqual({ type: 'none' });
    });
  });

  describe('buildDigitalFormSearch', () => {
    it('adds digital submission and removes transient forceMellomlagring after draft creation', () => {
      expect(
        buildDigitalFormSearch('?forceMellomlagring=true', { forceMellomlagring: undefined, innsendingsId: '123' }),
      ).toBe('?sub=digital&innsendingsId=123');
    });
  });

  describe('shouldUseLegacyPageForNewRenderer', () => {
    it('keeps active tasks on the legacy router', () => {
      expect(shouldUseLegacyPageForNewRenderer('paabegynt')).toBe(true);
      expect(shouldUseLegacyPageForNewRenderer('legitimasjon')).toBe(true);
      expect(shouldUseLegacyPageForNewRenderer('pdf')).toBe(true);
      expect(shouldUseLegacyPageForNewRenderer('oppsummering')).toBe(false);
    });
  });

  describe('isSoknadAlreadyExistsResponse', () => {
    it('recognizes create-draft conflicts from send-inn', () => {
      expect(isSoknadAlreadyExistsResponse({ status: 'soknadAlreadyExists' })).toBe(true);
      expect(isSoknadAlreadyExistsResponse({ status: 'ok' })).toBe(false);
    });
  });
});
