import { Button, Table } from '@navikt/ds-react';
import { formsApiTranslations } from '@navikt/skjemadigitalisering-shared-domain';
import TranslationDisplayCell from './TranslationDisplayCell';
import useTranslationTableStyles from './styles';

const UnusedTranslationRow = ({ translation, onRemove }) => {
  const styles = useTranslationTableStyles();
  const hasGlobalOverride = formsApiTranslations.isFormTranslation(translation) && !!translation.globalTranslationId;

  return (
    <Table.Row shadeOnHover={false}>
      <TranslationDisplayCell text={translation.nb} hasGlobalOverride={hasGlobalOverride} />
      <TranslationDisplayCell text={translation.nn} hasGlobalOverride={hasGlobalOverride} />
      <TranslationDisplayCell text={translation.en} hasGlobalOverride={hasGlobalOverride} />
      <Table.DataCell className={styles.actionColumn}>
        <Button variant="danger" size="small" onClick={() => onRemove(translation.id)}>
          Slett
        </Button>
      </Table.DataCell>
    </Table.Row>
  );
};

export default UnusedTranslationRow;
