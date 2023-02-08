import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Systemtittel } from "nav-frontend-typografi";
import React from "react";

interface Props {
  index: number;
  vedleggSomSkalSendes: any[];
  translate: any;
}

const LetterAddAttachment = ({ index, vedleggSomSkalSendes, translate }: Props) => {
  const skalSendeFlereVedlegg = vedleggSomSkalSendes.length > 1;
  const attachmentSectionTitle = translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleAttachTo)
    .concat(" ")
    .concat(
      skalSendeFlereVedlegg
        ? translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleTheseAttachments)
        : translate(TEXTS.statiske.prepareLetterPage.attachmentSectionTitleThisAttachment)
    );
  return (
    <section className="wizard-page" aria-label={`${index}. ${attachmentSectionTitle}`}>
      <Systemtittel tag="h3" className="margin-bottom-small">{`${index}. ${attachmentSectionTitle}`}</Systemtittel>
      <ul>
        {vedleggSomSkalSendes.map((vedlegg) => (
          <li key={vedlegg.key}>{translate(vedlegg.label)}</li>
        ))}
      </ul>
    </section>
  );
};

export default LetterAddAttachment;
