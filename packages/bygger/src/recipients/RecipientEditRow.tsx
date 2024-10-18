import { Table } from '@navikt/ds-react';
import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import RecipientButtonRow from './RecipientButtonRow';
import RecipientInput from './RecipientInput';
import useRecipientStyles from './styles';
import { LABELS } from './texts';

type ValidationErrors = {
  name?: string;
  poBoxAddress?: string;
  postalCode?: string;
  postalName?: string;
};

interface Props {
  isNew: boolean;
  value: Partial<Recipient>;
  onSave: () => Promise<void>;
  onDelete: () => Promise<void>;
  onCancel: () => void;
  errors?: ValidationErrors;
  updateValueProperty: (key: keyof Recipient, value: string) => void;
}

const RecipientEditRow = ({ isNew, value, onSave, onDelete, onCancel, errors, updateValueProperty }: Props) => {
  const styles = useRecipientStyles();

  return (
    <>
      <Table.Row shadeOnHover={false}>
        <Table.DataCell className={`${styles.editRow} ${styles.columnLarge}`}>
          <RecipientInput
            label={LABELS.name}
            defaultValue={value.name}
            error={errors?.name}
            onChange={(value) => updateValueProperty('name', value)}
          />
        </Table.DataCell>
        <Table.DataCell className={`${styles.editRow} ${styles.columnLarge}`}>
          <RecipientInput
            label={LABELS.poBoxAddress}
            defaultValue={value.poBoxAddress}
            error={errors?.poBoxAddress}
            onChange={(value) => updateValueProperty('poBoxAddress', value)}
          />
        </Table.DataCell>
        <Table.DataCell className={`${styles.editRow} ${styles.columnSmall}`}>
          <RecipientInput
            label={LABELS.postalCode}
            defaultValue={value.postalCode}
            error={errors?.postalCode}
            onChange={(value) => updateValueProperty('postalCode', value)}
          />
        </Table.DataCell>
        <Table.DataCell className={styles.editRow} colSpan={2}>
          <RecipientInput
            label={LABELS.postalName}
            defaultValue={value.postalName}
            error={errors?.postalName}
            onChange={(value) => updateValueProperty('postalName', value)}
          />
        </Table.DataCell>
      </Table.Row>
      <RecipientButtonRow isNew={isNew} onSave={onSave} onDelete={onDelete} onCancel={onCancel} />
    </>
  );
};

export default RecipientEditRow;
