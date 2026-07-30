import { UploadIcon } from '@navikt/aksel-icons';
import { Button, FileObject, FileUpload, VStack } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MutableRefObject, ReactNode, useState } from 'react';
import { useFyllutLanguage } from '../../context/fyllut/FyllutLanguageContext';
import StandaloneValidationError from '../fyllut-components/StandaloneValidationError';
import { useAttachmentUpload } from './AttachmentUploadContext';
import { FILE_ACCEPT, MAX_SIZE_ATTACHMENT_FILE_BYTES } from './fileUploadConfig';

const setUploadRef = (
  refs: Props['refs'],
  key: string,
  value: HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null,
) => {
  if (refs?.current) {
    Reflect.set(refs.current, key, value);
  }
};

interface Props {
  attachmentId: string;
  variant: 'primary' | 'secondary';
  allowUpload?: boolean;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
  readMore?: ReactNode;
  translationParams?: Record<string, string>;
  accept?: string;
  maxFileSizeInBytes?: number;
  onSuccess?: () => void;
}

const UploadButton = ({
  attachmentId,
  variant,
  allowUpload,
  refs,
  readMore,
  translationParams,
  accept = FILE_ACCEPT,
  maxFileSizeInBytes = MAX_SIZE_ATTACHMENT_FILE_BYTES,
  onSuccess,
}: Props) => {
  const { translate } = useFyllutLanguage();
  const { handleUploadFile, errors, addError } = useAttachmentUpload();
  const [loading, setLoading] = useState(false);
  const uploadErrorMessage = errors[attachmentId]?.find((error) => error.type === 'FILE')?.message;

  const onSelect = async (files: FileObject[]) => {
    setLoading(true);
    const file = files[0];
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

  const label = translate(
    variant === 'primary' ? TEXTS.statiske.uploadFile.selectFile : TEXTS.statiske.uploadFile.uploadMoreFiles,
  );

  return (
    <VStack gap="space-8">
      {allowUpload ? (
        <FileUpload.Trigger onSelect={onSelect} accept={accept} maxSizeInBytes={maxFileSizeInBytes} multiple={false}>
          <Button
            variant={variant}
            loading={loading}
            icon={<UploadIcon aria-hidden fontSize="1.5rem" />}
            ref={(ref) => setUploadRef(refs, `${attachmentId}-FILE`, ref)}
          >
            {label}
          </Button>
        </FileUpload.Trigger>
      ) : (
        <Button
          variant={variant}
          icon={<UploadIcon aria-hidden fontSize="1.5rem" />}
          ref={(ref) => setUploadRef(refs, `${attachmentId}-FILE`, ref)}
          onClick={() =>
            addError(
              attachmentId,
              translate('required', { field: translate(TEXTS.statiske.attachment.attachmentTitle) }),
              'TITLE',
            )
          }
        >
          {label}
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
