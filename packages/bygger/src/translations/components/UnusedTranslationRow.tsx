import { Button, Table } from '@navikt/ds-react';
import { formsApiTranslations } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import TranslationDisplayCell from './TranslationDisplayCell';
import useTranslationTableStyles from './styles';

const UnusedTranslationRow = ({ translation, onRemove }) => {
  const [loading, setLoading] = useState(false);
  const styles = useTranslationTableStyles();
  const hasGlobalOverride = formsApiTranslations.isFormTranslation(translation) && !!translation.globalTranslationId;

  const handleRemove = async () => {
    setLoading(true);
    await onRemove(translation.id);
    setLoading(false);
  };

  return (
    <Table.Row shadeOnHover={false}>
      <TranslationDisplayCell text={translation.nb} />
      <TranslationDisplayCell text={translation.nn} hasGlobalOverride={hasGlobalOverride} />
      <TranslationDisplayCell text={translation.en} hasGlobalOverride={hasGlobalOverride} />
      <Table.DataCell className={styles.actionColumn}>
        <Button type="button" variant="danger" size="small" loading={loading} onClick={handleRemove}>
          Slett
        </Button>
      </Table.DataCell>
    </Table.Row>
  );
};

export default UnusedTranslationRow;
