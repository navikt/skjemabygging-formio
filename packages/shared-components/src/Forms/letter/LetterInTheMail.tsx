import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Normaltekst, Systemtittel } from "nav-frontend-typografi";
import React from "react";

interface Props {
  index: number;
  vedleggSomSkalSendes: any[];
  translate: any;
}

const LetterInTheMail = ({ index, vedleggSomSkalSendes, translate }: Props) => (
  <section
    className="wizard-page"
    aria-label={`${index}. ${translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionTitle)}`}
  >
    <Systemtittel tag="h3" className="margin-bottom-small">
      {`${index}. ${translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionTitle)}`}
    </Systemtittel>
    <Normaltekst className="margin-bottom-default">
      {translate(TEXTS.statiske.prepareLetterPage.SendInPapirSectionInstruction)}
      {vedleggSomSkalSendes.length > 0 &&
        " ".concat(
          translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionAttachTo)
            .concat(" ")
            .concat(
              vedleggSomSkalSendes.length > 1
                ? translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionAttachments)
                : translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionAttachment)
            )
            .concat(" ")
            .concat(translate(TEXTS.statiske.prepareLetterPage.sendInPapirSection))
        )}
    </Normaltekst>
  </section>
);

export default LetterInTheMail;
