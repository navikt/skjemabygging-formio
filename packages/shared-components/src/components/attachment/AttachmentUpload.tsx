import { UploadIcon } from '@navikt/aksel-icons';
import {
  Alert,
  BodyLong,
  BodyShort,
  Button,
  FileObject,
  FileUpload,
  HStack,
  Label,
  Radio,
  RadioGroup,
  ReadMore,
  VStack,
} from '@navikt/ds-react';
import { AttachmentOption, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';
import makeStyles from '../../util/styles/jss/jss';
import { useAttachmentUpload } from './AttachmentUploadContext';

interface Props {
  label: string;
  options: AttachmentOption[];
  vedleggId: string;
  multiple?: boolean;
  description?: string;
  isIdUpload?: boolean;
}

const useStyles = makeStyles({
  button: {
    maxWidth: '18.75rem',
    borderRadius: 'var(--a-border-radius-large)',
  },
});

const AttachmentUpload = ({ label, options, vedleggId, multiple = false, description, isIdUpload }: Props) => {
  const [selectedOption, setSelectedOption] = useState<string>();
  const [loading, setLoading] = useState<boolean>(false);
  const styles = useStyles();
  const { translate } = useLanguages();
  const { innsendingsId } = useSendInn();
  const { handleUploadFiles, handleDeleteFile, uploadedFiles, errors } = useAttachmentUpload();

  const uploadedAttachmentFiles = uploadedFiles.filter((file) => file.vedleggId === vedleggId);
  const error = errors[vedleggId];

  const handleUpload = async (files: FileObject[] | null) => {
    if (!files || files.length === 0) {
      return;
    }
    setLoading(true);
    await handleUploadFiles(vedleggId, files);
    setLoading(false);
  };

  const handleDelete = async (filId: string) => {
    await handleDeleteFile(vedleggId, filId);
  };

  //TODO: store this in context
  const uploadSelected = !!options.find((option) => option.value === selectedOption)?.upload;

  return (
    <VStack gap="8" className="mb">
      <RadioGroup legend={label} onChange={(value) => setSelectedOption(value)} description={description}>
        {options.map((option) => (
          <Radio key={option.value} value={option.value}>
            {option.label}
          </Radio>
        ))}
      </RadioGroup>
      {uploadSelected && (
        <VStack gap="4">
          {isIdUpload && <Label>Last opp bilde eller skannet kopi av ID-en din</Label>}

          {uploadedAttachmentFiles.length === 0 && (
            <FileUpload.Trigger multiple={!!innsendingsId && multiple} onSelect={handleUpload}>
              {
                <Button
                  className={styles.button}
                  loading={loading}
                  icon={<UploadIcon title="a11y-title" fontSize="1.5rem" />}
                >
                  {translate(isIdUpload ? TEXTS.statiske.uploadId.selectFile : TEXTS.statiske.uploadId.uploadFiles)}
                </Button>
              }
            </FileUpload.Trigger>
          )}
          {uploadedAttachmentFiles.map(({ filId, filnavn, storrelse }) => (
            <FileUpload.Item
              key={filId}
              file={{ name: filnavn, size: storrelse }}
              button={{
                action: 'delete',
                onClick: () => handleDelete(filId),
              }}
            ></FileUpload.Item>
          ))}
          <ReadMore header="Gyldige filformater og størrelser" defaultOpen>
            <HStack gap="2" align="start">
              <BodyShort weight="semibold">{translate(TEXTS.statiske.attachment.validFormatsLabel)}</BodyShort>
              <BodyLong>{translate(TEXTS.statiske.attachment.validFormatsDescrption)}</BodyLong>

              <BodyShort weight="semibold">{translate(TEXTS.statiske.attachment.maxFileSizeLabel)}</BodyShort>
              <BodyLong>{translate(TEXTS.statiske.attachment.maxFileSizeDescription)}</BodyLong>
            </HStack>
          </ReadMore>
        </VStack>
      )}
      {error && (
        <Alert variant="error">
          <BodyLong>{error}</BodyLong>
        </Alert>
      )}
    </VStack>
  );
};

export default AttachmentUpload;
