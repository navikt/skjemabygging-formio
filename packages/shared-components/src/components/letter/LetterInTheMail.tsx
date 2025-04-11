import { BodyShort, Heading } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../context/languages';

interface Props {
  index: number;
  attachments: any[];
}

const LetterInTheMail = ({ index, attachments }: Props) => {
  const { translate } = useLanguages();

  return (
    <section
      className="wizard-page"
      aria-label={`${index}. ${translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionTitle)}`}
    >
      <Heading level="3" size="medium" spacing>
        {`${index}. ${
          attachments.length > 0
            ? translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionTitleWithAttachment)
            : translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionTitle)
        }`}
      </Heading>
      <BodyShort className="mb-4">
        {translate(TEXTS.statiske.prepareLetterPage.SendInPapirSectionInstruction)}
      </BodyShort>
    </section>
  );
};

export default LetterInTheMail;
