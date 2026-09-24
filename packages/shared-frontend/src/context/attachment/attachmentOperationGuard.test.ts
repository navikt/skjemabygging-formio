import { SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { describe, expect, it } from 'vitest';
import { createAttachmentOperationGuard } from './attachmentOperationGuard';

const attachment: SubmissionAttachment = {
  attachmentId: 'doc',
  navId: 'doc',
  type: 'default',
  value: 'leggerVedNaa',
  files: [],
};
const createStore = () => {
  let value: unknown = attachment;
  const listeners = new Set<() => void>();
  return {
    getValue: () => value,
    setValue: (_path: string, next: unknown) => {
      value = next;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
};

describe('attachment operation guards', () => {
  it('never resurrects an attachment after clear and restore at the same path', () => {
    const store = createStore();
    const guard = createAttachmentOperationGuard(store, 'doc', 'documentation');
    store.setValue('documentation', undefined);
    store.setValue('documentation', attachment);
    expect(guard.isCurrent()).toBe(false);
    guard.release();
  });

  it('invalidates requests when the choice changes, even if changed back before completion', () => {
    const store = createStore();
    const guard = createAttachmentOperationGuard(store, 'doc', 'documentation');
    store.setValue('documentation', { ...attachment, value: 'ettersender' });
    store.setValue('documentation', attachment);
    expect(guard.isCurrent()).toBe(false);
    guard.release();
  });

  it('allows concurrent title edits and file mutations for the same document', () => {
    const store = createStore();
    const guard = createAttachmentOperationGuard(store, 'doc', 'documentation');
    store.setValue('documentation', { ...attachment, title: 'Changed', files: [{ fileId: 'new-file' }] });
    expect(guard.isCurrent()).toBe(true);
    guard.release();
  });

  it('does not mutate a replacement datagrid row at the same index', () => {
    const store = createStore();
    const guard = createAttachmentOperationGuard(store, 'doc', 'rows[0].documentation');
    store.setValue('rows[0].documentation', { ...attachment, attachmentId: 'doc-2' });
    expect(guard.isCurrent()).toBe(false);
    guard.release();
  });
});
