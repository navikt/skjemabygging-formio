import { dateUtils, Submission, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it, vi } from 'vitest';
import type { CreateDraftResult, Draft } from '../../../context/runtime-services/RuntimeServices';
import { withDraftMetadata } from '../../draft/withDraftMetadata';
import prepareSubmissionForTransport from '../../submission/prepareSubmissionForTransport';
import { createDraftPersistence } from './draftPersistence';

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
};

const draft: Draft = {
  id: 'draft-1',
  language: 'nb',
  submission: { data: { answer: 'old', hidden: 'must not return' }, selfDeclaration: false },
  modifiedAt: '2026-09-23T10:00:00.000Z',
  deleteAt: '2026-10-21T10:00:00.000Z',
};

const createOperations = () => ({
  create: vi.fn(async (): Promise<CreateDraftResult> => ({ status: 'created', draft })),
  update: vi.fn(async (_id: string, _submission: Submission) => draft),
  sync: vi.fn(),
  alreadyExists: vi.fn(),
  isActive: vi.fn(() => true),
});

describe('saved draft reconciliation', () => {
  it('preserves newer answers, conditional clearing, attachment edits and all other local state', () => {
    const attachment: SubmissionAttachment = {
      attachmentId: 'documentation',
      navId: 'documentation',
      type: 'default',
      value: 'leggerVedNaa',
      files: [],
    };
    const current: Submission = {
      data: { answer: 'new', rows: [{ documentation: attachment }] },
      attachments: [attachment],
      selfDeclaration: true,
      state: 'local-state',
      fyllutState: {
        mellomlagring: { isActive: false, error: { type: 'UPDATE_FAILED', message: 'local error' } },
      },
    };
    const savedDraft = {
      ...draft,
      submission: { ...draft.submission, attachments: [{ ...attachment, value: 'ettersender' }] },
    };

    const reconciled = withDraftMetadata(current, savedDraft)!;

    expect(reconciled).toEqual({
      ...current,
      fyllutState: {
        mellomlagring: {
          ...current.fyllutState?.mellomlagring,
          isActive: true,
          savedDate: dateUtils.toLocaleDateAndTime(draft.modifiedAt),
          deletionDate: dateUtils.toLocaleDate(draft.deleteAt),
        },
      },
    });
    expect(reconciled.data).toBe(current.data);
    expect(reconciled.attachments).toBe(current.attachments);
    expect(reconciled.data).not.toHaveProperty('hidden');
    expect(current.fyllutState?.mellomlagring?.isActive).toBe(false);
  });

  it('does not restore deleted attachments or a cleared submission', () => {
    const current = { data: {}, attachments: [] };
    const savedDraft = { ...draft, submission: { data: { documentation: { files: [{ fileId: 'deleted' }] } } } };

    expect(withDraftMetadata(current, savedDraft)).toMatchObject(current);
    expect(withDraftMetadata(undefined, savedDraft)).toBeUndefined();
  });

  it('does not change transport content or clear a newer unsaved change when acknowledging a snapshot', () => {
    const sent = prepareSubmissionForTransport(draft.submission);
    const unchanged = withDraftMetadata(draft.submission, draft)!;
    const edited = withDraftMetadata({ ...draft.submission, data: { answer: 'new' } }, draft)!;

    expect(prepareSubmissionForTransport(unchanged)).toEqual(sent);
    expect(prepareSubmissionForTransport(edited)).not.toEqual(sent);
    expect(prepareSubmissionForTransport(edited).data).toEqual({ answer: 'new' });
  });
});

describe('draft persistence queue', () => {
  it('keeps edits during an in-flight save available to the next save', async () => {
    const request = deferred<Draft>();
    const operations = createOperations();
    operations.update.mockReturnValueOnce(request.promise);
    let current: Submission | undefined = draft.submission;
    operations.sync.mockImplementation((savedDraft) => {
      current = withDraftMetadata(current, savedDraft);
    });
    const persist = createDraftPersistence(draft.id);
    const firstSnapshot = prepareSubmissionForTransport(current);
    const saving = persist(firstSnapshot, operations);
    await Promise.resolve();
    current = { data: { answer: 'new', documentation: { value: 'ettersender', files: [] } }, attachments: [] };
    const edited = current;
    request.resolve(draft);
    await saving;

    expect(current?.data).toBe(edited.data);
    expect(prepareSubmissionForTransport(current!)).not.toEqual(firstSnapshot);
    await persist(prepareSubmissionForTransport(current!), operations);
    expect(operations.update.mock.calls).toEqual([
      [draft.id, firstSnapshot],
      [draft.id, prepareSubmissionForTransport(edited)],
    ]);
    expect(current?.data).toBe(edited.data);
  });

  it('serializes concurrent creation, a newer save and the ID lookup used by submit', async () => {
    const creation = deferred<CreateDraftResult>();
    const update = deferred<Draft>();
    const operations = createOperations();
    operations.create.mockReturnValueOnce(creation.promise);
    operations.update.mockReturnValueOnce(update.promise);
    const persist = createDraftPersistence();
    const newer = { data: { answer: 'new' } };

    const first = persist(draft.submission, operations);
    const second = persist(newer, operations);
    const lookup = persist(newer, { ...operations, update: undefined });
    await Promise.resolve();
    expect(operations.create).toHaveBeenCalledTimes(1);
    expect(operations.update).not.toHaveBeenCalled();

    creation.resolve({ status: 'created', draft });
    await first;
    await Promise.resolve();
    expect(operations.update).toHaveBeenCalledExactlyOnceWith(draft.id, newer);
    let lookupFinished = false;
    void lookup.then(() => {
      lookupFinished = true;
    });
    await Promise.resolve();
    expect(lookupFinished).toBe(false);

    const newerDraft = { ...draft, submission: newer, modifiedAt: '2026-09-23T10:05:00.000Z' };
    update.resolve(newerDraft);
    expect(await second).toBe(draft.id);
    expect(await lookup).toBe(draft.id);
    expect(operations.create).toHaveBeenCalledTimes(1);
    expect(operations.sync.mock.calls).toEqual([
      [draft, true],
      [newerDraft, false],
    ]);
  });

  it('shares creation between concurrent ID lookups without redundant updates', async () => {
    const operations = { ...createOperations(), update: undefined };
    const persist = createDraftPersistence();

    expect(await Promise.all([persist(draft.submission, operations), persist(draft.submission, operations)])).toEqual([
      draft.id,
      draft.id,
    ]);
    expect(operations.create).toHaveBeenCalledTimes(1);
    expect(operations.sync).toHaveBeenCalledTimes(1);
  });

  it('uses the initial ID without creating or changing local state for an ID lookup', async () => {
    const operations = createOperations();
    const persist = createDraftPersistence(draft.id);

    expect(await persist(draft.submission, { ...operations, update: undefined })).toBe(draft.id);
    expect(operations.create).not.toHaveBeenCalled();
    expect(operations.sync).not.toHaveBeenCalled();
  });

  it.each(['create', 'update'] as const)(
    'allows retries after a failed %s without acknowledging it',
    async (method) => {
      const operations = createOperations();
      const error = new Error('save failed');
      operations[method].mockRejectedValueOnce(error);
      const persist = createDraftPersistence(method === 'update' ? draft.id : undefined);

      await expect(persist(draft.submission, operations)).rejects.toBe(error);
      expect(operations.sync).not.toHaveBeenCalled();
      expect(await persist(draft.submission, operations)).toBe(draft.id);
      expect(operations[method]).toHaveBeenCalledTimes(2);
      expect(operations.sync).toHaveBeenCalledTimes(1);
      expect(operations.create).toHaveBeenCalledTimes(method === 'update' ? 0 : 2);
    },
  );

  it.each(['create', 'update'] as const)(
    'ignores a late %s response and queued saves after deletion or unmount',
    async (method) => {
      const operations = createOperations();
      const request = deferred<Draft>();
      if (method === 'create') {
        operations.create.mockImplementationOnce(async () => ({ status: 'created', draft: await request.promise }));
      } else {
        operations.update.mockReturnValueOnce(request.promise);
      }
      const persist = createDraftPersistence(method === 'update' ? draft.id : undefined);
      const first = persist(draft.submission, operations);
      const queued = persist(draft.submission, operations);
      await Promise.resolve();
      operations.isActive.mockReturnValue(false);
      request.resolve(draft);

      expect(await first).toBeUndefined();
      expect(await queued).toBeUndefined();
      expect(operations[method]).toHaveBeenCalledTimes(1);
      expect(operations.sync).not.toHaveBeenCalled();
    },
  );

  it('redirects once and does not create again when an active draft already exists', async () => {
    const operations = createOperations();
    operations.create.mockResolvedValue({ status: 'alreadyExists' });
    const persist = createDraftPersistence();

    expect(await Promise.all([persist(draft.submission, operations), persist(draft.submission, operations)])).toEqual([
      undefined,
      undefined,
    ]);
    expect(operations.create).toHaveBeenCalledTimes(1);
    expect(operations.alreadyExists).toHaveBeenCalledTimes(1);
    expect(operations.sync).not.toHaveBeenCalled();
  });
});
