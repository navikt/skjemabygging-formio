import { FileItem, FileObject, FileUpload, Label, VStack } from '@navikt/ds-react';
import { UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  label?: string;
  uploaded?: UploadedFile[];
  inProgress?: FileObject[];
  uploadingText: string;
  getFileError: (file: FileObject) => string | undefined;
  onDeleteFile: (fileId: string, file: FileItem) => void;
  onDownloadFile?: (fileId: string, fileName: string) => void;
}

const FileList = ({
  label,
  uploaded = [],
  inProgress = [],
  uploadingText,
  getFileError,
  onDeleteFile,
  onDownloadFile,
}: Props) => {
  const fileItems = [...uploaded, ...inProgress];

  return (
    <VStack gap="space-8">
      {label && <Label>{label}</Label>}
      {fileItems.length > 0 && (
        <FileUpload translations={{ item: { uploading: uploadingText } }}>
          <VStack gap="space-8" as="ul">
            {uploaded.map(({ fileId, fileName, size }) => (
              <FileUpload.Item
                as="li"
                key={fileId}
                file={{ name: fileName, size }}
                href={onDownloadFile ? '#' : undefined}
                onFileClick={
                  onDownloadFile
                    ? (event) => {
                        event.preventDefault();
                        onDownloadFile(fileId, fileName);
                      }
                    : undefined
                }
                button={{
                  action: 'delete',
                  onClick: () => onDeleteFile(fileId, { name: fileName, size }),
                }}
              />
            ))}
            {inProgress.map((file) => (
              <FileUpload.Item
                as="li"
                key={`${file.file.name}-${file.file.lastModified}`}
                file={file.file}
                onFileClick={(event) => event.preventDefault()}
                status={file.error ? 'idle' : 'uploading'}
                error={getFileError(file)}
              />
            ))}
          </VStack>
        </FileUpload>
      )}
    </VStack>
  );
};

export default FileList;
export type { Props as FileListProps };
