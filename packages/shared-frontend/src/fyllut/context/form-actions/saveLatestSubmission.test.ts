import { Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it, vi } from 'vitest';
import { saveLatestSubmission } from './saveLatestSubmission';

const deferred = () => {
  let resolve!: () => void;
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};

describe('saveLatestSubmission', () => {
  it('waits for successive edits to be saved without another explicit save request', async () => {
    const firstRequest = deferred();
    const secondRequest = deferred();
    const initial: Submission = { data: { answer: 'initial', hiddenAnswer: 'old' } };
    let current = initial;
    const save = vi
      .fn<(submission: Submission) => Promise<void>>()
      .mockReturnValueOnce(firstRequest.promise)
      .mockReturnValueOnce(secondRequest.promise)
      .mockResolvedValue(undefined);
    let finished = false;
    const saving = saveLatestSubmission(() => current, save).then((result) => {
      finished = true;
      return result;
    });

    const edited = { data: { answer: 'edited' } };
    current = edited;
    firstRequest.resolve();
    await Promise.resolve();

    expect(save.mock.calls).toEqual([[initial], [edited]]);
    expect(finished).toBe(false);

    const latest = { ...edited, selfDeclaration: true, attachments: [] };
    current = latest;
    secondRequest.resolve();

    expect(await saving).toBe(true);
    expect(save.mock.calls).toEqual([[initial], [edited], [latest]]);
  });

  it('does not save again for acknowledgement metadata or unchanged transport content', async () => {
    let current: Submission = { data: { answer: 'saved' } };
    const save = vi.fn(async () => {
      current = {
        ...current,
        data: { ...current.data, empty: {} },
        fyllutState: {
          mellomlagring: { isActive: true, savedDate: '29.09.2026 15:00', deletionDate: '27.10.2026' },
        },
      };
    });

    expect(await saveLatestSubmission(() => current, save)).toBe(true);
    expect(save).toHaveBeenCalledTimes(1);
  });

  it('rejects a failed follow-up save and retries the latest content only when requested', async () => {
    const firstRequest = deferred();
    const error = new Error('Follow-up save failed');
    let current: Submission = { data: { answer: 'initial' } };
    const save = vi
      .fn<(submission: Submission) => Promise<void>>()
      .mockReturnValueOnce(firstRequest.promise)
      .mockRejectedValueOnce(error)
      .mockResolvedValue(undefined);
    const saving = saveLatestSubmission(() => current, save);
    current = { data: { answer: 'latest' } };
    firstRequest.resolve();

    await expect(saving).rejects.toBe(error);
    expect(save).toHaveBeenCalledTimes(2);
    expect(current.data).toEqual({ answer: 'latest' });

    expect(await saveLatestSubmission(() => current, save)).toBe(true);
    expect(save).toHaveBeenLastCalledWith(current);
    expect(save).toHaveBeenCalledTimes(3);
  });

  it('does not report success if the submission is cleared during a save', async () => {
    let current: Submission | undefined = { data: { answer: 'initial' } };
    const save = vi.fn(async () => {
      current = undefined;
    });

    expect(await saveLatestSubmission(() => current, save)).toBe(false);
    expect(await saveLatestSubmission(() => current, save)).toBe(false);
    expect(save).toHaveBeenCalledTimes(1);
  });
});
