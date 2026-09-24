import { useState } from 'react';
import { useLanguage } from '../language/LanguageContext';
import { useOptionalFieldStateStore } from '../state/StateContext';
import { useOptionalValidationActions } from '../validation/ValidationContext';
import { AttachmentHost } from './attachmentUploadTypes';
import { createAttachmentOperations, PendingAttachmentUpload } from './createAttachmentOperations';
import { UploadsInProgress } from './uploadProgress';

const inertStore = { getValue: () => undefined, setValue: () => undefined, subscribe: () => () => undefined };

const useAttachmentOperations = (host: AttachmentHost) => {
  const { translate } = useLanguage();
  const store = useOptionalFieldStateStore() ?? inertStore;
  const { setExternalError } = useOptionalValidationActions();
  const [uploadsInProgress, setUploadsInProgress] = useState<UploadsInProgress>({});
  const [{ pendingUploads, generation }] = useState(() => ({
    pendingUploads: { current: new Map<symbol, PendingAttachmentUpload>() },
    generation: { current: 0 },
  }));
  return createAttachmentOperations({
    host,
    store,
    translate,
    setExternalError,
    uploadsInProgress,
    setUploadsInProgress,
    pendingUploads,
    generation,
  });
};

export { useAttachmentOperations };
