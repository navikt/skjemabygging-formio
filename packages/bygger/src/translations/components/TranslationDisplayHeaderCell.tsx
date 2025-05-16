import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { Table } from '@navikt/ds-react';
import { htmlUtils, InnerHtml } from '@navikt/skjemadigitalisering-shared-components';
import { useTranslationTableStyles } from './styles';

interface Props {
  text?: string;
  hasGlobalOverride?: boolean;
}

const TranslationDisplayHeaderCell = ({ text, hasGlobalOverride }: Props) => {
  const styles = useTranslationTableStyles();
  const isHtml = htmlUtils.isHtmlString(text ?? '');

  return isHtml ? (
    <Table.DataCell className={styles.column}>
      {hasGlobalOverride && (
        <PadlockLockedIcon
          className={styles.displayCellIcon}
          title="Globalt overstyrt oversettelse"
          fontSize="1.5rem"
        />
      )}
      <InnerHtml content={text ?? ''} />
    </Table.DataCell>
  ) : (
    <Table.HeaderCell className={styles.column} scope="row">
      {hasGlobalOverride && (
        <PadlockLockedIcon
          className={styles.displayCellIcon}
          title="Globalt overstyrt oversettelse"
          fontSize="1.5rem"
        />
      )}
      {text}
    </Table.HeaderCell>
  );
};

export default TranslationDisplayHeaderCell;
