import { PlusIcon, UploadIcon } from '@navikt/aksel-icons';
import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  FileObject,
  FileUpload,
  HStack,
  ReadMore,
  Textarea,
} from '@navikt/ds-react';
import { TEXTS, UploadedFile } from '@navikt/skjemadigitalisering-shared-domain';
import { useAttachmentStyles } from './styles';

type Props = {
  translate: (text: string, params?: any) => string;
  uploadedAttachmentFiles: UploadedFile[];
  otherAttachment?: boolean;
  selectedOption?: string;
  handleUploadFile: (attachmentId: string, file: FileObject) => Promise<void>;
  handleUpload: (fileList: FileObject[] | null) => Promise<void>;
  handleUploadAnotherAttachment: () => void;
  deadline?: string;
  loading: boolean;
  showDeadline: boolean;
  selectedAdditionalDocumentation?: {
    label?: string;
    description?: string;
  };
};

const AttachmentPanel = ({
  translate,
  uploadedAttachmentFiles,
  otherAttachment,
  deadline,
  handleUploadAnotherAttachment,
  handleUpload,
  loading,
  showDeadline,
  selectedAdditionalDocumentation,
}: Props) => {
  const styles = useAttachmentStyles();
  console.log(deadline);
  console.log(selectedAdditionalDocumentation);
  return (
    <>
      <ReadMore header={translate(TEXTS.statiske.attachment.sizeAndFormatHeader)}>
        <HStack gap="2" align="start">
          <BodyShort weight="semibold">{translate(TEXTS.statiske.attachment.validFormatsLabel)}</BodyShort>
          <BodyLong>{translate(TEXTS.statiske.attachment.validFormatsDescrption)}</BodyLong>
          <BodyShort weight="semibold">{translate(TEXTS.statiske.attachment.maxFileSizeLabel)}</BodyShort>
          <BodyLong>{translate(TEXTS.statiske.attachment.maxFileSizeDescription)}</BodyLong>
        </HStack>
      </ReadMore>

      {uploadedAttachmentFiles.length > 0 && (
        <FileUpload.Trigger onSelect={handleUpload}>
          {
            <Button
              variant="secondary"
              className={styles.button}
              loading={loading}
              icon={<UploadIcon title="a11y-title" fontSize="1.5rem" />}
            >
              {translate(TEXTS.statiske.attachment.uploadMoreFiles)}
            </Button>
          }
        </FileUpload.Trigger>
      )}

      {otherAttachment && (
        <Button
          variant="tertiary"
          onClick={() => handleUploadAnotherAttachment()}
          className={styles.addAnotherAttachmentButton}
          icon={<PlusIcon title="a11y-title" fontSize="1.5rem" />}
        >
          {translate(TEXTS.statiske.attachment.addNewAttachment)}
        </Button>
      )}

      {showDeadline && deadline && (
        <Alert variant="warning" inline>
          {translate(TEXTS.statiske.attachment.deadline, { deadline })}
        </Alert>
      )}

      {selectedAdditionalDocumentation && (
        <Textarea
          label={translate(selectedAdditionalDocumentation.label as string)}
          description={translate(selectedAdditionalDocumentation.description as string)}
          maxLength={200}
        />
      )}
    </>
  );
};

export default AttachmentPanel;
