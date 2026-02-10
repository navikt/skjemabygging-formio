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
        <HStack gap="space-16" justify="end">
          <Button
            size="small"
            loading={state.isSaving}
            disabled={state.isDeleting}
            onClick={async () => {
              setState((state) => ({ ...state, isSaving: true }));
              await onSave();
              setState((state) => ({ ...state, isSaving: false }));
            }}
          >
            Lagre
          </Button>
          <Button size="small" variant="tertiary" disabled={state.isSaving || state.isDeleting} onClick={onCancel}>
            Avbryt
          </Button>
          {!isNew && (
            <Button
              data-color="danger"
              size="small"
              variant="primary"
              loading={state.isDeleting}
              disabled={state.isSaving}
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
