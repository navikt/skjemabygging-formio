import { Heading } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../context/languages';

interface Props {
  index: number;
  attachments: any[];
}

const LetterAddAttachment = ({ index, attachments }: Props) => {
  const { translate } = useLanguages();

  const skalSendeFlereVedlegg = attachments.length > 1;
  const attachmentSectionTitle = translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleAttachTo)
    .concat(' ')
    .concat(
      skalSendeFlereVedlegg
        ? translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleTheseAttachments)
        : translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleThisAttachment),
    );
  return (
    <section className="wizard-page" aria-label={`${index}. ${attachmentSectionTitle}`}>
      <Heading level="3" size="medium" spacing>
        {`${index}. ${attachmentSectionTitle}`}
      </Heading>
      <ul>
        {attachments.map((vedlegg) => (
          <li key={vedlegg.key}>{translate(vedlegg.label)}</li>
        ))}
      </ul>
    </section>
  );
};

export default LetterAddAttachment;
