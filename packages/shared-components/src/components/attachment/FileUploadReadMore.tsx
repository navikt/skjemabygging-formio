import { BodyShort, HStack, ReadMore } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { MAX_TOTAL_SIZE_ATTACHMENT_FILES_TEXT } from '../../constants/fileUpload';
import { useLanguages } from '../../context/languages';

interface Props {
  maxTotalAttachmentSizeText?: string;
}

const FileUploadReadMore = ({ maxTotalAttachmentSizeText = MAX_TOTAL_SIZE_ATTACHMENT_FILES_TEXT }: Props) => {
  const { translate } = useLanguages();

  return (
    <ReadMore header={translate(TEXTS.statiske.attachment.sizeAndFormatHeader)}>
      <HStack gap="space-16" align="start">
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
  );
};

export default FileUploadReadMore;
