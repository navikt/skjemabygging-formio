import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { Checkbox, Label, Panel } from "@navikt/ds-react";
import { supportedEnhetstyper } from "@navikt/skjemadigitalisering-shared-components";
import { Enhetstype } from "@navikt/skjemadigitalisering-shared-domain";
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
      <Checkbox checked={enhetMaVelges} onChange={(event) => onChangeEnhetMaVelges(event.target.checked)}>
        {COMPONENT_TEXTS.BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR}
      </Checkbox>
      {enhetMaVelges && selectedEnhetstyper && (
        <Panel>
          <Label>Enhetstyper</Label>
          <ul className={styles.list}>
            {supportedEnhetstyper.map((enhetsType: Enhetstype) => (
              <li key={enhetsType}>
                <Checkbox
                  checked={selectedEnhetstyper.includes(enhetsType)}
                  onChange={(event) => {
                    const updatedSelectedEnhetstyper = event.target.checked
                      ? [...selectedEnhetstyper, enhetsType]
                      : selectedEnhetstyper.filter((selected) => selected !== enhetsType);
                    onChangeEnhetstyper(updatedSelectedEnhetstyper);
                  }}
                >
                  {enhetsType}
                </Checkbox>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </>
  );
};

export default EnhetSettings;
