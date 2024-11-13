import { Table } from '@navikt/ds-react';
import { Translation } from './TranslationTable';

interface Props {
  translation: Translation;
}

const TranslationRow = ({ translation }: Props) => {
  return (
    <Table.Row>
      <Table.HeaderCell scope="row">{translation.nb}</Table.HeaderCell>
      <Table.DataCell>{translation.nn}</Table.DataCell>
      <Table.DataCell>{translation.en}</Table.DataCell>
    </Table.Row>
  );
};

export default TranslationRow;
