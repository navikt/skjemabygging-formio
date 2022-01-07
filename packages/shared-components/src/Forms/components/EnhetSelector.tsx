import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Select } from "nav-frontend-skjema";
import React from "react";
import { EnhetInkludertKontaktinformasjon } from "../../api/Enhet";
import { useLanguages } from "../../context/languages";

interface EnhetSelectorProps {
  enhetsListe: EnhetInkludertKontaktinformasjon[];
  onSelectEnhet: (enhet?: EnhetInkludertKontaktinformasjon) => void;
  error?: string;
}

const EnhetSelector = ({ enhetsListe = [], onSelectEnhet, error }: EnhetSelectorProps) => {
  const { translate } = useLanguages();

  if (enhetsListe.length === 0) {
    return <></>;
  }

  return (
    <Select
      className="margin-bottom-default"
      bredde="l"
      label={translate(TEXTS.statiske.prepareLetterPage.chooseEntity)}
      description={translate(TEXTS.statiske.prepareLetterPage.chooseEntityDescription)}
      feil={error}
      onChange={(event) => {
        onSelectEnhet(enhetsListe.find((enhet) => `${enhet.enhet.enhetId}` === event.target.value));
      }}
    >
      <option>{translate(TEXTS.statiske.prepareLetterPage.selectEntityDefault)}</option>
      {enhetsListe.map((enhet) => (
        <option key={enhet.enhet.enhetId} value={enhet.enhet.enhetId}>
          {enhet.enhet.navn}
        </option>
      ))}
    </Select>
  );
};

export default EnhetSelector;
