import { Table } from '@navikt/ds-react';
import { SkeletonList } from '@navikt/skjemadigitalisering-shared-components';
import { useParams } from 'react-router-dom';
import { useGlobalTranslations } from '../../context/translations/GlobalTranslationsContext';
import TranslationRow from './TranslationRow';
import useTranslationTableStyles from './styles';

const columns = [
  { key: 'nb-NO', label: 'Bokmål' },
  { key: 'nn-NO', label: 'Nynorsk' },
  { key: 'en', label: 'Engelsk' },
];

const TranslationTable = () => {
  const { tag } = useParams();
  const { translationsPerTag } = useGlobalTranslations();
  const styles = useTranslationTableStyles();

  if (!tag || !translationsPerTag) {
    return <SkeletonList size={20} />;
  }

  return (
    <Table zebraStripes>
      <Table.Header>
        <Table.Row>
          {columns.map((column) => (
            <Table.HeaderCell className={styles.column} key={column.key} scope="col">
              {column.label}
            </Table.HeaderCell>
          ))}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {translationsPerTag[tag].map((row) => (
          <TranslationRow key={row.key} translation={row} />
        ))}
      </Table.Body>
    </Table>
  );
};

export default TranslationTable;
