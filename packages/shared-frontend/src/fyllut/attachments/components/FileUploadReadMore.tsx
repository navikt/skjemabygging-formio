import { BodyShort, HStack, ReadMore } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../../context/language/LanguageContext';

interface Props {
  maxTotalAttachmentSizeText?: string;
}

const FileUploadReadMore = ({ maxTotalAttachmentSizeText = '150 MB' }: Props) => {
  const { translate } = useLanguage();

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
