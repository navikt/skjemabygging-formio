import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { Tag } from "@navikt/ds-react";
import Lukknapp from "nav-frontend-lukknapp";
import Panel from "nav-frontend-paneler";
import { Input, SkjemaGruppe } from "nav-frontend-skjema";
import { Undertittel } from "nav-frontend-typografi";
import React from "react";

const useStyles = makeStyles({
  closeBtn: {
    float: "right",
  },
});

const SignatureComponent = ({ signature, index, onChange, onDelete, diff = undefined }) => {
  const styles = useStyles();
  const legend = (
    <div className="label-track-changes">
      <Undertittel>{"Signatur " + (index + 1)}</Undertittel>
      {diff && (
        <Tag variant="warning-filled" size="xsmall">
          {diff.status}
        </Tag>
      )}
    </div>
  );
  return (
    <Panel className="margin-bottom-default" border>
      <Lukknapp className={styles.closeBtn} bla={true} onClick={onDelete} />
      <SkjemaGruppe legend={legend}>
        <Input
          label="Hvem skal signere?"
          type="text"
          name={`signature${index + 1}`}
          placeholder='F.eks: "Søker", "Lege", "Evt. mor"'
          value={signature.label}
          onChange={(e) =>
            onChange({
              ...signature,
              label: e.target.value,
            })
          }
        />
        <Input
          label="Instruksjoner til den som signerer"
          type="text"
          name={`signatureInstruction${index}`}
          placeholder="Beskrivelse av hvorfor man signerer"
          value={signature.description}
          onChange={(e) =>
            onChange({
              ...signature,
              description: e.target.value,
            })
          }
        />
      </SkjemaGruppe>
    </Panel>
  );
};

export default SignatureComponent;
