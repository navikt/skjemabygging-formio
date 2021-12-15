import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import { Select } from "nav-frontend-skjema";
import React, { useEffect, useState } from "react";
import { useLanguages } from "../../context/languages";

type Enhetstype =
  | "AAREG"
  | "ALS"
  | "ARK"
  | "DIR"
  | "DOKSENTER"
  | "EKSTERN"
  | "FORVALTNING"
  | "FPY"
  | "FYLKE"
  | "HELFO"
  | "HMS"
  | "INNKREV"
  | "INTRO"
  | "IT"
  | "KLAGE"
  | "KO"
  | "KONTAKT"
  | "KONTROLL"
  | "LOKAL"
  | "OKONOMI"
  | "OPPFUTLAND"
  | "OTENESTE"
  | "RIKSREV"
  | "ROBOT"
  | "ROL"
  | "TILLIT"
  | "TILTAK"
  | "UKJENT"
  | "UTLAND"
  | "YTA";

const enhetsTypeWithKontaktInfo: Enhetstype[] = [
  "AAREG",
  "ALS",
  "ARK",
  "DIR",
  "FPY",
  "FYLKE",
  "HMS",
  "INNKREV",
  "INTRO",
  "KLAGE",
  "KONTAKT",
  "KONTROLL",
  "LOKAL",
  "OKONOMI",
  "TILTAK",
  "YTA",
  "OPPFUTLAND",
  "DOKSENTER",
  "ROL",
];

const enhetstypeVisesPaaNav: Enhetstype[] = [
  "ALS",
  "ARK",
  "FPY",
  "FYLKE",
  "HMS",
  "INTRO",
  "KLAGE",
  "KO",
  "KONTROLL",
  "LOKAL",
  "OKONOMI",
  "TILTAK",
  "YTA",
  "OPPFUTLAND",
];

const skalHaKontaktInfo = (enhet) => {
  return enhetsTypeWithKontaktInfo.includes(enhet.enhet.type);
};

const skalVisesPaaNav = (enhet) => {
  return enhetstypeVisesPaaNav.includes(enhet.enhet.type);
};

async function fetchEnhetsListe(baseUrl = "/fyllut") {
  return fetch(`${baseUrl}/api/enhetsliste`).then((response) => {
    if (response.ok) {
      return response.json();
    }
    return Promise.resolve([]);
  });
}

const EnhetSelector = ({ baseUrl, onSelectEnhet, error }) => {
  const { translate } = useLanguages();
  const [enhetsListe, setEnhetsListe] = useState([]);

  useEffect(() => {
    fetchEnhetsListe(baseUrl)
      .then((enhetsListe) =>
        enhetsListe
          .filter(skalHaKontaktInfo)
          .filter(skalVisesPaaNav)
          .sort((enhetA, enhetB) => enhetA.enhet.navn.localeCompare(enhetB.enhet.navn, "nb"))
      )
      .then(setEnhetsListe);
  }, [baseUrl]);

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
