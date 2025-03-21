import { BodyShort, Heading } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguages } from '../../context/languages';

interface Props {
  index: number;
}

const LetterPrint = ({ index }: Props) => {
  const { translate } = useLanguages();

  return (
    <section
      className="wizard-page"
      aria-label={`${index}. ${translate(TEXTS.statiske.prepareLetterPage.printFormTitle)}`}
    >
      <Heading level="3" size="medium" spacing>
        {index}. {translate(TEXTS.statiske.prepareLetterPage.printFormTitle)}
      </Heading>
      <BodyShort className="mb-4">{translate(TEXTS.statiske.prepareLetterPage.printFormDescription)}</BodyShort>
    </section>
  );
};

export default LetterPrint;
