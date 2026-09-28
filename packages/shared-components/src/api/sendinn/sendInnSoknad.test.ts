import type { NavFormType, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it, vi } from 'vitest';
import type { AppConfigContextType } from '../../context/config/configContext';
import { updateSoknad, updateUtfyltSoknad } from './sendInnSoknad';

describe('updateSoknad', () => {
  it('rejects a missing draft ID instead of silently skipping the save', async () => {
    const put = vi.fn();
    const appConfig = {
      baseUrl: '/fyllut',
      submissionMethod: 'digital',
      http: { put },
    } as unknown as AppConfigContextType;
    const form = { path: 'test-form' } as NavFormType;
    const submission = { data: {} } as Submission;

    await expect(updateSoknad(appConfig, form, submission, 'nb-NO', undefined)).rejects.toMatchObject({
      errorCode: 'ERROR',
      message: 'Draft submission ID is missing',
    });
    expect(put).not.toHaveBeenCalled();
  });

  it('rejects a missing draft ID before submission so the fallback save cannot be mistaken for success', async () => {
    const put = vi.fn();
    const appConfig = {
      baseUrl: '/fyllut',
      submissionMethod: 'digital',
      http: { put },
    } as unknown as AppConfigContextType;
    const form = { path: 'test-form', components: [] } as unknown as NavFormType;

    await expect(
      updateUtfyltSoknad(appConfig, form, { data: {} } as Submission, 'nb-NO', undefined, vi.fn()),
    ).rejects.toMatchObject({ errorCode: 'ERROR', message: 'Draft submission ID is missing' });
    expect(put).not.toHaveBeenCalled();
  });
});
