import { makeStyles } from "@material-ui/styles";
import { TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import React from "react";
import ReactSelect from "react-select";
import { EnhetInkludertKontaktinformasjon } from "../../api/Enhet";
import { useLanguages } from "../../context/languages";
import { navCssVariables } from "../../util/navCssVariables";

const useStyles = makeStyles({
  enhetsListe: {
    maxWidth: "20rem",
  },
});

const EnhetSelector = ({ enhetsListe = [], onSelectEnhet, error }: EnhetSelectorProps) => {
  const { translate } = useLanguages();
  const styles = useStyles();

  if (enhetsListe.length === 0) {
    return <></>;
  }

  const options = enhetsListe.map((enhet) => ({ label: enhet.enhet.navn, value: enhet.enhet.enhetNr }));
  return (
    <div className="skjemaelement margin-bottom-default">
      <label id="enhetSelectLabel" className="skjemaelement__label">
        {translate(TEXTS.statiske.prepareLetterPage.chooseEntity)}
      </label>
      <div className="skjemaelement__description">
        {translate(TEXTS.statiske.prepareLetterPage.chooseEntityDescription)}
      </div>
      <ReactSelect
        className={styles.enhetsListe}
        options={options}
        styles={{
          control: (base) => ({
            ...base,
            ...(error
              ? { borderColor: navCssVariables.navError, boxShadow: `0 0 0 1px ${navCssVariables.navError}` }
              : {}),
          }),
        }}
        placeholder={translate(TEXTS.statiske.prepareLetterPage.selectEntityDefault)}
        aria-errormessage="enhetSelectError"
        aria-labelledby="enhetSelectLabel"
        onChange={(event) => {
          onSelectEnhet(event && event.value);
        }}
      />
      {error && (
        <div id="enhetSelectError" className="skjemaelement__feilmelding">
          <p className="typo-feilmelding">{error}</p>
        </div>
      )}
    </div>
  );
};

interface EnhetSelectorProps {
  enhetsListe: EnhetInkludertKontaktinformasjon[];
  onSelectEnhet: (enhetNummer: string | null) => void;
  error?: string;
}

export default EnhetSelector;
