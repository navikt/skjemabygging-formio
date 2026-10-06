import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { AttachmentHost, AttachmentUploadActions, AttachmentUploadContextType } from './attachmentUploadTypes';
import { getFileValidationError } from './attachmentValidation';
import { UploadsInProgress } from './uploadProgress';
import { useAttachmentOperations } from './useAttachmentOperations';

const initialActions: AttachmentUploadActions = {
  hasPendingOperations: () => false,
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
  hasPendingOperations: () => boolean;
  trackOperation: <T>(operation: () => Promise<T>) => Promise<T>;
  subscribe: (listener: () => void) => () => void;
  getValue: () => AttachmentUploadContextType;
}

const AttachmentUploadContext = createContext<AttachmentUploadStore | undefined>(undefined);

const AttachmentUploadProvider = ({ children, host }: { children: React.ReactNode; host: AttachmentHost }) => {
  const value = useAttachmentOperations(host);
  const [pendingCount, setPendingCount] = useState(0);
  const pendingCountRef = useRef(0);
  const valueRef = useRef(value);
  const listenersRef = useRef(new Set<() => void>());
  const store = useMemo<AttachmentUploadStore>(
    () => ({
      hasPendingOperations: () => pendingCountRef.current > 0,
      trackOperation: async <T,>(operation: () => Promise<T>) => {
        setPendingCount(++pendingCountRef.current);
        try {
          return await operation();
        } finally {
          setPendingCount(--pendingCountRef.current);
        }
      },
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

  useLayoutEffect(() => {
    listenersRef.current.forEach((listener) => listener());
  }, [pendingCount]);

  return <AttachmentUploadContext.Provider value={store}>{children}</AttachmentUploadContext.Provider>;
};

const createAttachmentUploadActions = (store: AttachmentUploadStore): AttachmentUploadActions => ({
  hasPendingOperations: store.hasPendingOperations,
  handleUploadFile: (...args) => store.trackOperation(() => store.getValue().handleUploadFile(...args)),
  handleDownloadFile: (...args) => store.getValue().handleDownloadFile(...args),
  handleDeleteFile: (...args) => store.trackOperation(() => store.getValue().handleDeleteFile(...args)),
  handleDeleteAllFilesForAttachment: (...args) =>
    store.trackOperation(() => store.getValue().handleDeleteAllFilesForAttachment(...args)),
  handleDeleteAttachment: (...args) => store.trackOperation(() => store.getValue().handleDeleteAttachment(...args)),
  handleDeleteAllFiles: (...args) => store.trackOperation(() => store.getValue().handleDeleteAllFiles(...args)),
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
const noPendingOperations = () => false;

const useAttachmentPendingOperations = (): boolean => {
  const store = useContext(AttachmentUploadContext);
  return useSyncExternalStore(
    store?.subscribe ?? noSubscription,
    store?.hasPendingOperations ?? noPendingOperations,
    noPendingOperations,
  );
};

const useAttachmentUploadsInProgress = (attachmentId: string): UploadsInProgress[string] => {
  const store = useContext(AttachmentUploadContext);
  const getSnapshot = useCallback(
    () => store?.getValue().uploadsInProgress[attachmentId] ?? noFilesInProgress,
    [attachmentId, store],
  );
  return useSyncExternalStore(store?.subscribe ?? noSubscription, getSnapshot, getSnapshot);
};

export type { AttachmentErrorType } from './attachmentUploadTypes';
export {
  AttachmentUploadProvider,
  getFileValidationError,
  useAttachmentPendingOperations,
  useAttachmentUpload,
  useAttachmentUploadsInProgress,
};
