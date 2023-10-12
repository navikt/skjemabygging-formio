import { Close } from '@navikt/ds-icons';
import { Button, Fieldset, Heading, Panel, TextField } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import LabelWithDiff from '../FormMetaDataEditor/LabelWithDiff';

const useStyles = makeStyles({
  closeBtn: {
    float: 'right',
  },
});

const SignatureComponent = ({ signature, index, onChange, onDelete, diff = undefined }) => {
  const styles = useStyles();
  return (
    <Panel className="mb-4" border>
      <Button
        variant="tertiary"
        icon={<Close aria-hidden />}
        onClick={onDelete}
        className={styles.closeBtn}
        aria-label={'Slett signatur ' + (index + 1)}
      />
      <Fieldset data-testid="signatures">
        <legend>
          <LabelWithDiff
            label={
              <Heading level="2" size="small">
                {'Signatur ' + (index + 1)}
              </Heading>
            }
            diff={diff?.status}
          />
        </legend>
        <TextField
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
        <TextField
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
      </Fieldset>
    </Panel>
  );
};

export default SignatureComponent;
