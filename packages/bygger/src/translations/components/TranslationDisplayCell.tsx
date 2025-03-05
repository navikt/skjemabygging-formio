import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { Table } from '@navikt/ds-react';
import { InnerHtml } from '@navikt/skjemadigitalisering-shared-components';
import { htmlUtils } from '@navikt/skjemadigitalisering-shared-domain';
import useTranslationTableStyles from './styles';

interface Props {
  text?: string;
  hasGlobalOverride?: boolean;
}

const TranslationDisplayCell = ({ text, hasGlobalOverride = false }: Props) => {
  const styles = useTranslationTableStyles();

  const isHtml = htmlUtils.isHtmlString(text ?? '');

  return (
    <Table.DataCell className={styles.column}>
      {hasGlobalOverride && (
        <PadlockLockedIcon
          className={styles.displayCellIcon}
          title="Globalt overstyrt oversettelse"
          fontSize="1.5rem"
        />
      )}
      {isHtml ? <InnerHtml content={text ?? ''} /> : text}
    </Table.DataCell>
  );
};

export default TranslationDisplayCell;
