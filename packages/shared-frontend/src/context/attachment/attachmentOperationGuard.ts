import { FieldStateStore } from '../state/StateContext';
import { readAttachments, standaloneAttachmentsPath } from './attachmentSubmission';

/** Once a document disappears or changes choice, that request can never write to it again. */
const createAttachmentOperationGuard = (
  store: FieldStateStore,
  attachmentId: string,
  statePath = standaloneAttachmentsPath,
) => {
  const read = () => readAttachments(store.getValue(statePath)).find((item) => item.attachmentId === attachmentId);
  const initial = read();
  let active = !!initial;
  const check = () => {
    const current = read();
    active = active && !!current && current.value === initial?.value;
    return active;
  };
  const unsubscribe = store.subscribe(check);
  return { isCurrent: check, release: unsubscribe };
};

export { createAttachmentOperationGuard };
