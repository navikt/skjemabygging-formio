import { Button, HStack, Table } from '@navikt/ds-react';
import { useState } from 'react';

interface Props {
  isNew: boolean;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => void;
}

const RecipientButtonRow = ({ isNew, onSave, onCancel, onDelete }: Props) => {
  const [state, setState] = useState({ isSaving: false, isDeleting: false });

  return (
    <Table.Row shadeOnHover={false}>
      <Table.DataCell colSpan={5}>
        <HStack gap="4" justify="end">
          <Button
            size="small"
            loading={state.isSaving}
            onClick={async () => {
              setState((state) => ({ ...state, isSaving: true }));
              await onSave();
              setState((state) => ({ ...state, isSaving: false }));
            }}
          >
            Lagre
          </Button>
          <Button size="small" variant="tertiary" onClick={onCancel}>
            Avbryt
          </Button>
          {!isNew && (
            <Button
              size="small"
              variant="danger"
              loading={state.isDeleting}
              onClick={async () => {
                setState((state) => ({ ...state, isDeleting: true }));
                await onDelete();
                setState((state) => ({ ...state, isDeleting: false }));
              }}
            >
              Slett
            </Button>
          )}
        </HStack>
      </Table.DataCell>
    </Table.Row>
  );
};

export default RecipientButtonRow;
