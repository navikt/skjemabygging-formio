import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import Panel from "nav-frontend-paneler";
import { Checkbox } from "nav-frontend-skjema";
import { Ingress } from "nav-frontend-typografi";
import React from "react";
import { COMPONENT_TEXTS } from "./FormMetadataEditor";

// TODO: Enhetstype
const supportedEnhetsType: any[] = [
  "ALS",
  "ARK",
  "FORVALTNING",
  "FPY",
  "HMS",
  "INNKREV",
  "INTRO",
  "KLAGE",
  "KO",
  "KONTROLL",
  "LOKAL",
  "OKONOMI",
  "OPPFUTLAND",
  "OTENESTE",
  "ROL",
  "TILTAK",
  "UTLAND",
  "YTA",
];

interface EnhetSettingsProps {
  enhetMaVelges: boolean;
  selectedEnhetsTyper: any[]; // TODO: Enhetstype
  onChangeEnhetMaVelges: (value: boolean) => void;
  onChangeEnhetsTyper: (enhetsTyper: any[]) => void; // TODO: Enhetstype
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
  selectedEnhetsTyper,
  onChangeEnhetMaVelges,
  onChangeEnhetsTyper,
}: EnhetSettingsProps) => {
  const styles = useStyles();
  return (
    <>
      <div className="margin-bottom-default">
        <Checkbox
          label={COMPONENT_TEXTS.BRUKER_MA_VELGE_ENHET_VED_INNSENDING_PA_PAPIR}
          checked={enhetMaVelges}
          onChange={(event) => onChangeEnhetMaVelges(event.target.checked)}
        />
      </div>
      {enhetMaVelges && (
        <Panel className="margin-bottom-default">
          <Ingress>Enhetskategorier</Ingress>
          <ul className={styles.list}>
            {supportedEnhetsType.map((enhetsType) => (
              <li key={enhetsType}>
                <Checkbox
                  label={enhetsType}
                  checked={selectedEnhetsTyper.includes(enhetsType)}
                  onChange={(event) => {
                    const updatedSelectedEnhetsTyper = event.target.checked
                      ? [...selectedEnhetsTyper, enhetsType]
                      : selectedEnhetsTyper.filter((type) => type === enhetsType);
                    onChangeEnhetsTyper(updatedSelectedEnhetsTyper);
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
