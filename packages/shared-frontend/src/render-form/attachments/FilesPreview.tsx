import { FileItem, FileObject, FileUpload, Label, VStack } from '@navikt/ds-react';
import { SubmissionAttachment, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../context/language/LanguageContext';
import { getFileValidationError, useAttachmentUpload } from './AttachmentUploadContext';

const fileUploadErrorParams = { maxFileSize: '150 MB', maxAttachmentSize: '150 MB' };

const FilesPreview = ({
  label,
  uploaded = [],
  inProgress = [],
  onDelete,
  onDownload,
}: {
  label?: string;
  uploaded?: SubmissionAttachment['files'];
  inProgress?: FileObject[];
  onDelete: (fileId: string, file: FileItem) => void;
  onDownload?: (fileId: string, fileName: string) => void;
}) => {
  const { translate } = useLanguage();
  const { errors } = useAttachmentUpload();
  return (
    <VStack gap="space-8">
      {label && <Label>{label}</Label>}
      {(uploaded.length > 0 || inProgress.length > 0) && (
        <FileUpload translations={{ item: { uploading: translate(TEXTS.statiske.uploadFile.uploading) } }}>
          <VStack gap="space-8" as="ul">
            {uploaded.map(({ fileId, fileName, size }) => (
              <FileUpload.Item
                as="li"
                key={fileId}
                file={{ name: fileName, size }}
                href={onDownload ? '#' : undefined}
                onFileClick={
                  onDownload
                    ? (event) => {
                        event.preventDefault();
                        onDownload(fileId, fileName);
                      }
                    : undefined
                }
                button={{ action: 'delete', onClick: () => onDelete(fileId, { name: fileName, size }) }}
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
                error={translate(getFileValidationError(file), fileUploadErrorParams)}
              />
            ))}
          </VStack>
        </FileUpload>
      )}
    </VStack>
  );
};

export default FilesPreview;
