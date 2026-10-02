import { createContext, useCallback, useContext, useLayoutEffect, useMemo, useRef, useSyncExternalStore } from 'react';
import { AttachmentHost, AttachmentUploadActions, AttachmentUploadContextType } from './attachmentUploadTypes';
import { getFileValidationError } from './attachmentValidation';
import { UploadsInProgress } from './uploadProgress';
import { useAttachmentOperations } from './useAttachmentOperations';

const initialActions: AttachmentUploadActions = {
  handleUploadFile: async () => ({ status: 'unknown' }),
  handleDownloadFile: async () => {},
  handleDeleteFile: async () => {},
  handleDeleteAllFilesForAttachment: async () => {},
  handleDeleteAttachment: async () => {},
  handleDeleteAllFiles: async () => {},
  addError: () => {},
  removeError: () => {},
  changeAttachmentValue: () => {},
};

interface AttachmentUploadStore {
  subscribe: (listener: () => void) => () => void;
  getValue: () => AttachmentUploadContextType;
}

const AttachmentUploadContext = createContext<AttachmentUploadStore | undefined>(undefined);

const AttachmentUploadProvider = ({ children, host }: { children: React.ReactNode; host: AttachmentHost }) => {
  const value = useAttachmentOperations(host);
  const valueRef = useRef(value);
  const listenersRef = useRef(new Set<() => void>());
  const store = useMemo<AttachmentUploadStore>(
    () => ({
      subscribe: (listener) => {
        listenersRef.current.add(listener);
        return () => {
          listenersRef.current.delete(listener);
        };
      },
      getValue: () => valueRef.current,
    }),
    [],
  );

  useLayoutEffect(() => {
    const previousUploads = valueRef.current.uploadsInProgress;
    valueRef.current = value;
    if (previousUploads !== value.uploadsInProgress) {
      listenersRef.current.forEach((listener) => listener());
    }
  }, [value]);

  return <AttachmentUploadContext.Provider value={store}>{children}</AttachmentUploadContext.Provider>;
};

const createAttachmentUploadActions = (store: AttachmentUploadStore): AttachmentUploadActions => ({
  handleUploadFile: (...args) => store.getValue().handleUploadFile(...args),
  handleDownloadFile: (...args) => store.getValue().handleDownloadFile(...args),
  handleDeleteFile: (...args) => store.getValue().handleDeleteFile(...args),
  handleDeleteAllFilesForAttachment: (...args) => store.getValue().handleDeleteAllFilesForAttachment(...args),
  handleDeleteAttachment: (...args) => store.getValue().handleDeleteAttachment(...args),
  handleDeleteAllFiles: (...args) => store.getValue().handleDeleteAllFiles(...args),
  addError: (...args) => store.getValue().addError(...args),
  removeError: (...args) => store.getValue().removeError(...args),
  changeAttachmentValue: (...args) => store.getValue().changeAttachmentValue(...args),
});

const useAttachmentUpload = (): AttachmentUploadActions => {
  const store = useContext(AttachmentUploadContext);
  return useMemo(() => (store ? createAttachmentUploadActions(store) : initialActions), [store]);
};

const noFilesInProgress: UploadsInProgress[string] = {};
const noSubscription = () => () => undefined;

const useAttachmentUploadsInProgress = (attachmentId: string): UploadsInProgress[string] => {
  const store = useContext(AttachmentUploadContext);
  const getSnapshot = useCallback(
    () => store?.getValue().uploadsInProgress[attachmentId] ?? noFilesInProgress,
    [attachmentId, store],
  );
  return useSyncExternalStore(store?.subscribe ?? noSubscription, getSnapshot, getSnapshot);
};

export type { AttachmentErrorType } from './attachmentUploadTypes';
export { AttachmentUploadProvider, getFileValidationError, useAttachmentUpload, useAttachmentUploadsInProgress };
