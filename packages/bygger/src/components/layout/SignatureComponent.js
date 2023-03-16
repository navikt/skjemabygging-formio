import makeStyles from "@material-ui/styles/makeStyles/makeStyles";
import { Close } from "@navikt/ds-icons";
import { Button, Heading, Panel } from "@navikt/ds-react";
import { Input, SkjemaGruppe } from "nav-frontend-skjema";
import React from "react";
import LabelWithDiff from "../FormMetaDataEditor/LabelWithDiff";

const useStyles = makeStyles({
  closeBtn: {
    float: "right",
  },
});

const SignatureComponent = ({ signature, index, onChange, onDelete, diff = undefined }) => {
  const styles = useStyles();
  return (
    <Panel className="margin-bottom-default" border>
      <Button variant="tertiary" icon={<Close aria-hidden />} onClick={onDelete} className={styles.closeBtn} />
      <SkjemaGruppe
        legend={
          <LabelWithDiff
            label={
              <Heading level="2" size="small">
                {"Signatur " + (index + 1)}
              </Heading>
            }
            diff={diff?.status}
          />
        }
      >
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
