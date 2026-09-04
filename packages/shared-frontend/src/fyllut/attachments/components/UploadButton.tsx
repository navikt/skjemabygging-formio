import { UploadIcon } from '@navikt/aksel-icons';
import { Alert, Button, FileObject, FileUpload, VStack } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MutableRefObject, ReactNode, useState } from 'react';
import { getAttachmentsAtPath } from '../../../context/attachment/attachmentData';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useOptionalValidationScope } from '../../../context/validation/ValidationScopeContext';
import { inputId } from '../../../utils/inputId';
import { useAttachmentUpload } from '../context/AttachmentUploadContext';
import { FILE_ACCEPT, MAX_SIZE_ATTACHMENT_FILE_BYTES } from '../context/fileUploadConfig';
import useAttachmentValidation from './useAttachmentValidation';

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
  statePath: string;
  submissionPath?: string;
  multipleAttachments?: boolean;
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
  statePath,
  submissionPath,
  multipleAttachments = false,
  variant,
  allowUpload,
  refs,
  readMore,
  translationParams,
  accept = FILE_ACCEPT,
  maxFileSizeInBytes = MAX_SIZE_ATTACHMENT_FILE_BYTES,
  onSuccess,
}: Props) => {
  const { translate } = useLanguage();
  const { submission } = useSubmissionState();
  const { handleUploadFile, addError, submissionAttachments: legacyAttachments } = useAttachmentUpload();
  const submissionAttachments = submissionPath ? getAttachmentsAtPath(submission, submissionPath) : legacyAttachments;
  const scope = useOptionalValidationScope();
  const { getAttachmentError, getAttachmentExternalError } = useAttachmentValidation(submissionAttachments);
  const [loading, setLoading] = useState(false);
  const uploadErrorMessage =
    getAttachmentError(attachmentId, 'files') ?? getAttachmentExternalError(attachmentId, 'files');

  const onSelect = async (files: FileObject[]) => {
    setLoading(true);
    const file = files[0];
    if (!file) {
      setLoading(false);
      return;
    }
    const response = await handleUploadFile(attachmentId, file, submissionPath, multipleAttachments);
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
            id={inputId(statePath)}
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
          id={inputId(statePath)}
          variant={variant}
          icon={<UploadIcon aria-hidden fontSize="1.5rem" />}
          ref={(ref) => setUploadRef(refs, `${attachmentId}-FILE`, ref)}
          onClick={() =>
            addError(
              attachmentId,
              translate('required', { field: translate(TEXTS.statiske.attachment.attachmentTitle) }),
              'TITLE',
              scope?.pageKey,
            )
          }
        >
          {label}
        </Button>
      )}
      {uploadErrorMessage && (
        <Alert variant="error" inline>
          {translate(uploadErrorMessage, translationParams)}
        </Alert>
      )}
      {readMore}
    </VStack>
  );
};

export default UploadButton;
