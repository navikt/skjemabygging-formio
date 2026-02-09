import { UploadIcon } from '@navikt/aksel-icons';
import { Button, FileObject, FileUpload, VStack } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MutableRefObject, ReactNode, useCallback, useState } from 'react';
import { FILE_ACCEPT, MAX_SIZE_ATTACHMENT_FILE_BYTES } from '../../constants/fileUpload';
import { useLanguages } from '../../context/languages';
import makeStyles from '../../util/styles/jss/jss';
import { useAttachmentUpload } from '../attachment/AttachmentUploadContext';
import StandaloneValidationError from '../error/standalone-validation-error/StandaloneValidationError';

const useStyles = makeStyles({
  button: {
    maxWidth: '18.75rem',
    borderRadius: 'var(--ax-radius-8)',
  },
});

interface Props {
  attachmentId: string;
  variant: 'primary' | 'secondary';
  allowUpload?: boolean;
  attachmentRefs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
  readMore?: ReactNode;
  translationParams?: Record<string, string>;
  accept?: string;
  maxFileSizeInBytes?: number;
  onSuccess?: () => void;
}

const UploadButton = ({
  attachmentId,
  variant = 'primary',
  allowUpload,
  attachmentRefs: attachmentRefsRef,
  readMore,
  translationParams,
  accept = FILE_ACCEPT,
  maxFileSizeInBytes = MAX_SIZE_ATTACHMENT_FILE_BYTES,
  onSuccess,
}: Props) => {
  const { translate } = useLanguages();
  const styles = useStyles();
  const { handleUploadFile, errors, addError } = useAttachmentUpload();

  const [loading, setLoading] = useState(false);

  const registerFileButtonRef = useCallback(
    (ref: HTMLButtonElement | null) => {
      if (!attachmentRefsRef) {
        return;
      }
      attachmentRefsRef.current = { ...(attachmentRefsRef.current ?? {}), [`${attachmentId}-FILE`]: ref };
    },
    [attachmentId, attachmentRefsRef],
  );

  const uploadErrorMessage = errors[attachmentId]?.find((error) => error.type === 'FILE')?.message;

  const onSelect = async (files: FileObject[]) => {
    setLoading(true);
    const file = files?.[0];
    if (!file) {
      setLoading(false);
      return;
    }
    const response = await handleUploadFile(attachmentId, file);
    if (response.status === 'ok') {
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <VStack gap="space-2">
      {allowUpload ? (
        <FileUpload.Trigger onSelect={onSelect} accept={accept} maxSizeInBytes={maxFileSizeInBytes} multiple={false}>
          <Button
            variant={variant}
            className={styles.button}
            loading={loading}
            icon={<UploadIcon aria-hidden fontSize="1.5rem" />}
            ref={registerFileButtonRef}
          >
            {translate(
              variant === 'primary' ? TEXTS.statiske.uploadFile.selectFile : TEXTS.statiske.uploadFile.uploadMoreFiles,
            )}
          </Button>
        </FileUpload.Trigger>
      ) : (
        <Button
          variant={variant}
          className={styles.button}
          icon={<UploadIcon aria-hidden fontSize="1.5rem" />}
          ref={registerFileButtonRef}
          onClick={() =>
            addError(
              attachmentId,
              translate('required', { field: translate(TEXTS.statiske.attachment.attachmentTitle) }),
              'TITLE',
            )
          }
        >
          {translate(
            variant === 'primary' ? TEXTS.statiske.uploadFile.selectFile : TEXTS.statiske.uploadFile.uploadMoreFiles,
          )}
        </Button>
      )}
      {uploadErrorMessage && (
        <StandaloneValidationError>{translate(uploadErrorMessage, translationParams)}</StandaloneValidationError>
      )}
      {readMore}
    </VStack>
  );
};

export default UploadButton;
