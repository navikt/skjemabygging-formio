import { FileObject } from '@navikt/ds-react';
import { SubmissionAttachment, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it, vi } from 'vitest';
import { AttachmentApplication, AttachmentService } from '../runtime-services/RuntimeServices';
import { createAttachmentOperations } from './createAttachmentOperations';
import { MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES } from './fileUploadConfig';
import { UploadsInProgress } from './uploadProgress';

const uploadedFile: UploadedFile = {
  attachmentId: 'doc',
  fileId: 'file-1',
  fileName: 'document.pdf',
  innsendingId: 'draft',
  size: 123,
};
const initial: SubmissionAttachment = {
  attachmentId: 'doc',
  navId: 'doc',
  type: 'default',
  value: 'leggerVedNaa',
  files: [uploadedFile],
};
const selectedFile = {
  file: { name: 'document.pdf', size: 123, lastModified: 1 },
  error: false,
  reasons: [],
} as unknown as FileObject;
const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise;
  });
  return { promise, resolve };
};
const setup = () => {
  let value: SubmissionAttachment | undefined = initial;
  let progress: UploadsInProgress = {};
  const listeners = new Set<() => void>();
  const store = {
    getValue: () => value,
    setValue: (_path: string, next: unknown) => {
      value = next as typeof value;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
  const service = {
    uploadFile: vi.fn<AttachmentService['uploadFile']>().mockResolvedValue(uploadedFile),
    deleteFile: vi.fn<AttachmentService['deleteFile']>().mockResolvedValue(undefined),
    downloadFile: vi.fn<AttachmentService['downloadFile']>(),
    deleteAllFilesForAttachment: vi.fn<AttachmentService['deleteAllFilesForAttachment']>().mockResolvedValue(undefined),
    deleteAllFiles: vi.fn<AttachmentService['deleteAllFiles']>().mockResolvedValue(undefined),
  };
  const setExternalError = vi.fn();
  const getApplication = vi
    .fn<() => Promise<AttachmentApplication>>()
    .mockResolvedValue({ type: 'draft', id: 'draft' });
  const actions = createAttachmentOperations({
    host: {
      service,
      getApplication,
      isAuthenticationError: () => false,
      handleSessionExpired: vi.fn(),
      getAllAttachments: () => (value ? [value] : []),
      clearFiles: () => store.setValue('documentation', { ...value, files: [] }),
    },
    store,
    translate: (text) => text ?? '',
    setExternalError,
    uploadsInProgress: progress,
    setUploadsInProgress: (next) => {
      progress = typeof next === 'function' ? next(progress) : next;
    },
    pendingUploads: { current: new Map() },
    generation: { current: 0 },
  });
  return { actions, service, store, setExternalError, getApplication, getProgress: () => progress };
};

describe('attachment operations', () => {
  it.each(['upload', 'delete'] as const)('does not start a stale %s request after token acquisition', async (kind) => {
    const { actions, service, store, getApplication } = setup();
    const application = deferred<AttachmentApplication>();
    getApplication.mockReturnValue(application.promise);
    const operation =
      kind === 'upload'
        ? actions.handleUploadFile('doc', selectedFile, 'documentation')
        : actions.handleDeleteAttachment('doc', 'documentation');
    store.setValue('documentation', undefined);
    store.setValue('documentation', { ...initial, files: [] });
    application.resolve({ type: 'draft', id: 'draft' });
    await operation;
    expect(service.uploadFile).not.toHaveBeenCalled();
    expect(service.deleteFile).not.toHaveBeenCalled();
    expect(store.getValue()).toEqual({ ...initial, files: [] });
  });
  it('keeps file references after failed deletion', async () => {
    const { actions, service, store, setExternalError } = setup();
    service.deleteFile.mockRejectedValue(new Error('Unavailable'));
    await actions.handleDeleteFile('doc', 'file-1', { name: 'document.pdf', size: 123 }, 'documentation');
    expect(store.getValue()).toBe(initial);
    expect(setExternalError).toHaveBeenLastCalledWith('documentation.doc.files', expect.any(String), undefined);
  });

  it('discards late uploads after clear and restore instead of resurrecting them', async () => {
    const { actions, service, store, getProgress } = setup();
    const request = deferred<UploadedFile>();
    service.uploadFile.mockReturnValue(request.promise);
    const operation = actions.handleUploadFile('doc', selectedFile, 'documentation');
    await Promise.resolve();
    store.setValue('documentation', undefined);
    store.setValue('documentation', initial);
    request.resolve({ ...uploadedFile, fileId: 'late' });
    expect((await operation).status).toBe('unknown');
    expect(store.getValue()).toBe(initial);
    expect(Object.values(getProgress().doc)).toHaveLength(0);
    expect(service.deleteFile).toHaveBeenCalledWith({
      application: { type: 'draft', id: 'draft' },
      attachmentId: 'doc',
      fileId: 'late',
    });
  });

  it('preserves concurrent title and file changes during upload', async () => {
    const { actions, service, store } = setup();
    const request = deferred<UploadedFile>();
    service.uploadFile.mockReturnValue(request.promise);
    const operation = actions.handleUploadFile('doc', selectedFile, 'documentation');
    await Promise.resolve();
    store.setValue('documentation', { ...initial, title: 'Edited', files: [{ ...uploadedFile, fileId: 'parallel' }] });
    request.resolve({ ...uploadedFile, fileId: 'uploaded' });
    expect((await operation).status).toBe('ok');
    expect(store.getValue()).toMatchObject({
      title: 'Edited',
      files: [{ fileId: 'parallel' }, { fileId: 'uploaded' }],
    });
  });

  it('deletes only captured files and retains a document with a concurrently added file', async () => {
    const { actions, service, store } = setup();
    const request = deferred<void>();
    service.deleteFile.mockReturnValue(request.promise);
    const operation = actions.handleDeleteAttachment('doc', 'documentation');
    await Promise.resolve();
    store.setValue('documentation', { ...initial, files: [uploadedFile, { ...uploadedFile, fileId: 'parallel' }] });
    request.resolve();
    await operation;
    expect(store.getValue()?.files).toEqual([{ ...uploadedFile, fileId: 'parallel' }]);
    expect(service.deleteAllFilesForAttachment).not.toHaveBeenCalled();
  });

  it('marks an empty upload response as failed rather than indefinitely uploading', async () => {
    const { actions, service, getProgress } = setup();
    service.uploadFile.mockResolvedValue(undefined as unknown as UploadedFile);
    expect((await actions.handleUploadFile('doc', selectedFile, 'documentation')).status).toBe('unknown');
    expect(Object.values(getProgress().doc)[0].error).toBe(true);
  });

  it('counts reserved in-flight files before starting concurrent requests', async () => {
    const { actions, service } = setup();
    const request = deferred<UploadedFile>();
    service.uploadFile.mockReturnValue(request.promise);
    const first = actions.handleUploadFile(
      'doc',
      {
        ...selectedFile,
        file: { ...selectedFile.file, size: MAX_TOTAL_SIZE_ATTACHMENT_FILES_BYTES - 124 },
      } as FileObject,
      'documentation',
    );
    const second = await actions.handleUploadFile(
      'doc',
      {
        ...selectedFile,
        file: { ...selectedFile.file, name: 'second.pdf', size: 2 },
      } as FileObject,
      'documentation',
    );
    expect(second.status).toBe('invalid');
    expect(service.uploadFile).toHaveBeenCalledTimes(1);
    request.resolve(uploadedFile);
    await first;
  });

  it('retains files whose deletion failed after another file was successfully deleted', async () => {
    const { actions, service, store } = setup();
    store.setValue('documentation', { ...initial, files: [uploadedFile, { ...uploadedFile, fileId: 'file-2' }] });
    service.deleteFile.mockResolvedValueOnce(undefined).mockRejectedValueOnce(new Error('Unavailable'));
    await expect(actions.handleDeleteAttachment('doc', 'documentation')).rejects.toThrow('Unavailable');
    expect(store.getValue()?.files).toEqual([{ ...uploadedFile, fileId: 'file-2' }]);
  });
});
