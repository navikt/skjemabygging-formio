import { Button, Table } from '@navikt/ds-react';
import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import TranslationDisplayCell from './TranslationDisplayCell';
import { useTranslationTableStyles } from './styles';

interface Props {
  translation: FormsApiTranslation;
  onRemove: (id: number) => Promise<void>;
  showKey?: boolean;
}

const UnusedTranslationRow = ({ translation, onRemove, showKey = false }: Props) => {
  const [loading, setLoading] = useState(false);
  const styles = useTranslationTableStyles();
  const hasGlobalOverride = !!translation.globalTranslationId;

  const handleRemove = async () => {
    setLoading(true);
    await onRemove(translation.id!);
    setLoading(false);
  };

  return (
    <Table.Row shadeOnHover={false}>
      {showKey && <TranslationDisplayCell text={translation.key} />}
      <TranslationDisplayCell text={translation.nb} />
      <TranslationDisplayCell text={translation.nn} hasGlobalOverride={hasGlobalOverride} />
      <TranslationDisplayCell text={translation.en} hasGlobalOverride={hasGlobalOverride} />
      <Table.DataCell className={styles.actionColumn}>
        <Button
          data-color="danger"
          type="button"
          variant="primary"
          size="small"
          loading={loading}
          onClick={handleRemove}
        >
          Slett
        </Button>
      </Table.DataCell>
    </Table.Row>
  );
};

export default UnusedTranslationRow;
