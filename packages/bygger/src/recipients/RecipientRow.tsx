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

  const getValidationErrors = (currentRecipient: Partial<Recipient>) => {
    const required = 'Du må fylle ut';
    return {
      name: currentRecipient.name ? undefined : `${required} ${LABELS.name}`,
      poBoxAddress: currentRecipient.poBoxAddress ? undefined : `${required} ${LABELS.poBoxAddress}`,
      postalCode: currentRecipient.postalCode ? undefined : `${required} ${LABELS.postalCode}`,
      postalName: currentRecipient.postalName ? undefined : `${required} ${LABELS.postalName}`,
    };
  };

  const validationErrors = useMemo(() => getValidationErrors(value), [value]);

  const isValid = (currentRecipient: Partial<Recipient>): currentRecipient is Recipient =>
    Object.values(getValidationErrors(currentRecipient)).every((value) => value === undefined);

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
