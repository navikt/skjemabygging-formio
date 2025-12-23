import { Table } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { useStaticPdf } from './StaticPdfContext';
import StaticPdfTableRow from './StaticPdfTableRow';

const useStyles = makeStyles({
  table: {
    tableLayout: 'fixed',
    marginBottom: 'var(--a-spacing-4)',
  },
});

const StaticPdfTable = () => {
  const { loading } = useStaticPdf();

  const styles = useStyles();

  if (loading) {
    return null;
  }

  return (
    <Table className={styles.table}>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col" colSpan={4}>
            Publiserte filer
          </Table.HeaderCell>
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
