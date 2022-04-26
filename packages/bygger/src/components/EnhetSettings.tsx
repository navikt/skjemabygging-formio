import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { supportedEnhetstyper } from "@navikt/skjemadigitalisering-shared-components";
import { Enhetstype } from "@navikt/skjemadigitalisering-shared-domain";
import Panel from "nav-frontend-paneler";
import { Checkbox } from "nav-frontend-skjema";
import { Ingress } from "nav-frontend-typografi";
import React, { useEffect } from "react";
import { COMPONENT_TEXTS } from "./FormMetadataEditor";

interface EnhetSettingsProps {
  enhetMaVelges: boolean;
  selectedEnhetstyper?: Enhetstype[];
  onChangeEnhetMaVelges: (value: boolean) => void;
  onChangeEnhetstyper: (enhetstyper: Enhetstype[]) => void;
}

const useStyles = makeStyles({
  list: {
    maxWidth: "100%",
    maxHeight: "200px",
    display: "flex",
    gap: "0 1rem",
    flexDirection: "column",
    flexWrap: "wrap",
    listStyle: "none",

    "@media screen and (max-width: 1080px)": {
      maxHeight: "400px",
    },
    "@media screen and (max-width: 600px)": {
      maxHeight: "1000px",
    },
  },
});

const EnhetSettings = ({
  enhetMaVelges,
  selectedEnhetstyper,
  onChangeEnhetMaVelges,
  onChangeEnhetstyper,
}: EnhetSettingsProps) => {
  const styles = useStyles();

  useEffect(() => {
    if (enhetMaVelges && selectedEnhetstyper === undefined) {
      onChangeEnhetstyper(supportedEnhetstyper);
    }
  }, [onChangeEnhetstyper, enhetMaVelges, selectedEnhetstyper]);

  return (
    <>
      <div className="margin-bottom-default">
        <Checkbox
          label={COMPONENT_TEXTS.BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR}
          checked={enhetMaVelges}
          onChange={(event) => onChangeEnhetMaVelges(event.target.checked)}
        />
      </div>
      {enhetMaVelges && selectedEnhetstyper && (
        <Panel className="margin-bottom-default">
          <Ingress>Enhetstyper</Ingress>
          <ul className={styles.list}>
            {supportedEnhetstyper.map((enhetsType: Enhetstype) => (
              <li key={enhetsType}>
                <Checkbox
                  label={enhetsType}
                  checked={selectedEnhetstyper.includes(enhetsType)}
                  onChange={(event) => {
                    const updatedSelectedEnhetstyper = event.target.checked
                      ? [...selectedEnhetstyper, enhetsType]
                      : selectedEnhetstyper.filter((selected) => selected !== enhetsType);
                    onChangeEnhetstyper(updatedSelectedEnhetstyper);
                  }}
                />
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
};

export default EnhetSettings;
