import { PencilIcon } from '@navikt/aksel-icons';
import { Button, Table } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo, useState } from 'react';
import { useRecipients } from '../context/recipients/RecipientsContext';
import RecipientButtonRow from './RecipientButtonRow';
import RecipientInput from './RecipientInput';

const useStyles = makeStyles({
  editRow: {
    border: 0,
    verticalAlign: 'baseline',
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

type ValidationErrors = {
  name?: string;
  poBoxAddress?: string;
  postalCode?: string;
  postalName?: string;
};

const LABELS = {
  name: 'Enhetsnavn',
  poBoxAddress: 'Postboksadresse',
  postalCode: 'Postnr.',
  postalName: 'Poststed',
};

const RecipientRow = ({ recipient }: { recipient: Partial<Recipient> }) => {
  const { saveRecipient, deleteRecipient, cancelNewRecipient } = useRecipients();
  const { recipientId } = recipient;
  const [value, setValue] = useState(recipient);
  const [uiState, setUiState] = useState({ editing: recipientId === 'new', showErrors: false });
  const styles = useStyles();

  const updateValueProperty = (key: keyof Recipient, value: string) => {
    setValue((currentValue) => ({ ...currentValue, [key]: value }));
  };

  const validationErrors: ValidationErrors = useMemo(() => {
    const required = 'Du må fylle ut';
    return {
      name: value.name ? undefined : `${required} ${LABELS.name}`,
      poBoxAddress: value.poBoxAddress ? undefined : `${required} ${LABELS.poBoxAddress}`,
      postalCode: value.postalCode ? undefined : `${required} ${LABELS.postalCode}`,
      postalName: value.postalName ? undefined : `${required} ${LABELS.postalName}`,
    };
  }, [value.name, value.poBoxAddress, value.postalCode, value.postalName]);

  const isValid = (recipient: Partial<Recipient>): recipient is Recipient =>
    !Object.values(validationErrors).some((value) => !!value);

  const onSave = async () => {
    if (!isValid(value)) {
      setUiState((state) => ({ ...state, showErrors: true }));
      return;
    }

    const result = await saveRecipient(value);
    if (result) {
      setUiState({ editing: false, showErrors: false });
    }
  };

  const onDelete = async () => {
    console.log('On delete start');
    await deleteRecipient(recipientId);
    console.log('On delete end');
  };

  const cancelEditing = () => {
    if (recipientId === 'new') {
      cancelNewRecipient();
    } else {
      setValue(recipient);
      setUiState({ editing: false, showErrors: false });
    }
  };

  if (uiState.editing) {
    return (
      <>
        <Table.Row shadeOnHover={false}>
          <Table.DataCell className={`${styles.editRow} ${styles.columnLarge}`}>
            <RecipientInput
              label={LABELS.name}
              defaultValue={value.name}
              error={uiState.showErrors && validationErrors.name}
              onChange={(value) => updateValueProperty('name', value)}
            />
          </Table.DataCell>
          <Table.DataCell className={`${styles.editRow} ${styles.columnLarge}`}>
            <RecipientInput
              label={LABELS.poBoxAddress}
              defaultValue={value.poBoxAddress}
              error={uiState.showErrors && validationErrors.poBoxAddress}
              onChange={(value) => updateValueProperty('poBoxAddress', value)}
            />
          </Table.DataCell>
          <Table.DataCell className={`${styles.editRow} ${styles.columnSmall}`}>
            <RecipientInput
              label={LABELS.postalCode}
              defaultValue={value.postalCode}
              error={uiState.showErrors && validationErrors.postalCode}
              onChange={(value) => updateValueProperty('postalCode', value)}
            />
          </Table.DataCell>
          <Table.DataCell className={styles.editRow} colSpan={2}>
            <RecipientInput
              label={LABELS.postalName}
              defaultValue={value.postalName}
              error={uiState.showErrors && validationErrors.postalName}
              onChange={(value) => updateValueProperty('postalName', value)}
            />
          </Table.DataCell>
        </Table.Row>
        <RecipientButtonRow
          isNew={recipientId === 'new'}
          onSave={onSave}
          onDelete={onDelete}
          onCancel={cancelEditing}
        />
      </>
    );
  }

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
            onClick={() => setUiState((state) => ({ ...state, editing: true }))}
            variant="tertiary"
            type="button"
          >
            Endre
          </Button>
        }
      </Table.DataCell>
    </Table.Row>
  );
};

export default RecipientRow;
