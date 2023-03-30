import { BodyShort, Heading } from "@navikt/ds-react";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";

interface Props {
  index: number;
  translate: any;
}

const LetterNextSteps = ({ index, translate }: Props) => (
  <section
    className="wizard-page"
    aria-label={`${index}. ${translate(TEXTS.statiske.prepareLetterPage.lastSectionTitle)}`}
  >
    <Heading level="3" size="medium" className="margin-bottom-small">
      {`${index}. ${translate(TEXTS.statiske.prepareLetterPage.lastSectionTitle)}`}
    </Heading>
    <BodyShort className="margin-bottom-default">
      {translate(TEXTS.statiske.prepareLetterPage.lastSectionContent)}
    </BodyShort>
  </section>
);

export default LetterNextSteps;
