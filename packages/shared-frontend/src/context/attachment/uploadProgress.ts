import type { FileObject } from '@navikt/ds-react';
import type { Dispatch, SetStateAction } from 'react';

type UploadsInProgress = Record<string, Record<string, FileObject>>;

const createUploadProgressActions = (setUploadsInProgress: Dispatch<SetStateAction<UploadsInProgress>>) => {
  const fileIdentifier = (file: FileObject) => `${file.file.name}-${file.file.size}`;

  const addFileInProgress = (attachmentId: string, file: FileObject) => {
    setUploadsInProgress((current) => {
      const currentFiles = current[attachmentId] ?? {};
      return { ...current, [attachmentId]: { ...currentFiles, [fileIdentifier(file)]: file } };
    });
  };

  const removeAllFilesInProgress = (attachmentId: string, predicate?: (file: FileObject) => boolean) => {
    setUploadsInProgress((current) => {
      const { [attachmentId]: currentFiles, ...rest } = current;
      if (!predicate) {
        return rest;
      }

      return {
        ...rest,
        [attachmentId]: Object.fromEntries(Object.entries(currentFiles ?? {}).filter(([_, file]) => !predicate(file))),
      };
    });
  };

  const removeFileInProgress = (attachmentId: string, identifier: string) => {
    setUploadsInProgress((current) => {
      const currentFiles = current[attachmentId] ?? {};
      if (!currentFiles[identifier]) {
        return current;
      }

      const { [identifier]: _, ...rest } = currentFiles;
      return { ...current, [attachmentId]: rest };
    });
  };

  return { addFileInProgress, fileIdentifier, removeAllFilesInProgress, removeFileInProgress };
};

export { createUploadProgressActions };
export type { UploadsInProgress };
