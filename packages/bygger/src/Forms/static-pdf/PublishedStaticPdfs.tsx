import { Table } from '@navikt/ds-react';
import StaticPdfTableRow from './StaticPdfTableRow';

const PublishedStaticPdfs = () => {
  return (
    <Table className="mb-4">
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

export default PublishedStaticPdfs;
