import { Button, HStack, Table } from '@navikt/ds-react';
import { useState } from 'react';

interface Props {
  isNew: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const RecipientButtonRow = ({ isNew, onSave, onCancel }: Props) => {
  const [isSaving, setIsSaving] = useState(false);

  return (
    <Table.Row shadeOnHover={false}>
      <Table.DataCell colSpan={5}>
        <HStack gap="4" justify="end">
          <Button
            size="small"
            loading={isSaving}
            onClick={async () => {
              setIsSaving(true);
              onSave();
              setIsSaving(false);
            }}
          >
            Lagre
          </Button>
          <Button size="small" variant="tertiary" onClick={onCancel}>
            Avbryt
          </Button>
          {!isNew && (
            <Button size="small" variant="danger">
              Slett
            </Button>
          )}
        </HStack>
      </Table.DataCell>
    </Table.Row>
  );
};

export default RecipientButtonRow;
