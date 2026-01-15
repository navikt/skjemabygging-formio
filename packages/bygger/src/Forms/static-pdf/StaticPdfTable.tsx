import { Table } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { useStaticPdf } from './StaticPdfContext';
import StaticPdfTableRow from './StaticPdfTableRow';

const useStyles = makeStyles({
  table: {
    tableLayout: 'fixed',
    marginBottom: 'var(--a-spacing-4)',
  },
  smallColumn: {
    width: '120px',
  },
});

const StaticPdfTable = () => {
  const { loadingFiles } = useStaticPdf();

  const styles = useStyles();

  if (loadingFiles) {
    return null;
  }

  return (
    <Table className={styles.table}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col" className={styles.smallColumn}>
            Språk
          </Table.HeaderCell>
          <Table.HeaderCell scope="col">Filnavn</Table.HeaderCell>
          <Table.HeaderCell scope="col">Publisert</Table.HeaderCell>
          <Table.HeaderCell scope="col" className={styles.smallColumn}></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        <StaticPdfTableRow language="Bokmål" languageCode="nb" />
        <StaticPdfTableRow language="Nynorsk" languageCode="nn" />
        <StaticPdfTableRow language="Engelsk" languageCode="en" />
        <StaticPdfTableRow language="Samisk" languageCode="se" />
        <StaticPdfTableRow language="Fransk" languageCode="fr" />
      </Table.Body>
    </Table>
  );
};

export default StaticPdfTable;
