import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo, useState } from 'react';
import { useRecipients } from '../context/recipients/RecipientsContext';
import RecipientDisplayRow from './RecipientDisplayRow';
import RecipientEditRow from './RecipientEditRow';
import { LABELS } from './texts';

const RecipientRow = ({ recipient }: { recipient: Partial<Recipient> }) => {
  const { saveRecipient, deleteRecipient, cancelNewRecipient } = useRecipients();
  const { recipientId } = recipient;
  const [value, setValue] = useState(recipient);
  const [uiState, setUiState] = useState({ editing: recipientId === undefined, showErrors: false });

  const updateValueProperty = (key: keyof Recipient, value: string) => {
    setValue((currentValue) => ({ ...currentValue, [key]: value }));
  };

  const validationErrors = useMemo(() => {
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
    await deleteRecipient(recipientId);
  };

  const cancelEditing = () => {
    if (recipientId) {
      setValue(recipient);
      setUiState({ editing: false, showErrors: false });
    } else {
      cancelNewRecipient();
    }
  };

  return uiState.editing ? (
    <RecipientEditRow
      isNew={recipientId === undefined}
      value={value}
      onSave={onSave}
      onDelete={onDelete}
      onCancel={cancelEditing}
      errors={uiState.showErrors ? validationErrors : undefined}
      updateValueProperty={updateValueProperty}
    />
  ) : (
    <RecipientDisplayRow value={value} changeMode={() => setUiState((state) => ({ ...state, editing: true }))} />
  );
};

export default RecipientRow;
