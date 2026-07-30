import { FileItem, FileObject, FileUpload, Label, VStack } from '@navikt/ds-react';
import { TEXTS, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';
import { getFileValidationError, useAttachmentUpload } from './AttachmentUploadContext';

interface Props {
  label?: string;
  uploaded?: UploadedFile[];
  inProgress?: FileObject[];
  onDeleteFileItem: (fileId: string, file: FileItem) => void;
  onDownloadFileItem?: (fileId: string, fileName: string) => void;
  translationParams?: Record<string, string>;
}

const FilesPreview = ({
  label,
  uploaded = [],
  inProgress = [],
  onDeleteFileItem,
  onDownloadFileItem,
  translationParams,
}: Props) => {
  const { translate } = useFyllutLanguage();
  const { errors } = useAttachmentUpload();
  const fileItems = [...uploaded, ...inProgress];

  return (
    <VStack gap="space-8">
      {label && <Label>{label}</Label>}
      {fileItems.length > 0 && (
        <FileUpload translations={{ item: { uploading: translate(TEXTS.statiske.uploadFile.uploading) } }}>
          <VStack gap="space-8" as="ul">
            {uploaded.map(({ fileId, fileName, size }) => (
              <FileUpload.Item
                as="li"
                key={fileId}
                file={{ name: fileName, size }}
                href={onDownloadFileItem ? '#' : undefined}
                onFileClick={
                  onDownloadFileItem
                    ? (event) => {
                        event.preventDefault();
                        onDownloadFileItem(fileId, fileName);
                      }
                    : undefined
                }
                button={{
                  action: 'delete',
                  onClick: () => onDeleteFileItem(fileId, { name: fileName, size }),
                }}
                error={errors[fileId]?.[0]?.message ? translate(errors[fileId][0].message) : undefined}
              />
            ))}
            {inProgress.map((file) => (
              <FileUpload.Item
                as="li"
                key={`${file.file.name}-${file.file.lastModified}`}
                file={file.file}
                onFileClick={(event) => event.preventDefault()}
                status={file.error ? 'idle' : 'uploading'}
                error={translate(getFileValidationError(file), translationParams)}
              />
            ))}
          </VStack>
        </FileUpload>
      )}
    </VStack>
  );
};

export default FilesPreview;
