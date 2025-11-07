import { UploadIcon } from '@navikt/aksel-icons';
import { Alert, BodyLong, BodyShort, Button, FileObject, FileUpload, HStack, ReadMore, VStack } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MutableRefObject, useState } from 'react';
import {
  FILE_ACCEPT,
  MAX_SIZE_ATTACHMENT_FILE_BYTES,
  MAX_TOTAL_SIZE_ATTACHMENT_FILES_TEXT,
} from '../../constants/fileUpload';
import { useLanguages } from '../../context/languages';
import htmlUtils from '../../util/html/htmlUtils';
import makeStyles from '../../util/styles/jss/jss';
import { useAttachmentUpload } from '../attachment/AttachmentUploadContext';
import InnerHtml from '../inner-html/InnerHtml';

const useStyles = makeStyles({
  button: {
    maxWidth: '18.75rem',
    borderRadius: 'var(--a-border-radius-large)',
  },
});

interface Props {
  attachmentId: string;
  variant: 'primary' | 'secondary';
  allowUpload?: boolean;
  refs?: MutableRefObject<Record<string, HTMLInputElement | HTMLFieldSetElement | HTMLButtonElement | null>>;
  translationParams?: Record<string, string>;
  accept?: string;
  maxFileSizeInBytes?: number;
  maxTotalAttachmentSizeText?: string;
}

const UploadButton = ({
  attachmentId,
  variant = 'primary',
  allowUpload,
  refs,
  translationParams,
  accept = FILE_ACCEPT,
  maxFileSizeInBytes = MAX_SIZE_ATTACHMENT_FILE_BYTES,
  maxTotalAttachmentSizeText = MAX_TOTAL_SIZE_ATTACHMENT_FILES_TEXT,
}: Props) => {
  const { translate } = useLanguages();
  const styles = useStyles();
  const { handleUploadFile, errors, addError } = useAttachmentUpload();

  const [loading, setLoading] = useState(false);

  const uploadErrorMessage = errors[attachmentId]?.find((error) => error.type === 'FILE')?.message;

  const onSelect = async (files: FileObject[]) => {
    setLoading(true);
    const file = files?.[0];
    if (!file) {
      setLoading(false);
      return;
    }
    await handleUploadFile(attachmentId, file);
    setLoading(false);
  };

  return (
    <VStack gap="2">
      {allowUpload ? (
        <FileUpload.Trigger onSelect={onSelect} accept={accept} maxSizeInBytes={maxFileSizeInBytes}>
          <Button
            variant={variant}
            className={styles.button}
            loading={loading}
            icon={<UploadIcon aria-hidden fontSize="1.5rem" />}
            ref={(ref) => {
              if (refs?.current) {
                refs.current[`${attachmentId}-FILE`] = ref;
              }
            }}
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
          ref={(ref) => {
            if (refs?.current) {
              refs.current[`${attachmentId}-FILE`] = ref;
            }
          }}
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
        <Alert inline variant="error">
          {htmlUtils.isHtmlString(uploadErrorMessage) ? (
            <InnerHtml content={translate(uploadErrorMessage, translationParams)}></InnerHtml>
          ) : (
            <BodyLong>{translate(uploadErrorMessage, translationParams)}</BodyLong>
          )}
        </Alert>
      )}
      <ReadMore header={translate(TEXTS.statiske.attachment.sizeAndFormatHeader)}>
        <HStack gap="4" align="start">
          <BodyShort>
            <strong>{translate(TEXTS.statiske.attachment.validFormatsLabel)} </strong>
            {translate(TEXTS.statiske.attachment.validFormatsDescrption)}
          </BodyShort>
          <BodyShort>
            <strong>{translate(TEXTS.statiske.attachment.maxFileSizeLabel)} </strong>
            {translate(TEXTS.statiske.attachment.maxFileSizeDescription, { size: maxTotalAttachmentSizeText })}
          </BodyShort>
        </HStack>
      </ReadMore>
    </VStack>
  );
};

export default UploadButton;
