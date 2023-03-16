import { BodyShort, Heading } from "@navikt/ds-react";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
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
    <Heading level="3" size="medium" className="margin-bottom-small">
      {`${index}. ${translate(TEXTS.statiske.prepareLetterPage.sendInPapirSectionTitle)}`}
    </Heading>
    <BodyShort className="margin-bottom-default">
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
    </BodyShort>
  </section>
);

export default LetterInTheMail;
