import { PencilIcon } from '@navikt/aksel-icons';
import { Button, HStack, Table, TextField } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useRecipients } from '../context/recipients/RecipientsContext';

const useStyles = makeStyles({
  editRow: {
    border: 0,
    '& .navds-form-field': {
      paddingTop: '8px',
    },
  },
  columnSmall: {
    width: '4rem',
  },
  columnLarge: {
    width: '18rem',
  },
});

type ViewState = 'display' | 'editing';

const RecipientRow = ({ recipient }: { recipient: Partial<Recipient> }) => {
  const { saveRecipient } = useRecipients();
  const { recipientId } = recipient;
  const [viewState, setViewState] = useState<ViewState>(recipientId === 'new' ? 'editing' : 'display');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [value, setValue] = useState(recipient);
  const styles = useStyles();

  const updateValueProperty = (key: keyof Recipient, value: string) => {
    setValue((currentValue) => ({ ...currentValue, [key]: value }));
  };

  if (viewState === 'display') {
    return (
      <Table.Row shadeOnHover={false}>
        <Table.HeaderCell className={styles.columnLarge} textSize="small" scope="row">
          {value.name}
        </Table.HeaderCell>
        <Table.DataCell className={styles.columnLarge} textSize="small">
          {value.poBoxAddress}
        </Table.DataCell>
        <Table.DataCell className={styles.columnSmall} textSize="small">
          {value.postalCode}
        </Table.DataCell>
        <Table.DataCell textSize="small">{value.postalName}</Table.DataCell>
        <Table.DataCell align="right">
          {
            <Button
              icon={<PencilIcon aria-hidden />}
              onClick={() => setViewState('editing')}
              variant="tertiary"
              type="button"
            >
              Endre
            </Button>
          }
        </Table.DataCell>
      </Table.Row>
    );
  }

  if (viewState === 'editing') {
    return (
      <>
        <Table.Row shadeOnHover={false}>
          <Table.DataCell className={`${styles.editRow} ${styles.columnLarge}`}>
            <TextField
              label="Enhetsnavn"
              hideLabel
              size="small"
              defaultValue={value.name}
              onChange={(event) => updateValueProperty('name', event.currentTarget.value)}
            />
          </Table.DataCell>
          <Table.DataCell className={`${styles.editRow} ${styles.columnLarge}`}>
            <TextField
              label="Postboksadresse"
              hideLabel
              size="small"
              defaultValue={value.poBoxAddress}
              onChange={(event) => updateValueProperty('poBoxAddress', event.currentTarget.value)}
            />
          </Table.DataCell>
          <Table.DataCell className={`${styles.editRow} ${styles.columnSmall}`}>
            <TextField
              label="Postnr."
              hideLabel
              size="small"
              defaultValue={value.postalCode}
              onChange={(event) => updateValueProperty('postalCode', event.currentTarget.value)}
            />
          </Table.DataCell>
          <Table.DataCell className={styles.editRow} colSpan={2}>
            <TextField
              label="Poststed"
              hideLabel
              size="small"
              defaultValue={value.postalName}
              onChange={(event) => updateValueProperty('postalName', event.currentTarget.value)}
            />
          </Table.DataCell>
        </Table.Row>
        <Table.Row shadeOnHover={false}>
          <Table.DataCell colSpan={5}>
            <HStack gap="4" justify="end">
              <Button
                size="small"
                loading={isSaving}
                onClick={async () => {
                  console.log(value);
                  setIsSaving(true);
                  // FIXME
                  const result = await saveRecipient(value as Recipient);
                  setIsSaving(false);
                  if (result) setViewState('display');
                }}
              >
                Lagre
              </Button>
              <Button
                size="small"
                variant="tertiary"
                onClick={() => {
                  setValue(recipient);
                  setViewState('display');
                }}
              >
                Avbryt
              </Button>
              <Button size="small" variant="danger">
                Slett
              </Button>
            </HStack>
          </Table.DataCell>
        </Table.Row>
      </>
    );
  }
};

export default RecipientRow;
