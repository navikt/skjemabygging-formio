import { FileItem, FileObject, FileUpload, Label, VStack } from '@navikt/ds-react';
import { TEXTS, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../context/languages';
import { getFileValidationError } from '../../util/form/attachment-validation/attachmentValidation';
import { useAttachmentUpload } from '../attachment/AttachmentUploadContext';

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
  const { translate } = useLanguages();
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
                        onDownloadFileItem?.(fileId, fileName);
                      }
                    : undefined
                }
                button={{
                  action: 'delete',
                  onClick: () => onDeleteFileItem(fileId, { name: fileName, size }),
                }}
                error={errors[fileId]?.[0].message ? translate(errors[fileId][0].message) : undefined}
              ></FileUpload.Item>
            ))}
            {inProgress.map((file) => (
              <FileUpload.Item
                as="li"
                key={`${file.file.name}-${file.file.lastModified}`}
                file={file.file}
                onFileClick={(event) => event.preventDefault()}
                status={file.error ? 'idle' : 'uploading'}
                error={translate(getFileValidationError(file), translationParams)}
              ></FileUpload.Item>
            ))}
          </VStack>
        </FileUpload>
      )}
    </VStack>
  );
};

export default FilesPreview;
