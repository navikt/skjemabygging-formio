import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Normaltekst, Systemtittel } from "nav-frontend-typografi";
import React from "react";

interface Props {
  index: number;
  translate: any;
}

const LetterNextSteps = ({ index, translate }: Props) => (
  <section
    className="wizard-page"
    aria-label={`${index}. ${translate(TEXTS.statiske.prepareLetterPage.lastSectionTitle)}`}
  >
    <Systemtittel tag="h3" className="margin-bottom-small">
      {`${index}. ${translate(TEXTS.statiske.prepareLetterPage.lastSectionTitle)}`}
    </Systemtittel>
    <Normaltekst className="margin-bottom-default">
      {translate(TEXTS.statiske.prepareLetterPage.lastSectionContent)}
    </Normaltekst>
  </section>
);

export default LetterNextSteps;
