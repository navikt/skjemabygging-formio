import { FileObject } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useAttachmentUpload } from '../../context/attachment/AttachmentUploadContext';
import { FILE_ACCEPT, MAX_SIZE_ATTACHMENT_FILE_BYTES } from '../../context/attachment/fileUploadConfig';
import { useLanguage } from '../../context/language/LanguageContext';
import { useOptionalValidationScope } from '../../context/validation/ValidationScopeContext';
import { inputId } from '../../utils/inputId';
import FileUploadButton from './FileUploadButton';
import styles from './UploadButton.module.css';

interface Props {
  attachmentId: string;
  statePath: string;
  submissionPath?: string;
  multipleAttachments?: boolean;
  variant: 'primary' | 'secondary';
  allowUpload?: boolean;
  accept?: string;
  maxFileSizeInBytes?: number;
  onSuccess?: () => void;
}

const UploadButton = ({
  attachmentId,
  statePath,
  submissionPath,
  multipleAttachments = false,
  variant,
  allowUpload,
  accept = FILE_ACCEPT,
  maxFileSizeInBytes = MAX_SIZE_ATTACHMENT_FILE_BYTES,
  onSuccess,
}: Props) => {
  const { translate } = useLanguage();
  const { handleUploadFile, addError } = useAttachmentUpload();
  const scope = useOptionalValidationScope();
  const [loading, setLoading] = useState(false);

  const onSelect = async (files: FileObject[]) => {
    setLoading(true);
    const file = files[0];
    if (!file) {
      setLoading(false);
      return;
    }
    const response = await handleUploadFile(attachmentId, file, submissionPath, multipleAttachments, scope?.pageKey);
    if (response.status === 'ok') {
      onSuccess?.();
    }
    setLoading(false);
  };

  const label = translate(
    variant === 'primary' ? TEXTS.statiske.uploadFile.selectFile : TEXTS.statiske.uploadFile.uploadMoreFiles,
  );

  return (
    <div className={styles.container}>
      <FileUploadButton
        id={inputId(statePath)}
        label={label}
        loading={loading}
        variant={variant}
        accept={accept}
        maxSizeInBytes={maxFileSizeInBytes}
        onSelect={onSelect}
        onBlockedClick={
          allowUpload
            ? undefined
            : () =>
                addError(
                  attachmentId,
                  translate('required', { field: translate(TEXTS.statiske.attachment.attachmentTitle) }),
                  'TITLE',
                  scope?.pageKey,
                  submissionPath,
                )
        }
      />
    </div>
  );
};

export default UploadButton;
